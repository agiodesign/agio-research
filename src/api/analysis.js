export const getStoreList = async (bcode) => {
  try {
    const signguCd = bcode.substring(0, 5)
    const ldongCd = bcode
    const params = new URLSearchParams({ signguCd, ldongCd })
    const response = await fetch(`/api/population?${params}`)
    return await response.json()
  } catch (error) {
    console.error('상가 데이터 로드 실패:', error)
    return null
  }
}
