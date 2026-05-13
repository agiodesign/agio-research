const KAKAO_JAVASCRIPT_KEY = 'a9e1d634eecda9556876d1e4fa722cee' // 카카오 지도 SDK를 동적으로 불러올 때 사용할 앱 키입니다.
const KAKAO_SDK_ID = 'agio-kakao-map-sdk' // 같은 SDK 스크립트를 중복으로 삽입하지 않기 위해 사용할 script 태그 id입니다.
const RADIUS_METER = 500 // 지도와 상권 요약에서 공통으로 사용할 반경 값입니다.
const SDK_RETRY_LIMIT = 30 // window.kakao가 늦게 준비되는 상황에 대비해 최대 재시도 횟수를 정합니다.
const SDK_RETRY_DELAY = 200 // SDK 준비 상태를 다시 확인하기 전 기다릴 시간을 밀리초 단위로 정합니다.

function delay(ms) { // 지정한 시간만큼 기다리는 작은 유틸 함수입니다.
  return new Promise((resolve) => setTimeout(resolve, ms)) // setTimeout을 Promise로 감싸 await로 사용할 수 있게 합니다.
} // delay 함수 정의를 끝냅니다.

function isKakaoMapReady() { // 카카오 지도와 주소 검색 서비스가 모두 준비되었는지 확인하는 함수입니다.
  return Boolean(window.kakao?.maps?.Map && window.kakao?.maps?.services?.Geocoder) // 지도 생성자와 지오코더 생성자가 모두 있으면 true를 반환합니다.
} // isKakaoMapReady 함수 정의를 끝냅니다.

