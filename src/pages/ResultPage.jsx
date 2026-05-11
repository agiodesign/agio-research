import { useState } from 'react'

const S = {
  wrap: { minHeight:'100vh', background:'#f5f5f3', fontFamily:'Pretendard,sans-serif' },
  header: { background:'#fff', borderBottom:'1px solid #ebebeb', padding:'16px 24px', display:'flex', alignItems:'center', gap:'16px' },
  backBtn: { padding:'8px 14px', background:'#f5f5f3', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'600', cursor:'pointer', color:'#555' },
  headerInfo: { flex:1 },
  headerTitle: { fontSize:'15px', fontWeight:'700', color:'#1a1a1a' },
  headerSub: { fontSize:'12px', color:'#888', marginTop:'2px' },
  body: { maxWidth:'900px', margin:'0 auto', padding:'24px 20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' },
  section: { background:'#fff', borderRadius:'14px', padding:'22px', boxShadow:'0 1px 8px rgba(0,0,0,0.05)' },
  sectionFull: { background:'#fff', borderRadius:'14px', padding:'22px', boxShadow:'0 1px 8px rgba(0,0,0,0.05)', gridColumn:'1 / -1' },
  sectionTitle: { fontSize:'11px', fontWeight:'700', letterSpacing:'0.1em', color:'#888', textTransform:'uppercase', marginBottom:'16px', paddingBottom:'8px', borderBottom:'1px solid #f0f0f0' },
  infoRow: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #fafafa' },
  infoLabel: { fontSize:'13px', color:'#666' },
  infoValue: { fontSize:'13px', fontWeight:'600', color:'#1a1a1a' },
  badge: { display:'inline-block', padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'600', background:'#e8f4ff', color:'#1a6fc4' },
  statGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' },
  statGrid4: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'10px' },
  statCard: { background:'#f8f8f7', borderRadius:'10px', padding:'14px', textAlign:'center' },
  statNum: { fontSize:'20px', fontWeight:'700', color:'#1a1a1a' },
  statLabel: { fontSize:'11px', color:'#888', marginTop:'4px' },
  note: { background:'#fffbf0', border:'1px solid #ffe4a0', borderRadius:'10px', padding:'12px 14px', fontSize:'12px', color:'#a07000', marginBottom:'16px' },
}

const DUMMY = {
  building: { purpose:'제2종 근린생활시설', area:'84.5㎡', totalArea:'1,240㎡', floors:'지상 5층 / 지하 1층', built:'2009년 (16년)', structure:'철근콘크리트' },
  population: {
    total:'12,480명', male:'5,920명', female:'6,560명', households:'4,200세대',
    age:[{label:'10대 이하',value:18},{label:'20대',value:14},{label:'30대',value:22},{label:'40대',value:21},{label:'50대',value:14},{label:'60대+',value:11}]
  },
  education: { elementary:2, middle:1, high:1, academies:{국어:8,영어:15,수학:14,과학:6,예체능:20,기타:12} },
  living: { daycare:8, kindergarten:5, library:2, hospital:23, pharmacy:9, cafe:31, convenience:12 },
}

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value))
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'7px'}}>
      {data.map(d => (
        <div key={d.label} style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <div style={{width:'58px',fontSize:'11px',color:'#888',textAlign:'right',flexShrink:0}}>{d.label}</div>
          <div style={{flex:1,background:'#f0f0f0',borderRadius:'4px',height:'8px'}}>
            <div style={{width:`${(d.value/max)*100}%`,background:'#1a1a1a',borderRadius:'4px',height:'100%'}} />
          </div>
          <div style={{width:'32px',fontSize:'11px',fontWeight:'600',co
