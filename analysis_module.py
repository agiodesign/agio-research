import math  # 두 좌표 사이의 직선거리를 계산하기 위해 수학 함수를 불러옵니다.
import os  # 환경변수에서 공공데이터 API 키를 읽기 위해 표준 os 모듈을 불러옵니다.
import requests  # 공공데이터 API에 HTTP 요청을 보내기 위해 requests 모듈을 불러옵니다.


SBDC_DONG_URL = "https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInDong"  # 소상공인 상권정보 법정동 조회 API 주소입니다.
PUBLIC_DATA_SERVICE_KEY = "mX7nd4kSo5SUrlBEp4FVl2NqZIORFTqKdRXaY2Z2dGwTMIGpEkWDOlwl2YhJHZMx1ED5HpzMDBj4PFY05iA9vQ=="  # 기존 건축물대장 API와 동일하게 사용하는 공공데이터 인증키입니다.
EARTH_RADIUS_M = 6371000  # 하버사인 거리 계산에 사용할 지구 반지름입니다.


def calculate_distance_m(lat1, lon1, lat2, lon2):  # 두 좌표 사이의 직선거리를 미터 단위로 계산하는 함수입니다.
    lat1_rad = math.radians(float(lat1))  # 첫 번째 위도를 라디안으로 변환합니다.
    lon1_rad = math.radians(float(lon1))  # 첫 번째 경도를 라디안으로 변환합니다.
    lat2_rad = math.radians(float(lat2))  # 두 번째 위도를 라디안으로 변환합니다.
    lon2_rad = math.radians(float(lon2))  # 두 번째 경도를 라디안으로 변환합니다.
    d_lat = lat2_rad - lat1_rad  # 두 위도 사이의 차이를 계산합니다.
    d_lon = lon2_rad - lon1_rad  # 두 경도 사이의 차이를 계산합니다.
    a = math.sin(d_lat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(d_lon / 2) ** 2  # 하버사인 공식의 중간 값을 계산합니다.
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))  # 중심각을 계산합니다.
    return EARTH_RADIUS_M * c  # 지구 반지름과 중심각을 곱해 미터 단위 거리를 반환합니다.


def filter_items_within_radius(items, latitude, longitude, radius_m=500):  # 업소 목록에서 반경 안 데이터만 남기는 함수입니다.
    filtered_items = []  # 반경 안에 들어온 업소만 담을 빈 리스트를 만듭니다.
    for item in items or []:  # items가 None이어도 멈추지 않도록 빈 리스트로 대체하며 반복합니다.
        try:  # 업소 좌표가 비어 있거나 숫자가 아니어도 전체 처리가 멈추지 않도록 예외 처리합니다.
            item_lat = item.get("lat")  # 소상공인 API 업소 위도 값을 원본 키 이름 그대로 읽습니다.
            item_lon = item.get("lon")  # 소상공인 API 업소 경도 값을 원본 키 이름 그대로 읽습니다.
            if item_lat is None or item_lon is None:  # 좌표가 누락된 업소인지 확인합니다.
                continue  # 좌표가 없으면 반경 계산이 불가능하므로 제외합니다.
            distance_m = calculate_distance_m(latitude, longitude, item_lat, item_lon)  # 중심점과 업소 사이의 거리를 계산합니다.
            if distance_m <= radius_m:  # 업소가 지정 반경 안에 있는지 확인합니다.
                filtered_items.append({**item, "distance_m": distance_m})  # 원본 업소 데이터에 거리만 추가해서 결과에 담습니다.
        except (TypeError, ValueError):  # 좌표 변환 실패를 처리합니다.
            continue  # 잘못된 좌표를 가진 업소는 제외하고 다음 업소로 넘어갑니다.
    return filtered_items  # 반경 안 업소 목록만 반환합니다.


def get_population_data(ldong_cd, latitude, longitude, service_key=None, radius_m=500, num_of_rows=1000):  # 법정동 업소 중 중심 좌표 반경 안 데이터만 조회하는 함수입니다.
    try:  # API 통신 실패나 JSON 파싱 실패에 대비합니다.
        service_key = service_key or os.getenv("PUBLIC_DATA_SERVICE_KEY") or PUBLIC_DATA_SERVICE_KEY  # 인자, 환경변수, 기본 키 순서로 공공데이터 키를 선택합니다.
        if not service_key:  # 사용할 수 있는 공공데이터 키가 없는지 확인합니다.
            return {"success": False, "error": "공공데이터 서비스 키가 없습니다."}  # 키 누락 오류를 반환합니다.

        params = {  # 소상공인 API 요청 파라미터를 원본 키 이름 그대로 구성합니다.
            "serviceKey": service_key,  # 공공데이터포털 인증키입니다.
            "type": "json",  # JSON 형식의 응답을 요청합니다.
            "divId": "ldongCd",  # 법정동 코드 기준 조회를 요청합니다.
            "key": ldong_cd,  # 조회할 법정동 코드입니다.
            "numOfRows": num_of_rows,  # 한 페이지에 가져올 데이터 개수입니다.
            "pageNo": 1,  # 첫 번째 페이지부터 조회합니다.
        }  # 요청 파라미터 구성을 마칩니다.

        response = requests.get(SBDC_DONG_URL, params=params, timeout=10)  # 소상공인 법정동 조회 API를 호출합니다.
        response.raise_for_status()  # HTTP 상태 코드가 실패이면 except 블록에서 처리하도록 예외를 발생시킵니다.
        data = response.json()  # API 응답을 JSON 딕셔너리로 변환합니다.
        body = data.get("body", {})  # 공공데이터 응답의 body 깊이를 유지해서 접근합니다.
        items = body.get("items", [])  # body 안의 items 키를 유지해서 상권 목록을 꺼냅니다.
        filtered_items = filter_items_within_radius(items, latitude, longitude, radius_m)  # 중심점 기준 반경 안 업소만 남깁니다.

        return {  # 원본 JSON과 필터링 결과를 함께 반환합니다.
            "success": True,  # 조회 성공 여부입니다.
            "ldong_cd": ldong_cd,  # 조회 기준 법정동 코드입니다.
            "latitude": latitude,  # 중심점 위도입니다.
            "longitude": longitude,  # 중심점 경도입니다.
            "radius_m": radius_m,  # 조회 반경입니다.
            "source_total_count": body.get("totalCount"),  # API가 알려준 원본 전체 데이터 수입니다.
            "filtered_count": len(filtered_items),  # 반경 안으로 필터링된 업소 수입니다.
            "items": filtered_items,  # 반경 안 상권 목록입니다.
            "raw": data,  # JSON 깊이와 키를 변경하지 않은 원본 응답입니다.
        }  # 성공 결과 반환을 끝냅니다.

    except requests.exceptions.RequestException as e:  # 공공데이터 API 통신 실패를 처리합니다.
        return {"success": False, "error": f"소상공인 API 통신 실패: {e}"}  # 통신 실패 정보를 반환합니다.
    except ValueError as e:  # JSON 변환 실패를 처리합니다.
        return {"success": False, "error": f"소상공인 API JSON 파싱 실패: {e}"}  # JSON 파싱 오류를 반환합니다.
    except Exception as e:  # 예상하지 못한 모든 오류를 처리합니다.
        return {"success": False, "error": f"상권 데이터 처리 중 오류 발생: {e}"}  # 일반 오류 정보를 반환합니다.
