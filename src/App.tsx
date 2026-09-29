// メインアプリケーションコンポーネント
import React, { useState, useMemo } from 'react';
import { BRANDS, STORES_DATA } from './data/stores';
import { Store } from './types';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { StoreList } from './components/StoreList';
import { StoreDetail } from './components/StoreDetail';
import { Map } from './components/Map';
import { MapPin, List, Info, Sparkles, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [require100PercentVeg, setRequire100PercentVeg] = useState(false);
  const [requireDomesticMeat, setRequireDomesticMeat] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');
  const [showInfoModal, setShowInfoModal] = useState(false);

  // 富山県内の市町村リストを抽出
  const cities = useMemo(() => {
    const citySet = new Set<string>();
    STORES_DATA.forEach((s) => {
      if (s.city) citySet.add(s.city);
    });
    return Array.from(citySet).sort();
  }, []);

  // フィルタリング処理
  const filteredStores = useMemo(() => {
    return STORES_DATA.filter((store) => {
      const brand = BRANDS[store.brandId];

      // キーワード検索（店名、住所、ブランド名）
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = store.name.toLowerCase().includes(q);
        const matchAddr = store.address.toLowerCase().includes(q);
        const matchBrand = store.brandName.toLowerCase().includes(q);
        const matchGenre = brand?.genre.toLowerCase().includes(q);
        if (!matchName && !matchAddr && !matchBrand && !matchGenre) {
          return false;
        }
      }

      // ブランド絞り込み
      if (selectedBrandId && store.brandId !== selectedBrandId) {
        return false;
      }

      // 市町村絞り込み
      if (selectedCity && store.city !== selectedCity) {
        return false;
      }

      // 野菜国産100%条件
      if (require100PercentVeg && !brand?.domesticHighlight.vegetable.is100Percent) {
        return false;
      }

      // お肉国産対応条件
      if (requireDomesticMeat && !brand?.domesticHighlight.meat.available) {
        return false;
      }

      return true;
    });
  }, [
    searchQuery,
    selectedBrandId,
    selectedCity,
    require100PercentVeg,
    requireDomesticMeat,
  ]);

  // 店舗選択ハンドラ（選択時にモバイルなら地図タブに切り替えることも可能）
  const handleSelectStore = (store: Store) => {
    setSelectedStore(store);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100">
      {/* ヘッダー */}
      <Header
        brands={BRANDS}
        activeBrandId={selectedBrandId}
        onBrandClick={(brandId) => setSelectedBrandId(brandId)}
      />

      {/* メインレイアウト */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        {/* サイドバー（PC: 左側固定 / モバイル: タブ切り替え） */}
        <div
          className={`w-full md:w-[420px] lg:w-[460px] h-full flex flex-col bg-slate-50 border-r border-slate-200 z-20 transition-all ${
            mobileTab === 'list' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* 検索・絞り込みエリア */}
          <div className="p-3 sm:p-4 bg-white border-b border-slate-200 shadow-xs">
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedBrandId={selectedBrandId}
              onSelectBrand={setSelectedBrandId}
              require100PercentVeg={require100PercentVeg}
              onToggle100PercentVeg={() => setRequire100PercentVeg(!require100PercentVeg)}
              requireDomesticMeat={requireDomesticMeat}
              onToggleDomesticMeat={() => setRequireDomesticMeat(!requireDomesticMeat)}
              selectedCity={selectedCity}
              onSelectCity={setSelectedCity}
              cities={cities}
              brands={BRANDS}
              totalCount={filteredStores.length}
            />
          </div>

          {/* 店舗一覧リスト */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
            <StoreList
              stores={filteredStores}
              brands={BRANDS}
              selectedStore={selectedStore}
              onSelectStore={(store) => {
                handleSelectStore(store);
                if (window.innerWidth < 768) {
                  setMobileTab('map');
                }
              }}
            />
          </div>

          {/* フッター情報バー */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span>富山県内 {STORES_DATA.length} 店舗掲載中</span>
            <button
              onClick={() => setShowInfoModal(true)}
              className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              <Info size={13} />
              自動更新・こだわり基準について
            </button>
          </div>
        </div>

        {/* 地図エリア */}
        <div
          className={`flex-1 h-full relative ${
            mobileTab === 'map' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <Map
            stores={filteredStores}
            brands={BRANDS}
            selectedStore={selectedStore}
            onSelectStore={handleSelectStore}
          />

          {/* 店舗詳細フローティングカード（PC・タブレット表示） */}
          {selectedStore && (
            <div className="absolute top-4 right-4 z-[500] w-[340px] sm:w-[380px] max-w-[calc(100vw-32px)]">
              <StoreDetail
                store={selectedStore}
                brand={BRANDS[selectedStore.brandId]}
                onClose={() => setSelectedStore(null)}
              />
            </div>
          )}
        </div>
      </div>

      {/* モバイル用ナビゲーションバー（スマホのみ） */}
      <div className="md:hidden bg-white border-t border-slate-200 py-2 px-6 flex items-center justify-around z-30 shadow-lg">
        <button
          onClick={() => setMobileTab('map')}
          className={`flex flex-col items-center gap-1 text-xs font-bold ${
            mobileTab === 'map' ? 'text-emerald-600' : 'text-slate-400'
          }`}
        >
          <MapPin size={18} />
          地図を見る
        </button>
        <button
          onClick={() => setMobileTab('list')}
          className={`flex flex-col items-center gap-1 text-xs font-bold ${
            mobileTab === 'list' ? 'text-emerald-600' : 'text-slate-400'
          }`}
        >
          <List size={18} />
          店舗一覧 ({filteredStores.length})
        </button>
      </div>

      {/* 自動更新・基準についてのインフォメーションモーダル */}
      {showInfoModal && (
        <div className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
                <Sparkles size={18} className="text-emerald-600" />
                国産食材マップと月次更新の仕組み
              </h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                本マップは、<strong>国産の野菜やお肉を積極的に使用している国内チェーンレストラン</strong>を可視化し、食の安心・安全や地産地消を応援するためのWebマップです。
              </p>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-1.5">
                <p className="font-bold text-emerald-900 flex items-center gap-1">
                  <CheckCircle2 size={14} /> 掲載基準
                </p>
                <ul className="list-disc list-inside space-y-1 text-emerald-800">
                  <li><strong>リンガーハット</strong>: 野菜・小麦粉が100%国産</li>
                  <li><strong>餃子の王将</strong>: 餃子の主要具材（豚肉・野菜）が100%国産</li>
                  <li><strong>モスバーガー</strong>: 生野菜が契約農家の国産100%</li>
                  <li><strong>大戸屋</strong>: 国産野菜・チルド国産肉・無添加店内調理</li>
                  <li><strong>しゃぶ葉</strong>: 厳選国産牛・国産豚食べ放題コース提供</li>
                </ul>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                <p className="font-bold text-slate-900">🔄 1か月に1回の自動更新について</p>
                <p>
                  GitHub Actions（月次cronスケジュール）により、公式HPの産地情報ページやOpenStreetMapの店舗位置データを定期チェック。
                  新店舗や産地情報の差分を自動検知してVercelへ自動デプロイする運用に対応しています。
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
