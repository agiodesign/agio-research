import { useEffect, useState } from 'react'
import { getBuildingInfo, getGeoLocation, getCommercialAnalysis } from '../api/building'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ResultPage({ data, onBack }) {
  const [building, setBuilding] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        // [1] 건축물 정보 로드
        const bInfo = await getBuildingInfo(data.jibunData)
        if (bInfo) setBuilding(bInfo)

        // [2] 좌표 및 상권 분석
        const coords = await getGeoLocation(data.address)
        if (coords) {
          const commData = await getCommercialAnalysis(coords.lng, coords.lat)
          const dummyPop = [{ name: '주거', value: 4500 }, { name: '직장', value: 3200 }, { name: '유동', value: 8900 }]
          setAnalysis({ ...commData, refinedPop: dummyPop })
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [data])

  if (loading) return <div style={{padding:'100px', textAlign:'center'}}>분석 중...</div>

  return (
    <div style={{minHeight:'100vh', background:'#f5f5f7', paddingBottom:'60px'}}>
      <div style={{padding:'20px'}}><button onClick={onBack}>〈 뒤로가기</button></div>
      
      <div style={{maxWidth:'600px', margin:'0 auto', padding:'0 16px', display:'flex', flexDirection:'column', gap:'20px'}}>
        
        {/* 건축물 정보 박스 */}
        <div style={{background:'#fff', borderRadius:'24px', padding:'24px'}}>
          <h3 style={{marginBottom:'20px'}}>🏢 건축물 정보 요약</h3>
          <div style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #eee'}}>
            <span>주용도</span><strong>{building?.purpose || '-'}</strong>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #eee'}}>
            <span>규모</span><strong>{building?.floors || '-'}</strong>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #eee'}}>
            <span>대지면적</span><strong>{building?.area || '-'}</strong>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #eee'}}>
            <span>준공일자</span><strong>{building?.built || '-'}</strong>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', padding:'10px 0'}}>
            <span>주차대수</span><strong>{building?.parking || '-'}</strong>
          </div>
        </div>

        {/* 상권 분석 그래프 박스 */}
        <div style={{background:'#fff', borderRadius:'24px', padding:'24px'}}>
          <h3 style={{marginBottom:'20px'}}>👥 인구 환경 분석</h3>
          <div style={{height:'200px', width:'100%'}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysis?.refinedPop || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis hide />
                <Bar dataKey="value" fill="#007AFF" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )
}
