import { useEffect, useState } from 'react'
import { getStoreSummary } from '../api/analysis'
import { getBuildingInfo, getFloorInfo, getUnitInfo } from '../api/building'
import PopulationAnalysis from '../components/PopulationAnalysis'

const S = {
  wrap: { minHeight: '100vh', background: '#f5f5f7', paddingBottom: '60px' },
  header: { background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #e5e5e5', padding: '12px 20px', position: 'sticky', top: 0, zIndex: 100 },
  backBtn: { border: 'none', background: 'none', fontSize: '14px', color: '#007AFF', cursor: 'pointer', padding: '8px 0', fontWeight: '500' },
  headerTitle: { fontSize: '17px', fontWeight: '700', color: '#1d1d1f', letterSpacing: '-0.4px' },
  modeBadge: { fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '8px', display: 'inline-block', marginTop: '2px', background: '#eef2ff', color: '#3730a3' },
  body: { maxWidth: '500px', margin: '0 auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  section: { background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  sectionTitle: { fontSize: '13px', fontWeight: '700', color: '#555', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
  summaryItem: { background: '#f5f5f7', borderRadius: '12px', padding: '12px', minWidth: 0 },
  summaryLabel: { fontSize: '11px', color: '#86868b', marginBottom: '4px', whiteSpace: 'nowrap' },
  summaryValue: { fontSize: '15px', color: '#1d1d1f', fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  unitCard: { background: '#1d1d1f', borderRadius: '20px', padding: '24px', color: '#fff', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '12px' },
  stackContainer: { display: 'flex', flexDirection: 'column', gap: '4px', background: '#f5f5f7', padding: '10px', borderRadius: '14px', maxHeight: '420px', overflowY: 'auto', WebkitOverflowScrolling: 'touch' },
  stackLevel: { minHeight: '38px', display: 'flex', alignItems: 'center', padding: '0 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '500', transition: 'all 0.3s ease' },
  infoRow: { display: 'flex', justifyContent: 'space-between', gap: '14px', padding: '12px 0', borderBottom: '1px solid #f5f5f7' },
  label: { color: '#86868b', fontSize: '14px' },
  value: { color: '#1d1d1f', fontSize: '14px', fontWeight: '600', textAlign: 'right' },
  badge: { padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', background: '#f5f5f7', color: '#48484a' },
  notice: { marginTop: '12px', fontSize: '12px', color: '#86868b', lineHeight: 1.5 },
}

function BuildingStack({ floors, selectedHo }) {
  const targetFloorNm = selectedHo ? (selectedHo.length >= 3 ? selectedHo.slice(0, -2) : selectedHo.charAt(0)) : null
  const sortedFloors = [...floors].sort((a, b) => {
    const getLevel = (name) => {
      if (name.includes('지') || name.includes('B')) {
        const num = name.replace(/[^0-9]/g, '')
        return -parseInt(num || 1)
      }
      return parseInt(name.replace(/[^0-9]/g, '') || 0)
    }
    return getLevel(b.floor) - getLevel(a.floor)
  })

  return (
    <div style={S.stackContainer}>
      {sortedFloors.map((f, i) => {
        const isTarget = targetFloorNm && f.floor.includes(targetFloorNm)
        const isBasement = f.floor.includes('지') || f.floor.includes('B')
        return (
          <div key={i} id={isTarget ? 'active-floor' : undefined} style={{ ...S.stackLevel, background: isTarget ? '#007AFF' : '#fff', color: isTarget ? '#fff' : '#1d1d1f', border: isTarget ? 'none' : '1px solid #e5e5e5', boxShadow: isTarget ? '0 4px 12px rgba(0, 122, 255, 0.3)' : 'none', opacity: isBasement && !isTarget ? 0.6 : 1, flexShrink: 0, display: 'flex', justifyContent: 'space-between', padding: '0 16px', marginBottom: '4px' }}>
            <span style={{ width: '40px', fontWeight: '700', fontSize: '11px' }}>{f.floor}</span>
            <div style={{ flex: 1, textAlign: 'left', paddingLeft: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '9px', fontWeight: '800', background: isTarget ? 'rgba(255,255,255,0.2)' : '#f1f3f5', padding: '2px 5px', borderRadius: '4px', whiteSpace: 'nowrap' }}>{f.purpose}</span>
              <span style={{ fontSize: '11px', opacity: isTarget ? 0.9 : 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.detailPurpose}</span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: isTarget ? '#fff' : '#007AFF', marginLeft: '8px' }}>{f.area}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function ResultPage({ data, onBack }) {
  const selectedFeatures = data.selectedFeatures || (data.mode ? [data.mode] : ['building'])
  const hasMarket = selectedFeatures.includes('market')
  const hasBuilding = selectedFeatures.includes('building')
  const [building, setBuilding] = useState(null)
  const [floors, setFloors] = useState([])
  const [unit, setUnit] = useState(null)
  const [buildingLoading, setBuildingLoading] = useState(false)
  const [marketSummary, setMarketSummary] = useState(null)
  const [marketLoading, setMarketLoading] = useState(false)
  const marketCoords = marketSummary?.coords || data.jibunData?.coords

  useEffect(() => {
    if (!hasMarket || !data.jibunData?.sigunguCd) return
    async function loadMarket() {
      try {
        setMarketLoading(true)
        const summary = await getStoreSummary(data.jibunData, data.jibunData?.coords, data.address)
        if (summary?.radiusCount >= 1000) {
          console.warn('반경 500m 업소 수가 1,000개 이상입니다. 서버 거리 필터와 좌표를 다시 확인하세요.', summary)
        }
        setMarketSummary(summary)
      } catch (e) {
        console.error(e)
      } finally {
        setMarketLoading(false)
      }
    }
    loadMarket()
  }, [hasMarket, data])

  useEffect(() => {
    if (!hasBuilding) return
    async function loadBuilding() {
      try {
        setBuildingLoading(true)
        const jibun = data.jibunData
        const [bInfo, fInfo] = await Promise.all([
          getBuildingInfo(jibun),
          getFloorInfo(jibun),
        ])
        setBuilding(bInfo)
        setFloors(fInfo)
        if (data.hoNm) {
          const uInfo = await getUnitInfo(jibun, data.hoNm)
          setUnit(uInfo)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setBuildingLoading(false)
      }
    }
    loadBuilding()
  }, [hasBuilding, data])

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={onBack}>뒤로가기</button>
        <div style={S.headerTitle}>{data.address}</div>
        <span style={S.modeBadge}>통합 분석</span>
      </div>

      <div style={S.body}>
        {hasMarket && (
          <div style={S.section}>
            <div style={S.sectionTitle}>반경 500m 이내 핵심 분석 데이터</div>
            <div style={S.summaryGrid}>
              <div style={S.summaryItem}>
                <div style={S.summaryLabel}>반경 내 업소</div>
                <div style={S.summaryValue}>{marketLoading ? '데이터 분석 중...' : marketSummary?.success ? `${marketSummary.radiusCount.toLocaleString()}개` : '-'}</div>
              </div>
              <div style={S.summaryItem}>
                <div style={S.summaryLabel}>법정동 업소</div>
                <div style={S.summaryValue}>{marketLoading ? '데이터 분석 중...' : marketSummary?.success ? `${marketSummary.totalCount.toLocaleString()}개` : '-'}</div>
              </div>
              <div style={S.summaryItem}>
                <div style={S.summaryLabel}>최다 업종</div>
                <div style={S.summaryValue}>{marketLoading ? '데이터 분석 중...' : marketSummary?.success ? marketSummary.topCategoryName : '-'}</div>
              </div>
            </div>
            <div style={S.notice}>
              {marketLoading ? '데이터 분석 중...' : '서버에서 중심 좌표 기준 500m를 초과한 업소는 리스트와 카운트에서 제외했습니다.'}
            </div>
          </div>
        )}

        {hasMarket && data.jibunData?.sigunguCd && marketCoords && (
          <PopulationAnalysis bjdongCode={data.jibunData.bcode} areaData={data.jibunData} coords={marketCoords} address={data.address} />
        )}

        {hasBuilding && (
          <>
            {buildingLoading ? (
              <div style={{ ...S.section, textAlign: 'center', color: '#86868b', fontSize: '14px' }}>
                건축물대장 데이터를 불러오는 중입니다.
              </div>
            ) : unit ? (
              <div style={S.unitCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>{unit.hoNm} 상세정보</div>
                    <div style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1px' }}>{unit.area}</div>
                  </div>
                  <div style={S.badge}>{unit.purpose}</div>
                </div>
                <div style={{ fontSize: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', marginTop: '4px', opacity: 0.9 }}>
                  {unit.floor} · {unit.detailPurpose}
                </div>
              </div>
            ) : (
              <div style={{ ...S.section, textAlign: 'center', color: '#86868b', fontSize: '14px' }}>
                호실 정보를 입력하면 전용면적을 확인할 수 있습니다.
              </div>
            )}

            <div style={S.section}>
              <div style={S.sectionTitle}>건축물대장 정보</div>
              <div style={S.infoRow}><span style={S.label}>건물 주용도</span><span style={S.value}>{building?.purpose || '-'}</span></div>
              <div style={S.infoRow}><span style={S.label}>연면적</span><span style={S.value}>{building?.area || '-'}</span></div>
              <div style={S.infoRow}><span style={S.label}>규모</span><span style={S.value}>{building?.floors || '-'}</span></div>
              <div style={S.infoRow}><span style={S.label}>준공일자</span><span style={S.value}>{building?.built || '-'}</span></div>
              <div style={S.infoRow}><span style={S.label}>주차</span><span style={S.value}>{building?.parking || '-'}</span></div>
              <div style={S.infoRow}><span style={S.label}>구조</span><span style={S.value}>{building?.structure || '-'}</span></div>
            </div>

            <div style={S.section}>
              <div style={S.sectionTitle}>층별 용도와 면적</div>
              <BuildingStack floors={floors} selectedHo={data.hoNm} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
