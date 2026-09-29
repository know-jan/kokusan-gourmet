// Leafletを用いたインタラクティブ地図コンポーネント
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Store, ChainBrand } from '../types';

interface MapProps {
  stores: Store[];
  brands: Record<string, ChainBrand>;
  selectedStore: Store | null;
  onSelectStore: (store: Store) => void;
}

export const Map: React.FC<MapProps> = ({
  stores,
  brands,
  selectedStore,
  onSelectStore,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // 地図の初期化（富山市を中心とする）
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // 富山県富山市周辺を初期表示（緯度: 36.6953, 経度: 137.2113, ズーム: 11）
    const map = L.map(mapContainerRef.current, {
      center: [36.6953, 137.2113],
      zoom: 11,
      zoomControl: true,
    });

    // オープンストリートマップの標準タイルレイヤー（日本語対応・無料）
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> 貢献者',
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 店舗ピンマーカーの描画・更新
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    stores.forEach((store) => {
      const brand = brands[store.brandId];
      const isSelected = selectedStore?.id === store.id;
      const bgColor = brand ? brand.color : '#16a34a';
      const label = brand ? brand.iconText : store.brandName.slice(0, 2);

      // カスタムHTMLピン（CSSスタイリング）
      const pinHtml = `
        <div class="custom-pin relative flex items-center justify-center ${
          isSelected ? 'ring-4 ring-offset-2 ring-emerald-500 scale-125 z-50' : ''
        }" style="background-color: ${bgColor}; width: ${isSelected ? '38px' : '32px'}; height: ${
        isSelected ? '38px' : '32px'
      }; border: 2px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border-radius: 9999px;">
          <span style="color: #ffffff; font-size: ${isSelected ? '11px' : '10px'}; font-weight: bold; white-space: nowrap; pointer-events: none;">
            ${label}
          </span>
          <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${bgColor};"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: pinHtml,
        className: 'custom-leaflet-marker',
        iconSize: isSelected ? [38, 44] : [32, 38],
        iconAnchor: isSelected ? [19, 44] : [16, 38],
        popupAnchor: [0, -38],
      });

      const marker = L.marker([store.lat, store.lng], { icon: customIcon });

      // ポップアップ内容（簡潔な店舗情報と国産こだわり）
      const popupContent = `
        <div style="min-width: 220px; font-family: sans-serif; padding: 12px;">
          <div style="font-size: 11px; font-weight: bold; color: ${bgColor}; margin-bottom: 2px;">
            ${brand?.genre || 'レストラン'}
          </div>
          <div style="font-size: 14px; font-weight: bold; color: #1e293b; margin-bottom: 6px;">
            ${store.name}
          </div>
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 6px 8px; margin-bottom: 8px;">
            <div style="font-size: 11px; font-weight: bold; color: #15803d;">🌱 国産こだわりポイント</div>
            <div style="font-size: 11px; color: #166534; line-height: 1.4; margin-top: 2px;">
              ${brand?.commitmentSummary || '国産食材へのこだわりあり'}
            </div>
          </div>
          <div style="font-size: 11px; color: #64748b; line-height: 1.4;">
            📍 ${store.address}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        onSelectStore(store);
      });

      layer.addLayer(marker);

      // 選択中の店舗ならポップアップを開く
      if (isSelected) {
        marker.openPopup();
      }
    });
  }, [stores, brands, selectedStore, onSelectStore]);

  // 店舗が選択されたときにその店舗へスムーズに地図を移動
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedStore) return;
    mapInstanceRef.current.flyTo([selectedStore.lat, selectedStore.lng], 14, {
      duration: 1.0,
    });
  }, [selectedStore]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
