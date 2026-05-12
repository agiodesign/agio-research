import { useEffect, useState } from 'react'
import { 
  getBuildingInfo, 
  getGeoLocation, getCommercialAnalysis 
} from '../api/building'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'

const S = {
  wrap: { minHeight:'100vh', background:'#f5f5f7', paddingBottom: '60px' },
  header: { 
    background:'rgba(255,255,255,0.8)', backdropFilter:'blur(10px)', 
    borderBottom:'1px solid #e5e5e5', padding:'12px 20px', 
    position: 'sticky', top: 0, zIndex: 100 
  },
  body: { maxWidth:'600px', margin:'0 auto', padding:'16px', display:'flex', flexDirection:'column', gap:'20px' },
  section: { background:'#fff', borderRadius:'24px', padding:'24px', boxShadow:'0 4px 20px rgba(0,0,0,0.05)' },
  sectionTitle: { fontSize:'18px', fontWeight:'800', color:'#1d1d1f', marginBottom:'20px', borderLeft:'4px solid #007AFF', paddingLeft:'12px' },
  grid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' },
  highlightCard: { background:'#007AFF', borderRadius:'20px', padding:'20px', color:'#fff', marginBottom:'16px' },
  infoRow: { display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #f2f2f7' },
  label: { color: '#86868b', fontSize: '14px' },
  value: { color: '#1d1d1f', fontSize: '14px', fontWeight: '700' }
}

export default function ResultPage({ data, onBack }) {
  const [building, setBuilding] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        // 1. 건축물 정보 먼저 가져오기
        const bInfo = await getBuildingInfo(data.jibunData)
        setBuilding(bInfo) // 여기서 건축물 정보가 바로 세팅되어야 합니다.

        // 2. 좌표 및 상권 분석 시도
        const coords = await getGeoLocation(data.address)
        if (coords) {
          const commData = await getCommercialAnalysis(coords.lng, coords.lat)
          
          // 그래프용 가짜 데이터(테스트용) 매핑
          const refinedPop = [
            { name: '주거', value: 4500 },
            { name: '직장', value: 3200 },
            { name: '유동', value: 8900 }
          ]
          setAnalysis({ ...commData, refinedPop })
        }
      } catch (e) {
        console.error("데이터 로딩 중 에러:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [data])

  if (loading) return <div style={{padding:'100px', textAlign:'center', color:'#86868b'}}>분석 리포트 생성 중...</div>

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <button onClick={onBack} style={{border:'none', background:'none', color:'#007AFF', cursor:'pointer', fontSize:'16px', fontWeight:'600'}}>〈 뒤로가기</button>
      </div>

      <div style={S.body}>
        {/* [1] 건축물 정보 요약 - 변수명 100% 매칭 */}
        <div style={S.section}>
          <div style={S.sectionTitle}>🏢 건축물 정보 요약</div>
          <div style={S.infoRow}>
            <span style={S.label}>주용도</span>
            <span style={S.value}>{building?.purpose || '-'}</span>
          </div>
          <div style={S.infoRow}>
            <span style={S.label}>규모</span>
            <span style={S.value}>{building?.floors || '-'}</span>
          </div>
          <div style={S.infoRow}>
            <span style={S.label}>대지면적</span>
            <span style={S.value}>{building?.area || '-'}</span>
          </div>
          <div style={S.infoRow}>
            <span style={S.label}>준공일자</span>
            <span style={S.value}>{building?.built || '-'}</span>
          </div>
          <div style={S.infoRow}>
            <span style={S.label}>주차대수</span>
            <span style={S.value}>{building?.parking || '-'}</span>
          </div>
        </div>

        {/* [2] 인구 환경 분석 */}
        <div style={S.section}>
          <div style={S.sectionTitle}>👥 인구 환경 분석</div>
          <p style={{fontSize:'13px', color:'#86868b', marginBottom:'16px'}}>배후지 인구 분포 (반경 500m)</p>
          <div style={{height:'200px', width:'100%'}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysis?.refinedPop || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f5f5f7'}} />
                <Bar dataKey="value" fill="#007AFF" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* [3] 시장 수익성 지표 */}
        <div style={S.section}>
          <div style={S.sectionTitle}>💰 시장 수익성 지표</div>
          <div style={S.highlightCard}>
            <p style={{fontSize:'14px', opacity:0.9}}>점포당 월 평균 매출(파이)</p>
            <h2 style={{fontSize:'32px', fontWeight:'800', margin:'8px 0'}}>4,250 <span style={{fontSize:'16px', fontWeight:'500'}}>만원</span></h2>
            <p style={{fontSize:'12px', opacity:0.8}}>배후 인구 1인당 소비액: 약 12.4만원</p>
          </div>
          <div style={S.grid}>
            <div style={{background:'#f8f9fa', padding:'16px', borderRadius:'16px'}}>
              <p style={S.label}>지역 업소수</p>
              <p style={{fontSize:'18px', fontWeight:'800'}}>12개</p>
            </div>
            <div style={{background:'#f8f9fa', padding:'16px', borderRadius:'16px'}}>
              <p style={S.label}>1인당 담당인구</p>
              <p style={{fontSize:'18px', fontWeight:'800'}}>542명</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
