 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/api/population.js b/api/population.js
index d0ec5743596f345cc154485282b4fee930c05e8c..dddbcdc73ae781d0b9e773211c17177623f94957 100644
--- a/api/population.js
+++ b/api/population.js
@@ -1,21 +1,51 @@
+const RAW_API_KEY = 'mX7nd4kSo5SUrlBEp4FVl2NqZIORFTqKdRXaY2Z2dGwTMIGpEkWDOlwl2YhJHZMx1ED5HpzMDBj4PFY05iA9vQ=='
+const ENCODED_API_KEY = encodeURIComponent(RAW_API_KEY)
+
 export default async function handler(req, res) {
   res.setHeader('Access-Control-Allow-Origin', '*')
-  const { divId, key } = req.query
-  
-const API_KEY = 'mX7nd4kSo5SUrlBEp4FVl2NqZIORFTqKdRXaY2Z2dGwTMIGpEkWDOlwl2YhJHZMx1ED5HpzMDBj4PFY05iA9vQ=='
-  
-  const params = new URLSearchParams({
-    serviceKey: API_KEY,
-    type: 'json',
+
+  const {
+    operation = 'storeListInDong',
     divId,
     key,
+    radius,
+    cx,
+    cy,
+    indsLclsCd,
+    indsMclsCd,
+    indsSclsCd,
+    rows = '20',
+  } = req.query
+
+  const allowList = new Set(['storeListInDong', 'storeListInBuilding', 'storeListInRadius'])
+  const targetOperation = allowList.has(operation) ? operation : 'storeListInDong'
+
+  const params = new URLSearchParams({
+    type: 'json',
+    numOfRows: String(rows),
   })
-  
+
+  if (divId) params.set('divId', divId)
+  if (key) params.set('key', key)
+  if (radius) params.set('radius', radius)
+  if (cx) params.set('cx', cx)
+  if (cy) params.set('cy', cy)
+
+  // 동 단위 조회는 기본적으로 음식점(I2) 필터를 적용 (요청 시 override 가능)
+  if (targetOperation === 'storeListInDong' && !indsLclsCd) {
+    params.set('indsLclsCd', 'I2')
+  }
+
+  if (indsLclsCd) params.set('indsLclsCd', indsLclsCd)
+  if (indsMclsCd) params.set('indsMclsCd', indsMclsCd)
+  if (indsSclsCd) params.set('indsSclsCd', indsSclsCd)
+
   try {
-    const response = await fetch(`https://apis.data.go.kr/B553077/api/open/sdsc2/population/status?${params}`)
+    const endpoint = `https://apis.data.go.kr/B553077/api/open/sdsc2/${targetOperation}?serviceKey=${ENCODED_API_KEY}&${params.toString()}`
+    const response = await fetch(endpoint)
     const text = await response.text()
-    res.status(200).send(text)
+    res.status(response.status).send(text)
   } catch (e) {
     res.status(500).json({ error: e.message })
   }
 }
 
EOF
)
