import React, { useState, useEffect } from 'react';
import { getStoreList } from '../api/analysis';

const TARGET = {
  'P1': { label: '교육', icon: '📚', color: '#45B7D1' },
  'Q1': { label: '보건의료', icon: '🏥', color: '#96CEB4' },
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
            <span key={i} style={{fontSize:'11px', background:'#f5f5f7', padding:'3px 8px', borderRadius:'6px', color:'#48484a'}}>
              {s}
            </span>
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
          {Object.entries(subs)
            .sort((a, b) => b[1].length - a[1].length)
            .map(([sName, stores]) => (
              <SubItem key={sName} name={sName} stores={stores} />
            ))}
        </div>
      )}
    </div>
  )
}

function CategorySection({ title, icon, color, items }) {
  const [open, setOpen] = useState(false)

  // 중분류 → 소분류 그룹핑
  const mids = {}
  items.forEach(item => {
    const m = item.indsMclsNm
    const s = item.indsSclsNm
    if (!mids[m]) mids[m] = {}
    if (!mids[m][s]) mids[m][s] = []
    mids[m][s].push(item.bizesNm)
  })

  return (
    <div style={{border:`1.5px solid ${color}30`, borderRadius:'16px', overflow:'hidden'}}>
      <div onClick={() => setOpen(!open)} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px', background:`${color}15`, cursor:'pointer'}}>
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <span style={{fontSize:'20px'}}>{icon}</span>
          <div>
            <div style={{fontSize:'15px', fontWeight:'700', color:'#1d1d1f'}}>{title}</div>
            <div style={{fontSize:'12px', color:'#86868b'}}>총 {items.length}개 · {Object.keys(mids).length}개 분류</div>
          </div>
        </div>
        <span style={{fontSize:'12px', color:'#86868b'}}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{padding:'12px'}}>
          {Object.entries(mids)
            .sort((a, b) => {
              const aTotal = Object.values(b[1]).reduce((s, x) => s + x.length, 0)
              const bTotal = Object.values(a[1]).reduce((s, x) => s + x.length, 0)
              return bTotal - aTotal
            })
            .map(([mName, subs]) => (
              <MidItem key={mName} name={mName} subs={subs} />
            ))}
        </div>
      )}
    </div>
  )
}

export default function PopulationAnalysis({ bjdongCode }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

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

  const grouped = {}
  data.items.forEach(item => {
    const cd = item.indsLclsCd
    if (!TARGET[cd]) return
    if (!grouped[cd]) grouped[cd] = []
    grouped[cd].push(item)
  })

  return (
    <div style={{background:'#fff', borderRadius:'20px', padding:'20px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)', display:'flex', flexDirection:'column', gap:'10px'}}>
      <div style={{fontSize:'13px', fontWeight:'600', color:'#86868b'}}>🔍 상권 분석</div>
      {Object.entries(TARGET).map(([cd, cat]) => (
        grouped[cd]?.length > 0 && (
          <CategorySection key={cd} title={cat.label} icon={cat.icon} color={cat.color} items={grouped[cd]} />
        )
      ))}
    </div>
  )
}
