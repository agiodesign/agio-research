import React, { useState, useEffect } from 'react';
import { getPopulationStatus } from '../api/analysis';

const PopulationAnalysis = ({ bjdongCode }) => {
  const [popData, setPopData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!bjdongCode) return;
      setLoading(true);
      try {
        // 법정동 코드를 앞 8자리만 잘라서 사용해야 할 수도 있습니다 (API 사양에 따라)
        const result = await getPopulationStatus('bjdongCd', bjdongCode);
        console.log("API 응답 결과:", result); // 확인용 콘솔로그
        setPopData(result);
      } catch (error) {
        console.error("데이터 호출 에러:", error);
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
      backgroundColor: '#fff' 
    }}>
      <h2 style={{ color: '#4A90E2' }}>📊 상권 인구 분석</h2>
      
      {loading ? (
        <p>데이터를 불러오는 중입니다...</p>
      ) : popData ? (
        <div>
          <p>✅ 데이터를 성공적으로 가져왔습니다!</p>
          {/* 여기에 곧 그래프를 그릴 거예요 */}
          <pre style={{ fontSize: '10px', background: '#eee', padding: '10px' }}>
            {JSON.stringify(popData, null, 2)}
          </pre>
        </div>
      ) : (
        <p>데이터를 불러올 수 없습니다. (법정동 코드: {bjdongCode})</p>
      )}
    </div>
  );
};

export default PopulationAnalysis;
