export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const { divId, key } = req.query
  
  const API_KEY = '소상공인_API_키_여기에_입력'
  
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
