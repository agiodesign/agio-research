import { useEffect, useState } from 'react'
import { getBuildingInfo, getFloorInfo, getUnitInfo } from '../api/building'
import PopulationAnalysis from '../components/PopulationAnalysis';

const S = {
  wrap: { minHeight:'100vh', background:'#f5f5f7', paddingBottom: '60px' },
  header: { 
    background:'rgba(255,255,255,0.8)', backdropFilter:'blur(10px)', 
    borderBottom:'1px solid #e5e5e5', padding:'12px 20px', 
    position: 'sticky', top: 0, zIndex: 100 
  },
  backBtn: { border:'none', background:'none', fontSize:'14px', color:'#007AFF', cursor:'pointer', padding: '8px 0', fontWeight: '500' },
  headerTitle: { fontSize:'17px', fontWeight:'700', color:'#1d1d1f', letterSpacing:'-0.4px' },
  modeBadge: { fontSize:'11px', fontWeight:'700', padding:'4px 10px', borderRadius:'8px', display:'inline-block', marginTop:'2px' },
  body: { maxWidth:'500px', margin:'0 auto', padding:'16px', display:'flex', flexDirection:'column', gap:'12px' },
  unitCard: { background:'#1d1d1f', borderRadius:'20px', padding:'24px', color:'#fff', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', display:'flex', flexDirection:'column', gap:'12px' },
  section: { background:'#fff', borderRadius:'20px', padding:'20px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' },
  sectionTitle: { fontSize:'13px', fontWeight:'600', color:'#86868b', marginBottom:'16px', display: 'flex', alignItems: 'center', gap: '6px' },
  stackContainer: { display: 'flex', flexDirection: 'column-reverse', gap: '4px', background: '#f5f5f7', padding: '10px', borderRadius: '14px', maxHeight: '420px', overflowY: 'auto', WebkitOverflowScrolling: 'touch' },
  stackLevel: { minHeight: '38px', display: 'flex', alignItems: 'center', padding: '0 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '500', transition: 'all 0.3s ease' },
  infoRow: { display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #f5f5f7' },
  label: { color: '#86868b', fontSize: '14px' },
  value: { color: '#1d1d1f', fontSize: '14px', fontWeight: '600' },
  badge: { padding:'4px 10px', borderRadius:'8px', fontSize:'11px', fontWeight:'700', background:'#f5f5f7', color:'#48484a' }
}

function BuildingStack({ floors, selectedHo }) {
  const targetFloorNm = selectedHo ? (selectedHo.length >= 3 ? selectedHo.slice(0, -2) : selectedHo.charAt(0)) : null;
  const sortedFloors = [...floors].sort((a, b) => {
    const getLevel = (name) => {
      if (name.includes('지') || name.includes('B')) { const num = name.replace(/[^0-9]/g, ''); return -parseInt(num || 1); }
      return parseInt(name.replace(/[^0-9]/g, '') || 0);
    };
    return getLevel(b.floor) - getLevel(a.floor);
  });
  useEffect(() => {
    const target = document.getElementById('active-floor');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [floors, selectedHo]);
  return (
    <div sty
