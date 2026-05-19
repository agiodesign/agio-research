import { useEffect, useRef, useState } from 'react';
import { useNaverMaps } from '../hooks/useNaverMaps';

export default function BuildingMap({ coords, address, height = 400 }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const { loaded, error } = useNaverMaps();
  const [resolvedCoords, setResolvedCoords] = useState(coords);

  // coords가 없으면 네이버 geocoder로 직접 변환
  useEffect(() => {
    if (coords) {
      setResolvedCoords(coords);
      return;
    }
    if (!loaded || !address) return;

    window.naver.maps.Service.geocode({ query: address }, (status, response) => {
      if (status !== window.naver.maps.Service.Status.OK) return;
      const result = response.v2.addresses?.[0];
      if (result) {
        setResolvedCoords({ lat: parseFloat(result.y), lon: parseFloat(result.x) });
      }
    });
  }, [loaded, coords, address]);

  // 지도 생성/갱신
  useEffect(() => {
    if (!loaded || !resolvedCoords || !mapRef.current) return;

    const { naver } = window;
    const position = new naver.maps.LatLng(resolvedCoords.lat, resolvedCoords.lon);

    if (!mapInstance.current) {
      mapInstance.current = new naver.maps.Map(mapRef.current, {
        center: position,
        zoom: 17,
        zoomControl: true,
        zoomControlOptions: { position: naver.maps.Position.TOP_RIGHT },
      });
      markerInstance.current = new naver.maps.Marker({
        position,
        map: mapInstance.current,
      });
    } else {
      mapInstance.current.setCenter(position);
      markerInstance.current.setPosition(position);
    }
  }, [loaded, resolvedCoords]);

  useEffect(() => () => {
    markerInstance.current?.setMap(null);
    mapInstance.current?.destroy?.();
    mapInstance.current = null;
    markerInstance.current = null;
  }, []);

  if (error) {
    return (
      <div style={{ padding: 16, color: 'crimson', background: '#fff5f5', borderRadius: 8 }}>
        지도 로드 실패. 네이버 지도 인증을 확인해주세요.
      </div>
    );
  }

  if (!resolvedCoords) {
    return (
      <div style={{
        height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f5f5f3', borderRadius: 8, color: '#888', fontSize: 14
      }}>
        지도를 불러오는 중...
      </div>
    );
  }

  return (
    <div>
      <div ref={mapRef} style={{ width: '100%', height, borderRadius: 8, background: '#f5f5f3' }} />
      {address && (
        <p style={{ marginTop: 8, fontSize: 13, color: '#666' }}>📍 {address}</p>
      )}
    </div>
  );
}