import { useEffect, useState } from 'react'
import { getBuildingInfo, getFloorInfo } from '../api/building'

const S = {
  wrap: { minHeight:'100vh', background:'#f5f5f3' },
  header: { background:'#fff', borderBottom:'1px solid #ebebeb', padding:'16px 24px', display:'flex', alignItems:'center', gap:'16px' },
  backBtn: { padding:'8px 14px', background:'#f5f5f3', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'600', cursor:'pointer', color:'#555' },
  headerTitle: { fontSize:'15px', fontWeight:'700', color:'#1a1a1a' },
  headerSub: { fontSize:'12px', color:'#888', marginTop:'2px' },
  body: { maxWidth:'900px', margin:'0 auto', padding:'24px 20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' },
  full: { gridColumn:'1 / -1' },
  section: { background:'#fff', borderRadius:'14px', padding:'22px', boxShadow:'0 1px 8px rgba(0,0,0,0.05)' },
  sectionTitle: { fontSize:'11px', fontWeight:'700', letterSpacing:'0.1em', color:'#888', textTransform:'uppercase', marginBottom:'16px', paddingBottom:'8px', borderBottom:'1px solid #f0f0f0' },
  infoRow: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #fafafa' },
  infoLabel: { fontSize:'13px', color:'#666' },
  infoValue: { fontSize:'13px', fontWeight:'600', color:'#1a1a1a' },
  badge: { display:'inline-block', padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'600', background:'#e8f4ff', color:'#1a6fc4' },
  grid2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' },
  grid4: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'10px' },
  statCard: { background:'#f8f8f7', borderRadius:'10px', padding:'14px', textAlign:'center' },
  statNum: { fontSize:'20px', fontWeight:'700', color:'#1a1a1a' },
  statLabel: { fontSize:'11px', color:'#888', marginTop:'4px' },
  loading: { display:'flex', alignItems:'center', justifyContent:'center', minHeight:'200px', fontSize:'14px', color:'#888' },
  error: { background:'#fff0f0', border:'1px solid #ffcccc', borderRadius:'10px', padding:'14px', fontSize:'13px', color:'#cc0000' },
  note: { background:'#fffbf0', border:'1px solid #ffe4a0', borderRadius:'10px', padding:'12px 14px', fontSize:'12px', color:'#a07000', marginBottom:'14px' },
  th: { textAlign:'left', padding:'8px', background:'#f8f8f7', fontSize:'11px', color:'#888', fontWeight:'600' },
  td: { padding:'8px', borderBottom:'1px solid #f5f5f5', fontSize:'13px' },
}

const DUMMY_POP = {
  total:'12,480명', male:'5,920명', female:'6,560명', households:'4,200세대',
  age:[{label:'10대 이하',value:18},{label:'20대',value:14},{label:'30대',value:22},{label:'40대',value:21},{label:'50대',value:14},{label:'60대+',value:11}]
}
const DUMMY_EDU = { elementary:2, middle:1, high:1, academies:{국어:8,영어:15,수학:14,과학:6,예체능:20,기타:12} }
const DUMMY_LIVE = { daycare:8, kindergarten:5, library:2, hospital:23, pharmacy:9, cafe:31, convenience:12 }

function Bar({ data }) {
  const max = Math.max(...data.map(d => d.value))
  return (
    <div style={{display:'flex', flexDirection:'column', gap:'7px'}}>
      {data.map(d => (
        <div key={d.label} style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <div style={{width:'58px', fontSize:'11px', color:'#888', textAlign:'right', flexShrink:0}}>{d.label}</div>
          <div style={{flex:1, background:'#f0f0f0', borderRadius:'4px', height:'8px'}}>
            <div style={{width:`${(d.value/max)*100}%`, background:'#1a1a1a', borderRadius:'4px', height:'100%'}} />
          </div>
          <div style={{width:'32px', fontSize:'11px', fontWeight:'600', color:'#1a1a1a'}}>{d.value}%</div>
        </div>
      ))}
    </div>
  )
}

function StatCard({ label, value }) {
  return <div style={S.statCard}><div style={S.statNum}>{value}</div><div style={S.statLabel}>{label}</div></div>
}

function InfoRow({ label, value, badge }) {
  return (
    <div style={S.infoRow}>
      <span style={S.infoLabel}>{label}</span>
      <span style={badge ? S.badge : S.infoValue}>{value}</span>
    </div>
  )
}

