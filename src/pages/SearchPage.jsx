import { useState } from 'react'

const S = {
  wrap: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: '#f5f5f3' },
  logo: { fontSize: '13px', fontWeight: '600', letterSpacing: '0.25em', color: '#888', marginBottom: '12px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#1a1a1a', marginBottom: '6px' },
  sub: { fontSize: '14px', color: '#888', marginBottom: '48px' },
  card: { background: '#fff', borderRadius: '16px', padding: '36px', width: '100%', maxWidth: '520px', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' },
  label: { fontSize: '12px', fontWeight: '600', color: '#888', letterSpacing: '0.08em', marginBottom: '8px', display: 'block' },
  addrRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
  addrInput: { flex: 1, padding: '12px 14px', border: '1.5px solid #e8e8e8', borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#fafafa' },
  addrBtn: { padding: '12px 16px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
  detailInput: { width: '100%', padding: '12px 14px', border: '1.5px solid #e8e8e8', borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#fafafa', marginBottom: '24px' },
  divider: { height: '1px', background: '#f0f0f0', margin: '24px 0' },
  clientLabel: { fontSize: '12px', fontWeight: '600', color: '#888', letterSpacing: '0.08em', marginBottom: '8px', display: 'block' },
  clientInput: { width: '100%', padding: '12px 14px', border: '1.5px solid #e8e8e8', borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#fafafa', marginBottom: '24px' },
  submitBtn: { width: '100%', padding: '14px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.04em' },
  submitBtnDisabled: { width: '100%', padding: '14px', background: '#ccc', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'not-allowed', letterSpacing: '0.04em' },
}

export default function SearchPage({ onSearch }) {
  const [address, setAddress] = useState('')
  const [coords, setCoords] = useState(null)
  const [detail, setDetail] = useState('')
  const [client, setClient] = useState('')
  const [loading, setLoading] = useState(false)

  const openAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        const addr = data.roadAddress || data.jibunAddress
        setAddress(addr)
        // 주소 → 좌표 변환
        const geocoder = new window.kakao.maps.services.Geocoder()
        geocoder.addressSearch(addr, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            setCoords({ lat: parseFloat(result[0].y), lng: parseFloat(result[0].x) })
          }
        })
      }
    }).open()
  }

  const handleSubmit = async () => {
    if (!address || !coords) return
    setLoading(true)
    // 건축물대장 API 및 기타 API는 추후 연동
    // 지금은 주소+좌표만 넘겨서 지도 표시 확인
    setTimeout(() => {
      onSearch({ address, detail, client, coords })
      setLoading(false)
    }, 800)
  }

  return (
    <div style={S.wrap}>
      <div style={S.logo}>AGIO DESIGN</div>
      <div style={S.title}>상권 분석 리서치</div>
      <div style={S.sub}>주소를 입력하면 건물정보·인구·교육환경을 한번에 분석해드립니다</div>

      <div style={S.card}>
        <span style={S.label}>조사 주소</span>
        <div style={S.addrRow}>
          <input
            style={S.addrInput}
            value={address}
            readOnly
            placeholder="주소 검색 버튼을 눌러주세요"
          />
          <button style={S.addrBtn} onClick={openAddressSearch}>주소 검색</button>
        </div>
        <input
          style={S.detailInput}
          value={detail}
          onChange={e => setDetail(e.target.value)}
          placeholder="상세주소 (호실, 층수 등)"
        />

        <div style={S.divider} />

        <span style={S.clientLabel}>고객명 / 현장명</span>
        <input
          style={S.clientInput}
          value={client}
          onChange={e => setClient(e.target.value)}
          placeholder="예: 홍길동 / 강남 카페 현장"
        />

        <button
          style={address && coords ? S.submitBtn : S.submitBtnDisabled}
          onClick={handleSubmit}
          disabled={!address || !coords || loading}
        >
          {loading ? '분석 중...' : '분석 시작 →'}
        </button>
      </div>
    </div>
  )
}
