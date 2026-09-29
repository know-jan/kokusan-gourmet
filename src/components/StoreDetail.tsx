// 店舗詳細表示パネルコンポーネント
import React from 'react';
import { Store, ChainBrand } from '../types';
import {
  Leaf,
  Beef,
  Wheat,
  MapPin,
  Phone,
  Clock,
  Car,
  ShoppingBag,
  ExternalLink,
  X,
  Navigation,
} from 'lucide-react';

interface StoreDetailProps {
  store: Store | null;
  brand?: ChainBrand;
  onClose: () => void;
}

export const StoreDetail: React.FC<StoreDetailProps> = ({
  store,
  brand,
  onClose,
}) => {
  if (!store || !brand) return null;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${store.name} ${store.address}`
  )}`;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] md:max-h-[calc(100vh-140px)] transition-all animate-in slide-in-from-bottom-5 md:slide-in-from-right-5 duration-300">
      {/* ヘッダーエリア */}
      <div
        className="p-5 text-white relative"
        style={{
          backgroundColor: brand.color,
          backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.15) 100%)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 p-1.5 rounded-full transition-colors"
          title="閉じる"
        >
          <X size={18} />
        </button>

        <div className="inline-block bg-white/20 backdrop-blur-sm text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
          {brand.genre}
        </div>
        <h2 className="text-xl font-bold tracking-tight">{store.name}</h2>
        <p className="text-white/90 text-sm mt-0.5">{brand.name}</p>
      </div>

      {/* スクロール可能コンテンツ */}
      <div className="p-5 overflow-y-auto space-y-5 text-slate-700 text-sm">
        {/* 国産食材のこだわりセクション */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            国産食材へのこだわり
          </h3>

          {/* 野菜のこだわり */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700 shrink-0 mt-0.5">
              <Leaf size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-900 text-sm">野菜のこだわり</span>
                {brand.domesticHighlight.vegetable.is100Percent && (
                  <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    国産100%
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                {brand.domesticHighlight.vegetable.description}
              </p>
            </div>
          </div>

          {/* お肉のこだわり */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0 mt-0.5">
              <Beef size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-900 text-sm">お肉のこだわり</span>
                {brand.domesticHighlight.meat.available && (
                  <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    国産対応
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                {brand.domesticHighlight.meat.description}
              </p>
            </div>
          </div>

          {/* その他食材（米・小麦等） */}
          {brand.domesticHighlight.others && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3">
              <div className="p-2 bg-slate-200 rounded-lg text-slate-700 shrink-0 mt-0.5">
                <Wheat size={18} />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm">お米・小麦・その他</span>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {brand.domesticHighlight.others}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 公式産地情報リンク */}
        <div className="pt-1">
          <a
            href={brand.officialSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <ExternalLink size={14} className="text-slate-500" />
              公式HPの食材・産地情報を見る
            </span>
            <span className="text-[11px] text-slate-400">公式外部サイト ↗</span>
          </a>
        </div>

        <hr className="border-slate-100" />

        {/* 店舗の基本情報 */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">店舗情報</h3>

          <div className="flex items-start gap-2.5 text-xs text-slate-600">
            <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
            <span>{store.address}</span>
          </div>

          {store.phone && (
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <Phone size={16} className="text-slate-400 shrink-0" />
              <a href={`tel:${store.phone}`} className="hover:text-emerald-600 underline">
                {store.phone}
              </a>
            </div>
          )}

          {store.openingHours && (
            <div className="flex items-start gap-2.5 text-xs text-slate-600">
              <Clock size={16} className="text-slate-400 shrink-0 mt-0.5" />
              <span>{store.openingHours}</span>
            </div>
          )}

          {/* 施設・サービスバッジ */}
          <div className="flex flex-wrap gap-2 pt-1">
            {store.hasParking !== undefined && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-1 rounded-md">
                <Car size={13} />
                {store.hasParking ? '駐車場あり' : '駐車場なし'}
              </span>
            )}
            {store.takeoutAvailable && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md font-medium">
                <ShoppingBag size={13} />
                テイクアウト対応
              </span>
            )}
          </div>
        </div>

        {/* ナビ・Googleマップリンク */}
        <div className="pt-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-colors"
          >
            <Navigation size={14} />
            Googleマップでルートを調べる
          </a>
        </div>
      </div>
    </div>
  );
};
