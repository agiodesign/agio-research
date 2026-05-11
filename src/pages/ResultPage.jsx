import { useState } from 'react'

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
  note: { background:'#fffbf0', border:'1px solid #ffe4a0', borderRadius:'10px', padding:'12px 14px', fontSize:'12px', color:'#a07000' },
}

const D = {
  building: { purpose:'제2종 근린생활시설', area:'84.5㎡', totalArea:'1,240㎡', floors:'지상 5층 / 지하 1층', built:'2009년 (16년)', structure:'철근콘크리트' },
  population: {
    total:'12,480명', male:'5,920명', female:'6,560명', households:'4,200세대',
    age:[{label:'10대 이하',value:18},{label:'20대',value:14},{label:'30대',value:22},{label:'40대',value:21},{label:'50대',value:14},{label:'60대+',value:11}]
  },
  education: { elementary:2, middle:1, high:1, academies:{국어:8,영어:15,수학:14,과학:6,예체능:20,기타:12} },
  living: { daycare:8, kindergarten:5, library:2, hospital:23, pharmacy:9, cafe:31, convenience:12 },
}

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
  return (
    <div style={S.statCard}>
      <div style={S.statNum}>{value}</div>
      <div style={S.statLabel}>{label}</div>
    </div>
  )
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
  const totalAcademy = Object.values(D.education.academies).reduce((a,b) => a+b, 0)

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

        <div style={{...S.section, ...S.full}}>
          <div style={S.note}>⚠️ 현재 UI 확인용 샘플 데이터입니다. 공공API 연동 후 실제 데이터로 교체됩니다.</div>
        </div>

        <div style={S.section}>
          <div style={S.sectionTitle}>🏢 건물 정보</div>
          <InfoRow label="건물 용도" value={D.building.purpose} badge />
          <InfoRow label="호실 면적" value={D.building.area} />
          <InfoRow label="연면적" value={D.building.totalArea} />
          <InfoRow label="층수" value={D.building.floors} />
          <InfoRow label="준공연도" value={D.building.built} />
          <InfoRow label="구조" value={D.building.structure} />
        </div>

        <div style={S.section}>
          <div style={S.sectionTitle}>👥 주거환경 (반경 500m)</div>
          <div style={{...S.grid2, marginBottom:'16px'}}>
            <StatCard label="총 인구" value={D.population.total} />
            <StatCard label="세대수" value={D.population.households} />
            <StatCard label="남성" value={D.population.male} />
            <StatCard label="여성" value={D.population.female} />
          </div>
          <div style={{fontSize:'11px', color:'#888', marginBottom:'8px', fontWeight:'600'}}>연령대별 분포</div>
          <Bar data={D.population.age} />
        </div>

        <div style={S.section}>
          <div style={S.sectionTitle}>🎓 교육환경 (반경 500m)</div>
          <div style={{...S.grid4, marginBottom:'16px'}}>
            <StatCard label="초등학교" value={D.education.elementary} />
            <StatCard label="중학교" value={D.education.middle} />
            <StatCard label="고등학교" value={D.education.high} />
            <StatCard label="총 학원" value={totalAcademy} />
          </div>
          <div style={{fontSize:'11px', color:'#888', marginBottom:'8px', fontWeight:'600'}}>과목별 학원</div>
          {Object.entries(D.education.academies).map(([k,v]) => (
            <InfoRow key={k} label={k} value={`${v}개`} />
          ))}
        </div>

        <div style={S.section}>
          <div style={S.sectionTitle}>🏪 생활편의 (반경 500m)</div>
          <div style={S.grid2}>
            <StatCard label="어린이집" value={D.living.daycare} />
            <StatCard label="유치원" value={D.living.kindergarten} />
            <StatCard label="도서관" value={D.living.library} />
            <StatCard label="병원" value={D.living.hospital} />
            <StatCard label="약국" value={D.living.pharmacy} />
            <StatCard label="카페" value={D.living.cafe} />
            <StatCard label="편의점" value={D.living.convenience} />
          </div>
        </div>

      </div>
    </div>
  )
}
