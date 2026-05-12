export const getStoreList = async (coords) => {
  try {
    if (!coords || !coords.lat || !coords.lon) return null
    
    // 좌표 정보와 반경(500m)을 서버 파라미터로 전달
    const params = new URLSearchParams({ 
      lat: coords.lat, 
      lon: coords.lon, 
      radius: 500 
    })
    const response = await fetch(`/api/population?${params}`)
    return await response.json()
  } catch (error) {
    console.error('상가 데이터 로드 실패:', error)
    return null
  }
}
