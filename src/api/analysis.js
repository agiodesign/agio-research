export const getPopulationStatus = async (divId, key) => {
  try {
    const params = new URLSearchParams({ divId, key })
    const response = await fetch(`/api/population?${params}`)
    const data = await response.json()
    return data?.body
  } catch (error) {
    console.error("인구 분석 데이터 로드 실패:", error)
    return null
  }
}
