const KAKAO_JAVASCRIPT_KEY = '3d45e8959fb9d51bcc0db0ebaa9a2f51' // 카카오 지도 SDK를 동적으로 불러올 때 사용할 앱 키입니다.
const KAKAO_SDK_ID = 'agio-kakao-map-sdk' // 같은 스크립트를 여러 번 추가하지 않기 위해 사용할 script 태그 id입니다.
const RADIUS_METER = 500 // 화면에 표시할 상권 분석 반경을 미터 단위로 고정합니다.

function waitForKakaoMap() { // 카카오 지도 SDK가 완전히 준비될 때까지 기다리는 함수입니다.
  return new Promise((resolve, reject) => { // 비동기 로딩 결과를 Promise로 감싸서 호출부에서 await 할 수 있게 합니다.
    if (window.kakao?.maps?.Map) { // 이미 카카오 지도 객체가 준비되어 있으면 추가 로딩 없이 바로 처리합니다.
      resolve(window.kakao) // 준비된 카카오 전역 객체를 반환합니다.
      return // 이미 성공했으므로 아래 로직을 실행하지 않습니다.
    } // 기존 SDK 확인을 마칩니다.

    const existingScript = document.getElementById(KAKAO_SDK_ID) // 이전에 우리가 추가한 SDK script 태그가 있는지 확인합니다.
    const script = existingScript || document.createElement('script') // 기존 태그가 있으면 재사용하고 없으면 새 script 태그를 만듭니다.
    script.id = KAKAO_SDK_ID // script 태그를 나중에 다시 찾을 수 있도록 id를 지정합니다.
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JAVASCRIPT_KEY}&libraries=services&autoload=false` // 지도와 주소검색 services 라이브러리를 함께 불러옵니다.
    script.async = true // 브라우저 렌더링을 막지 않도록 비동기 로딩을 설정합니다.

    script.onload = () => { // SDK 파일 다운로드가 끝났을 때 실행할 함수를 등록합니다.
      window.kakao.maps.load(() => resolve(window.kakao)) // 카카오 내부 초기화가 끝난 뒤 전역 객체를 반환합니다.
    } // onload 처리를 끝냅니다.

    script.onerror = () => { // SDK 파일을 불러오지 못했을 때 실행할 함수를 등록합니다.
      reject(new Error('카카오 지도 SDK를 불러오지 못했습니다.')) // 호출부에서 처리할 수 있도록 오류를 반환합니다.
    } // onerror 처리를 끝냅니다.

    if (!existingScript) { // 아직 script 태그가 없을 때만 문서에 새로 추가합니다.
      document.head.appendChild(script) // head 영역에 카카오 지도 SDK script 태그를 삽입합니다.
    } // script 삽입 조건 처리를 끝냅니다.
  }) // Promise 생성을 끝냅니다.
} // waitForKakaoMap 함수 정의를 끝냅니다.

export async function renderKakaoRadiusMap(container, coords, address) { // 지정한 DOM 요소에 카카오 지도와 500m 원을 그리는 함수입니다.
  try { // 지도 로딩 실패나 좌표 누락으로 화면이 멈추지 않도록 예외 처리를 시작합니다.
    if (!container || !coords?.lat || !coords?.lon) { // 지도 컨테이너나 좌표가 없으면 지도를 그릴 수 없습니다.
      return { success: false, error: '지도 표시용 좌표가 없습니다.' } // 실패 사유를 반환합니다.
    } // 필수 값 검사를 끝냅니다.

    const kakao = await waitForKakaoMap() // 카카오 지도 SDK가 준비될 때까지 기다립니다.
    const center = new kakao.maps.LatLng(coords.lat, coords.lon) // 위도와 경도로 카카오 지도 중심 좌표 객체를 만듭니다.
    const map = new kakao.maps.Map(container, { center, level: 4 }) // 전달받은 화면 영역에 지도를 생성합니다.
    const marker = new kakao.maps.Marker({ position: center }) // 분석 기준 주소 위치를 표시할 마커를 만듭니다.
    marker.setMap(map) // 마커를 지도 위에 표시합니다.

    const circle = new kakao.maps.Circle({ // 반경 500m 원 객체를 생성합니다.
      center, // 원의 중심은 주소 좌표와 동일하게 설정합니다.
      radius: RADIUS_METER, // 원의 반지름을 500m로 설정합니다.
      strokeWeight: 3, // 원 테두리 두께를 설정합니다.
      strokeColor: '#2563eb', // 원 테두리 색상을 파란색 계열로 설정합니다.
      strokeOpacity: 0.9, // 원 테두리 불투명도를 설정합니다.
      strokeStyle: 'solid', // 원 테두리 선 스타일을 실선으로 설정합니다.
      fillColor: '#60a5fa', // 원 내부 채움 색상을 설정합니다.
      fillOpacity: 0.18, // 지도 내용을 볼 수 있도록 원 내부를 반투명하게 설정합니다.
    }) // 원 객체 생성을 끝냅니다.
    circle.setMap(map) // 반경 원을 지도 위에 표시합니다.

    const infoWindow = new kakao.maps.InfoWindow({ // 주소 텍스트를 보여줄 간단한 정보창을 만듭니다.
      content: `<div style="padding:6px 10px;font-size:12px;white-space:nowrap;">${address || '분석 위치'}</div>`, // 정보창 안에 표시할 주소 HTML입니다.
    }) // 정보창 객체 생성을 끝냅니다.
    infoWindow.open(map, marker) // 마커 위에 정보창을 표시합니다.

    return { success: true, map, marker, circle } // 필요할 경우 호출부가 지도 객체를 참조할 수 있도록 결과를 반환합니다.
  } catch (error) { // 지도 생성 중 발생한 오류를 처리합니다.
    console.error('카카오 지도 표시 실패:', error) // 개발자가 원인을 확인할 수 있도록 콘솔에 오류를 남깁니다.
    return { success: false, error: error.message } // 화면이 멈추지 않도록 실패 정보를 반환합니다.
  } // 예외 처리를 끝냅니다.
} // renderKakaoRadiusMap 함수 정의를 끝냅니다.

function getDistance(lat1, lon1, lat2, lon2) { // 두 좌표 사이의 거리를 미터 단위로 계산하는 함수입니다.
  const earthRadius = 6371000 // 지구 반지름을 미터 단위로 둡니다.
  const dLat = (lat2 - lat1) * Math.PI / 180 // 위도 차이를 라디안으로 변환합니다.
  const dLon = (lon2 - lon1) * Math.PI / 180 // 경도 차이를 라디안으로 변환합니다.
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2 // 하버사인 공식의 중간 값을 계산합니다.
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) // 최종 거리를 미터 단위로 반환합니다.
} // getDistance 함수 정의를 끝냅니다.

export async function getPopulationSummary(bcode, coords) { // 기존 상권 API를 이용해 화면용 요약 데이터를 만드는 함수입니다.
  try { // API 실패나 데이터 누락으로 화면이 멈추지 않도록 예외 처리를 시작합니다.
    if (!bcode) { // 법정동 코드가 없으면 기존 상권 API를 호출할 수 없습니다.
      return { success: false, error: '법정동 코드가 없습니다.' } // 실패 사유를 반환합니다.
    } // 법정동 코드 검사를 끝냅니다.

    const signguCd = bcode.substring(0, 5) // 기존 population API가 쓰는 시군구 코드를 법정동 코드 앞 5자리에서 꺼냅니다.
    const ldongCd = bcode // 기존 population API가 쓰는 법정동 코드는 전체 bcode를 그대로 사용합니다.
    const params = new URLSearchParams({ signguCd, ldongCd }) // 기존 api/population.js가 받는 쿼리 파라미터를 그대로 구성합니다.
    const response = await fetch(`/api/population?${params}`) // 기존 상권 API 엔드포인트를 호출합니다.
    const data = await response.json() // API 응답을 JSON으로 변환합니다.
    const sourceItems = Array.isArray(data?.items) ? data.items : [] // items 배열이 있으면 사용하고 없으면 빈 배열로 안전하게 처리합니다.
    const radiusItems = coords ? sourceItems.filter((item) => item.lat && item.lon && getDistance(coords.lat, coords.lon, item.lat, item.lon) <= RADIUS_METER) : sourceItems // 좌표가 있으면 500m 안 업소만 남깁니다.
    const categoryCounts = radiusItems.reduce((acc, item) => { // 업종 대분류별 개수를 누적합니다.
      const name = item.indsLclsNm || item.indsLclsCd || '기타' // 업종명이 없으면 업종 코드나 기타로 표시합니다.
      acc[name] = (acc[name] || 0) + 1 // 해당 업종의 개수를 1개 증가시킵니다.
      return acc // 다음 반복을 위해 누적 객체를 반환합니다.
    }, {}) // 빈 객체에서 누적을 시작합니다.
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0] || null // 가장 많은 업종을 찾습니다.

    return { // 화면에서 바로 사용할 수 있는 요약 데이터를 반환합니다.
      success: true, // 요약 생성 성공 여부입니다.
      totalCount: data?.totalCount || sourceItems.length, // API 전체 개수 또는 실제 배열 길이를 표시합니다.
      radiusCount: radiusItems.length, // 반경 500m 안 업소 수입니다.
      topCategoryName: topCategory?.[0] || '-', // 가장 많은 업종명입니다.
      topCategoryCount: topCategory?.[1] || 0, // 가장 많은 업종의 개수입니다.
      raw: data, // 기존 API 원본 응답을 보존합니다.
    } // 성공 결과 반환을 끝냅니다.
  } catch (error) { // API 호출이나 파싱 중 생긴 오류를 처리합니다.
    console.error('상권 요약 생성 실패:', error) // 개발자가 원인을 확인할 수 있도록 콘솔에 오류를 남깁니다.
    return { success: false, error: error.message } // 화면이 멈추지 않도록 실패 정보를 반환합니다.
  } // 예외 처리를 끝냅니다.
} // getPopulationSummary 함수 정의를 끝냅니다.
