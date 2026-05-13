export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const { signguCd, ldongCd, lat, lon, radius = '500' } = req.query
  const API_KEY = 'mX7nd4kSo5SUrlBEp4FVl2NqZIORFTqKdRXaY2Z2dGwTMIGpEkWDOlwl2YhJHZMx1ED5HpzMDBj4PFY05iA9vQ=='
  const BASE = 'https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInDong'
  const centerLat = Number(lat)
  const centerLon = Number(lon)
  const radiusMeter = Number(radius) || 500
  const hasCenter = Number.isFinite(centerLat) && Number.isFinite(centerLon)

  // 두 좌표 사이의 직선 거리를 미터 단위로 계산합니다.
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  // 공공데이터 API의 한 페이지를 가져옵니다.
  const fetchPage = async (divId, key, pageNo) => {
    const params = new URLSearchParams({
      serviceKey: API_KEY,
      type: 'json',
      divId,
      key,
      numOfRows: '1000',
      pageNo: String(pageNo),
    })
    const response = await fetch(`${BASE}?${params}`)
    return await response.json()
  }

  // 법정동 또는 시군구 기준으로 전체 페이지를 가져옵니다.
  const fetchAllByArea = async (divId, key) => {
    if (!key) return { ok: false, error: '조회 코드가 없습니다.', totalCount: 0, items: [] }

    const firstJson = await fetchPage(divId, key, 1)
    if (firstJson?.header?.resultCode !== '00') {
      return { ok: false, error: firstJson?.header?.resultMsg, totalCount: 0, items: [] }
    }

    const totalCount = firstJson.body?.totalCount || 0
    const totalPages = Math.ceil(totalCount / 1000)
    const firstItems = firstJson.body?.items || []
    const restPages = await Promise.all(
      Array.from({ length: Math.max(totalPages - 1, 0) }, (_, i) => i + 2).map(async (page) => {
        const json = await fetchPage(divId, key, page)
        return json.body?.items || []
      })
    )

    return { ok: true, totalCount, items: firstItems.concat(...restPages) }
  }

  try {
    // 17,901개처럼 시군구 전체 개수가 섞이지 않도록 법정동 조회를 먼저 시도합니다.
    let source = ldongCd ? await fetchAllByArea('ldongCd', ldongCd) : { ok: false, items: [] }
    let sourceScope = 'ldongCd'

    // API가 법정동 직접 조회를 지원하지 않거나 빈 결과를 주면 시군구 조회 후 법정동 코드로 한 번 더 좁힙니다.
    if (!source.ok || source.items.length === 0) {
      source = await fetchAllByArea('signguCd', signguCd)
      sourceScope = 'signguCd-fallback'
    }

    if (!source.ok) {
      return res.status(200).json({ error: source.error })
    }

    // 법정동 코드가 있으면 실제 해당 동네 업소만 남깁니다.
    const dongFiltered = ldongCd ? source.items.filter(item => item.ldongCd === ldongCd) : source.items

    // 중심 좌표가 있으면 500m 초과 업소는 카운트와 리스트에서 모두 제외합니다.
    const radiusFiltered = hasCenter
      ? dongFiltered.filter(item => {
          const itemLat = Number(item.lat)
          const itemLon = Number(item.lon)
          if (!Number.isFinite(itemLat) || !Number.isFinite(itemLon)) return false
          return getDistance(centerLat, centerLon, itemLat, itemLon) <= radiusMeter
        })
      : dongFiltered

    res.status(200).json({
      totalCount: source.totalCount,
      sourceScope,
      dongFilteredCount: dongFiltered.length,
      filteredCount: radiusFiltered.length,
      radius: radiusMeter,
      radiusApplied: hasCenter,
      items: radiusFiltered,
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
