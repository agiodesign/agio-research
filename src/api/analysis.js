 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/src/api/analysis.js b/src/api/analysis.js
index a4d0b6b778a05e5c71227aa89a2c540641dd2d81..6f5ef6c337941e18c80d62ea3aead3950a92d69e 100644
--- a/src/api/analysis.js
+++ b/src/api/analysis.js
@@ -1,21 +1,115 @@
-import axios from 'axios';
+const API_BASE = (import.meta.env.VITE_POPULATION_API_BASE || '/api/population').trim()
 
-const API_KEY = process.env.REACT_APP_API_KEY; // 기존 키 사용
-const BASE_URL = 'http://apis.data.go.kr/B553077/api/open/sdsc2';
+function normalizePayload(data) {
+  const root = data?.response || data || {}
+  const header = root?.header || {}
+  const body = root?.body || {}
+  const items = body?.items?.item
+
+  const normalizedItems = Array.isArray(items) ? items : items ? [items] : []
+  const totalCount = Number(body?.totalCount ?? normalizedItems.length ?? 0)
+
+  return {
+    header,
+    body: {
+      ...body,
+      totalCount: Number.isNaN(totalCount) ? 0 : totalCount,
+      items: normalizedItems,
+      isEmpty: normalizedItems.length === 0,
+    },
+  }
+}
+
+export function normalizeAreaCode(rawCode = '', divId = 'adongCd') {
+  const code = String(rawCode).replace(/\D/g, '')
+
+  if (divId === 'adongCd') return code.slice(0, 8)
+  if (divId === 'bjdongCd' || divId === 'ldongCd') return code.slice(0, 10)
+  if (divId === 'signguCd') return code.slice(0, 5)
+  if (divId === 'sidoCd') return code.slice(0, 2)
+
+  return code
+}
+
+async function requestPopulationApi(params) {
+  const query = new URLSearchParams(params)
+  const response = await fetch(`${API_BASE}?${query}`)
+  const rawText = await response.text()
+
+  if (!response.ok) {
+    throw new Error(`API 요청 실패(${response.status}): ${rawText || response.statusText}`)
+  }
+
+  let data
+  try {
+    data = JSON.parse(rawText)
+  } catch {
+    throw new Error(`JSON 파싱 실패: ${rawText.slice(0, 120)}`)
+  }
+
+  const normalized = normalizePayload(data)
+
+  if (normalized.header?.resultCode && normalized.header.resultCode !== '00') {
+    throw new Error(`상권 API 오류(${normalized.header.resultCode}): ${normalized.header.resultMsg || '알 수 없는 오류'}`)
+  }
+
+  return normalized
+}
+
+export function calcStoreDensity({ totalCount = 0, areaSqm = 0 }) {
+  if (!areaSqm || areaSqm <= 0) {
+    return { totalCount: Number(totalCount) || 0, densityPerSqKm: null }
+  }
+
+  const areaSqKm = areaSqm / 1_000_000
+  return {
+    totalCount: Number(totalCount) || 0,
+    densityPerSqKm: Number(((Number(totalCount) || 0) / areaSqKm).toFixed(2)),
+  }
+}
+
+export async function getStoresInDong({ divId = 'adongCd', key, indsLclsCd = 'I2', indsMclsCd, indsSclsCd, rows = 20 }) {
+  return requestPopulationApi({
+    operation: 'storeListInDong',
+    divId,
+    key,
+    rows,
+    indsLclsCd,
+    ...(indsMclsCd ? { indsMclsCd } : {}),
+    ...(indsSclsCd ? { indsSclsCd } : {}),
+  })
+}
+
+export async function getStoresInBuilding({ key, indsLclsCd, indsMclsCd, indsSclsCd, rows = 100 }) {
+  return requestPopulationApi({
+    operation: 'storeListInBuilding',
+    key,
+    rows,
+    ...(indsLclsCd ? { indsLclsCd } : {}),
+    ...(indsMclsCd ? { indsMclsCd } : {}),
+    ...(indsSclsCd ? { indsSclsCd } : {}),
+  })
+}
+
+export async function getStoresInRadius({ radius, cx, cy, indsLclsCd, indsMclsCd, indsSclsCd, rows = 100 }) {
+  return requestPopulationApi({
+    operation: 'storeListInRadius',
+    radius,
+    cx,
+    cy,
+    rows,
+    ...(indsLclsCd ? { indsLclsCd } : {}),
+    ...(indsMclsCd ? { indsMclsCd } : {}),
+    ...(indsSclsCd ? { indsSclsCd } : {}),
+  })
+}
 
-/**
- * 소상공인 상권정보 - 인구 현황 조회
- * @param {string} divId - 구분ID (adongCd: 행정동, bjdongCd: 법정동 등)
- * @param {string} key - 행정동/법정동 코드
- */
 export const getPopulationStatus = async (divId, key) => {
   try {
-    const params = new URLSearchParams({ divId, key })
-    const response = await fetch(`/api/population?${params}`)
-    const data = await response.json()
-    return data?.body
+    const normalizedKey = normalizeAreaCode(key, divId)
+    return await getStoresInDong({ divId, key: normalizedKey })
   } catch (error) {
-    console.error("인구 분석 데이터 로드 실패:", error)
+    console.error('인구 분석 데이터 로드 실패:', error)
     return null
   }
 }
 
EOF
)
