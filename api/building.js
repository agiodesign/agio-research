// src/api/building.js

const VWORLD_KEY = 'D7C2C114-A22B-3289-9FCB-4D7A163B183B';
const SO_KEY = 'mx7nd4kSo5SUrlBEp4FVl2NqZIORFTqKdRXay2Z2dGwTMIGpEkWDOlwl2YhJHZMX1ED5HpzMDBj4PFY05iA9vQ%3D%3D';

// 1. 주소를 좌표로 변환
export async function getGeoLocation(address) {
  try {
    const url = `https://api.vworld.kr/req/address?service=address&request=getcoord&version=2.0&crs=epsg:4326&address=${encodeURIComponent(address)}&refine=true&simple=false&format=json&type=both&key=${VWORLD_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.response.status === 'OK') {
      return { lng: data.response.result.point.x, lat: data.response.result.point.y };
    }
    return null;
  } catch (e) { return null; }
}

// 2. 상권 분석 데이터 호출
export async function getCommercialAnalysis(lng, lat) {
  try {
    const baseParams = `serviceKey=${SO_KEY}&cx=${lng}&cy=${lat}&radius=500&type=json`;
    const [popRes, salesRes, trendRes] = await Promise.all([
      fetch(`https://apis.data.go.kr/B553077/api/open/sdsc2/baroApi?resId=popstats&catId=lhsc&${baseParams}`),
      fetch(`https://apis.data.go.kr/B553077/api/open/sdsc2/baroApi?resId=store&catId=dynamic&${baseParams}`),
      fetch(`https://apis.data.go.kr/B553077/api/open/sdsc2/baroApi?resId=store&catId=upso&${baseParams}`)
    ]);
    const p = await popRes.json();
    const s = await salesRes.json();
    const t = await trendRes.json();
    return { population: p.body?.items || [], sales: s.body?.items || [], trend: t.body?.items || [] };
  } catch (e) { return null; }
}

// 3. 건축물대장 정보 (이 부분이 화면의 상단 정보입니다)
export async function getBuildingInfo(jibun) {
  try {
    const url = `https://apis.data.go.kr/1613000/BldRgstService_v2/getBrTitleInfo?serviceKey=${SO_KEY}&sigunguCd=${jibun.sigunguCd}&bjdongCd=${jibun.bjdongCd}&platGbCd=${jibun.platGbCd}&bun=${jibun.bun}&ji=${jibun.ji}&_type=json`;
    const res = await fetch(url);
    const data = await res.json();
    const b = data?.response?.body?.items?.item;
    const item = Array.isArray(b) ? b[0] : b;

    if (!item) return null;

    return {
      purpose: item.mainPurpsCdNm || '-',
      floors: `지상 ${item.grndFlrCnt || 0}층 / 지하 ${item.ugrndFlrCnt || 0}층`,
      area: item.platArea ? `${parseFloat(item.platArea).toLocaleString()}㎡` : '-',
      built: item.pmsDay || item.useAprvDay || '-',
      parking: `내 ${item.indrAutoUtcnt || 0}대 / 외 ${item.oudrAutoUtcnt || 0}대`
    };
  } catch (e) { return null; }
}
