const API_KEY = 'mX7nd4kSo5SUrlBEp4FVl2NqZIORFTqKdRXaY2Z2dGwTMIGpEkWDOlwl2YhJHZMx1ED5HpzMDBj4PFY05iA9vQ=='
const KAKAO_REST_API_KEY = '3d45e8959fb9d51bcc0db0ebaa9a2f51'
const BASE = 'https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInDong'
const KAKAO_ADDRESS_URL = 'https://dapi.kakao.com/v2/local/search/address.json'

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const geocodeAddress = async (address) => {
  if (!address) return null
  const response = await fetch(`${KAKAO_ADDRESS_URL}?query=${encodeURIComponent(address)}`, {
    headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` },
  })
  const data = await response.json()
  const first = data?.documents?.[0]
  if (!first?.x || !first?.y) return null
  return { lat: Number(first.y), lon: Number(first.x) }
}

const getDongCenterCoords = (items) => {
  const coords = (items || [])
    .map(item => ({ lat: Number(item.lat), lon: Number(item.lon) }))
    .filter(item => Number.isFinite(item.lat) && Number.isFinite(item.lon))
  if (!coords.length) return null
  const sum = coords.reduce((acc, item) => {
    acc.lat += item.lat
    acc.lon += item.lon
    return acc
  }, { lat: 0, lon: 0 })
  return { lat: sum.lat / coords.length, lon: sum.lon / coords.length }
}

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const { signguCd, ldongCd, lat, lon, address, radius = '500' } = req.query
  const radiusMeter = Number(radius) || 500

  try {
    let centerLat = Number(lat)
    let centerLon = Number(lon)
    let centerCoords = Number.isFinite(centerLat) && Number.isFinite(centerLon)
      ? { lat: centerLat, lon: centerLon }
      : null

    if (!centerCoords && address) {
      centerCoords = await geocodeAddress(address)
      centerLat = Number(centerCoords?.lat)
      centerLon = Number(centerCoords?.lon)
    }

    let source = ldongCd ? await fetchAllByArea('ldongCd', ldongCd) : { ok: false, items: [] }
    let sourceScope = 'ldongCd'

    if (!source.ok || source.items.length === 0) {
      source = await fetchAllByArea('signguCd', signguCd)
      sourceScope = 'signguCd-fallback'
    }

    if (!source.ok) {
      return res.status(200).json({ error: source.error })
    }

    const dongFiltered = ldongCd ? source.items.filter(item => item.ldongCd === ldongCd) : source.items
    if (!centerCoords) {
      centerCoords = getDongCenterCoords(dongFiltered)
      centerLat = Number(centerCoords?.lat)
      centerLon = Number(centerCoords?.lon)
    }
    const hasCenter = Number.isFinite(centerLat) && Number.isFinite(centerLon)
    const radiusFiltered = hasCenter
      ? dongFiltered.filter(item => {
          const itemLat = Number(item.lat)
          const itemLon = Number(item.lon)
          if (!Number.isFinite(itemLat) || !Number.isFinite(itemLon)) return false
          return getDistance(centerLat, centerLon, itemLat, itemLon) <= radiusMeter
        })
      : []

    console.log(`실제 500m 이내 필터링 완료: ${radiusFiltered.length}개`)

    res.status(200).json({
      totalCount: source.totalCount,
      sourceScope,
      dongFilteredCount: dongFiltered.length,
      filteredCount: radiusFiltered.length,
      radius: radiusMeter,
      radiusApplied: hasCenter,
      centerCoords,
      items: radiusFiltered,
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
