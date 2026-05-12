// src/api/building.js

const VWORLD_KEY = 'D7C2C114-A22B-3289-9FCB-4D7A163B183B';

/**
 * [Step 1] 주소를 위도/경도로 변환 (Vworld API)
 */
export async function getGeoLocation(address) {
  try {
    // 주소에 특수문자가 있을 수 있으므로 인코딩합니다.
    const encodedAddr = encodeURIComponent(address);
    const url = `https://api.vworld.kr/req/address?service=address&request=getcoord&version=2.0&crs=epsg:4326&address=${encodedAddr}&refine=true&simple=false&format=json&type=both&key=${VWORLD_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.response.status === 'OK') {
      const { x, y } = data.response.result.point;
      console.log('📍 좌표 변환 성공:', { lng: x, lat: y });
      return { lng: x, lat: y }; // x: 경도, y: 위도
    } else {
      console.error('❌ 좌표 변환 실패:', data.response.error?.text);
      return null;
    }
  } catch (e) {
    console.error('⚠️ Vworld API 에러:', e);
    return null;
  }
}
const PURPS = {
  '01': '단독주택', '02': '공동주택', '03': '제1종근린생활시설', '04': '제2종근린생활시설',
  '05': '문화및집회시설', '06': '종교시설', '07': '판매시설', '08': '운수시설', '09': '의료시설',
  '10': '교육연구시설', '11': '노유자시설', '12': '수련시설', '13': '운동시설', '14': '업무시설',
  '15': '숙박시설', '16': '위락시설', '17': '공장', '18': '창고시설', '19': '위험물저장및처리시설',
  '20': '자동차관련시설',
}

function getPurpose(cd) {
  if (!cd) return '-'
  return PURPS[cd.substring(0, 2)] || '-'
}

async function fetchAPI(type, jibun) {
  const params = new URLSearchParams({
    type,
    sigunguCd: jibun.sigunguCd,
    bjdongCd: jibun.bjdongCd,
    bun: jibun.bun,
    ji: jibun.ji,
  })
  const res = await fetch(`/api/building?${params}`)
  const contentType = res.headers.get("content-type");
  
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return await res.json();
  } else {
    const text = await res.text();
    try { return JSON.parse(text); } catch(e) { return null; }
  }
}

// 1. 건축물 기본 정보 조회
export async function getBuildingInfo(jibun) {
  const data = await fetchAPI('title', jibun)
  const items = data?.response?.body?.items?.item
  if (!items) throw new Error('건축물대장 정보를 찾을 수 없습니다')
  const item = Array.isArray(items) ? items[0] : items
  
  return {
    purpose: getPurpose(item.mainPurpsCd),
    area: item.totArea ? `${parseFloat(item.totArea).toLocaleString()}㎡` : '-',
    floors: `지상 ${item.grndFlrCnt || 0}층 / 지하 ${item.ugrndFlrCnt || 0}층`,
    built: item.useAprDay ? `${item.useAprDay.substring(0,4)}년` : '-',
    structure: item.strctCdNm || '-',
    bcRat: item.bcRat ? `${item.bcRat}%` : '-',
    parking: `실내 ${item.indrAutoUtcnt || 0}대 / 실외 ${item.oudrAutoUtcnt || 0}대`,
    isComplex: item.regstrGbCd === '2' || item.regstrKindCd === '2' || item.regstrKindCd === '4',
  }
}

// 2. 층별 정보 조회 (누락되었던 부분)
export async function getFloorInfo(jibun) {
  const data = await fetchAPI('floor', jibun)
  const items = data?.response?.body?.items?.item || data?.items
  if (!items) return []
  
  const arr = Array.isArray(items) ? items : [items]
  const floorOrder = ['지하2층','지하1층','1층','2층','3층','4층','5층','6층','7층','8층','9층','10층','11층','12층','13층','14층','15층']
  
  return arr
    .map(f => ({
      floor: f.flrNoNm || f.flrNm || '-',
      purpose: getPurpose(f.mainPurpsCd),
      detailPurpose: f.mainPurpsCdNm || f.etcPurps || '-',
      area: f.area ? `${parseFloat(f.area).toLocaleString()}㎡` : '-',
    }))
    .sort((a, b) => {
      const ai = floorOrder.indexOf(a.floor)
      const bi = floorOrder.indexOf(b.floor)
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
}

// 3. 호실(전유부) 정보 조회 (검색 로직 강화)
export async function getUnitInfo(jibun, hoNm) {
  const data = await fetchAPI('unit', jibun)
  const rawItems = data?.items || data?.response?.body?.items?.item
  if (!rawItems) return null
  
  const arr = Array.isArray(rawItems) ? rawItems : [rawItems]
  const searchHo = hoNm.replace(/[^0-9]/g, '');

  // 입력된 호수가 있으면 특정 호수만 찾고, 없으면 전체 반환
  if (!hoNm) return arr.map(u => ({
    hoNm: u.hoNm,
    floor: u.flrNoNm || u.flrNm,
    purpose: getPurpose(u.mainPurpsCd),
    detailPurpose: u.mainPurpsCdNm || u.etcPurps || '-',
    area: u.area ? `${parseFloat(u.area).toLocaleString()}㎡` : '-',
  }))

  const unit = arr.find(u => {
    const targetHo = String(u.hoNm).replace(/[^0-9]/g, '');
    return targetHo === searchHo || String(u.hoNm).includes(hoNm);
  })

  if (!unit) return null
  
  return {
    hoNm: unit.hoNm,
    floor: unit.flrNoNm || unit.flrNm,
    purpose: getPurpose(unit.mainPurpsCd),
    detailPurpose: unit.mainPurpsCdNm || unit.etcPurps || '-',
    area: unit.area ? `${parseFloat(unit.area).toLocaleString()}㎡` : '-',
  }
}
