import { useEffect, useState } from 'react';

const SCRIPT_ID = 'naver-maps-script';
const CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;

let loadPromise = null;

function loadNaverMaps() {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (window.naver?.maps) {
      resolve(window.naver);
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    // 좌표는 카카오 geocoder로 받으니까 submodules 없이 가벼운 로드
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${CLIENT_ID}&submodules=geocoder`;
    script.async = true;
    script.onload = () => resolve(window.naver);
    script.onerror = (e) => {
      loadPromise = null;
      reject(e);
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function useNaverMaps() {
  const [state, setState] = useState({
    loaded: !!window.naver?.maps,
    error: null,
  });

  useEffect(() => {
    if (state.loaded) return;
    let cancelled = false;
    loadNaverMaps()
      .then(() => !cancelled && setState({ loaded: true, error: null }))
      .catch((err) => !cancelled && setState({ loaded: false, error: err }));
    return () => { cancelled = true; };
  }, [state.loaded]);

  return state;
}
