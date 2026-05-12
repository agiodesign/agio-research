export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  // 1. 위도(lat), 경도(lon), 반경(radius)을 쿼리 스트링에서 받습니다.
  const { lat, lon, radius = 500 } = req.query
  const API_KEY = 'mX7nd4kSo5SUrlBEp4FVl2NqZIORFTqKdRXaY2Z2dGwTMIGpEkWDOlwl2YhJHZMx1ED5HpzMDBj4PFY05iA9vQ=='
  
  // 2. 지정 핵심지점 내 상가업소 조회(반경 기준) 엔드포인트로 변경
  const BASE = `https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInRadius`

  try {
    // 3. cx: 경도(lon), cy: 위도(lat), radius: 반경(미터) 파라미터 적용
    const firstUrl = `${BASE}?serviceKey=${encodeURIComponent(API_KEY)}&type=json&radius=${radius}&cx=${lon}&cy=${lat}&numOfRows=1000&pageNo=1`
    const firstRes = await fetch(firstUrl)
    const firstJson = await firstRes.json()

    if (firstJson?.header?.resultCode !== '00') {
      return res.status(200).json({ error: firstJson?.header?.resultMsg })
    }

    const totalCount = firstJson.body?.totalCount || 0
    const totalPages = Math.ceil(totalCount / 1000)

    // 1000개 이상의 업소가 있을 경우 모든 페이지 병렬 fetch
    const pages = await Promise.all(
      Array.from({ length: totalPages }, (_, i) => i + 1).map(async (page) => {
        if (page === 1) return firstJson.body?.items || []
        const url = `${BASE}?serviceKey=${encodeURIComponent(API_KEY)}&type=json&radius=${radius}&cx=${lon}&cy=${lat}&numOfRows=1000&pageNo=${page}`
        const r = await fetch(url)
        const j = await r.json()
        return j.body?.items || []
      })
    )

    const allItems = pages.flat()

    res.status(200).json({
      totalCount,
      items: allItems
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
