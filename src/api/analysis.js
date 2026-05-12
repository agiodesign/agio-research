import axios from 'axios';

const API_KEY = process.env.REACT_APP_API_KEY; // 기존 키 사용
const BASE_URL = 'http://apis.data.go.kr/B553077/api/open/sdsc2';

/**
 * 소상공인 상권정보 - 인구 현황 조회
 * @param {string} divId - 구분ID (adongCd: 행정동, bjdongCd: 법정동 등)
 * @param {string} key - 행정동/법정동 코드
 */
export const getPopulationStatus = async (divId, key) => {
  try {
    const params = new URLSearchParams({ divId, key })
    const response = await fetch(`/api/population?${params}`)
    const data = await response.json()
    return data?.body
  } catch (error) {
    console.error("인구 분석 데이터 로드 실패:", error)
    return null
  }
}
