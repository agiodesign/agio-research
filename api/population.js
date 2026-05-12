export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const { signguCd, ldongCd } = req.query
  const API_KEY = 'mX7nd4kSo5SUrlBEp4FVl2NqZIORFTqKdRXaY2Z2dGwTMIGpEkWDOlwl2YhJHZMx1ED5HpzMDBj4PFY05iA9vQ=='
  const BASE = `https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInDong`

  try {
    // 1페이지로 totalCount 먼저 확인
    const firstUrl = `${BASE}?serviceKey=${encodeURIComponent(API_KEY)}&type=json&divId=signguCd&key=${signguCd}&numOfRows=1000&pageNo=1`
    const firstRes = await fetch(firstUrl)
    const firstJson = await firstRes.json()

    if (firstJson?.header?.resultCode !== '00') {
      return res.status(200).json({ error: firstJson?.header?.resultMsg })
    }

    const totalCount = firstJson.body?.totalCount || 0
    const totalPages = Math.ceil(totalCount / 1000)

    // 모든 페이지 병렬 fetch
    const pages = await Promise.all(
      Array.from({ length: totalPages }, (_, i) => i + 1).map(async (page) => {
        if (page === 1) return firstJson.body?.items || []
        const url = `${BASE}?serviceKey=${encodeURIComponent(API_KEY)}&type=json&divId=signguCd&key=${signguCd}&numOfRows=1000&pageNo=${page}`
        const r = await fetch(url)
        const j = await r.json()
        return j.body?.items || []
      })
    )

    const allItems = pages.flat()
    const filtered = ldongCd ? allItems.filter(item => item.ldongCd === ldongCd) : allItems

    res.status(200).json({
      totalCount,
      filteredCount: filtered.length,
      items: filtered
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
