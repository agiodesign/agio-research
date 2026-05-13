const KAKAO_REST_API_KEY = '3d45e8959fb9d51bcc0db0ebaa9a2f51'
const KAKAO_ADDRESS_URL = 'https://dapi.kakao.com/v2/local/search/address.json'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const { address } = req.query
  if (!address) {
    return res.status(200).json({ success: false, error: '주소가 없습니다.' })
  }

  try {
    const response = await fetch(`${KAKAO_ADDRESS_URL}?query=${encodeURIComponent(address)}`, {
      headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` },
    })
    const data = await response.json()
    const first = data?.documents?.[0]
    if (!first?.x || !first?.y) {
      return res.status(200).json({ success: false, error: '주소 좌표를 찾을 수 없습니다.', raw: data })
    }

    res.status(200).json({
      success: true,
      coords: { lat: Number(first.y), lon: Number(first.x), lng: Number(first.x) },
      raw: data,
    })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
}
