import { useEffect, useState } from 'react'
import { 
  getBuildingInfo, getFloorInfo, getUnitInfo, 
  getGeoLocation, getCommercialAnalysis 
} from '../api/building'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line 
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
  const [floors, setFloors] = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const jibun = data.jibunData
        
        // 1. 건축물 데이터 & 좌표 데이터 가져오기
        const [bInfo, fInfo, coords] = await Promise.all([
          getBuildingInfo(jibun),
          getFloorInfo(jibun),
          getGeoLocation(data.address)
        ])
        
        setBuilding(bInfo)
        setFloors(fInfo)

        // 2. 좌표가 있으면 상권 상세 분석 데이터 가져오기
        if (coords) {
          const commData = await getCommercialAnalysis(coords.lng, coords.lat)
          setAnalysis(commData)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [data])

  if (loading) return <div style={{padding:'100px', textAlign:'center'}}>데이터 분석 리포트 생성 중...</div>

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <button onClick={onBack} style={{border:'none', background:'none', color:'#007AFF', cursor:'pointer'}}>〈 뒤로가기</button>
        <div style={{fontSize:'16px', fontWeight:'700', marginTop:'4px'}}>{data.address} 분석 리포트</div>
      </div>

      <div style={S.body}>
        {/* [1] 건축물 기본 정보 섹션 */}
        <div style={S.section}>
          <div style={S.sectionTitle}>🏢 건축물 정보 요약</div>
          <div style={S.infoRow}><span style={S.label}>주용도</span><span style={S.value}>{building?.purpose}</span></div>
          <div style={S.infoRow}><span style={S.label}>규모</span><span style={S.value}>{building?.floors}</span></div>
          <div style={S.infoRow}><span style={S.label}>준공일자</span><span style={S.value}>{building?.built}</span></div>
        </div>

        {/* [2] 인구 환경 분석 박스 */}
        <div style={S.section}>
          <div style={S.sectionTitle}>👥 인구 환경 분석</div>
          
          <div style={{marginBottom:'24px'}}>
            <p style={{fontSize:'14px', fontWeight:'700', marginBottom:'12px'}}>주거/유동/직장인구 비율</p>
            <div style={{height:'200px'}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis?.population || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#007AFF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p style={{fontSize:'14px', fontWeight:'700', marginBottom:'12px'}}>성별/연령대별 직장인구</p>
          <table style={{width:'100%', fontSize:'12px', textAlign:'center', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#f5f5f7'}}>
                <th style={{padding:'8px'}}>구분</th><th style={ {padding:'8px'} }>20대</th><th style={{padding:'8px'}}>30대</th><th style={{padding:'8px'}}>40대</th><th style={{padding:'8px'}}>50대</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{padding:'8px', fontWeight:'600'}}>남성</td><td>12%</td><td>25%</td><td>30%</td><td>20%</td>
              </tr>
              <tr>
                <td style={{padding:'8px', fontWeight:'600'}}>여성</td><td>15%</td><td>28%</td><td>25%</td><td>18%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* [3] 시장 경쟁 및 나눠먹기 분석 (핵심!) */}
        <div style={S.section}>
          <div style={S.sectionTitle}>💰 시장 수익성 지표</div>
          
          <div style={S.highlightCard}>
            <p style={{fontSize:'14px', opacity:0.9}}>선택 업종 점포당 월 평균 매출(파이)</p>
            <h2 style={{fontSize:'32px', fontWeight:'800', margin:'8px 0'}}>4,250 <span style={{fontSize:'16px'}}>만원</span></h2>
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

          <div style={{marginTop:'20px'}}>
            <p style={{fontSize:'13px', color:'#86868b', textAlign:'center'}}>
              "현재 주거인구 대비 업소 수가 과밀 상태입니다.<br/>직장인 타겟의 특화 전략이 필요합니다."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
