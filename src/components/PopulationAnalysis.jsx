import React from 'react';

const PopulationAnalysis = ({ bjdongCode }) => {
  return (
    <div style={{ 
      marginTop: '40px', 
      padding: '20px', 
      border: '2px solid #4A90E2', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9' 
    }}>
      <h2 style={{ color: '#4A90E2' }}>📊 상권 인구 분석 (준비 중)</h2>
      <p>법정동 코드: <strong>{bjdongCode}</strong></p>
      <p>여기에 세대 수 추이 그래프가 들어갈 예정입니다.</p>
    </div>
  );
};

export default PopulationAnalysis;
