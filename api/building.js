const BUILDING_API_KEY = 'mX7nd4kSo5SUrlBEp4FVl2NqZIORFTqKdRXaY2Z2dGwTMIGpEkWDOlwl2YhJHZMx1ED5HpzMDBj4PFY05iA9vQ=='

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const { type, sigunguCd, bjdongCd, bun, ji } = req.query
  const endpointMap = {
    title: 'getBrTitleInfo',
    floor: 'getBrFlrOulnInfo',
    unit: 'getBrExposPubuseAreaInfo',
  }
  const endpoint = endpointMap[type] || 'getBrTitleInfo'
  const baseParams = {
    serviceKey: BUILDING_API_KEY,
    sigunguCd, bjdongCd,
    bun: String(bun).padStart(4, '0'),
    ji: String(ji).padStart(4, '0'),
    _type: 'json',
  }
  try {
    if (type === 'unit') {
      const firstRes = await fetch(`https://apis.data.go.kr/1613000/BldRgstHubService/${endpoint}?${new URLSearchParams({...baseParams, pageNo:'1', numOfRows:'100'})}`)
      const firstData = await firstRes.json()
      const totalCount = firstData?.response?.body?.totalCount || 0
      const firstItems = firstData?.response?.body?.items?.item || []
      const arr = Array.isArray(firstItems) ? firstItems : [firstItems]
      if (totalCount <= 100) {
        res.status(200).json({ items: arr })
        return
      }
      const totalPages = Math.ceil(totalCount / 100)
      const promises = []
      for (let page = 2; page <= totalPages; page++) {
        promises.push(
          fetch(`https://apis.data.go.kr/1613000/BldRgstHubService/${endpoint}?${new URLSearchParams({...baseParams, pageNo: String(page), numOfRows:'100'})}`)
            .then(r => r.json())
            .then(d => {
              const items = d?.response?.body?.items?.item || []
              return Array.isArray(items) ? items : [items]
            })
        )
      }
      const rest = await Promise.all(promises)
      const allItems = arr.concat(...rest)
      res.status(200).json({ items: allItems })
    } else {
      const params = new URLSearchParams({...baseParams, pageNo:'1', numOfRows: type === 'floor' ? '100' : '10'})
      const response = await fetch(`https://apis.data.go.kr/1613000/BldRgstHubService/${endpoint}?${params}`)
      const text = await response.text()
      res.status(200).send(text)
    }
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
