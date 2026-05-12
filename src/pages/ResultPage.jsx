import { useEffect, useState } from 'react';
import { getBuildingInfo, getFloorInfo } from '../api/building';

export default function ResultPage({ data, onBack }) {
  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const bInfo = await getBuildingInfo(data.jibunData);
        setBuilding(bInfo);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [data]);

  if (loading) return <div style={{padding:'100px', textAlign:'center'}}>정보 불러오는 중...</div>;

  return (
    <div style={{minHeight:'100vh', background:'#f5f5f7', padding:'20px'}}>
      <button onClick={onBack} style={{marginBottom:'20px'}}>〈 뒤로가기</button>
      <div style={{maxWidth:'600px', margin:'0 auto', background:'#fff', borderRadius:'20px', padding:'24px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}>
        <h3 style={{marginBottom:'20px'}}>🏢 건축물 정보 요약</h3>
        <div style={{display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #eee'}}>
          <span>주용도</span><strong>{building?.purpose}</strong>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #eee'}}>
          <span>규모</span><strong>{building?.floors}</strong>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #eee'}}>
          <span>대지면적</span><strong>{building?.area}</strong>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #eee'}}>
          <span>준공일자</span><strong>{building?.built}</strong>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', padding:'12px 0'}}>
          <span>주차대수</span><strong>{building?.parking}</strong>
        </div>
      </div>
    </div>
  );
}
