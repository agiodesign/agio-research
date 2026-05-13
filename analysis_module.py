import os  # 환경변수에서 공공데이터 API 키를 읽기 위해 표준 os 모듈을 불러옵니다.
import requests  # 카카오 API와 공공데이터 API에 HTTP 요청을 보내기 위해 requests 모듈을 불러옵니다.
from urllib.parse import urlencode  # URL에 들어갈 값을 안전하게 인코딩하기 위해 urlencode 함수를 불러옵니다.


KAKAO_REST_API_KEY = "3d45e8959fb9d51bcc0db0ebaa9a2f51"  # 주소를 좌표로 변환할 때 사용할 카카오 REST API 키입니다.
KAKAO_ADDRESS_URL = "https://dapi.kakao.com/v2/local/search/address.json"  # 카카오 주소 검색 REST API 주소입니다.
SBDC_RADIUS_URL = "https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInRadius"  # 소상공인 상권정보 반경 조회 API 주소입니다.
PUBLIC_DATA_SERVICE_KEY = "mX7nd4kSo5SUrlBEp4FVl2NqZIORFTqKdRXaY2Z2dGwTMIGpEkWDOlwl2YhJHZMx1ED5HpzMDBj4PFY05iA9vQ=="  # 기존 건축물대장 API와 동일하게 사용하는 공공데이터 인증키입니다.


def get_kakao_map(address, radius_m=500):  # 입력받은 주소를 좌표로 바꾸고 반경 원을 표시할 지도 정보를 반환하는 함수입니다.
    try:  # API 통신 실패나 응답 데이터 누락이 생겨도 프로그램이 멈추지 않도록 예외 처리를 시작합니다.
        headers = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"}  # 카카오 REST API가 요구하는 인증 헤더를 만듭니다.
        params = {"query": address}  # 사용자가 입력한 주소를 카카오 주소 검색 API의 query 파라미터로 준비합니다.
        response = requests.get(KAKAO_ADDRESS_URL, headers=headers, params=params, timeout=10)  # 카카오 주소 검색 API를 호출합니다.
        response.raise_for_status()  # HTTP 상태 코드가 실패이면 except 블록으로 이동하도록 예외를 발생시킵니다.
        data = response.json()  # 카카오 API 응답 본문을 JSON 딕셔너리로 변환합니다.

        documents = data.get("documents", [])  # 카카오 원본 JSON의 documents 키를 그대로 유지해서 검색 결과 목록을 꺼냅니다.
        if not documents:  # 검색 결과가 하나도 없는 경우를 확인합니다.
            return {"success": False, "error": "주소 검색 결과가 없습니다.", "raw": data}  # 실패 사유와 원본 JSON을 함께 반환합니다.

        first = documents[0]  # 가장 앞의 검색 결과를 대표 주소 결과로 사용합니다.
        longitude = first.get("x")  # 카카오 주소 검색 API에서 x 키는 경도 값을 의미합니다.
        latitude = first.get("y")  # 카카오 주소 검색 API에서 y 키는 위도 값을 의미합니다.

        if not longitude or not latitude:  # 위도 또는 경도 값이 누락되었는지 확인합니다.
            return {"success": False, "error": "좌표 정보가 누락되었습니다.", "raw": data}  # 좌표 누락 오류와 원본 JSON을 함께 반환합니다.

        map_link_params = urlencode({"urlX": longitude, "urlY": latitude, "itemId": address})  # 카카오맵 링크용 파라미터를 안전하게 인코딩합니다.
        kakao_map_url = f"https://map.kakao.com/link/map/{address},{latitude},{longitude}?{map_link_params}"  # 브라우저에서 열 수 있는 카카오맵 링크를 만듭니다.
        map_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>상권 분석 지도</title>
