export const RADIUS_500M = 500

export function calculateDistance(center, target) {
  const centerLat = Number(center?.lat)
  const centerLon = Number(center?.lon ?? center?.lng)
  const targetLat = Number(target?.lat)
  const targetLon = Number(target?.lon ?? target?.lng)

  if (![centerLat, centerLon, targetLat, targetLon].every(Number.isFinite)) {
    return Number.POSITIVE_INFINITY
  }

  const earthRadius = 6371000
  const dLat = (targetLat - centerLat) * Math.PI / 180
  const dLon = (targetLon - centerLon) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(centerLat * Math.PI / 180)
    * Math.cos(targetLat * Math.PI / 180)
    * Math.sin(dLon / 2) ** 2

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function filterWithinRadius(items, center, radius = RADIUS_500M) {
  if (!Array.isArray(items) || !center) return []
  return items.filter((item) => calculateDistance(center, item) <= radius)
}
