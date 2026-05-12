import React, { useState, useEffect } from 'react';
import { getStoreList } from '../api/analysis';

const PopulationAnalysis = ({ bjdongCode }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!bjdongCode) return
    setLoading(true)
    getStoreList(bjdongCode)
      .then(setData)
      .finally(() => setLoading(false))
  }, [bjdongCode])

  if (loading) return <div style={{padding:'20px', textAlign:'center', color:'#86868b'}}>상가 데이터 로딩 중...</div>
  if (!data) return null

  return (
    <div style={{background:'#fff', borderRadius:'20px', padding:'20px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
      <div style={{fontSize:'13px', fontWeight:'600', color:'#86868b', marginBottom:'16px'}}>🏪 주변 상가 현황</div>
      <div>총 {data.filteredCount}개 업소</div>
      <pre style={{fontSize:'11px', background:'#f4f4f4', padding:'10px', borderRadius:'8px', overflow:'auto', maxHeight:'200px'}}>
        {JSON.stringify(data.items?.slice(0,3), null, 2)}
      </pre>
    </div>
  )
}

export default PopulationAnalysis;
