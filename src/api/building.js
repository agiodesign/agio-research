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
    purpose: item.mainPurpsCdNm || '-',
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
  const floorOrder = ['지하2층','지하1층','1층','2층','3층','4층','5층','6층','7층','8층','9층','10층']
  return arr
    .map(f => ({
      floor: f.flrNoNm || '-',
      purpose: f.mainPurpsCdNm || '-',
      area: f.area ? `${parseFloat(f.area).toLocaleString()}㎡` : '-',
    }))
    .sort((a, b) => {
      const ai = floorOrder.indexOf(a.floor)
      const bi = floorOrder.indexOf(b.floor)
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
}
