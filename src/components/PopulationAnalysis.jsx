import React, { useState, useEffect } from 'react';
import { getPopulationStatus } from '../api/analysis';

const PopulationAnalysis = ({ bjdongCode }) => {
  const [popData, setPopData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // 법정동 코드가 없으면 실행하지 않음
      if (!bjdongCode) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // 소상공인 API 호출 (법정동 기준)
        const result = await getPopulationStatus('bjdongCd', bjdongCode);
        setPopData(result);
      } catch (err) {
        console.error("데이터 로드 실패:", err);
        setError("데이터를 가져오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bjdongCode]);

  return (
    <div style={{ 
      marginTop: '40px', 
      padding: '20px', 
      border: '2px solid #4A90E2', 
      borderRadius: '8px',
      backgroundColor: '#fff',
      textAlign: 'left'
    }}>
      <h2 style={{ color: '#4A90E2', marginBottom: '15px' }}>📊 상권 인구 분석 리포트</h2>
      
      {loading && <p>데이터를 불러오는 중입니다... ⏳</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {!loading && !popData && !error && (
        <p>해당 지역({bjdongCode})의 인구 데이터를 찾을 수 없습니다.</p>
      )}

      {!loading && popData && (
        <div>
          <div style={{ padding: '10px', background: '#e3f2fd', borderRadius: '4px', marginBottom: '20px' }}>
            <p style={{ margin: 0, color: '#1976d2', fontWeight: 'bold' }}>
              ✅ 성공적으로 데이터를 연결했습니다!
            </p>
            <small>이제 이 데이터를 활용해 그래프를 그릴 수 있습니다.</small>
          </div>

          <p><strong>수신된 데이터 미리보기:</strong></p>
          <pre style={{ 
            fontSize: '11px', 
            background: '#333', 
            color: '#fff', 
            padding: '15px', 
            borderRadius: '5px',
            overflowX: 'auto',
            maxHeight: '300px'
          }}>
            {JSON.stringify(popData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PopulationAnalysis;
