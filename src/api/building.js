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
  // 응답이 JSON인지 확인하는 안전장치
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return await res.json();
  } else {
    const text = await res.text();
    try { return JSON.parse(text); } catch(e) { return null; }
  }
}

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
    // 집합건물 구분 키를 더 유연하게 체크 (regstrGbCd 또는 regstrKindCd)
    isComplex: item.regstrGbCd === '2' || item.regstrKindCd === '2',
  }
}

export async function getUnitInfo(jibun, hoNm) {
  const data = await fetchAPI('unit', jibun)
  // 전유부 API 응답 구조가 items.item 아래에 있는지, 아니면 직계에 있는지 체크
  const rawItems = data?.items || data?.response?.body?.items?.item
  if (!rawItems) return null
  
  const arr = Array.isArray(rawItems) ? rawItems : [rawItems]
  
  // 1. 필터링 완화: exposPubuseGbCd 체크를 제거하거나 유연하게 변경
  // (집합건물인데 전유부 코드값이 안 넘어오는 경우가 많음)
  const units = arr; 

  if (!hoNm) return units.map(u => ({
    hoNm: u.hoNm,
    floor: u.flrNoNm || u.flrNm,
    purpose: getPurpose(u.mainPurpsCd),
    detailPurpose: u.mainPurpsCdNm || u.etcPurps || '-',
    area: u.area ? `${parseFloat(u.area).toLocaleString()}㎡` : '-',
  }))

  // 2. 호수 검색 강화: "101", "101호", "0101" 모두 대응 가능하도록 숫자만 추출해서 비교
  const searchHo = hoNm.replace(/[^0-9]/g, '');
  const unit = units.find(u => {
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
