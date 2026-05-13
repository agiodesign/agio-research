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
    const center = data?.centerCoords || coords || null
    const items = filterWithinRadius(Array.isArray(data?.items) ? data.items : [], center)
    console.log(`실제 500m 이내 필터링 완료: ${items.length}개`)
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
      radiusCount: items.length,
      topCategoryName: topCategory?.[0] || '-',
      topCategoryCount: topCategory?.[1] || 0,
      coords: center,
      items,
      raw: { ...data, items, filteredCount: items.length },
    }
  } catch (error) {
    console.error('상권 요약 데이터 로드 실패:', error)
    return { success: false, error: error.message }
  }
}
import { filterWithinRadius } from '../utils/distance'
