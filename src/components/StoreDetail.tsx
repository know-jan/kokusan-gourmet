// 店舗詳細表示パネルコンポーネント（産地国・安全性・個人店対応）
import React from 'react';
import { Store, ChainBrand } from '../types';
import {
  Leaf,
  Beef,
  Wheat,
  MapPin,
  Phone,
  Clock,
  ExternalLink,
  X,
  Navigation,
  ShieldCheck,
  ShieldAlert,
  Globe2,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface StoreDetailProps {
  store: Store | null;
  brand?: ChainBrand;
  onClose: () => void;
  onDeleteCustomStore?: (id: string) => void;
}

export const StoreDetail: React.FC<StoreDetailProps> = ({
  store,
  brand,
  onClose,
  onDeleteCustomStore,
}) => {
  if (!store) return null;

  const googleMapsUrl =
    store.googleMapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${store.name} ${store.address}`
    )}`;

  const isPureDomestic = store.safetyRank === 'domestic_pure';
  const isNoChina = !store.containsChinaIngredients;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] md:max-h-[calc(100vh-140px)] transition-all animate-in slide-in-from-bottom-5 md:slide-in-from-right-5 duration-300">
      {/* ヘッダーエリア */}
      <div
        className="p-5 text-white relative"
        style={{
          backgroundColor: store.isCustom
            ? '#f59e0b'
            : isPureDomestic
            ? '#16a34a'
            : isNoChina
            ? '#0284c7'
            : '#64748b',
          backgroundImage:
            'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.15) 100%)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 p-1.5 rounded-full transition-colors"
          title="閉じる"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-1.5 mb-2">
          {store.isCustom ? (
            <span className="bg-white/20 backdrop-blur-xs text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles size={11} /> 地元個人店
            </span>
          ) : (
            <span className="bg-white/20 backdrop-blur-xs text-[11px] font-bold px-2 py-0.5 rounded-full">
              {brand?.genre}
            </span>
          )}

          {/* 中国産ステータスバッジ */}
          {isNoChina ? (
            <span className="bg-emerald-950/40 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-emerald-300/30">
              <ShieldCheck size={11} /> 中国産不使用
            </span>
          ) : (
            <span className="bg-rose-950/40 text-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-rose-300/30">
              <ShieldAlert size={11} /> 中国産食材あり
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold tracking-tight">{store.name}</h2>
        <p className="text-white/90 text-xs mt-0.5">
          {store.isCustom ? '手動登録されたこだわり店' : brand?.name}
        </p>
      </div>

      {/* スクロール可能コンテンツ */}
      <div className="p-5 overflow-y-auto space-y-4 text-slate-700 text-xs">
        {/* 使用されている食材の産出国タグ */}
        <div>
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
            <Globe2 size={13} /> 主な食材の原産国
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {store.countriesUsed.map((country) => (
              <span
                key={country}
                className={`px-2 py-1 rounded-md font-semibold text-[11px] border ${
                  country === '日本'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : country === '中国'
                    ? 'bg-rose-50 text-rose-800 border-rose-200 font-bold'
                    : 'bg-sky-50 text-sky-800 border-sky-200'
                }`}
              >
                {country === '日本' && '🇯🇵 '}
                {country === '中国' && '🇨🇳 '}
                {country === 'アメリカ・カナダ' && '🇺🇸🇨🇦 '}
                {country === 'オーストラリア・NZ' && '🇦🇺 '}
                {country === '欧州' && '🇪🇺 '}
                {country}
              </span>
            ))}
          </div>
        </div>

        {/* 食材のこだわりセクション */}
        <div className="space-y-2.5">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            食材の産地・安全性詳細
          </h3>

          {/* 個人店メモがある場合 */}
          {store.customNotes && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3">
              <p className="font-bold text-amber-950 mb-1">⭐ 個人店こだわりメモ</p>
              <p className="text-amber-900 leading-relaxed">{store.customNotes}</p>
            </div>
          )}

          {/* チェーン店の野菜情報 */}
          {brand?.domesticHighlight.vegetable && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
              <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-700 shrink-0 mt-0.5">
                <Leaf size={15} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-950">野菜の産地</span>
                  {brand.domesticHighlight.vegetable.is100PercentDomestic && (
                    <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                      国産100%
                    </span>
                  )}
                </div>
                <p className="text-emerald-800 mt-0.5 leading-relaxed">
                  {brand.domesticHighlight.vegetable.description}
                </p>
              </div>
            </div>
          )}

          {/* チェーン店のお肉情報 */}
          {brand?.domesticHighlight.meat && (
            <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3 flex items-start gap-2.5">
              <div className="p-1.5 bg-sky-100 rounded-lg text-sky-700 shrink-0 mt-0.5">
                <Beef size={15} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sky-950">お肉の産地</span>
                  {brand.domesticHighlight.meat.isDomestic && (
                    <span className="bg-sky-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                      国産肉
                    </span>
                  )}
                </div>
                <p className="text-sky-800 mt-0.5 leading-relaxed">
                  {brand.domesticHighlight.meat.description}
                </p>
              </div>
            </div>
          )}

          {/* その他食材 */}
          {brand?.domesticHighlight.others && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
              <div className="p-1.5 bg-slate-200 rounded-lg text-slate-700 shrink-0 mt-0.5">
                <Wheat size={15} />
              </div>
              <div>
                <span className="font-bold text-slate-900">お米・小麦粉・調味料</span>
                <p className="text-slate-700 mt-0.5 leading-relaxed">
                  {brand.domesticHighlight.others.description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 公式産地ページリンク */}
        {brand?.officialSourceUrl && (
          <a
            href={brand.officialSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors"
          >
            <span className="flex items-center gap-1.5 font-semibold">
              <ExternalLink size={13} className="text-slate-500" />
              公式HPの産地情報を見る
            </span>
            <span className="text-[10px] text-slate-400">公式 ↗</span>
          </a>
        )}

        <hr className="border-slate-100" />

        {/* 店舗情報 */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-slate-600">
            <MapPin size={15} className="text-slate-400 shrink-0 mt-0.5" />
            <span>{store.address}</span>
          </div>

          {store.phone && (
            <div className="flex items-center gap-2 text-slate-600">
              <Phone size={15} className="text-slate-400 shrink-0" />
              <a href={`tel:${store.phone}`} className="hover:text-emerald-600 underline">
                {store.phone}
              </a>
            </div>
          )}

          {store.openingHours && (
            <div className="flex items-start gap-2 text-slate-600">
              <Clock size={15} className="text-slate-400 shrink-0 mt-0.5" />
              <span>{store.openingHours}</span>
            </div>
          )}
        </div>

        {/* Googleマップ連携ボタン */}
        <div className="pt-2 flex flex-col gap-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow transition-colors"
          >
            <Navigation size={14} />
            Googleマップで口コミ・経路を見る
          </a>

          {/* 個人店の場合は削除ボタンも表示 */}
          {store.isCustom && onDeleteCustomStore && (
            <button
              onClick={() => {
                if (confirm(`「${store.name}」をマップから削除しますか？`)) {
                  onDeleteCustomStore(store.id);
                  onClose();
                }
              }}
              className="flex items-center justify-center gap-1 w-full py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-semibold text-xs"
            >
              <Trash2 size={13} />
              この個人店を削除
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
