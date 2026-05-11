import { useEffect, useRef, useState } from 'react'

const S = {
  wrap: { minHeight: '100vh', background: '#f5f5f3', fontFamily: 'Pretendard, sans-serif' },
  header: { background: '#fff', borderBottom: '1px solid #ebebeb', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' },
  backBtn: { padding: '8px 14px', background: '#f5f5f3', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#555' },
  headerTitle: { fontSize: '15px', fontWeight: '700', color: '#1a1a1a' },
  headerSub: { fontSize: '12px', color: '#888', marginTop: '2px' },
  body: { display: 'grid', gridTemplateColumns: '1fr 380px', height: 'calc(100vh - 65px)' },
  mapWrap: { position: 'relative' },
  map: { width: '100%', height: '100%' },
  panel: { background: '#fff', borderLeft: '1px solid #ebebeb', overflowY: 'auto', padding: '24px' },
  section: { marginBottom: '28px' },
  sectionTitle: { fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' },
  infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #fafafa' },
  infoLabel: { fontSize: '13px', color: '#666' },
  infoValue: { fontSize: '13px', fontWeight: '600', color: '#1a1a1a' },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: '#f0f0f0', color: '#555' },
  badgeBlue: { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: '#e8f4ff', color: '#1a6fc4' },
  apiNote: { background: '#fffbf0', border: '1px solid #ffe4a0', borderRadius: '10px', padding: '14px', fontSize: '12px', color: '#a07000', lineHeight: '1.7' },
  statGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  statCard: { background: '#f8f8f7', borderRadius: '10px', padding: '14px', textAlign: 'center' },
  statNum: { fontSize: '22px', fontWeight: '700', color: '#1a1a1a' },
  statLabel: { fontSize: '11px', color: '#888', marginTop: '4px' },
  mapLabel: { position: 'absolute', top: '16px', left: '16px', background: '#fff', borderRadius: '10px', padding: '10px 14px', boxShadow: '0 2px 12px rgba(0,0,0,0.12)', fontSize: '13px', fontWeight: '600', zIndex: 10 },
}

// 더미 데이터 (API 연동 전 UI 확인용)
const DUMMY = {
  building: {
    purpose: '제2종 근린생활시설',
    area: '84.5㎡',
    totalArea: '1,240㎡',
    floors: '지상 5층 / 지하 1층',
    built: '2009년 (16년)',
    structure: '철근콘크리트',
  },
  population: {
    total: '12,480명',
    male: '5,920명',
    female: '6,560명',
    households: '4,200세대',
    age: [
      { label: '10대 이하', value: 18 },
      { label: '20대', value: 14 },
      { label: '30대', value: 22 },
      { label: '40대', value: 21 },
      { label: '50대', value: 14 },
      { label: '60대+', value: 11 },
    ]
  },
  education: {
    elementary: 2,
    middle: 1,
    high: 1,
    academies: { 국어: 8, 영어: 15, 수학: 14, 과학: 6, 예체능: 20, 기타: 12 },
  },
  living: {
    daycare: 8,
    kindergarten: 5,
    library: 2,
    hospital: 23,
    pharmacy: 9,
    cafe: 31,
    convenience: 12,
  }
}

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {data.map(d => (
        <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '60px', fontSize: '11px', color: '#888', textAlign: 'right', flexShrink: 0 }}>{d.label}</div>
          <div style={{ flex: 1, background: '#f0f0f0', borderRadius: '4px', height: '8px' }}>
            <div style={{ width: `${(d.value / max) * 100}%`, background: '#1a1a1a', borderRadius: '4px', height: '100%' }} />
          </div>
          <div style={{ width: '30px', fontSize: '11px', fontWeight: '600', color: '#1a1a1a' }}>{d.value}%</div>
        </div>
      ))}
    </div>
  )
}

