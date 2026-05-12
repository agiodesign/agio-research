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
        { name: '법정동 10자리', type: 'bjdongCd', val: codeStr },
        { name: '행정/법정 8자리', type: 'adongCd', val: codeStr.substring(0, 8) },
        { name: '시군구 5자리', type: 'ctprvnCd', val: codeStr.substring(0, 5) } // 시군구 단위까지 확장
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

  return (
    <div style={{ marginTop: '20px', padding: '20px', border: '2px solid #FF5722', borderRadius: '12px', backgroundColor: '#fff' }}>
      <h3 style={{ color: '#FF5722', marginTop: 0 }}>🔍 데이터 탐색 로그</h3>
      
      <div style={{ background: '#333', color: '#0f0', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '15px' }}>
        {logs.map((log, i) => <div key={i}>{log}</div>)}
      </div>

      {finalData && (
        <div>
          <p style={{ color: 'blue', fontWeight: 'bold' }}>🎁 수신된 데이터 구조:</p>
          <pre style={{ fontSize: '11px', background: '#f4f4f4', padding: '15px', borderRadius: '8px', overflowX: 'auto', maxHeight: '200px' }}>
            {JSON.stringify(finalData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PopulationAnalysis;
