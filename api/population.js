export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  
  const { divId, key } = req.query
  
  const API_KEY = 'mX7nd4kSo5SUrlBEp4FVl2NqZIORFTqKdRXaY2Z2dGwTMIGpEkWDOlwl2YhJHZMx1ED5HpzMDBj4PFY05iA9vQ=='
  
  // serviceKey는 URLSearchParams 쓰면 이중인코딩 됨 → 직접 조합
  const url = `https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInDong?serviceKey=${encodeURIComponent(API_KEY)}&type=json&divId=${divId}&key=${key}`
  
  try {
    const response = await fetch(url)
    const text = await response.text()
    
    // 응답이 JSON인지 확인
    try {
      const json = JSON.parse(text)
      const resultCode = json?.header?.resultCode
      if (resultCode === '00') {
        res.status(200).json(json.body)
      } else {
        res.status(200).json({ error: json?.header?.resultMsg, code: resultCode })
      }
    } catch {
      res.status(200).send(text)
    }
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
