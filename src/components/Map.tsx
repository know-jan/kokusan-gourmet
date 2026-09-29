// Leafletを用いたインタラクティブ地図コンポーネント（産地安全性ランク別ピン表示）
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Store, ChainBrand, SafetyRank } from '../types';

interface MapProps {
  stores: Store[];
  brands: Record<string, ChainBrand>;
  selectedStore: Store | null;
  onSelectStore: (store: Store) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

// ランク別の配色とラベル
const RANK_CONFIG: Record<SafetyRank, { color: string; label: string; badge: string }> = {
  domestic_pure: { color: '#16a34a', label: '純国産', badge: '🇯🇵 純国産' },
  no_china_safe: { color: '#0284c7', label: '安心', badge: '🛡 中国産不使用' },
  custom_local: { color: '#f59e0b', label: '★個人店', badge: '⭐ 地元個人店' },
  mixed_selective: { color: '#eab308', label: '選択可', badge: '選択制' },
  china_included: { color: '#94a3b8', label: '中国産有', badge: '🇨🇳 中国産あり' },
};

export const Map: React.FC<MapProps> = ({
  stores,
  brands,
  selectedStore,
  onSelectStore,
  onMapClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // 地図の初期化（富山市を中心とする）
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [36.6953, 137.2113],
      zoom: 11,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // 地図クリックで個人店登録を促すイベント
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [onMapClick]);

  // マーカー描画
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    stores.forEach((store) => {
      const isSelected = selectedStore?.id === store.id;
      const rankInfo = RANK_CONFIG[store.safetyRank] || RANK_CONFIG.no_china_safe;
      const bgColor = store.isCustom ? '#f59e0b' : rankInfo.color;
      const label = store.isCustom ? '★' : store.brandName.slice(0, 2);

      const pinHtml = `
        <div class="custom-pin relative flex items-center justify-center ${
          isSelected ? 'ring-4 ring-offset-2 ring-emerald-500 scale-125 z-50' : ''
        }" style="background-color: ${bgColor}; width: ${isSelected ? '38px' : '32px'}; height: ${
        isSelected ? '38px' : '32px'
      }; border: 2px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.25); border-radius: 9999px;">
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

      const brand = brands[store.brandId];
      const popupContent = `
        <div style="min-width: 210px; font-family: sans-serif; padding: 10px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: bold; color: ${bgColor}; background: #f8fafc; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
              ${rankInfo.badge}
            </span>
            <span style="font-size: 10px; color: #64748b;">${store.city}</span>
          </div>
          <div style="font-size: 13px; font-weight: bold; color: #1e293b; margin-bottom: 4px;">
            ${store.name}
          </div>
          <div style="font-size: 11px; color: #334155; line-height: 1.4; margin-bottom: 6px;">
            ${store.customNotes || brand?.commitmentSummary || '産地に配慮した店舗'}
          </div>
          <div style="font-size: 10px; color: #64748b;">
            📍 ${store.address}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => onSelectStore(store));
      layer.addLayer(marker);

      if (isSelected) {
        marker.openPopup();
      }
    });
  }, [stores, brands, selectedStore, onSelectStore]);

  // 選択店舗へのフォーカス
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedStore) return;
    mapInstanceRef.current.flyTo([selectedStore.lat, selectedStore.lng], 14, {
      duration: 1.0,
    });
  }, [selectedStore]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* 地図左下の凡例（ランク説明） */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur-xs border border-slate-200 shadow-md rounded-xl p-2.5 text-[10px] space-y-1">
        <div className="font-bold text-slate-700 mb-1">ピンの見分け方</div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span>純国産（野菜・主要肉100%）</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
          <span>中国産不使用（国産・欧米豪産）</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>手動登録した個人店</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
          <span>中国産食材あり（排除トグルで非表示）</span>
        </div>
      </div>
    </div>
  );
};
