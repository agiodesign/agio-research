import React, { useState, useEffect } from 'react';
import { getPopulationStatus } from '../api/analysis';

const PopulationAnalysis = ({ bjdongCode }) => {
  const [debugInfo, setDebugInfo] = useState({ status: '대기 중', data: null, error: null });

  useEffect(() => {
    const fetchData = async () => {
      if (!bjdongCode) {
        setDebugInfo(prev => ({ ...prev, status: '법정동 코드가 없습니다.' }));
        return;
      }

      setDebugInfo(prev => ({ ...prev, status: `데이터 호출 시작 (코드: ${bjdongCode})` }));

      try {
        // 우선 전달받은 코드 그대로 호출
        const result = await getPopulationStatus('bjdongCd', bjdongCode);
        
        if (result) {
          setDebugInfo({ status: '✅ 호출 성공!', data: result, error: null });
        } else {
          setDebugInfo({ status: '⚠️ 호출은 됐으나 데이터가 비어있음(null)', data: null, error: null });
        }
      } catch (err) {
        setDebugInfo({ status: '❌ API 호출 실패(에러 발생)', data: null, error: err.message });
      }
    };

    fetchData();
  }, [bjdongCode]);

  return (
    <div style={{ marginTop: '40px', padding: '20px', border: '2px solid #FF5722', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h3 style={{ color: '#FF5722' }}>🛠️ 인구 데이터 연결 진단기</h3>
      <p><strong>현재 상태:</strong> {debugInfo.status}</p>
      
      {debugInfo.error && (
        <div style={{ color: 'red', background: '#fee', padding: '10px' }}>
          <strong>에러 메시지:</strong> {debugInfo.error}
        </div>
      )}

      {debugInfo.data ? (
        <pre style={{ fontSize: '11px', background: '#f4f4f4', padding: '15px', overflowX: 'auto' }}>
          {JSON.stringify(debugInfo.data, null, 2)}
        </pre>
      ) : (
        <div style={{ padding: '20px', background: '#eee', marginTop: '10px' }}>
          받아온 데이터가 여기에 표시됩니다. 지금은 비어있습니다.
        </div>
      )}
    </div>
  );
};

export default PopulationAnalysis;
