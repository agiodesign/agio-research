const normalizeAreaData = (areaData) => {
  if (typeof areaData === 'string') {
    return {
      bcode: areaData,
      ldongCd: areaData,
      sigunguCd: areaData.substring(0, 5),
    }
  }

  const bcode = areaData?.bcode || ''
  return {
    bcode,
    ldongCd: bcode,
    sigunguCd: areaData?.sigunguCd || (bcode ? bcode.substring(0, 5) : ''),
  }
}

const buildPopulationParams = (areaData, coords, address) => {
  const area = normalizeAreaData(areaData)
  const params = new URLSearchParams({ radius: '500' })

  if (area.sigunguCd) params.set('signguCd', area.sigunguCd)
  if (area.ldongCd) params.set('ldongCd', area.ldongCd)
  if (coords?.lat && coords?.lon) {
    params.set('lat', coords.lat)
    params.set('lon', coords.lon)
  }
  if (address) params.set('address', address)

  return params
}

export const getStoreList = async (areaData, coords, address) => {
  try {
    const params = buildPopulationParams(areaData, coords, address)
    const response = await fetch(`/api/population?${params}`)
    return await response.json()
  } catch (error) {
    console.error('상권 데이터 로드 실패:', error)
    return null
  }
}

export const getStoreSummary = async (areaData, coords, address) => {
  try {
    const params = buildPopulationParams(areaData, coords, address)
    const response = await fetch(`/api/population?${params}`)
    const data = await response.json()
    const items = Array.isArray(data?.items) ? data.items : []
    const categoryCounts = items.reduce((acc, item) => {
      const name = item.indsLclsNm || item.indsLclsCd || '기타'
      acc[name] = (acc[name] || 0) + 1
      return acc
    }, {})
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0] || null

    return {
      success: !data?.error,
      totalCount: data?.dongFilteredCount ?? items.length,
      sourceTotalCount: data?.totalCount ?? items.length,
      radiusCount: data?.filteredCount ?? items.length,
      topCategoryName: topCategory?.[0] || '-',
      topCategoryCount: topCategory?.[1] || 0,
      coords: data?.centerCoords || coords || null,
      raw: data,
    }
  } catch (error) {
    console.error('상권 요약 데이터 로드 실패:', error)
    return { success: false, error: error.message }
  }
}
