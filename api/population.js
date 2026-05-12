export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  
  const { signguCd, ldongCd } = req.query
  const API_KEY = 'mX7nd4kSo5SUrlBEp4FVl2NqZIORFTqKdRXaY2Z2dGwTMIGpEkWDOlwl2YhJHZMx1ED5HpzMDBj4PFY05iA9vQ=='
  
  const url = `https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInDong?serviceKey=${encodeURIComponent(API_KEY)}&type=json&divId=signguCd&key=${signguCd}&numOfRows=1000&pageNo=1`

  try {
    const response = await fetch(url)
    const json = await response.json()
    
    if (json?.header?.resultCode !== '00') {
      return res.status(200).json({ error: json?.header?.resultMsg })
    }

    // ldongCd로 필터링
    const items = json.body?.items || []
    const filtered = ldongCd 
      ? items.filter(item => item.ldongCd === ldongCd)
      : items

    res.status(200).json({
      totalCount: json.body?.totalCount,
      filteredCount: filtered.length,
      items: filtered
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
