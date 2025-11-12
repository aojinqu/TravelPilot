import requests

def get_place_photo_url(place_name, api_key):
    """根据地名返回Google Maps照片URL"""

    find_place_url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
    find_params = {
        "input": place_name,
        "inputtype": "textquery",
        "fields": "place_id",
        "key": api_key
    }
    find_resp = requests.get(find_place_url, params=find_params).json()
    
    if not find_resp.get("candidates"):
        print("未找到该地点")
        return None
    
    place_id = find_resp["candidates"][0]["place_id"]
    print(f"找到 place_id: {place_id}")

    details_url = "https://maps.googleapis.com/maps/api/place/details/json"
    details_params = {
        "place_id": place_id,
        "fields": "photos",
        "key": api_key
    }
    details_resp = requests.get(details_url, params=details_params).json()
    
    photos = details_resp.get("result", {}).get("photos", [])
    if not photos:
        print("该地点没有照片数据")
        return None
    
    photo_reference = photos[0]["photo_reference"]
    photo_url = (
        "https://maps.googleapis.com/maps/api/place/photo"
        f"?maxwidth=1600&photoreference={photo_reference}&key={api_key}"
    )
    return photo_url


# if __name__ == "__main__":
#     API_KEY = "" 
#     address = "13-6-3 Shibuya, Tokyo 150-0002, Japan"
    
#     image_url = get_place_photo_url(address, API_KEY)
#     print("图片URL:", image_url)
