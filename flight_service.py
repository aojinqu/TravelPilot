from amadeus import Client, ResponseError
from models import Flight

class SimpleFlightService:
    def __init__(self):
        self.amadeus = Client(
            client_id='...',
            client_secret='...'
        )
        self.airport_mapping = {
            '东京': 'HND', 
            'tokyo': 'NRT', 
            '香港': 'HKG',
            'hong kong': 'HKG',
            '大阪': 'KIX',
            'osaka': 'KIX',
            '首尔': 'ICN',
            'seoul': 'ICN',
            '新加坡': 'SIN',
            'singapore': 'SIN',
            '曼谷': 'BKK',
            'bangkok': 'BKK',
            '台北': 'TPE',
            'taipei': 'TPE',
            '北京': 'PEK',
            'beijing': 'PEK',
            '上海': 'PVG',
            'shanghai': 'PVG'
        }
    
    def get_airport_code(self, city_input):
        key = city_input.lower()
        
        if key in self.airport_mapping:
            return self.airport_mapping[key]

        if len(city_input) == 3 and city_input.isalpha():
            return city_input.upper()

        return 'HKG'  # 默认返回香港
    
    def search_flights_with_budget(self, origin, destination, departure_date, passengers=1, max_budget=None):
        origin_code = self.get_airport_code(origin)
        destination_code = self.get_airport_code(destination)
           
        try:
            response = self.amadeus.shopping.flight_offers_search.get(
                originLocationCode=origin_code,
                destinationLocationCode=destination_code,
                departureDate=departure_date,
                adults=passengers,
                nonStop='true', 
                max=50 
            )
            
            all_flights = response.data
            print(f"找到 {len(all_flights)} 个航班选项")
            
            if max_budget:
                filtered_flights = []
                for flight in all_flights:
                    price = float(flight['price']['total'])
                    if price <= max_budget:
                        filtered_flights.append(flight)
                
                print(f"预算 {max_budget} 内找到 {len(filtered_flights)} 个航班")
                return filtered_flights
            else:
                return all_flights
                
        except ResponseError as error:
            print(f"航班搜索失败: {error}")
            return None

    def get_round_trip_flights(self, departure_city, destination_city, num_people, budget, departure_date, return_date):
        """获取往返航班信息"""
        flight_budget = budget * 0.5  # 分配50%预算给单程机票
        
        # 查询去程航班
        outbound_flights = self.search_flights_with_budget(
            origin=departure_city,
            destination=destination_city,
            departure_date=departure_date,
            passengers=num_people,
            max_budget=flight_budget
        )
        
        # 查询返程航班
        inbound_flights = self.search_flights_with_budget(
            origin=destination_city,
            destination=departure_city,
            departure_date=return_date,
            passengers=num_people,
            max_budget=flight_budget
        )
        
        return outbound_flights, inbound_flights

    def extract_flight(self, segment, duration, origin, destination):
        """从 segment 信息提取航班数据并返回 Flight 对象"""
        dep_time = segment['departure']['at']
        arr_time = segment['arrival']['at']
        return Flight(
            origin=origin,
            destination=destination,
            departure_time=dep_time.split('T')[1][:5],
            departure_date=dep_time.split('T')[0],
            arrival_time=arr_time.split('T')[1][:5],
            arrival_date=arr_time.split('T')[0],
            duration=duration.replace('PT', '').lower(),
            airline=segment['carrierCode'],
            nonstop=True
        )
