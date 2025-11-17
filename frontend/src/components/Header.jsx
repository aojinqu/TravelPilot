// components/Header.jsx

import { useTravel } from '../context/TravelContext';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { tripOverview, priceSummary, travelInfo, flights, hotels, daily_itinerary} = useTravel();
    const { user, isAuthenticated } = useAuth();

    // ... 你的默认值和数据提取逻辑 (保持不变) ...
    const title = tripOverview?.title || "TravelPilot";
    const totalPrice = priceSummary
        ? `${priceSummary.currency} ${priceSummary.grand_total}`
        : "HKD  0";


    return (
        <header className="flex items-center justify-between px-6 py-3 bg-gray-900 shadow-md z-10">
            {/* ... 左侧标题和分享 (保持不变) ... */}
            <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-gray-200">{title}</h1>
            </div>

            {/*/!* 中间筛选：已更新 *!/*/}
            {/*<div className="flex items-center space-x-3 text-gray-300">*/}
            {/*    /!* 日期选择 *!/*/}
            {/*    <DropdownButton triggerContent={dateRange} triggerIcon={dateIcon}>*/}
            {/*        /!* 使用新组件! *!/*/}
            {/*        <DateRangePicker />*/}
            {/*    </DropdownButton>*/}

            {/*    /!* 人数选择 *!/*/}
            {/*    <DropdownButton triggerContent={numPeople} triggerIcon={peopleIcon}>*/}
            {/*        /!* 使用新组件! *!/*/}
            {/*        <PassengerSelector />*/}
            {/*    </DropdownButton>*/}

            {/*    /!* 地点选择 *!/*/}
            {/*    <DropdownButton triggerContent={location} triggerIcon={locationIcon}>*/}
            {/*        <LocationSearch />*/}
            {/*    </DropdownButton>*/}
            {/*</div>*/}

            {/* ... 右侧总价和预订按钮 ... */}
            <div className="flex items-center space-x-4">
                <div>
                    <span className="block text-sm text-gray-400">Total (per adult)</span>
                    <span className="text-xl font-semibold text-gray-200">{totalPrice}</span>
                </div>

                {/* Save Plan 按钮 */}
                {isAuthenticated && tripOverview && (
                    <button
                        onClick={async () => {
                            try {
                                const planData = {
                                    title: tripOverview?.title || "Travel Plan",
                                    destination: travelInfo?.destination || "",
                                    departure: travelInfo?.departure || "",
                                    num_days: travelInfo?.numDays || 0,
                                    num_people: travelInfo?.numPeople || 0,
                                    budget: priceSummary?.grand_total || 0,
                                    start_date: travelInfo?.startDate || "",
                                    end_date: travelInfo?.endDate || "",
                                    trip_overview: tripOverview,
                                    flights: flights || [],
                                    hotels: hotels || [],
                                    price_summary: priceSummary,
                                    daily_itinerary: daily_itinerary || []
                                };

                                // 调试：打印保存的数据
                                console.log('准备保存的计划数据:', planData);
                                console.log('tripOverview:', tripOverview);
                                console.log('flights:', flights);
                                console.log('hotels:', hotels);
                                console.log('priceSummary:', priceSummary);
                                console.log('daily_itinerary:', daily_itinerary);

                                // 验证数据完整性
                                if (!tripOverview || !flights || flights.length === 0 || !hotels || hotels.length === 0) {
                                    const missing = [];
                                    if (!tripOverview) missing.push('tripOverview');
                                    if (!flights || flights.length === 0) missing.push('flights');
                                    if (!hotels || hotels.length === 0) missing.push('hotels');
                                    alert(`警告：数据不完整，缺少：${missing.join(', ')}。是否仍要保存？`);
                                }

                                const response = await fetch('http://localhost:8000/api/plans/save', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${user.token || user.user_id}`
                                    },
                                    body: JSON.stringify(planData)
                                });
                                
                                const result = await response.json();
                                console.log('保存结果:', result);
                                
                                if (result.success) {
                                    alert('计划保存成功！');
                                } else {
                                    alert('保存失败：' + (result.message || '未知错误'));
                                }
                            } catch (error) {
                                console.error('保存计划失败:', error);
                                alert('保存失败，请稍后重试');
                            }
                        }}
                        className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-lg transition-colors duration-200"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                        </svg>
                        Save Plan
                    </button>
                )}

                {/* Login 按钮 */}
                {!isAuthenticated ? (
                    <button
                        onClick={() => {
                            window.location.href = 'http://localhost:8000/api/auth/google';
                        }}
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg transition-colors duration-200"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        Login
                    </button>
                ) : (
                    <div className="flex items-center space-x-2">
                        {user.picture && (
                            <img
                                src={user.picture}
                                alt={user.name}
                                className="w-8 h-8 rounded-full"
                            />
                        )}
                        <span className="text-sm text-gray-300">{user.name || user.email}</span>
                        <button
                            onClick={() => {
                                localStorage.removeItem('auth_token');
                                localStorage.removeItem('user_info');
                                window.location.reload();
                            }}
                            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
                        >
                            登出
                        </button>
                    </div>
                )}

                <button className="flex items-center px-6 py-2 bg-[#8965F2] hover:bg-purple-700 text-white font-medium rounded-lg shadow-lg transition-colors duration-200">
                    To Calendar
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </button>
            </div>
        </header>
    );
};

export default Header;