// 検索および国産こだわり絞り込みフィルターバー
import React from 'react';
import { Search, Filter, Leaf, Beef, X } from 'lucide-react';
import { ChainBrand } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedBrandId: string;
  onSelectBrand: (brandId: string) => void;
  require100PercentVeg: boolean;
  onToggle100PercentVeg: () => void;
  requireDomesticMeat: boolean;
  onToggleDomesticMeat: () => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  cities: string[];
  brands: Record<string, ChainBrand>;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedBrandId,
  onSelectBrand,
  require100PercentVeg,
  onToggle100PercentVeg,
  requireDomesticMeat,
  onToggleDomesticMeat,
  selectedCity,
  onSelectCity,
  cities,
  brands,
  totalCount,
}) => {
  const brandList = Object.values(brands);

  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-md rounded-2xl p-3.5 space-y-3">
      {/* 上段：キーワード検索とエリア選択 */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        {/* 検索入力フォーム */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="店名や住所で検索（例: 高岡、ファボーレ、餃子）"
            className="w-full pl-9 pr-8 py-2 bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-xs sm:text-sm rounded-xl border border-transparent focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all text-slate-800"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* 市町村絞り込み */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
          <select
            value={selectedCity}
            onChange={(e) => onSelectCity(e.target.value)}
            className="w-full sm:w-auto py-2 px-3 bg-slate-100 text-xs sm:text-sm rounded-xl border border-transparent focus:border-emerald-500 focus:outline-none text-slate-700 font-medium"
          >
            <option value="">富山県全域</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 下段：国産こだわり条件トグル ＆ チェーン絞り込み */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
        {/* 国産条件トグルボタン */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Filter size={12} /> こだわり条件:
          </span>

          {/* 野菜100%国産 */}
          <button
            onClick={onToggle100PercentVeg}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
              require100PercentVeg
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
          >
            <Leaf size={13} />
            <span>野菜100%国産</span>
          </button>

          {/* お肉も国産対応 */}
          <button
            onClick={onToggleDomesticMeat}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
              requireDomesticMeat
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
            }`}
          >
            <Beef size={13} />
            <span>お肉も国産</span>
          </button>
        </div>

        {/* チェーン絞り込み & 件数 */}
        <div className="flex items-center gap-2 ml-auto">
          <select
            value={selectedBrandId}
            onChange={(e) => onSelectBrand(e.target.value)}
            className="py-1 px-2.5 bg-slate-100 text-xs rounded-lg border border-transparent text-slate-700 font-medium focus:outline-none"
          >
            <option value="">全チェーン表示</option>
            {brandList.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>

          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md shrink-0">
            {totalCount} 件表示
          </span>
        </div>
      </div>
    </div>
  );
};
