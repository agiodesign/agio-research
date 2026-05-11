import { useState } from 'react'
import SearchPage from './pages/SearchPage'
import ResultPage from './pages/ResultPage'

export default function App() {
  const [result, setResult] = useState(null)
  return result
    ? <ResultPage data={result} onBack={() => setResult(null)} />
    : <SearchPage onSearch={setResult} />
}
