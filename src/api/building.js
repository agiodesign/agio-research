// src/api/building.js

const VWORLD_KEY = 'D7C2C114-A22B-3289-9FCB-4D7A163B183B';
const SO_KEY = 'mx7nd4kSo5SUrlBEp4FVl2NqZIORFTqKdRXay2Z2dGwTMIGpEkWDOlwl2YhJHZMX1ED5HpzMDBj4PFY05iA9vQ%3D%3D';

/**
 * 1. 주소를 위도/경도로 변환 (Vworld API)
 */
export async function getGeoLocation(address) {
  try {
    const encodedAddr = encodeURIComponent(address);
    const url = `https://api.vworld.kr/req/address?service=address&request=getcoord&version=2.0&crs=epsg:4326&address=${encodedAddr}&refine=true&simple=false&format=json&type=both&key=${VWORLD_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.response.status === 'OK') {
      const { x, y } = data.response.result.point;
      return { lng: x, lat: y };
    }
    return null;
  } catch (e) {
    console.error('Vworld API 에러:', e);
    return null;
  }
}

/**
 * 2. 상권 분석 데이터 호출 (인구/매출/업소추이)
 */
export async function getCommercialAnalysis(lng, lat) {
  try {
    const baseParams = `serviceKey=${SO_KEY}&cx=${lng}&cy=${lat}&radius=500&type=json`;

    // 3가지 핵심 데이터 병렬 호출
    const [popRes, salesRes, trendRes] = await Promise.all([
      fetch(`https://apis.data.go.kr/B553077/api/open/sdsc2/baroApi?resId=popstats&catId=lhsc&${baseParams}`),
      fetch(`https://apis.data.go.kr/B553077/api/open/sdsc2/baroApi?resId=store&catId=dynamic&${baseParams}`),
      fetch(`https://apis.data.go.kr/B553077/api/open/sdsc2/baroApi?resId=store&catId=upso&${baseParams}`)
    ]);

    const popData = await popRes.json();
    const salesData = await salesRes.json();
    const trendData = await trendRes.json();

    return {
      population: popData.body?.items || [],
      sales: salesData.body?.items || [],
      trend: trendData.body?.items || []
    };
  } catch (e) {
    console.error("상권 데이터 수집 에러:", e);
    return null;
  }
}

/**
 * 3. 기존 건축물 정보 API 관련 (기존 코드 유지)
 */
const BUILDING_API_KEY = decodeURIComponent(SO_KEY); 

async function fetchAPI(type, jibun) {
  const baseUrl = 'https://apis.data.go.kr/1613000/BldRgstService_v2';
  const endpoints = {
    info: '/getBrTitleInfo',
    floor: '/getBrFlrInqre',
    unit: '/getBrExposPubuseAreaInqre'
  };

  const url = `${baseUrl}${endpoints[type]}?serviceKey=${BUILDING_API_KEY}&sigunguCd=${jibun.sigunguCd}&bjdongCd=${jibun.bjdongCd}&platGbCd=${jibun.platGbCd}&bun=${jibun.bun}&ji=${jibun.ji}&_type=json&numOfRows=1000`;
  
  const res = await fetch(url);
  return res.json();
}

export async function getBuildingInfo(jibun) {
  const data = await fetchAPI('info', jibun);
  const item = data?.response?.body?.items?.item;
  const b = Array.isArray(item) ? item[0] : item;
  if (!b) return null;
  return {
    purpose: b.mainPurpsCdNm || '-',
    area: `${parseFloat(b.platArea).toLocaleString()}㎡`,
    floors: `지상 ${b.grndFlrCnt}층 / 지하 ${b.ugrndFlrCnt}층`,
    built: b.pmsDay || '-',
    parking: `실내 ${b.indrAutoUtcnt}대 / 실외 ${b.oudrAutoUtcnt}대`,
    structure: b.strctCdNm || '-'
  };
}

export async function getFloorInfo(jibun) {
  const data = await fetchAPI('floor', jibun);
  const items = data?.response?.body?.items?.item || [];
  const arr = Array.isArray(items) ? items : [items];
  
  const floorOrder = ['지하', 'B', '지', '옥탑'];
  return arr.map(f => ({
    floor: f.flrNoNm || `${f.flrNo}층`,
    purpose: f.mainPurpsCdNm || '-',
    detailPurpose: f.etcPurps || '-',
    area: f.area ? `${parseFloat(f.area).toLocaleString()}㎡` : '-'
  })).sort((a, b) => {
    const getLevel = (n) => {
      if (n.includes('지') || n.includes('B')) return -parseInt(n.replace(/[^0-9]/g, '') || 1);
      return parseInt(n.replace(/[^0-9]/g, '') || 0);
    };
    return getLevel(b.floor) - getLevel(a.floor);
  });
}

export async function getUnitInfo(jibun, hoNm) {
  const data = await fetchAPI('unit', jibun);
  const rawItems = data?.response?.body?.items?.item;
  if (!rawItems) return null;
  const arr = Array.isArray(rawItems) ? rawItems : [rawItems];
  const unit = arr.find(u => String(u.hoNm).includes(hoNm));
  if (!unit) return null;
  return {
    hoNm: unit.hoNm,
    floor: unit.flrNoNm || '-',
    purpose: unit.mainPurpsCdNm || '-',
    detailPurpose: unit.etcPurps || '-',
    area: unit.area ? `${parseFloat(unit.area).toLocaleString()}㎡` : '-'
  };
}