export default function ResultPage({ data, onBack }) {
  const mapRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!window.kakao || !mapRef.current) return

    const map = new window.kakao.maps.Map(mapRef.current, {
      center: new window.kakao.maps.LatLng(data.coords.lat, data.coords.lng),
      level: 5,
    })

    // 중심 마커
    new window.kakao.maps.Marker({
      map,
      position: new window.kakao.maps.LatLng(data.coords.lat, data.coords.lng),
    })

    // 반경 500m 원
    new window.kakao.maps.Circle({
      map,
      center: new window.kakao.maps.LatLng(data.coords.lat, data.coords.lng),
      radius: 500,
      strokeWeight: 2,
      strokeColor: '#1a1a1a',
      strokeOpacity: 0.6,
      strokeStyle: 'solid',
      fillColor: '#1a1a1a',
      fillOpacity: 0.05,
    })

    setMapLoaded(true)
  }, [data.coords])

  const d = DUMMY

  return (
    <div style={S.wrap}>
      {/* 헤더 */}
      <div style={S.header}>
        <button style={S.backBtn} onClick={onBack}>← 돌아가기</button>
        <div>
          <div style={S.headerTitle}>{data.address} {data.detail}</div>
          <div style={S.headerSub}>{data.client && `고객: ${data.client} · `}반경 500m 기준 분석</div>
        </div>
      </div>

      {/* 바디 */}
      <div style={S.body}>
        {/* 지도 */}
        <div style={S.mapWrap}>
          <div ref={mapRef} style={S.map} />
          <div style={S.mapLabel}>📍 반경 500m</div>
        </div>

        {/* 분석 패널 */}
        <div style={S.panel}>

          {/* API 연동 안내 */}
          <div style={{ ...S.apiNote, marginBottom: '24px' }}>
            ⚠️ 현재 UI 확인용 샘플 데이터입니다.<br />
            카카오 API Key + 공공데이터 API Key 입력 후<br />실제 데이터로 연동됩니다.
          </div>

          {/* 건물 정보 */}
          <div style={S.section}>
            <div style={S.sectionTitle}>🏢 건물 정보</div>
            {Object.entries({
              '건물 용도': d.building.purpose,
              '해당 호실 면적': d.building.area,
              '연면적': d.building.totalArea,
              '층수': d.building.floors,
              '준공연도': d.building.built,
              '구조': d.building.structure,
            }).map(([k, v]) => (
              <div key={k} style={S.infoRow}>
                <span style={S.infoLabel}>{k}</span>
                <span style={k === '건물 용도' ? S.badgeBlue : S.infoValue}>{v}</span>
              </div>
            ))}
          </div>

          {/* 주거환경 */}
          <div style={S.section}>
            <div style={S.sectionTitle}>👥 주거환경 (반경 500m)</div>
            <div style={{ ...S.statGrid, marginBottom: '16px' }}>
              <div style={S.statCard}>
                <div style={S.statNum}>{d.population.total}</div>
                <div style={S.statLabel}>총 주거인구</div>
              </div>
              <div style={S.statCard}>
                <div style={S.statNum}>{d.population.households}</div>
                <div style={S.statLabel}>세대수</div>
              </div>
              <div style={S.statCard}>
                <div style={S.statNum}>{d.population.male}</div>
                <div style={S.statLabel}>남성</div>
              </div>
              <div style={S.statCard}>
                <div style={S.statNum}>{d.population.female}</div>
                <div style={S.statLabel}>여성</div>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px', fontWeight: '600' }}>연령대별 분포</div>
            <BarChart data={d.population.age} />
          </div>

          {/* 교육환경 */}
          <div style={S.section}>
            <div style={S.sectionTitle}>🎓 교육환경 (반경 500m)</div>
            <div style={{ ...S.statGrid, marginBottom: '16px' }}>
              <div style={S.statCard}>
                <div style={S.statNum}>{d.education.elementary}</div>
                <div style={S.statLabel}>초등학교</div>
              </div>
              <div style={S.statCard}>
                <div style={S.statNum}>{d.education.middle}</div>
                <div style={S.statLabel}>중학교</div>
              </div>
              <div style={S.statCard}>
                <div style={S.statNum}>{d.education.high}</div>
                <div style={S.statLabel}>고등학교</div>
              </div>
              <div style={S.statCard}>
                <div style={S.statNum}>{Object.values(d.education.academies).reduce((a, b) => a + b, 0)}</div>
                <div style={S.statLabel}>총 학원 수</div>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px', fontWeight: '600' }}>과목별 학원</div>
            {Object.entries(d.education.academies).map(([k, v]) => (
              <div key={k} style={S.infoRow}>
                <span style={S.infoLabel}>{k}</span>
                <span style={S.badge}>{v}개</span>
              </div>
            ))}
          </div>

          {/* 생활편의 */}
          <div style={S.section}>
            <div style={S.sectionTitle}>🏪 생활편의 (반경 500m)</div>
            <div style={S.statGrid}>
              {[
                ['어린이집', d.living.daycare],
                ['유치원', d.living.kindergarten],
                ['도서관', d.living.library],
                ['병원', d.living.hospital],
                ['약국', d.living.pharmacy],
                ['카페', d.living.cafe],
                ['편의점', d.living.convenience],
              ].map(([label, val]) => (
                <div key={label} style={S.statCard}>
                  <div style={S.statNum}>{val}</div>
                  <div style={S.statLabel}>{label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