export default function ResultPage({ data, onBack }) {
  const [building, setBuilding] = useState(null)
  const [floors, setFloors] = useState([])
  const [loadingB, setLoadingB] = useState(true)
  const [errorB, setErrorB] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        setLoadingB(true)
        const jibun = data.jibunData
        const [bInfo, fInfo] = await Promise.all([
          getBuildingInfo(jibun),
          getFloorInfo(jibun),
        ])
        setBuilding(bInfo)
        setFloors(fInfo)
      } catch (e) {
        setErrorB(e.message)
      } finally {
        setLoadingB(false)
      }
    }
    load()
  }, [])

  const totalAcademy = Object.values(DUMMY_EDU.academies).reduce((a,b)=>a+b,0)

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={onBack}>← 돌아가기</button>
        <div>
          <div style={S.headerTitle}>{data.address} {data.detail}</div>
          <div style={S.headerSub}>
            {[data.client && `고객: ${data.client}`, data.site && `현장: ${data.site}`, '반경 500m 기준'].filter(Boolean).join(' · ')}
          </div>
        </div>
      </div>

      <div style={S.body}>

        <div style={S.section}>
          <div style={S.sectionTitle}>🏢 건물 정보 (건축물대장)</div>
          {loadingB ? (
            <div style={S.loading}>건축물대장 조회 중...</div>
          ) : errorB ? (
            <div style={S.error}>⚠️ {errorB}</div>
          ) : building && (
            <>
              <InfoRow label="건물 용도" value={building.purpose} badge />
              <InfoRow label="연면적" value={building.area} />
              <InfoRow label="층수" value={building.floors} />
              <InfoRow label="준공연도" value={building.built} />
              <InfoRow label="구조" value={building.structure} />
              <InfoRow label="건폐율" value={building.bcRat} />
              <InfoRow label="주차" value={building.parking} />
            </>
          )}
        </div>

        <div style={S.section}>
          <div style={S.sectionTitle}>📐 층별 용도 및 면적</div>
          {loadingB ? (
            <div style={S.loading}>조회 중...</div>
          ) : floors.length > 0 ? (
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr>
                  <th style={S.th}>층</th>
                  <th style={S.th}>용도</th>
                  <th style={{...S.th, textAlign:'right'}}>면적</th>
                </tr>
              </thead>
              <tbody>
                {floors.map((f,i) => (
                  <tr key={i}>
                    <td style={S.td}>{f.floor}</td>
                    <td style={S.td}>{f.purpose}</td>
                    <td style={{...S.td, textAlign:'right', fontWeight:'600'}}>{f.area}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{fontSize:'13px', color:'#aaa'}}>층별 정보가 없습니다</div>
          )}
        </div>

        <div style={S.section}>
          <div style={S.sectionTitle}>👥 주거환경 (반경 500m)</div>
          <div style={S.note}>📌 인구 데이터 API 연동 예정</div>
          <div style={{...S.grid2, marginBottom:'16px'}}>
            <StatCard label="총 인구" value={DUMMY_POP.total} />
            <StatCard label="세대수" value={DUMMY_POP.households} />
            <StatCard label="남성" value={DUMMY_POP.male} />
            <StatCard label="여성" value={DUMMY_POP.female} />
          </div>
          <div style={{fontSize:'11px', color:'#888', marginBottom:'8px', fontWeight:'600'}}>연령대별 분포</div>
          <Bar data={DUMMY_POP.age} />
        </div>

        <div style={S.section}>
          <div style={S.sectionTitle}>🎓 교육환경 (반경 500m)</div>
          <div style={S.note}>📌 학원 데이터 API 연동 예정</div>
          <div style={{...S.grid4, marginBottom:'16px'}}>
            <StatCard label="초등학교" value={DUMMY_EDU.elementary} />
            <StatCard label="중학교" value={DUMMY_EDU.middle} />
            <StatCard label="고등학교" value={DUMMY_EDU.high} />
            <StatCard label="총 학원" value={totalAcademy} />
          </div>
          <div style={{fontSize:'11px', color:'#888', marginBottom:'8px', fontWeight:'600'}}>과목별 학원</div>
          {Object.entries(DUMMY_EDU.academies).map(([k,v]) => (
            <InfoRow key={k} label={k} value={`${v}개`} />
          ))}
        </div>

        <div style={{...S.section, ...S.full}}>
          <div style={S.sectionTitle}>🏪 생활편의 (반경 500m)</div>
          <div style={S.note}>📌 소상공인 상권정보 API 연동 예정</div>
          <div style={S.grid4}>
            <StatCard label="어린이집" value={DUMMY_LIVE.daycare} />
            <StatCard label="유치원" value={DUMMY_LIVE.kindergarten} />
            <StatCard label="도서관" value={DUMMY_LIVE.library} />
            <StatCard label="병원" value={DUMMY_LIVE.hospital} />
            <StatCard label="약국" value={DUMMY_LIVE.pharmacy} />
            <StatCard label="카페" value={DUMMY_LIVE.cafe} />
            <StatCard label="편의점" value={DUMMY_LIVE.convenience} />
          </div>
        </div>

      </div>
    </div>
  )
}
