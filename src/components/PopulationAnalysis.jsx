import React, { useState, useEffect } from 'react';
import { getStoresInDong } from '../api/analysis';

const PopulationAnalysis = ({ bjdongCode }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!bjdongCode) return;
      setLoading(true);
      setError(null);

      try {
        // 코덱스가 정규화한 '동 단위 상가 조회' 함수 사용
        const result = await getStoresInDong(bjdongCode);
        
        if (result && result.items) {
          setAnalysis({
            total: result.totalCount || 0,
            sample: result.items[0], 
            stdrYm: result.stdrYm    
          });
        } else {
          setError("해당 지역의 상권 데이터를 찾을 수 없습니다.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [bjdongCode]);

  return (
    <div style={{ 
      marginTop: '20px', 
      padding: '24px', 
      background: '#fff', 
      borderRadius: '20px', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      textAlign: 'left'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1d1d1f', marginBottom: '16px' }}>📊 상권 분석 리포트</h3>
      
      {loading && <p style={{ color: '#86868b' }}>상권 데이터를 불러오는 중... ⏳</p>}
      {error && <div style={{ color: '#FF3B30', fontSize: '14px', background: '#FFF2F2', padding: '12px', borderRadius: '10px' }}>⚠️ {error}</div>}

      {analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#F5F5F7', borderRadius: '14px' }}>
            <div style={{ fontSize: '13px', color: '#86868b', marginBottom: '4px' }}>해당 법정동 총 업소 수</div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#007AFF' }}>{Number(analysis.total).toLocaleString()}개</div>
          </div>
          
          <div style={{ fontSize: '13px', color: '#86868b', lineHeight: '1.6' }}>
            • 데이터 기준: {analysis.stdrYm || '최신'} <br />
            • 주요 업종: <strong>{analysis.sample?.indsLclsNm || '정보 없음'}</strong> 계열 활성화
          </div>
        </div>
      )}
    </div>
  );
};

export default PopulationAnalysis;
