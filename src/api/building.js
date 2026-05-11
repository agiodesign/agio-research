const PURPS = {
  '010': '단독주택',
  '020': '공동주택',
  '030': '제1종근린생활시설',
  '040': '제2종근린생활시설',
  '050': '문화및집회시설',
  '060': '종교시설',
  '070': '판매시설',
  '080': '운수시설',
  '090': '의료시설',
  '100': '교육연구시설',
  '110': '노유자시설',
  '120': '수련시설',
  '130': '운동시설',
  '140': '업무시설',
  '150': '숙박시설',
  '160': '위락시설',
  '170': '공장',
  '180': '창고시설',
  '190': '위험물저장및처리시설',
  '200': '자동차관련시설',
}

function getPurpose(cd) {
  if (!cd) return '-'
  return PURPS[cd.substring(0, 3)] || '-'
}

export async function getBuildingInfo(jibun) {
  const params = new URLSearchParams({
    type: 'title',
    sigunguCd: jibun.sigunguCd,
    bjdongCd: jibun.bjdongCd,
    bun: jibun.bun,
    ji: jibun.ji,
  })
  const res = await fetch(`/api/building?${params}`)
  const text = await res.text()
  const data = JSON.parse(text)
  const items = data?.response?.body?.items?.item
  if (!items) throw new Error('건축물대장 정보를 찾을 수 없습니다')
  const item = Array.isArray(items) ? items[0] : items
  return {
    purpose: getPurpose(item.mainPurpsCd),
    area: item.totArea ? `${parseFloat(item.totArea).toLocaleString()}㎡` : '-',
    floors: `지상 ${item.grndFlrCnt || 0}층 / 지하 ${item.ugrndFlrCnt || 0}층`,
    built: item.useAprDay ? `${item.useAprDay.substring(0,4)}년 (${new Date().getFullYear() - parseInt(item.useAprDay.substring(0,4))}년)` : '-',
    structure: item.strctCdNm || '-',
    bcRat: item.bcRat ? `${item.bcRat}%` : '-',
    parking: item.oudrAutoUtcnt ? `실외 ${item.oudrAutoUtcnt}대` : (item.indrAutoUtcnt ? `실내 ${item.indrAutoUtcnt}대` : '-'),
  }
}

export async function getFloorInfo(jibun) {
  const params = new URLSearchParams({
    type: 'floor',
    sigunguCd: jibun.sigunguCd,
    bjdongCd: jibun.bjdongCd,
    bun: jibun.bun,
    ji: jibun.ji,
  })
  const res = await fetch(`/api/building?${params}`)
  const text = await res.text()
  const data = JSON.parse(text)
  const items = data?.response?.body?.items?.item
  if (!items) return []
  const arr = Array.isArray(items) ? items : [items]
  const floorOrder = ['지하2층','지하1층','1층','2층','3층','4층','5층','6층','7층','8층','9층','10층','11층','12층','13층','14층','15층']
  return arr
    .map(f => ({
      floor: f.flrNoNm || '-',
      purpose: getPurpose(f.mainPurpsCd),
      detailPurpose: f.mainPurpsCdNm || '-',
      area: f.area ? `${parseFloat(f.area).toLocaleString()}㎡` : '-',
    }))
    .sort((a, b) => {
      const ai = floorOrder.indexOf(a.floor)
      const bi = floorOrder.indexOf(b.floor)
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
}
