 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/api/population.js b/api/population.js
index d0ec5743596f345cc154485282b4fee930c05e8c..ebba10b3c9c7b96cd5079546bd12b32a7eb2ce1a 100644
--- a/api/population.js
+++ b/api/population.js
@@ -1,21 +1,39 @@
 export default async function handler(req, res) {
   res.setHeader('Access-Control-Allow-Origin', '*')
-  const { divId, key } = req.query
+  const {
+    operation = 'storeListInDong',
+    divId,
+    key,
+    radius,
+    cx,
+    cy,
+    indsLclsCd,
+    indsMclsCd,
+    indsSclsCd,
+    rows = '20',
+  } = req.query
   
 const API_KEY = 'mX7nd4kSo5SUrlBEp4FVl2NqZIORFTqKdRXaY2Z2dGwTMIGpEkWDOlwl2YhJHZMx1ED5HpzMDBj4PFY05iA9vQ=='
   
-  const params = new URLSearchParams({
-    serviceKey: API_KEY,
-    type: 'json',
-    divId,
-    key,
-  })
+  const params = new URLSearchParams({ serviceKey: API_KEY, type: 'json', numOfRows: rows })
+  if (divId) params.set('divId', divId)
+  if (key) params.set('key', key)
+  if (radius) params.set('radius', radius)
+  if (cx) params.set('cx', cx)
+  if (cy) params.set('cy', cy)
+
+  if (indsLclsCd) params.set('indsLclsCd', indsLclsCd)
+  if (indsMclsCd) params.set('indsMclsCd', indsMclsCd)
+  if (indsSclsCd) params.set('indsSclsCd', indsSclsCd)
   
   try {
-    const response = await fetch(`https://apis.data.go.kr/B553077/api/open/sdsc2/population/status?${params}`)
+    const allowList = new Set(['storeListInDong', 'storeListInBuilding', 'storeListInRadius'])
+    const targetOperation = allowList.has(operation) ? operation : 'storeListInDong'
+
+    const response = await fetch(`https://apis.data.go.kr/B553077/api/open/sdsc2/${targetOperation}?${params}`)
     const text = await response.text()
-    res.status(200).send(text)
+    res.status(response.status).send(text)
   } catch (e) {
     res.status(500).json({ error: e.message })
   }
 }
 
EOF
)
