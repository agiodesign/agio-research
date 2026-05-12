 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/src/components/PopulationAnalysis.jsx b/src/components/PopulationAnalysis.jsx
index 0a8a5d6f9c22fbcecc9cf870e7735b22a9b07b6e..7710a45086e88b048bb1dd49ea77e40088836906 100644
--- a/src/components/PopulationAnalysis.jsx
+++ b/src/components/PopulationAnalysis.jsx
@@ -1,67 +1,101 @@
-import React, { useState, useEffect } from 'react';
-import { getPopulationStatus } from '../api/analysis';
+import React, { useEffect, useState } from 'react'
+import { getPopulationStatus } from '../api/analysis'
 
 const PopulationAnalysis = ({ bjdongCode }) => {
-  const [logs, setLogs] = useState([]);
-  const [finalData, setFinalData] = useState(null);
+  const [logs, setLogs] = useState([])
+  const [finalData, setFinalData] = useState(null)
 
-  const addLog = (msg) => setLogs(prev => [...prev, msg]);
+  const addLog = (msg) => setLogs((prev) => [...prev, msg])
 
   useEffect(() => {
     const searchData = async () => {
       if (!bjdongCode) {
-        addLog("❌ 전달된 코드가 없습니다.");
-        return;
+        addLog('❌ 전달된 코드가 없습니다.')
+        return
+      }
+
+      const codeStr = String(bjdongCode).replace(/\D/g, '')
+      if (codeStr.length < 8) {
+        addLog(`❌ 코드 길이가 올바르지 않습니다: ${codeStr}`)
+        return
       }
 
-      const codeStr = bjdongCode.toString();
       const codes = [
-        { name: '법정동 10자리', type: 'bjdongCd', val: codeStr },
-        { name: '행정/법정 8자리', type: 'adongCd', val: codeStr.substring(0, 8) },
-        { name: '시군구 5자리', type: 'ctprvnCd', val: codeStr.substring(0, 5) } // 시군구 단위까지 확장
-      ];
+        { name: '행정동 8자리', type: 'adongCd', val: codeStr.slice(0, 8) },
+        { name: '시군구 5자리', type: 'signguCd', val: codeStr.slice(0, 5) },
+      ]
 
-      addLog(`🚀 탐색 시작 (원본 코드: ${codeStr})`);
+      addLog(`🚀 탐색 시작 (원본 코드: ${codeStr})`)
 
       for (const item of codes) {
         try {
-          addLog(`🔍 ${item.name}(${item.val}) 시도 중...`);
-          const result = await getPopulationStatus(item.type, item.val);
-          
+          addLog(`🔍 ${item.name}(${item.val}) 시도 중...`)
+          const result = await getPopulationStatus(item.type, item.val)
+
           if (result && (Array.isArray(result) ? result.length > 0 : true)) {
-            addLog(`✅ ${item.name}에서 데이터를 찾았습니다!`);
-            setFinalData(result);
-            return; // 찾으면 종료
+            addLog(`✅ ${item.name}에서 데이터를 찾았습니다!`)
+            setFinalData(result)
+            return
           }
         } catch (err) {
-          addLog(`❌ ${item.name} 에러: ${err.message}`);
+          addLog(`❌ ${item.name} 에러: ${err.message}`)
         }
       }
-      addLog("😭 모든 단위에서 데이터를 찾지 못했습니다.");
-    };
 
-    setLogs([]);
-    searchData();
-  }, [bjdongCode]);
+      addLog('😭 모든 단위에서 데이터를 찾지 못했습니다.')
+    }
+
+    setLogs([])
+    setFinalData(null)
+    searchData()
+  }, [bjdongCode])
 
   return (
-    <div style={{ marginTop: '20px', padding: '20px', border: '2px solid #FF5722', borderRadius: '12px', backgroundColor: '#fff' }}>
+    <div
+      style={{
+        marginTop: '20px',
+        padding: '20px',
+        border: '2px solid #FF5722',
+        borderRadius: '12px',
+        backgroundColor: '#fff',
+      }}
+    >
       <h3 style={{ color: '#FF5722', marginTop: 0 }}>🔍 데이터 탐색 로그</h3>
-      
-      <div style={{ background: '#333', color: '#0f0', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '15px' }}>
-        {logs.map((log, i) => <div key={i}>{log}</div>)}
+
+      <div
+        style={{
+          background: '#333',
+          color: '#0f0',
+          padding: '10px',
+          borderRadius: '8px',
+          fontSize: '12px',
+          marginBottom: '15px',
+        }}
+      >
+        {logs.map((log, i) => (
+          <div key={i}>{log}</div>
+        ))}
       </div>
 
       {finalData && (
         <div>
           <p style={{ color: 'blue', fontWeight: 'bold' }}>🎁 수신된 데이터 구조:</p>
-          <pre style={{ fontSize: '11px', background: '#f4f4f4', padding: '15px', borderRadius: '8px', overflowX: 'auto', maxHeight: '200px' }}>
+          <pre
+            style={{
+              fontSize: '11px',
+              background: '#f4f4f4',
+              padding: '15px',
+              borderRadius: '8px',
+              overflowX: 'auto',
+              maxHeight: '200px',
+            }}
+          >
             {JSON.stringify(finalData, null, 2)}
           </pre>
         </div>
       )}
     </div>
-  );
-};
+  )
+}
 
-export default PopulationAnalysis;
+export default PopulationAnalysis
 
EOF
)
