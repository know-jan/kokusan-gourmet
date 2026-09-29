// 店舗リスト一覧表示コンポーネント（サイドバー用）
import React from 'react';
import { Store, ChainBrand } from '../types';
import { Leaf, Beef, ChevronRight, MapPin } from 'lucide-react';

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
          検索キーワードやこだわり条件を変更してお試しください。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-250px)] pr-1">
      {stores.map((store) => {
        const brand = brands[store.brandId];
        const isSelected = selectedStore?.id === store.id;

        return (
          <div
            key={store.id}
            onClick={() => onSelectStore(store)}
            className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
              isSelected
                ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-200 shadow-sm'
                : 'bg-white hover:bg-slate-50 border-slate-200/90 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {/* ジャンルとチェーン名バッジ */}
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: brand?.color || '#16a34a' }}
                  >
                    {brand?.name}
                  </span>
                  <span className="text-[11px] text-slate-400">{store.city}</span>
                </div>

                {/* 店舗名 */}
                <h4 className="font-bold text-slate-800 text-sm truncate">{store.name}</h4>

                {/* 住所 */}
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                  <MapPin size={12} className="shrink-0 text-slate-400" />
                  {store.address}
                </p>

                {/* こだわりバッジ */}
                <div className="flex items-center gap-1.5 mt-2">
                  {brand?.domesticHighlight.vegetable.is100Percent && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                      <Leaf size={10} /> 野菜100%
                    </span>
                  )}
                  {brand?.domesticHighlight.meat.available && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">
                      <Beef size={10} /> 国産肉
                    </span>
                  )}
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
