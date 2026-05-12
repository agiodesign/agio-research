 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/src/api/analysis.js b/src/api/analysis.js
index a4d0b6b778a05e5c71227aa89a2c540641dd2d81..4066ff1029b1a2a5f32f48eae2fe52650f767695 100644
--- a/src/api/analysis.js
+++ b/src/api/analysis.js
@@ -1,21 +1,95 @@
-import axios from 'axios';
+const API_BASE = (import.meta.env.VITE_POPULATION_API_BASE || '/api/population').trim()
 
-const API_KEY = process.env.REACT_APP_API_KEY; // 기존 키 사용
-const BASE_URL = 'http://apis.data.go.kr/B553077/api/open/sdsc2';
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
+  const header = data?.header || data?.body?.header
+  if (header?.resultCode && header.resultCode !== '00') {
+    throw new Error(`상권 API 오류(${header.resultCode}): ${header.resultMsg || '알 수 없는 오류'}`)
+  }
+
+  return data
+}
+
+export function normalizeAreaCode(rawCode = '', divId = 'adongCd') {
+  const code = String(rawCode).replace(/\D/g, '')
+  if (divId === 'signguCd') return code.slice(0, 5)
+  if (divId === 'sidoCd') return code.slice(0, 2)
+  return code.slice(0, 8)
+}
+
+export function calcStoreDensity({ totalCount = 0, areaSqm = 0 }) {
+  if (!areaSqm || areaSqm <= 0) {
+    return { totalCount, densityPerSqKm: null }
+  }
+
+  const areaSqKm = areaSqm / 1_000_000
+  return {
+    totalCount,
+    densityPerSqKm: Number((totalCount / areaSqKm).toFixed(2)),
+  }
+}
+
+export async function getStoresInDong({ divId = 'adongCd', key, indsLclsCd, indsMclsCd, indsSclsCd, rows = 20 }) {
+  const data = await requestPopulationApi({
+    operation: 'storeListInDong',
+    divId,
+    key,
+    rows,
+    ...(indsLclsCd ? { indsLclsCd } : {}),
+    ...(indsMclsCd ? { indsMclsCd } : {}),
+    ...(indsSclsCd ? { indsSclsCd } : {}),
+  })
+
+  return data?.body || data
+}
+
+export async function getStoresInBuilding({ key, indsLclsCd, indsMclsCd, indsSclsCd, rows = 100 }) {
+  const data = await requestPopulationApi({
+    operation: 'storeListInBuilding',
+    key,
+    rows,
+    ...(indsLclsCd ? { indsLclsCd } : {}),
+    ...(indsMclsCd ? { indsMclsCd } : {}),
+    ...(indsSclsCd ? { indsSclsCd } : {}),
+  })
+
+  return data?.body || data
+}
+
+export async function getStoresInRadius({ radius, cx, cy, indsLclsCd, indsMclsCd, indsSclsCd, rows = 100 }) {
+  const data = await requestPopulationApi({
+    operation: 'storeListInRadius',
+    radius,
+    cx,
+    cy,
+    rows,
+    ...(indsLclsCd ? { indsLclsCd } : {}),
+    ...(indsMclsCd ? { indsMclsCd } : {}),
+    ...(indsSclsCd ? { indsSclsCd } : {}),
+  })
+
+  return data?.body || data
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
+    return await getStoresInDong({ divId, key })
   } catch (error) {
-    console.error("인구 분석 데이터 로드 실패:", error)
+    console.error('인구 분석 데이터 로드 실패:', error)
     return null
   }
 }
 
EOF
)
