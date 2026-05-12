 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/api/population.js b/api/population.js
index d0ec5743596f345cc154485282b4fee930c05e8c..cdc98814b269a7239afd0f015701363c1e145ea2 100644
--- a/api/population.js
+++ b/api/population.js
@@ -1,21 +1,27 @@
 export default async function handler(req, res) {
   res.setHeader('Access-Control-Allow-Origin', '*')
-  const { divId, key } = req.query
+  const { divId, key, indsLclsCd, indsMclsCd, indsSclsCd, rows = '20' } = req.query
   
 const API_KEY = 'mX7nd4kSo5SUrlBEp4FVl2NqZIORFTqKdRXaY2Z2dGwTMIGpEkWDOlwl2YhJHZMx1ED5HpzMDBj4PFY05iA9vQ=='
   
   const params = new URLSearchParams({
     serviceKey: API_KEY,
     type: 'json',
     divId,
     key,
+    numOfRows: rows,
   })
+
+  if (indsLclsCd) params.set('indsLclsCd', indsLclsCd)
+  if (indsMclsCd) params.set('indsMclsCd', indsMclsCd)
+  if (indsSclsCd) params.set('indsSclsCd', indsSclsCd)
   
   try {
-    const response = await fetch(`https://apis.data.go.kr/B553077/api/open/sdsc2/population/status?${params}`)
+    // sdsc2에는 population/status 엔드포인트가 없고, 동 단위 조회는 storeListInDong 사용
+    const response = await fetch(`https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInDong?${params}`)
     const text = await response.text()
-    res.status(200).send(text)
+    res.status(response.status).send(text)
   } catch (e) {
     res.status(500).json({ error: e.message })
   }
 }
 
EOF
)
