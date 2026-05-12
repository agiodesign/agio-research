import React, { useState, useEffect } from 'react';
import { getPopulationStatus } from '../api/analysis';

const PopulationAnalysis = ({ bjdongCode }) => {
  const [debugInfo, setDebugInfo] = useState({ status: '대기 중', data: null });

  useEffect(() => {
    const fetchData = async () => {
      if (!bjdongCode) return;

      // 💡 핵심: 10자리 코드 중 앞의 8자리만 사용하도록 자릅니다.
      const shortCode = bjdongCode.toString().substring(0, 8);
      
      setDebugInfo({ status: `8자리 코드로 재시도 중 (${shortCode})...`, data: null });

      try {
        // 잘린 코드로 다시 호출
        const result = await getPopulationStatus('adongCd', shortCode); // 구분값도 adongCd로 변경
        
        if (result && result.length > 0) {
          setDebugInfo({ status: '✅ 데이터 로드 성공!', data: result });
        } else {
          // 그래도 안되면 행정동이 아닌 법정동(bjdongCd) 8자리로 한 번 더 시도
          const result2 = await getPopulationStatus('bjdongCd', shortCode);
          if (result2) {
            setDebugInfo({ status: '✅ 법정동 8자리로 성공!', data: result2 });
          } else {
            setDebugInfo({ status: '⚠️ 모든 시도 실패 (데이터 없음)', data: null });
          }
        }
      } catch (err) {
        setDebugInfo({ status: '❌ 에러 발생', data: err.message });
      }
    };

    fetchData();
  }, [bjdongCode]);

  return (
    <div style={{ marginTop: '20px', padding: '20px', border: '2px solid #FF5722', borderRadius: '12px', backgroundColor: '#fff' }}>
      <h3 style={{ color: '#FF5722', marginTop: 0 }}>📊 인구 데이터 연결 현황</h3>
      <p><strong>상태:</strong> {debugInfo.status}</p>
      
      {debugInfo.data ? (
        <div>
          <p style={{ color: 'green', fontWeight: 'bold' }}>데이터를 찾았습니다! 아래는 원본 데이터입니다:</p>
          <pre style={{ fontSize: '11px', background: '#f4f4f4', padding: '15px', borderRadius: '8px', overflowX: 'auto', maxHeight: '200px' }}>
            {JSON.stringify(debugInfo.data, null, 2)}
          </pre>
        </div>
      ) : (
        <div style={{ padding: '15px', background: '#eee', borderRadius: '8px' }}>
          아직 표시할 데이터가 없습니다.
        </div>
      )}
    </div>
  );
};

export default PopulationAnalysis;
