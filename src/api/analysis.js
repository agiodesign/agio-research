 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/src/api/analysis.js b/src/api/analysis.js
index a4d0b6b778a05e5c71227aa89a2c540641dd2d81..89bd1da8557b4130669b1ba81fbca59e804c3577 100644
--- a/src/api/analysis.js
+++ b/src/api/analysis.js
@@ -1,21 +1,30 @@
-import axios from 'axios';
-
-const API_KEY = process.env.REACT_APP_API_KEY; // 기존 키 사용
-const BASE_URL = 'http://apis.data.go.kr/B553077/api/open/sdsc2';
+const API_BASE = (import.meta.env.VITE_POPULATION_API_BASE || '/api/population').trim()
 
 /**
  * 소상공인 상권정보 - 인구 현황 조회
  * @param {string} divId - 구분ID (adongCd: 행정동, bjdongCd: 법정동 등)
  * @param {string} key - 행정동/법정동 코드
  */
 export const getPopulationStatus = async (divId, key) => {
   try {
     const params = new URLSearchParams({ divId, key })
-    const response = await fetch(`/api/population?${params}`)
-    const data = await response.json()
+    const response = await fetch(`${API_BASE}?${params}`)
+
+    const rawText = await response.text()
+    if (!response.ok) {
+      throw new Error(`API 요청 실패(${response.status}): ${rawText || response.statusText}`)
+    }
+
+    let data
+    try {
+      data = JSON.parse(rawText)
+    } catch {
+      throw new Error(`JSON 파싱 실패: ${rawText.slice(0, 120)}`)
+    }
+
     return data?.body
   } catch (error) {
     console.error("인구 분석 데이터 로드 실패:", error)
     return null
   }
 }
 
EOF
)
