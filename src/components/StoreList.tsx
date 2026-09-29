// 店舗一覧リスト表示コンポーネント（産地国・安全性ランク・個人店対応）
import React from 'react';
import { Store, ChainBrand } from '../types';
import { ChevronRight, MapPin, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';

interface StoreListProps {
  stores: Store[];
  brands: Record<string, ChainBrand>;
  selectedStore: Store | null;
  onSelectStore: (store: Store) => void;
}

export const StoreList: React.FC<StoreListProps> = ({
  stores,
  brands,
  selectedStore,
  onSelectStore,
}) => {
  if (stores.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
        <p className="font-semibold text-sm">該当する店舗が見つかりませんでした</p>
        <p className="text-xs text-slate-400 mt-1">
          条件を変更するか、「中国産を排除」を切り替えてお試しください。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-270px)] pr-1">
      {stores.map((store) => {
        const brand = brands[store.brandId];
        const isSelected = selectedStore?.id === store.id;
        const isNoChina = !store.containsChinaIngredients;
        const isPure = store.safetyRank === 'domestic_pure';

        return (
          <div
            key={store.id}
            onClick={() => onSelectStore(store)}
            className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
              isSelected
                ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-200 shadow-sm'
                : 'bg-white hover:bg-slate-50 border-slate-200/90 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {/* 産地安全性バッジとエリア */}
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  {store.isCustom ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white flex items-center gap-0.5">
                      <Sparkles size={10} /> 個人店
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {brand?.name}
                    </span>
                  )}

                  {/* 産地安全性 */}
                  {isPure ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                      🇯🇵 純国産
                    </span>
                  ) : isNoChina ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 flex items-center gap-0.5">
                      <ShieldCheck size={10} /> 中国産ゼロ
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 flex items-center gap-0.5">
                      <ShieldAlert size={10} /> 中国産食材あり
                    </span>
                  )}

                  <span className="text-[11px] text-slate-400">{store.city}</span>
                </div>

                {/* 店舗名 */}
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                  {store.name}
                </h4>

                {/* 住所 */}
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                  <MapPin size={11} className="shrink-0 text-slate-400" />
                  {store.address}
                </p>

                {/* 使用国アイコンタグ */}
                <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500">
                  <span className="text-slate-400">産地:</span>
                  {store.countriesUsed.map((c) => (
                    <span key={c} className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">
                      {c === '日本' && '🇯🇵 日本'}
                      {c === '中国' && '🇨🇳 中国'}
                      {c === 'アメリカ・カナダ' && '🇺🇸 北米'}
                      {c === 'オーストラリア・NZ' && '🇦🇺 豪州'}
                      {c === '欧州' && '🇪🇺 欧州'}
                    </span>
                  ))}
                </div>
              </div>

              <ChevronRight
                size={16}
                className={`shrink-0 mt-3 transition-transform ${
                  isSelected ? 'text-emerald-600 translate-x-1' : 'text-slate-300'
                }`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
