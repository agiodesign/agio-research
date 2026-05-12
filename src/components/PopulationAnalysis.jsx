import React, { useState, useEffect } from 'react';
import { getStoreList } from '../api/analysis';

const CATEGORY_COLORS = {
  'I2': { label: '음식', color: '#FF6B6B', icon: '🍽️' },
  'G2': { label: '소매', color: '#4ECDC4', icon: '🛍️' },
  'P1': { label: '교육', color: '#45B7D1', icon: '📚' },
  'Q1': { label: '보건의료', color: '#96CEB4', icon: '🏥' },
  'L1': { label: '부동산', color: '#FFEAA7', icon: '🏠' },
  'M1': { label: '과학·기술', color: '#DDA0DD', icon: '💼' },
  'N1': { label: '시설관리', color: '#F0E68C', icon: '🔧' },
  'F2': { label: '생활서비스', color: '#98FB98', icon: '✂️' },
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

  // 업종별 집계
  const categories = {}
  data.items.forEach(item => {
    const cd = item.indsLclsCd
    const nm = item.indsLclsNm
    if (!categories[cd]) categories[cd] = { name: nm, count: 0 }
    categories[cd].count++
  })

  const sorted = Object.entries(categories)
    .sort((a, b) => b[1].count - a[1].count)

  const total = data.filteredCount

  return (
    <div style={{background:'#fff', borderRadius:'20px', padding:'20px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
      <div style={{fontSize:'13px', fontWeight:'600', color:'#86868b', marginBottom:'4px'}}>🏪 주변 상가 현황</div>
      <div style={{fontSize:'24px', fontWeight:'800', color:'#1d1d1f', marginBottom:'16px'}}>
        총 {total.toLocaleString()}개 업소
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
        {sorted.map(([cd, info]) => {
          const cat = CATEGORY_COLORS[cd]
          const pct = Math.round(info.count / total * 100)
          return (
            <div key={cd}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'4px', fontSize:'13px'}}>
                <span>{cat?.icon || '🏢'} {cat?.label || info.name}</span>
                <span style={{fontWeight:'700', color:'#1d1d1f'}}>{info.count}개 <span style={{color:'#86868b', fontWeight:'400'}}>({pct}%)</span></span>
              </div>
              <div style={{height:'6px', background:'#f5f5f7', borderRadius:'3px', overflow:'hidden'}}>
                <div style={{height:'100%', width:`${pct}%`, background: cat?.color || '#007AFF', borderRadius:'3px', transition:'width 0.5s ease'}} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