<style>
html, body, #map {{
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
}}
</style>
<script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey={KAKAO_REST_API_KEY}"></script>
</head>
<body>
<div id="map"></div>
<script>
var center = new kakao.maps.LatLng({latitude}, {longitude});
var map = new kakao.maps.Map(document.getElementById('map'), {{
    center: center,
    level: 4
}});
var marker = new kakao.maps.Marker({{
    position: center
}});
marker.setMap(map);
var circle = new kakao.maps.Circle({{
    center: center,
    radius: {radius_m},
    strokeWeight: 3,
    strokeColor: '#2563EB',
    strokeOpacity: 0.9,
    strokeStyle: 'solid',
    fillColor: '#60A5FA',
    fillOpacity: 0.18
}});
circle.setMap(map);
</script>
</body>
</html>"""  # 카카오 지도 SDK로 중심 마커와 반경 원을 그리는 독립 HTML 예시입니다.

        return {  # 호출한 쪽에서 필요한 값을 골라 쓸 수 있도록 딕셔너리 형태로 결과를 반환합니다.
            "success": True,  # 주소 변환과 지도 정보 생성이 성공했는지 표시합니다.
            "address": address,  # 사용자가 입력한 원본 주소입니다.
            "latitude": latitude,  # 카카오 API에서 얻은 위도입니다.
            "longitude": longitude,  # 카카오 API에서 얻은 경도입니다.
            "radius_m": radius_m,  # 지도에 표시할 반경 값입니다.
            "kakao_map_url": kakao_map_url,  # 카카오맵에서 바로 열 수 있는 링크입니다.
            "map_html": map_html,  # 독립 HTML로 지도와 원을 표시할 수 있는 코드입니다.
            "raw": data,  # 카카오 원본 JSON 구조를 그대로 보존한 값입니다.
        }  # 성공 결과 반환을 끝냅니다.

    except requests.exceptions.RequestException as e:  # 네트워크 오류, 타임아웃, HTTP 오류를 처리합니다.
        return {"success": False, "error": f"카카오 API 통신 실패: {e}"}  # 통신 실패 정보를 반환합니다.
    except ValueError as e:  # JSON 파싱 실패를 처리합니다.
        return {"success": False, "error": f"카카오 API JSON 파싱 실패: {e}"}  # JSON 오류 정보를 반환합니다.
    except Exception as e:  # 예상하지 못한 모든 오류를 처리합니다.
        return {"success": False, "error": f"카카오 지도 처리 중 오류 발생: {e}"}  # 일반 오류 정보를 반환합니다.


def get_population_data(latitude, longitude, service_key=None, radius_m=500, num_of_rows=100):  # 좌표 기준 반경 500m 안의 상권 데이터를 조회하는 함수입니다.
    try:  # 공공데이터 API 통신이나 JSON 파싱 중 오류가 나도 프로그램이 멈추지 않게 예외 처리를 시작합니다.
        service_key = service_key or os.getenv("PUBLIC_DATA_SERVICE_KEY") or PUBLIC_DATA_SERVICE_KEY  # 인자, 환경변수, 기본 키 순서로 공공데이터 키를 선택합니다.
        if not service_key:  # 사용할 수 있는 공공데이터 키가 없는지 확인합니다.
            return {"success": False, "error": "공공데이터 서비스 키가 없습니다."}  # 키 누락 오류를 반환합니다.

        params = {  # 소상공인 API 요청 파라미터를 원본 키 이름 그대로 구성합니다.
            "serviceKey": service_key,  # 공공데이터포털 인증키입니다.
            "radius": radius_m,  # 조회 반경을 미터 단위로 전달합니다.
            "cx": longitude,  # 중심 좌표의 경도입니다.
            "cy": latitude,  # 중심 좌표의 위도입니다.
            "numOfRows": num_of_rows,  # 한 페이지에 가져올 데이터 개수입니다.
            "pageNo": 1,  # 첫 번째 페이지부터 조회합니다.
            "type": "json",  # JSON 형식의 응답을 요청합니다.
        }  # 요청 파라미터 구성을 마칩니다.

        response = requests.get(SBDC_RADIUS_URL, params=params, timeout=10)  # 소상공인 반경 조회 API를 호출합니다.
        response.raise_for_status()  # HTTP 상태 코드가 실패이면 except 블록에서 처리하도록 예외를 발생시킵니다.
        data = response.json()  # API 응답을 JSON 딕셔너리로 변환합니다.
        body = data.get("body", {})  # 공공데이터 응답의 body 깊이를 유지해서 접근합니다.
        items = body.get("items", [])  # body 안의 items 키를 유지해서 상권 목록을 꺼냅니다.

        return {  # 원본 JSON과 화면 요약에 필요한 값을 함께 반환합니다.
            "success": True,  # 조회 성공 여부입니다.
            "latitude": latitude,  # 조회 기준 위도입니다.
            "longitude": longitude,  # 조회 기준 경도입니다.
            "radius_m": radius_m,  # 조회 반경입니다.
            "total_count": body.get("totalCount"),  # API가 알려준 전체 데이터 수입니다.
            "items": items,  # 반경 안 상권 목록입니다.
            "raw": data,  # JSON 깊이와 키를 변경하지 않은 원본 응답입니다.
        }  # 성공 결과 반환을 끝냅니다.

    except requests.exceptions.RequestException as e:  # 공공데이터 API 통신 실패를 처리합니다.
        return {"success": False, "error": f"소상공인 API 통신 실패: {e}"}  # 통신 실패 정보를 반환합니다.
    except ValueError as e:  # JSON 변환 실패를 처리합니다.
        return {"success": False, "error": f"소상공인 API JSON 파싱 실패: {e}"}  # JSON 파싱 오류를 반환합니다.
    except Exception as e:  # 예상하지 못한 모든 오류를 처리합니다.
        return {"success": False, "error": f"인구/상권 데이터 처리 중 오류 발생: {e}"}  # 일반 오류 정보를 반환합니다.
