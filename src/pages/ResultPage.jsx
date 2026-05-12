import { useEffect, useState } from 'react'
import { getBuildingInfo, getFloorInfo, getUnitInfo } from '../api/building'
import PopulationAnalysis from '../components/PopulationAnalysis';

const S = {
  wrap: { minHeight:'100vh', background:'#f5f5f7', paddingBottom: '60px' },
  header: { 
    background:'rgba(255,255,255,0.8)', backdropFilter:'blur(10px)', 
    borderBottom:'1px solid #e5e5e5', padding:'12px 20px', 
    position: 'sticky', top: 0, zIndex: 100 
  },
  backBtn: { border:'none', background:'none', fontSize:'14px', color:'#007AFF', cursor:'pointer', padding: '8px 0', fontWeight: '500' },
  headerTitle: { fontSize:'17px', fontWeight:'700', color:'#1d1d1f', letterSpacing:'-0.4px' },
  modeBadge: { fontSize:'11px', fontWeight:'700', padding:'4px 10px', borderRadius:'8px', display:'inline-block', marginTop:'2px' },
  body: { maxWidth:'500px', margin:'0 auto', padding:'16px', display:'flex', flexDirection:'column', gap:'12px' },
  unitCard: { background:'#1d1d1f', borderRadius:'20px', padding:'24px', color:'#fff', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', display:'flex', flexDirection:'column', gap:'12px' },
  section: { background:'#fff', borderRadius:'20px', padding:'20px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' },
  sectionTitle: { fontSize:'13px', fontWeight:'600', color:'#86868b', marginBottom:'16px', display: 'flex', alignItems: 'center', gap: '6px' },
  stackContainer: { display: 'flex', flexDirection: 'column', gap: '4px', background: '#f5f5f7', padding: '10px', borderRadius: '14px', maxHeight: '420px', overflowY: 'auto' },
  stackLevel: { minHeight: '38px', display: 'flex', alignItems: 'center', padding: '0 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '500' },
  infoRow: { display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #f5f5f7' },
  label: { color: '#86868b', fontSize: '14px' },
  value: { color: '#1d1d1f', fontSize: '14px', fontWeight: '600' },
  badge: { padding:'4px 10px', borderRadius:'8px', fontSize:'11px', fontWeight:'700', background:'#f5f5f7', color:'#48484a' }
}

function BuildingStack({ floors, selectedHo }) {
  const targetFloorNm = selectedHo ? (selectedHo.length >= 3 ? selectedHo.slice(0, -2) : selectedHo.charAt(0)) : null;
  const sortedFloors = [...floors].sort((a, b) => {
    const getLevel = (name) => {
      if (name.includes('지') || name.includes('B')) { const num = name.replace(/[^0-9]/g, ''); return -parseInt(num || 1); }
      return parseInt(name.replace(/[^0-9]/g, '') || 0);
    };
    return getLevel(b.floor) - getLevel(a.floor);
  });
  return (
    <div style={S.stackContainer}>
      {sortedFloors.map((f, i) => {
        const isTarget = targetFloorNm && f.floor.includes(targetFloorNm);
        return (
          <div key={i} style={{...S.stackLevel, background: isTarget ? '#007AFF' : '#fff', color: isTarget ? '#fff' : '#1d1d1f', border: isTarget ? 'none' : '1px solid #e5e5e5', marginBottom: '4px'}}>
            <span style={{ width: '40px', fontWeight: '700' }}>{f.floor}</span>
            <div style={{ flex: 1, textAlign: 'left', paddingLeft: '12px', display: 'flex', gap: '6px' }}>
              <span style={{ fontSize: '11px', opacity: 0.8 }}>{f.detailPurpose}</span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700' }}>{f.area}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function ResultPage({ data, onBack }) {
  const [building, setBuilding] = useState(null)
  const [floors, setFloors] = useState([])
  const [unit, setUnit] = useState(null)
  const [loading, setLoading] = useState(false)
  const isBuilding = data.mode === 'building' || !data.mode

  useEffect(() => {
    if (!isBuilding) return
    async function load() {
      try {
        setLoading(true)
        const jibun = data.jibunData
        const [bInfo, fInfo] = await Promise.all([
          getBuildingInfo(jibun),
          getFloorInfo(jibun),
        ])
        setBuilding(bInfo)
        setFloors(fInfo)
        if (data.hoNm) {
          const uInfo = await getUnitInfo(jibun, data.hoNm)
          setUnit(uInfo)
        }
      } catch (e) { console.error(e) } finally { setLoading(false) }
    }
    load()
  }, [data])

  if (loading) return <div style={{...S.wrap, textAlign:'center', paddingTop:'100px'}}>데이터 로딩 중...</div>

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={onBack}>〈 뒤로가기</button>
        <div style={S.headerTitle}>{data.address}</div>
        <span style={{...S.modeBadge, background: isBuilding ? '#e8f0fe' : '#e8f8e8', color: isBuilding ? '#1a56db' : '#1a8a1a'}}>
          {isBuilding ? '🏢 건축물대장' : '📊 상권분석'}
        </span>
      </div>

      <div style={S.body}>
        {isBuilding ? (
          <>
            {unit && (
              <div style={S.unitCard}>
                <div style={{fontSize:'14px', opacity:0.8}}>{unit.hoNm}호 상세정보</div>
                <div style={{fontSize:'32px', fontWeight:'800'}}>{unit.area}</div>
                <div style={{fontSize:'15px', opacity:0.9}}>{unit.floor} · {unit.detailPurpose}</div>
              </div>
            )}
            <div style={S.section}>
              <div style={S.sectionTitle}>📊 건물 단면</div>
              <BuildingStack floors={floors} selectedHo={data.hoNm} />
            </div>
          </>
        ) : (
          /* 핵심 수정: bjdongCode 대신 coords를 넘겨줍니다 */
          <PopulationAnalysis coords={data.jibunData?.coords} />
        )}
      </div>
    </div>
  )
}
