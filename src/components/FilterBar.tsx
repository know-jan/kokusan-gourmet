// 産地・安全性・中国産排除フィルターバー
import React from 'react';
import { Search, ShieldCheck, ShieldAlert, Plus, X, Leaf, Beef } from 'lucide-react';
import { OriginCountry } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  excludeChina: boolean;
  onToggleExcludeChina: () => void;
  require100PercentVeg: boolean;
  onToggle100PercentVeg: () => void;
  requireDomesticMeat: boolean;
  onToggleDomesticMeat: () => void;
  selectedCountry: string;
  onSelectCountry: (country: string) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  cities: string[];
  totalCount: number;
  onOpenAddModal: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  excludeChina,
  onToggleExcludeChina,
  require100PercentVeg,
  onToggle100PercentVeg,
  requireDomesticMeat,
  onToggleDomesticMeat,
  selectedCountry,
  onSelectCountry,
  selectedCity,
  onSelectCity,
  cities,
  totalCount,
  onOpenAddModal,
}) => {
  const originCountries: OriginCountry[] = [
    '日本',
    '欧州',
    'オーストラリア・NZ',
    'アメリカ・カナダ',
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl p-3.5 space-y-3">
      {/* 1段目：検索 ＆ 個人店追加ボタン */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="店名・住所・メニューで検索（例: 高岡、キャベツ、ハーブ鶏）"
            className="w-full pl-9 pr-8 py-2 bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-xs sm:text-sm rounded-xl border border-transparent focus:border-emerald-500 focus:outline-none transition-all text-slate-800"
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

        {/* 個人店登録ボタン */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shrink-0 shadow-sm transition-colors"
          title="お気に入りの個人店を手動で登録"
        >
          <Plus size={15} />
          <span>個人店を登録</span>
        </button>
      </div>

      {/* 2段目：最重要スイッチ「🇨🇳 中国産を排除」 */}
      <div className="flex items-center justify-between p-2.5 rounded-xl border transition-all bg-gradient-to-r from-emerald-50/70 to-teal-50/50 border-emerald-200/80">
        <div className="flex items-center gap-2">
          {excludeChina ? (
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck size={16} />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
              <ShieldAlert size={16} />
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm text-slate-900">
                中国産食材を排除
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                安心フィルタ
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              {excludeChina
                ? '中国産ありの店舗を除外中（安心店舗のみ表示）'
                : 'ジョイフル・ガスト等の全店舗を表示中（ONで一括除外）'}
            </p>
          </div>
        </div>

        {/* トグルスイッチ */}
        <button
          type="button"
          onClick={onToggleExcludeChina}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            excludeChina ? 'bg-emerald-600' : 'bg-slate-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              excludeChina ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* 3段目：食材こだわり ＆ 国別・エリア絞り込み */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
        {/* こだわりバッジボタン */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={onToggle100PercentVeg}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
              require100PercentVeg
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
          >
            <Leaf size={12} />
            <span>野菜国産100%</span>
          </button>

          <button
            onClick={onToggleDomesticMeat}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
              requireDomesticMeat
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
            }`}
          >
            <Beef size={12} />
            <span>お肉も国産</span>
          </button>

          {/* 国別絞り込み */}
          <select
            value={selectedCountry}
            onChange={(e) => onSelectCountry(e.target.value)}
            className="py-1.5 px-2 bg-slate-100 text-xs rounded-lg border border-transparent text-slate-700 font-medium focus:outline-none"
          >
            <option value="">産出国: すべて</option>
            {originCountries.map((c) => (
              <option key={c} value={c}>
                {c}産を使用
              </option>
            ))}
          </select>
        </div>

        {/* 市町村 ＆ 件数 */}
        <div className="flex items-center gap-2 ml-auto">
          <select
            value={selectedCity}
            onChange={(e) => onSelectCity(e.target.value)}
            className="py-1 px-2.5 bg-slate-100 text-xs rounded-lg border border-transparent text-slate-700 font-medium focus:outline-none"
          >
            <option value="">富山県全域</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md shrink-0">
            {totalCount} 店舗
          </span>
        </div>
      </div>
    </div>
  );
};
