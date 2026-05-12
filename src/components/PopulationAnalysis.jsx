 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/src/components/PopulationAnalysis.jsx b/src/components/PopulationAnalysis.jsx
index 0a8a5d6f9c22fbcecc9cf870e7735b22a9b07b6e..aebe183061bf95d32dcad1573ab0784e0984e066 100644
--- a/src/components/PopulationAnalysis.jsx
+++ b/src/components/PopulationAnalysis.jsx
@@ -1,46 +1,46 @@
 import React, { useState, useEffect } from 'react';
 import { getPopulationStatus } from '../api/analysis';
 
 const PopulationAnalysis = ({ bjdongCode }) => {
   const [logs, setLogs] = useState([]);
   const [finalData, setFinalData] = useState(null);
 
   const addLog = (msg) => setLogs(prev => [...prev, msg]);
 
   useEffect(() => {
     const searchData = async () => {
       if (!bjdongCode) {
         addLog("❌ 전달된 코드가 없습니다.");
         return;
       }
 
       const codeStr = bjdongCode.toString();
       const codes = [
-        { name: '법정동 10자리', type: 'bjdongCd', val: codeStr },
-        { name: '행정/법정 8자리', type: 'adongCd', val: codeStr.substring(0, 8) },
-        { name: '시군구 5자리', type: 'ctprvnCd', val: codeStr.substring(0, 5) } // 시군구 단위까지 확장
+        // sdsc2 storeListInDong는 divId가 adongCd 또는 signguCd 계열일 때 안정적으로 동작
+        { name: '행정동 8자리', type: 'adongCd', val: codeStr.substring(0, 8) },
+        { name: '시군구 5자리', type: 'signguCd', val: codeStr.substring(0, 5) },
       ];
 
       addLog(`🚀 탐색 시작 (원본 코드: ${codeStr})`);
 
       for (const item of codes) {
         try {
           addLog(`🔍 ${item.name}(${item.val}) 시도 중...`);
           const result = await getPopulationStatus(item.type, item.val);
           
           if (result && (Array.isArray(result) ? result.length > 0 : true)) {
             addLog(`✅ ${item.name}에서 데이터를 찾았습니다!`);
             setFinalData(result);
             return; // 찾으면 종료
           }
         } catch (err) {
           addLog(`❌ ${item.name} 에러: ${err.message}`);
         }
       }
       addLog("😭 모든 단위에서 데이터를 찾지 못했습니다.");
     };
 
     setLogs([]);
     searchData();
   }, [bjdongCode]);
 
 
EOF
)
