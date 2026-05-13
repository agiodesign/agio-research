export const getStoreList = async (bcode, coords) => {
  try {
    const signguCd = bcode.substring(0, 5)
    const ldongCd = bcode
    const params = new URLSearchParams({ signguCd, ldongCd })
    if (coords?.lat && coords?.lon) {
      params.set('lat', coords.lat)
      params.set('lon', coords.lon)
      params.set('radius', '500')
    }
    const response = await fetch(`/api/population?${params}`)
    return await response.json()
  } catch (error) {
    console.error('상가 데이터 로드 실패:', error)
    return null
  }
}
