import { useState } from 'react'

const S = {
  wrap: { minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 20px', background:'#f5f5f3' },
  logo: { fontSize:'13px', fontWeight:'600', letterSpacing:'0.25em', color:'#888', marginBottom:'12px' },
  title: { fontSize:'28px', fontWeight:'700', color:'#1a1a1a', marginBottom:'6px' },
  sub: { fontSize:'14px', color:'#888', marginBottom:'48px' },
  card: { background:'#fff', borderRadius:'16px', padding:'36px', width:'100%', maxWidth:'520px', boxShadow:'0 2px 20px rgba(0,0,0,0.06)' },
  label: { fontSize:'12px', fontWeight:'600', color:'#888', letterSpacing:'0.08em', marginBottom:'8px', display:'block' },
  addrRow: { display:'flex', gap:'8px', marginBottom:'12px' },
  addrInput: { flex:1, padding:'12px 14px', border:'1.5px solid #e8e8e8', borderRadius:'10px', fontSize:'14px', outline:'none', background:'#fafafa' },
  addrBtn: { padding:'12px 16px', background:'#1a1a1a', color:'#fff', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap' },
  input: { width:'100%', padding:'12px 14px', border:'1.5px solid #e8e8e8', borderRadius:'10px', fontSize:'14px', outline:'none', background:'#fafafa', marginBottom:'12px', boxSizing:'border-box' },
  divider: { height:'1px', background:'#f0f0f0', margin:'20px 0' },
  row2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'24px' },
  submitBtn: { width:'100%', padding:'14px', background:'#1a1a1a', color:'#fff', border:'none', borderRadius:'10px', fontSize:'15px', fontWeight:'700', cursor:'pointer' },
  submitBtnOff: { width:'100%', padding:'14px', background:'#d0d0d0', color:'#fff', border:'none', borderRadius:'10px', fontSize:'15px', fontWeight:'700', cursor:'not-allowed' },
}

export default function SearchPage({ onSearch }) {
  const [address, setAddress] = useState('')
  const [jibunData, setJibunData] = useState(null)
  const [detail, setDetail] = useState('')
  const [client, setClient] = useState('')
  const [site, setSite] = useState('')

  const openAddr = () => {
    new window.daum.Postcode({
     oncomplete: (data) => {
  const addr = data.roadAddress || data.jibunAddress
  setAddress(addr)

  // jibunAddress에서 번지 파싱
  const jibun = data.jibunAddress || ''
  const parts = jibun.trim().split(' ')
  const bunjiStr = parts[parts.length - 1] || '0'
  const bunjiArr = bunjiStr.split('-')
  const bun = bunjiArr[0] || '0'
  const ji = bunjiArr[1] || '0'

  console.log('파싱결과:', { sido: data.sido, sigungu: data.sigungu, bname: data.bname, bun, ji })

  setJibunData({
    siDo: data.sido,
    siGunGu: data.sigungu,
    eupmyundong: data.bname,
    bun,
    ji,
  })
},

  return (
    <div style={S.wrap}>
      <div style={S.logo}>AGIO DESIGN</div>
      <div style={S.title}>상권 분석 리서치</div>
      <div style={S.sub}>주소를 입력하면 건물정보·인구·교육환경을 한번에 분석해드립니다</div>
      <div style={S.card}>
        <span style={S.label}>조사 주소</span>
        <div style={S.addrRow}>
          <input style={S.addrInput} value={address} readOnly placeholder="주소 검색 버튼을 눌러주세요" />
          <button style={S.addrBtn} onClick={openAddr}>주소 검색</button>
        </div>
        <input style={S.input} value={detail} onChange={e=>setDetail(e.target.value)} placeholder="상세주소 (호실, 층수 등)" />
        <div style={S.divider} />
        <div style={S.row2}>
          <div>
            <span style={S.label}>고객명</span>
            <input style={{...S.input, marginBottom:0}} value={client} onChange={e=>setClient(e.target.value)} placeholder="예: 홍길동" />
          </div>
          <div>
            <span style={S.label}>현장명</span>
            <input style={{...S.input, marginBottom:0}} value={site} onChange={e=>setSite(e.target.value)} placeholder="예: 강남 카페" />
          </div>
        </div>
        <button
          style={address ? S.submitBtn : S.submitBtnOff}
          onClick={() => address && onSearch({ address, detail, client, site, jibunData })}
          disabled={!address}
        >
          분석 시작 →
        </button>
      </div>
    </div>
  )
}
