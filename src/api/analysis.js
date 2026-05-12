const API_BASE = (import.meta.env.VITE_POPULATION_API_BASE || '/api/population').trim();

/**
 * 법정동/행정동 코드 정규화 유틸리티
 */
export const normalizeAreaCode = (code, length = 8) => {
  if (!code) return '';
  return code.toString().substring(0, length);
};

/**
 * 공통 API 요청 및 응답 처리기
 */
const requestPopulationApi = async (operation, params) => {
  try {
    const searchParams = new URLSearchParams({ ...params, operation });
    const response = await fetch(`${API_BASE}?${searchParams}`);
    
    if (!response.ok) {
      throw new Error(`API 요청 실패(${response.status})`);
    }

    const rawData = await response.json();
    // sdsc2 응답 구조(data.response.body 또는 data.body) 정규화
    const data = rawData.response || rawData;
    const header = data.header || data.body?.header;

    if (header?.resultCode !== '00') {
      throw new Error(header?.resultMsg || '데이터 조회 실패');
    }

    return data.body || data;
  } catch (error) {
    console.error(`[${operation}] 데이터 로드 실패:`, error);
    throw error;
  }
};

/**
 * 행정동 단위 상가업소 조회
 */
export const getStoresInDong = async (code) => {
  // 행정동 조회는 8자리 코드를 기본으로 사용 [cite: 744, 1672]
  const key = normalizeAreaCode(code, 8);
  return requestPopulationApi('storeListInDong', { divId: 'adongCd', key });
};

/**
 * 건물단위 상가업소 조회
 */
export const getStoresInBuilding = async (buildingMngNo) => {
  // 건물관리번호는 25자리 필수 [cite: 669]
  return requestPopulationApi('storeListInBuilding', { key: buildingMngNo });
};

/**
 * 반경내 상가업소 조회
 */
export const getStoresInRadius = async (cx, cy, radius = 500) => {
  // radius는 미터 단위, 최대 2000m [cite: 944]
  return requestPopulationApi('storeListInRadius', { cx, cy, radius });
};

/**
 * 기존 코드 호환성 유지용 래퍼
 */
export const getPopulationStatus = async (divId, key) => {
  try {
    return await getStoresInDong(key);
  } catch {
    return null;
  }
};
