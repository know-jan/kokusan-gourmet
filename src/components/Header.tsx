// ヘッダーナビゲーションコンポーネント
import React from 'react';
import { MapPinned, Sparkles, RefreshCw } from 'lucide-react';
import { ChainBrand } from '../types';

interface HeaderProps {
  brands: Record<string, ChainBrand>;
  activeBrandId: string;
  onBrandClick: (brandId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  brands,
  activeBrandId,
  onBrandClick,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* ロゴ・タイトルエリア */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-200 shrink-0">
            <MapPinned size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                国産食材こだわりチェーン レストランマップ
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
                <Sparkles size={11} /> 富山版
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span>国産野菜100%や国産肉にこだわるチェーン店を可視化</span>
              <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                <RefreshCw size={10} className="text-emerald-600" />
                月次自動更新対応
              </span>
            </p>
          </div>
        </div>

        {/* チェーンクイック切替バッジ */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {Object.values(brands).map((brand) => {
            const isActive = activeBrandId === brand.id;
            return (
              <button
                key={brand.id}
                onClick={() => onBrandClick(isActive ? '' : brand.id)}
                className={`text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
                style={{
                  backgroundColor: isActive ? brand.color : undefined,
                  borderColor: isActive ? brand.color : undefined,
                }}
              >
                {brand.name}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
