const BUILDING_API_KEY = 'mX7nd4kSo5SUrlBEp4FVl2NqZIORFTqKdRXaY2Z2dGwTMIGpEkWDOlwl2YhJHZMx1ED5HpzMDBj4PFY05iA9vQ=='

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const { type, sigunguCd, bjdongCd, bun, ji } = req.query
  const endpoint = type === 'floor' ? 'getBrFlrOulnInfo' : 'getBrTitleInfo'
  const params = new URLSearchParams({
    serviceKey: BUILDING_API_KEY,
    sigunguCd,
    bjdongCd,
    bun: String(bun).padStart(4, '0'),
    ji: String(ji).padStart(4, '0'),
    pageNo: '1',
    numOfRows: type === 'floor' ? '100' : '10',
    _type: 'json',
  })
  try {
    const response = await fetch(`https://apis.data.go.kr/1613000/BldRgstHubService/${endpoint}?${params}`)
    const text = await response.text()
    res.status(200).send(text)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
