import React, { useState, useEffect } from 'react';
import { getStoreList } from '../api/analysis';

const CATEGORIES = {
  'I2': { label: '음식', icon: '🍽️', color: '#FF6B6B' },
  'I1': { label: '숙박', icon: '🏨', color: '#FF9F43' },
  'G2': { label: '소매', icon: '🛍️', color: '#4ECDC4' },
  'P1': { label: '교육', icon: '📚', color: '#45B7D1' },
  'Q1': { label: '보건의료', icon: '🏥', color: '#96CEB4' },
  'L1': { label: '부동산', icon: '🏠', color: '#F7DC6F' },
  'M1': { label: '과학·기술', icon: '💼', color: '#DDA0DD' },
  'F2': { label: '생활서비스', icon: '✂️', color: '#98FB98' },
  'N1': { label: '시설관리', icon: '🔧', color: '#F0A500' },
  'R1': { label: '스포츠·여가', icon: '⚽', color: '#A8E6CF' },
  'S2': { label: '수리·개인관리', icon: '🛠️', color: '#FFB3B3' },
  'H2': { label: '관광·여행', icon: '✈️', color: '#B3D9FF' },
  'J1': { label: '금융·보험', icon: '🏦', color: '#C8B8E8' },
  'K1': { label: '기관·단체', icon: '🏛️', color: '#D4E8B8' },
}

// Haversine 거리 계산 (미터)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function SubItem({ name, stores }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{marginLeft:'12px', borderLeft:'2px solid #f0f0f0', paddingLeft:'10px'}}>
      <div onClick={() => setOpen(!open)} style={{cursor:'pointer', display:'flex', justifyContent:'space-between', padding:'4px 0', fontSize:'12px'}}>
        <span style={{color:'#48484a'}}>{name}</span>
        <span style={{color:'#86868b'}}>{stores.length}개 {open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{display:'flex', flexWrap:'wrap', gap:'4px', paddingBottom:'6px'}}>
          {stores.map((s, i) => (
            <span key={i} style={{fontSize:'11px', background:'#f5f5f7', padding:'3px 8px', borderRadius:'6px', color:'#48484a'}}>{s}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function MidItem({ name, subs }) {
  const [open, setOpen] = useState(false)
  const total = Object.values(subs).reduce((s, a) => s + a.length, 0)
  return (
    <div style={{marginBottom:'4px'}}>
      <div onClick={() => setOpen(!open)} style={{cursor:'pointer', display:'flex', justifyContent:'space-between', padding:'8px 10px', background:'#f9f9f9', borderRadius:'8px', fontSize:'13px'}}>
        <span style={{fontWeight:'600', color:'#1d1d1f'}}>{name}</span>
        <span style={{color:'#86868b'}}>{total}개 {open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{marginTop:'4px'}}>
          {Object.entries(subs).sort((a,b) => b[1].length - a[1].length).map(([sName, stores]) => (
            <SubItem key={sName} name={sName} stores={stores} />
          ))}
        </div>
      )}
    </div>
  )
}

function CategoryDetail({ cd, items }) {
  const cat = CATEGORIES[cd] || { label: cd, icon: '🏢', color: '#ccc' }
  const mids = {}
  items.forEach(item => {
    const m = item.indsMclsNm
    const s = item.indsSclsNm
    if (!mids[m]) mids[m] = {}
    if (!mids[m][s]) mids[m][s] = []
    mids[m][s].push(item.bizesNm)
  })
  return (
    <div style={{border:`1.5px solid ${cat.color}40`, borderRadius:'16px', padding:'16px', marginTop:'10px'}}>
      <div style={{fontSize:'14px', fontWeight:'700', color:'#1d1d1f', marginBottom:'12px'}}>
        {cat.icon} {cat.label} <span style={{fontWeight:'400', color:'#86868b', fontSize:'12px'}}>총 {items.length}개</span>
      </div>
      {Object.entries(mids).sort((a,b) => {
        const at = Object.values(a[1]).reduce((s,x) => s+x.length, 0)
        const bt = Object.values(b[1]).reduce((s,x) => s+x.length, 0)
        return bt - at
      }).map(([mName, subs]) => (
        <MidItem key={mName} name={mName} subs={subs} />
      ))}
    </div>
  )
}

export default function PopulationAnalysis({ bjdongCode, coords }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState([])
  const RADIUS = 500

  useEffect(() => {
    if (!bjdongCode) return
    setLoading(true)
    getStoreList(bjdongCode)
      .then(setData)
      .finally(() => setLoading(false))
  }, [bjdongCode])

  if (loading) return (
    <div style={{background:'#fff', borderRadius:'20px', padding:'24px', textAlign:'center', color:'#86868b', fontSize:'14px'}}>
      상가 데이터 분석 중...
    </div>
  )
  if (!data?.items) return null

  // 반경 500m 필터링
  const items = coords
    ? data.items.filter(item => item.lat && item.lon && getDistance(coords.lat, coords.lon, item.lat, item.lon) <= RADIUS)
    : data.items

  const grouped = {}
  items.forEach(item => {
    const cd = item.indsLclsCd
    if (!grouped[cd]) grouped[cd] = []
    grouped[cd].push(item)
  })

  const toggle = (cd) => setSelected(prev => prev.includes(cd) ? prev.filter(x => x !== cd) : [...prev, cd])

  return (
    <div style={{background:'#fff', borderRadius:'20px', padding:'20px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
      <div style={{fontSize:'13px', fontWeight:'600', color:'#86868b', marginBottom:'4px'}}>🔍 상권 분석</div>
      <div style={{display:'flex', alignItems:'baseline', gap:'8px', marginBottom:'16px'}}>
        <div style={{fontSize:'24px', fontWeight:'800', color:'#1d1d1f'}}>총 {items.length.toLocaleString()}개 업소</div>
        {coords && <div style={{fontSize:'12px', color:'#86868b'}}>반경 500m 이내</div>}
      </div>

      <div style={{display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'4px'}}>
        {Object.entries(grouped).sort((a,b) => b[1].length - a[1].length).map(([cd, list]) => {
          const cat = CATEGORIES[cd] || { label: cd, icon: '🏢', color: '#ccc' }
          const isOn = selected.includes(cd)
          return (
            <button key={cd} onClick={() => toggle(cd)} style={{
              border:`1.5px solid ${cat.color}`,
              background: isOn ? cat.color : '#fff',
              color: isOn ? '#fff' : '#1d1d1f',
              borderRadius:'20px', padding:'6px 14px',
              fontSize:'12px', fontWeight:'600', cursor:'pointer', transition:'all 0.2s'
            }}>
              {cat.icon} {cat.label} {list.length}
            </button>
          )
        })}
      </div>

      {selected.map(cd => grouped[cd] && <CategoryDetail key={cd} cd={cd} items={grouped[cd]} />)}
    </div>
  )
}
