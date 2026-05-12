// src/pages/ResultPage.jsx
import { useEffect, useState } from 'react';
import { getBuildingInfo } from '../api/building';

export default function ResultPage({ data, onBack }) {
  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const bInfo = await getBuildingInfo(data.jibunData);
        setBuilding(bInfo);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [data]);

  if (loading) return <div style={{padding:'100px', textAlign:'center'}}>분석 중...</div>;

  return (
    <div style={{minHeight:'100vh', background:'#f5f5f7', padding:'20px'}}>
      <div style={{maxWidth:'600px', margin:'0 auto'}}>
        <button onClick={onBack} style={{marginBottom:'20px', border:'none', background:'none', color:'#007AFF', cursor:'pointer'}}>〈 뒤로가기</button>
        <div style={{background:'#fff', borderRadius:'24px', padding:'24px', boxShadow:'0 4px 20px rgba(0,0,0,0.05)'}}>
          <h3 style={{marginBottom:'20px'}}>🏢 건축물 정보 요약</h3>
          {[
            { label: '주용도', value: building?.purpose },
            { label: '규모', value: building?.floors },
            { label: '대지면적', value: building?.area },
            { label: '준공일자', value: building?.built },
            { label: '주차대수', value: building?.parking }
          ].map((item, i) => (
            <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom: i===4?'none':'1px solid #f2f2f7'}}>
              <span style={{color:'#86868b'}}>{item.label}</span>
              <span style={{fontWeight:'700'}}>{item.value || '-'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
