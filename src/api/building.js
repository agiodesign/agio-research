// src/api/building.js
const KEY = 'mx7nd4kSo5SUrlBEp4FVl2NqZIORFTqKdRXay2Z2dGwTMIGpEkWDOlwl2YhJHZMX1ED5HpzMDBj4PFY05iA9vQ%3D%3D';

export async function getBuildingInfo(jibun) {
  try {
    const url = `https://apis.data.go.kr/1613000/BldRgstService_v2/getBrTitleInfo?serviceKey=${KEY}&sigunguCd=${jibun.sigunguCd}&bjdongCd=${jibun.bjdongCd}&platGbCd=${jibun.platGbCd}&bun=${jibun.bun}&ji=${jibun.ji}&_type=json`;
    const res = await fetch(url);
    const data = await res.json();
    const item = data?.response?.body?.items?.item;
    const b = Array.isArray(item) ? item[0] : item;
    if (!b) return null;
    return {
      purpose: b.mainPurpsCdNm || '-',
      floors: `지상 ${b.grndFlrCnt || 0}층 / 지하 ${b.ugrndFlrCnt || 0}층`,
      area: b.platArea ? `${parseFloat(b.platArea).toLocaleString()}㎡` : '-',
      built: b.pmsDay || b.useAprvDay || '-',
      parking: `내 ${b.indrAutoUtcnt || 0}대 / 외 ${b.oudrAutoUtcnt || 0}대`,
    };
  } catch (e) { return null; }
}