async function waitForKakaoMap() { // 카카오 지도 SDK가 완전히 준비될 때까지 기다리는 함수입니다.
  if (isKakaoMapReady()) { // 이미 SDK가 준비되어 있으면 추가 작업 없이 바로 반환합니다.
    return window.kakao // 준비된 카카오 전역 객체를 반환합니다.
  } // 즉시 반환 조건을 끝냅니다.

  let script = document.getElementById(KAKAO_SDK_ID) // 우리가 이전에 추가한 SDK script 태그가 있는지 확인합니다.
  if (!script) { // 아직 script 태그가 없으면 새로 만들어야 합니다.
    script = document.createElement('script') // 카카오 SDK를 불러올 script 태그를 생성합니다.
    script.id = KAKAO_SDK_ID // 나중에 중복 삽입을 막기 위해 id를 지정합니다.
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JAVASCRIPT_KEY}&libraries=services&autoload=false` // 지도와 주소 검색 라이브러리를 함께 불러옵니다.
    script.async = true // 페이지 렌더링을 막지 않도록 비동기 로딩을 사용합니다.
    document.head.appendChild(script) // 문서 head에 script 태그를 추가해 SDK 로딩을 시작합니다.
  } // script 생성 조건을 끝냅니다.

  for (let attempt = 0; attempt < SDK_RETRY_LIMIT; attempt += 1) { // SDK가 늦게 준비되는 상황을 반복 확인합니다.
    if (window.kakao?.maps?.load && !isKakaoMapReady()) { // autoload=false 상태에서 maps.load 함수가 먼저 준비된 경우를 처리합니다.
      await new Promise((resolve) => window.kakao.maps.load(resolve)) // 카카오 내부 초기화가 끝날 때까지 기다립니다.
    } // maps.load 처리 조건을 끝냅니다.

    if (isKakaoMapReady()) { // 지도와 지오코더가 준비되었는지 다시 확인합니다.
      return window.kakao // 준비가 끝났으면 카카오 전역 객체를 반환합니다.
    } // 준비 완료 조건을 끝냅니다.

    await delay(SDK_RETRY_DELAY) // 아직 준비되지 않았다면 잠시 기다린 뒤 다시 확인합니다.
  } // SDK 준비 재시도 반복을 끝냅니다.

  throw new Error('카카오 지도 SDK가 준비되지 않았습니다.') // 정해진 횟수 안에 준비되지 않으면 호출부에서 처리할 오류를 발생시킵니다.
} // waitForKakaoMap 함수 정의를 끝냅니다.

function normalizeCoords(coords) { // 외부에서 들어온 좌표 값을 안전하게 숫자로 정리하는 함수입니다.
  const lat = Number(coords?.lat) // 위도 값을 숫자로 변환합니다.
  const lon = Number(coords?.lon) // 경도 값을 숫자로 변환합니다.
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null // 위도나 경도가 유효하지 않으면 null을 반환합니다.
  return { lat, lon } // 유효한 좌표이면 정리된 좌표 객체를 반환합니다.
} // normalizeCoords 함수 정의를 끝냅니다.

function geocodeAddress(kakao, address) { // 주소 문자열을 카카오 지오코더로 좌표 변환하는 함수입니다.
  return new Promise((resolve) => { // 카카오 콜백 API를 Promise로 감싸 await로 사용할 수 있게 합니다.
    if (!address) { // 주소가 없으면 변환을 시도할 수 없습니다.
      resolve(null) // 좌표 없음 상태를 반환합니다.
      return // 아래 검색 로직을 실행하지 않습니다.
    } // 주소 누락 조건을 끝냅니다.

    const geocoder = new kakao.maps.services.Geocoder() // 카카오 주소 검색용 지오코더 객체를 생성합니다.
    geocoder.addressSearch(address, (result, status) => { // 주소 문자열을 실시간으로 좌표 검색합니다.
      if (status !== kakao.maps.services.Status.OK || !result?.[0]) { // 검색 실패나 결과 누락을 확인합니다.
        resolve(null) // 좌표 복구 실패를 null로 반환합니다.
        return // 아래 좌표 변환 로직을 실행하지 않습니다.
      } // 검색 실패 조건을 끝냅니다.

      resolve({ lat: Number(result[0].y), lon: Number(result[0].x) }) // 카카오 결과의 y는 위도, x는 경도이므로 앱 좌표 형식으로 반환합니다.
    }) // addressSearch 콜백 등록을 끝냅니다.
  }) // Promise 생성을 끝냅니다.
} // geocodeAddress 함수 정의를 끝냅니다.

async function resolveMapCoords(kakao, coords, address) { // 좌표가 없을 때 주소로 좌표를 복구하는 함수입니다.
  const normalized = normalizeCoords(coords) // 먼저 전달받은 좌표가 유효한지 확인합니다.
  if (normalized) return normalized // 좌표가 유효하면 그대로 사용합니다.
  return await geocodeAddress(kakao, address) // 좌표가 없으면 주소 검색으로 좌표를 복구합니다.
} // resolveMapCoords 함수 정의를 끝냅니다.

export async function renderKakaoRadiusMap(container, coords, address) { // 지정한 DOM 요소에 카카오 지도와 500m 원을 그리는 함수입니다.
  try { // SDK 로딩 실패, 좌표 누락, 주소 검색 실패가 있어도 화면이 멈추지 않도록 예외 처리를 시작합니다.
    if (!container) { // 지도 컨테이너가 없으면 지도를 그릴 수 없습니다.
      return { success: false, error: '지도 컨테이너가 없습니다.' } // 실패 사유를 반환합니다.
    } // 컨테이너 확인을 끝냅니다.

    container.style.setProperty('height', '300px', 'important') // 데이터 로딩 전에도 지도 영역이 보이도록 높이를 강제로 지정합니다.
    container.style.setProperty('min-height', '300px', 'important') // 부모 레이아웃이 줄어드는 상황을 막기 위해 최소 높이도 지정합니다.

    const kakao = await waitForKakaoMap() // 카카오 지도 SDK가 완전히 준비될 때까지 기다립니다.
    const fixedCoords = await resolveMapCoords(kakao, coords, address) // 좌표가 없으면 주소 문자열로 좌표를 복구합니다.
    if (!fixedCoords) { // 좌표 복구까지 실패했는지 확인합니다.
      return { success: false, error: '주소를 좌표로 변환하지 못했습니다.' } // 실패 사유를 반환합니다.
    } // 좌표 확인을 끝냅니다.

    const center = new kakao.maps.LatLng(fixedCoords.lat, fixedCoords.lon) // 위도와 경도로 카카오 지도 중심 좌표 객체를 만듭니다.
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

    setTimeout(() => map.relayout(), 0) // 컨테이너 높이 확정 직후 지도 타일이 틀어지지 않도록 레이아웃을 다시 계산합니다.

    return { success: true, map, marker, circle, coords: fixedCoords } // 호출부가 복구된 좌표를 재사용할 수 있도록 함께 반환합니다.
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
    const fixedCoords = normalizeCoords(coords) // 반경 필터에 사용할 좌표를 숫자 형태로 정리합니다.
    const radiusItems = fixedCoords ? sourceItems.filter((item) => item.lat && item.lon && getDistance(fixedCoords.lat, fixedCoords.lon, item.lat, item.lon) <= RADIUS_METER) : sourceItems // 좌표가 있으면 500m 안 업소만 남깁니다.
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
