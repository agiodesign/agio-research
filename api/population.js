export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const { divId, key } = req.query
  
const API_KEY = 'mX7nd4kSo5SUrlBEp4FVl2NqZIORFTqKdRXaY2Z2dGwTMIGpEkWDOlwl2YhJHZMx1ED5HpzMDBj4PFY05iA9vQ=='
  
  const params = new URLSearchParams({
    serviceKey: API_KEY,
    type: 'json',
    divId,
    key,
  })
  
  try {
    const response = await fetch(`http://apis.data.go.kr/B553077/api/open/sdsc2/population/status?${params}`)
    const text = await response.text()
    res.status(200).send(text)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
