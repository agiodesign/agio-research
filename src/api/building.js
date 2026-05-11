const BUILDING_API_KEY = 'mX7nd4kSo5SUrlBEp4FVl2NqZIORFTqKdRXaY2Z2dGwTMIGpEkWDOlwl2YhJHZMx1ED5HpzMDBj4PFY05iA9vQ=='

export async function getBuildingInfo(jibun) {
  const params = new URLSearchParams({
    serviceKey: BUILDING_API_KEY,
    siDo: jibun.siDo,
    siGunGu: jibun.siGunGu,
    eupmyundong: jibun.eupmyundong,
    bun: String(jibun.bun).padStart(4, '0'),
    ji: String(jibun.ji).padStart(4, '0'),
    pageNo: '1',
    numOfRows: '10',
    _type: 'json',
  })
  const res = await fetch(`https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo?${params}`)
  const data = await res.json()
  const items = data?.response?.body?.items?.item
  if (!items) throw new Error('건축물대장 정보를 찾을 수 없습니다')
  const item = Array.isArray(items) ? items[0] : items
  return {
    purpose: item.mainPurpsCdNm || '-',
    area: item.totArea ? `${parseFloat(item.totArea).toLocaleString()}㎡` : '-',
    floors: `지상 ${item.grndFlrCnt || 0}층 / 지하 ${item.ugrndFlrCnt || 0}층`,
    built: item.useAprDay ? `${item.useAprDay.substring(0,4)}년 (${new Date().getFullYear() - parseInt(item.useAprDay.substring(0,4))}년)` : '-',
    structure: item.mainStrctCdNm || '-',
    bcRat: item.bcRat ? `${item.bcRat}%` : '-',
    parking: item.indrAutoUtcnt ? `실내 ${item.indrAutoUtcnt}대 / 실외 ${item.oudrAutoUtcnt||0}대` : '-',
  }
}

export async function getFloorInfo(jibun) {
  const params = new URLSearchParams({
    serviceKey: BUILDING_API_KEY,
    siDo: jibun.siDo,
    siGunGu: jibun.siGunGu,
    eupmyundong: jibun.eupmyundong,
    bun: String(jibun.bun).padStart(4, '0'),
    ji: String(jibun.ji).padStart(4, '0'),
    pageNo: '1',
    numOfRows: '100',
    _type: 'json',
  })
  const res = await fetch(`https://apis.data.go.kr/1613000/BldRgstHubService/getBrFlrOulnInfo?${params}`)
  const data = await res.json()
  const items = data?.response?.body?.items?.item
  if (!items) return []
  const arr = Array.isArray(items) ? items : [items]
  return arr.map(f => ({
    floor: f.flrNoNm || '-',
    purpose: f.mainPurpsCdNm || '-',
    area: f.area ? `${parseFloat(f.area).toLocaleString()}㎡` : '-',
  }))
}
