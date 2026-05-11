import { useState, useEffect } from 'react'
import SearchPage from './pages/SearchPage'
import ResultPage from './pages/ResultPage'

export default function App() {
  const [result, setResult] = useState(null)
  const [kakaoReady, setKakaoReady] = useState(false)

  useEffect(() => {
    const load = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => setKakaoReady(true))
      } else {
        setTimeout(load, 300)
      }
    }
    load()
  }, [])

  if (!kakaoReady) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Pretendard,sans-serif', flexDirection:'column', gap:'12px' }}>
      <div style={{ fontSize:'14px', color:'#888' }}>지도 로딩 중...</div>
    </div>
  )

  return result
    ? <ResultPage data={result} onBack={() => setResult(null)} />
    : <SearchPage onSearch={setResult} />
}
