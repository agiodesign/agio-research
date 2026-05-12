// src/api/building.js

const SERVICE_KEY = 'mx7nd4kSo5SUrlBEp4FVl2NqZIORFTqKdRXay2Z2dGwTMIGpEkWDOlwl2YhJHZMX1ED5HpzMDBj4PFY05iA9vQ%3D%3D';

async function fetchAPI(type, jibun) {
  const baseUrl = 'https://apis.data.go.kr/1613000/BldRgstService_v2';
  const endpoints = {
    info: '/getBrTitleInfo',
    floor: '/getBrFlrInqre'
  };

  const url = `${baseUrl}${endpoints[type]}?serviceKey=${SERVICE_KEY}&sigunguCd=${jibun.sigunguCd}&bjdongCd=${jibun.bjdongCd}&platGbCd=${jibun.platGbCd}&bun=${jibun.bun}&ji=${jibun.ji}&_type=json&numOfRows=1000`;
  const res = await fetch(url);
  return res.json();
}

export async function getBuildingInfo(jibun) {
  try {
    const data = await fetchAPI('info', jibun);
    const item = data?.response?.body?.items?.item;
    const b = Array.isArray(item) ? item[0] : item;
    if (!b) return null;
    return {
      purpose: b.mainPurpsCdNm || '-',
      area: b.platArea ? `${parseFloat(b.platArea).toLocaleString()}㎡` : '-',
      floors: `지상 ${b.grndFlrCnt}층 / 지하 ${b.ugrndFlrCnt}층`,
      built: b.pmsDay || b.useAprvDay || '-',
      parking: `내 ${b.indrAutoUtcnt || 0}대 / 외 ${b.oudrAutoUtcnt || 0}대`,
    };
  } catch (e) { return null; }
}

export async function getFloorInfo(jibun) {
  try {
    const data = await fetchAPI('floor', jibun);
    const items = data?.response?.body?.items?.item || [];
    return Array.isArray(items) ? items : [items];
  } catch (e) { return []; }
}
