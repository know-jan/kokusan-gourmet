// メインアプリケーションコンポーネント（産地国フィルタ・中国産排除・個人店登録対応）
import React, { useState, useMemo, useEffect } from 'react';
import { BRANDS, STORES_DATA } from './data/stores';
import { Store } from './types';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { StoreList } from './components/StoreList';
import { StoreDetail } from './components/StoreDetail';
import { Map } from './components/Map';
import { AddCustomStoreModal } from './components/AddCustomStoreModal';
import { MapPin, List, Info, Sparkles, ShieldCheck } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'kokusan_custom_stores_v1';

export const App: React.FC = () => {
  const [customStores, setCustomStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [excludeChina, setExcludeChina] = useState(false); // 初期表示は全店舗表示！スイッチONで中国産を排除
  const [require100PercentVeg, setRequire100PercentVeg] = useState(false);
  const [requireDomesticMeat, setRequireDomesticMeat] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [clickedMapCoords, setClickedMapCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );

  // 初回マウント時にLocalStorageから保存済み個人店を復元
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setCustomStores(JSON.parse(saved));
      }
    } catch (e) {
      console.error('個人店データの読み込みに失敗しました:', e);
    }
  }, []);

  // 個人店データが更新されたらLocalStorageに保存
  const saveCustomStores = (newStores: Store[]) => {
    setCustomStores(newStores);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newStores));
    } catch (e) {
      console.error('個人店データの保存に失敗しました:', e);
    }
  };

  // 個人店追加ハンドラ
  const handleAddStore = (newStore: Store) => {
    const updated = [newStore, ...customStores];
    saveCustomStores(updated);
    setSelectedStore(newStore);
  };

  // 個人店削除ハンドラ
  const handleDeleteCustomStore = (id: string) => {
    const updated = customStores.filter((s) => s.id !== id);
    saveCustomStores(updated);
    if (selectedStore?.id === id) {
      setSelectedStore(null);
    }
  };

  // 全店舗（マスタ＋個人店）
  const allStores = useMemo(() => {
    return [...customStores, ...STORES_DATA];
  }, [customStores]);

  // 富山県内の市町村リスト
  const cities = useMemo(() => {
    const citySet = new Set<string>();
    allStores.forEach((s) => {
      if (s.city) citySet.add(s.city);
    });
    return Array.from(citySet).sort();
  }, [allStores]);

  // フィルタリング処理
  const filteredStores = useMemo(() => {
    return allStores.filter((store) => {
      const brand = BRANDS[store.brandId];

      // 1. 中国産排除フィルタ（最優先！）
      if (excludeChina && store.containsChinaIngredients) {
        return false;
      }

      // 2. キーワード検索
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = store.name.toLowerCase().includes(q);
        const matchAddr = store.address.toLowerCase().includes(q);
        const matchBrand = store.brandName.toLowerCase().includes(q);
        const matchNotes = store.customNotes?.toLowerCase().includes(q);
        const matchSummary = brand?.commitmentSummary.toLowerCase().includes(q);
        if (!matchName && !matchAddr && !matchBrand && !matchNotes && !matchSummary) {
          return false;
        }
      }

      // 3. 市町村絞り込み
      if (selectedCity && store.city !== selectedCity) {
        return false;
      }

      // 4. 食材産出国指定（日本、欧州、豪州、北米等）
      if (selectedCountry && !store.countriesUsed.includes(selectedCountry as any)) {
        return false;
      }

      // 5. 野菜国産100%条件
      if (require100PercentVeg) {
        if (store.isCustom) {
          if (store.safetyRank !== 'domestic_pure') return false;
        } else if (!brand?.domesticHighlight.vegetable.is100PercentDomestic) {
          return false;
        }
      }

      // 6. お肉国産対応条件
      if (requireDomesticMeat) {
        if (store.isCustom) {
          if (!store.countriesUsed.includes('日本')) return false;
        } else if (!brand?.domesticHighlight.meat.isDomestic) {
          return false;
        }
      }

      return true;
    });
  }, [
    allStores,
    excludeChina,
    searchQuery,
    selectedCity,
    selectedCountry,
    require100PercentVeg,
    requireDomesticMeat,
  ]);

  // 地図クリックで個人店登録を開く
  const handleMapClick = (lat: number, lng: number) => {
    setClickedMapCoords({ lat, lng });
    setShowAddModal(true);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100">
      {/* ヘッダー */}
      <Header
        brands={BRANDS}
        activeBrandId=""
        onBrandClick={(brandId) => {
          if (brandId) {
            setSearchQuery(BRANDS[brandId]?.name || '');
          } else {
            setSearchQuery('');
          }
        }}
      />

      {/* メインエリア */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        {/* サイドバー（PC: 左側固定 / スマホ: タブ切り替え） */}
        <div
          className={`w-full md:w-[420px] lg:w-[460px] h-full flex flex-col bg-slate-50 border-r border-slate-200 z-20 transition-all ${
            mobileTab === 'list' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* 検索・絞り込みエリア */}
          <div className="p-3 sm:p-4 bg-white border-b border-slate-200 shadow-2xs">
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              excludeChina={excludeChina}
              onToggleExcludeChina={() => setExcludeChina(!excludeChina)}
              require100PercentVeg={require100PercentVeg}
              onToggle100PercentVeg={() => setRequire100PercentVeg(!require100PercentVeg)}
              requireDomesticMeat={requireDomesticMeat}
              onToggleDomesticMeat={() => setRequireDomesticMeat(!requireDomesticMeat)}
              selectedCountry={selectedCountry}
              onSelectCountry={setSelectedCountry}
              selectedCity={selectedCity}
              onSelectCity={setSelectedCity}
              cities={cities}
              totalCount={filteredStores.length}
              onOpenAddModal={() => {
                setClickedMapCoords(null);
                setShowAddModal(true);
              }}
            />
          </div>

          {/* 店舗一覧リスト */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
            <StoreList
              stores={filteredStores}
              brands={BRANDS}
              selectedStore={selectedStore}
              onSelectStore={(store) => {
                setSelectedStore(store);
                if (window.innerWidth < 768) {
                  setMobileTab('map');
                }
              }}
            />
          </div>

          {/* フッター情報 */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              掲載: {allStores.length}店（個人店: {customStores.length}店）
            </span>
            <button
              onClick={() => setShowInfoModal(true)}
              className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              <Info size={13} />
              産地基準・中国産判定について
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
            onSelectStore={(store) => setSelectedStore(store)}
            onMapClick={handleMapClick}
          />

          {/* 店舗詳細フローティングカード */}
          {selectedStore && (
            <div className="absolute top-4 right-4 z-[500] w-[340px] sm:w-[380px] max-w-[calc(100vw-32px)]">
              <StoreDetail
                store={selectedStore}
                brand={BRANDS[selectedStore.brandId]}
                onClose={() => setSelectedStore(null)}
                onDeleteCustomStore={handleDeleteCustomStore}
              />
            </div>
          )}
        </div>
      </div>

      {/* スマホ用タブ切り替えバー */}
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

      {/* 個人店手動登録モーダル */}
      {showAddModal && (
        <AddCustomStoreModal
          initialLat={clickedMapCoords?.lat}
          initialLng={clickedMapCoords?.lng}
          onClose={() => setShowAddModal(false)}
          onAddStore={handleAddStore}
        />
      )}

      {/* 基準説明モーダル */}
      {showInfoModal && (
        <div className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
                <Sparkles size={18} className="text-emerald-600" />
                食材の産地基準と中国産排除の仕組み
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
                本マップは、<strong>「中国産食材を避け、安全な国産・欧米豪産を選びたい」</strong>という消費者の声に応えるために設計されています。
              </p>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2">
                <p className="font-bold text-emerald-950 flex items-center gap-1">
                  <ShieldCheck size={15} /> 産地判定のランク基準
                </p>
                <ul className="space-y-1.5 text-emerald-900">
                  <li>
                    <span className="font-bold">🟢 純国産 (ランクS)</span>: 野菜・主要お肉・小麦粉が100%国産（リンガーハット、王将の餃子、KFCのチキン等）
                  </li>
                  <li>
                    <span className="font-bold">🔵 中国産不使用 (ランクA)</span>: 生野菜国産100%、肉は豪州・北米・欧州・国産を使用し、中国産野菜・加工肉を排除（モス、8番らーめん、サイゼリヤ等）
                  </li>
                  <li>
                    <span className="font-bold">⭐ 地元個人店</span>: 手動登録された地産地消・無農薬などのこだわり店
                  </li>
                  <li>
                    <span className="font-bold">⚪ 中国産食材あり</span>: 「中国産を排除」スイッチをONにすると地図から自動的に非表示になります。
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <p className="font-bold text-slate-800">💡 地図をクリックして個人店を追加できます</p>
                <p>
                  地図上の好きな場所をクリックするか、「個人店を登録」ボタンから、地元のお気に入り個人店をいつでも登録・保存できます。
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
