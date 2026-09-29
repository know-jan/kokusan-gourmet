// 個人店手動登録モーダルコンポーネント（逆ジオコーディング・ワンタップアシスト対応）
import React, { useState, useEffect } from 'react';
import { Store, SafetyRank, OriginCountry } from '../types';
import { X, Store as StoreIcon, MapPin, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';

interface AddCustomStoreModalProps {
  initialLat?: number;
  initialLng?: number;
  onClose: () => void;
  onAddStore: (store: Store) => void;
}

export const AddCustomStoreModal: React.FC<AddCustomStoreModalProps> = ({
  initialLat = 36.6953,
  initialLng = 137.2113,
  onClose,
  onAddStore,
}) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('富山市');
  const [address, setAddress] = useState('富山県富山市');
  const [genre, setGenre] = useState('和食・定食');
  const [excludeChina, setExcludeChina] = useState(true); // 中国産不使用か
  const [vegDomestic100, setVegDomestic100] = useState(true); // 野菜100%国産か
  const [meatOrigin, setMeatOrigin] = useState<'国産' | '欧米豪' | 'その他'>('国産');
  const [riceOrigin, setRiceOrigin] = useState('富山県産コシヒカリ100%');
  const [customNotes, setCustomNotes] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const lat = initialLat;
  const lng = initialLng;

  // 地図クリック地点の住所・店名を自動取得（Nominatim逆ジオコーディング）
  useEffect(() => {
    if (!initialLat || !initialLng) return;

    let isMounted = true;
    setIsLoadingAddress(true);

    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${initialLat}&lon=${initialLng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'ja',
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted || !data) return;

        // 住所情報の抽出
        if (data.display_name) {
          const rawAddr = data.display_name;
          // 日本語形式に整形
          const cleanAddr = rawAddr
            .replace(/, 日本$/, '')
            .replace(/〒\d{3}-\d{4}\s*/, '');
          setAddress(cleanAddr);
        }

        // 市町村の自動選択
        const addrObj = data.address || {};
        const detectedCity = addrObj.city || addrObj.town || addrObj.village || addrObj.county || '';
        if (detectedCity.includes('高岡')) setCity('高岡市');
        else if (detectedCity.includes('射水')) setCity('射水市');
        else if (detectedCity.includes('氷見')) setCity('氷見市');
        else if (detectedCity.includes('砺波')) setCity('砺波市');
        else if (detectedCity.includes('魚津')) setCity('魚津市');
        else if (detectedCity.includes('黒部')) setCity('黒部市');
        else if (detectedCity.includes('南砺')) setCity('南砺市');
        else setCity('富山市');

        // もし飲食店名（POI）が存在すれば店名に自動セット
        if (data.name && !name) {
          setName(data.name);
        }
      })
      .catch((err) => {
        console.warn('住所自動取得をスキップ:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingAddress(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialLat, initialLng]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const countries: OriginCountry[] = ['日本'];
    if (meatOrigin === '欧米豪') countries.push('オーストラリア・NZ');
    if (!excludeChina) countries.push('中国');

    let rank: SafetyRank = 'custom_local';
    if (!excludeChina) {
      rank = 'china_included';
    } else if (vegDomestic100 && meatOrigin === '国産') {
      rank = 'domestic_pure';
    } else {
      rank = 'no_china_safe';
    }

    const newStore: Store = {
      id: `custom-${Date.now()}`,
      brandId: 'custom-local',
      brandName: genre,
      name: name.trim(),
      prefecture: '富山県',
      city,
      address,
      lat,
      lng,
      safetyRank: rank,
      containsChinaIngredients: !excludeChina,
      countriesUsed: countries,
      isCustom: true,
      customNotes: `【こだわり】${customNotes || '地産地消・安心食材にこだわる個人店'} (お米: ${riceOrigin})`,
      googleMapsUrl: googleMapsUrl.trim() || undefined,
    };

    onAddStore(newStore);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
              <StoreIcon size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
                こだわり店舗を手動登録
                {isLoadingAddress && (
                  <span className="text-[10px] text-emerald-600 font-normal flex items-center gap-0.5">
                    <Loader2 size={11} className="animate-spin" /> 住所自動検出中...
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                地図クリック地点の住所・店名が自動入力されます
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={18} />
          </button>
        </div>

        {/* 登録フォーム */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
          {/* 店名 */}
          <div>
            <label className="block font-bold mb-1 text-slate-800">
              店舗名 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 自然食レストラン 越中、ビストロ〇〇"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* ジャンル＆市町村 */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold mb-1 text-slate-800">ジャンル</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
              >
                <option value="和食・定食">和食・定食</option>
                <option value="ラーメン">ラーメン</option>
                <option value="カフェ・自然食">カフェ・自然食</option>
                <option value="洋食・イタリアン">洋食・イタリアン</option>
                <option value="焼肉・肉料理">焼肉・肉料理</option>
                <option value="居酒屋・地酒">居酒屋・地酒</option>
                <option value="その他">その他</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1 text-slate-800">市町村</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
              >
                <option value="富山市">富山市</option>
                <option value="高岡市">高岡市</option>
                <option value="射水市">射水市</option>
                <option value="氷見市">氷見市</option>
                <option value="砺波市">砺波市</option>
                <option value="魚津市">魚津市</option>
                <option value="黒部市">黒部市</option>
                <option value="南砺市">南砺市</option>
                <option value="滑川市">滑川市</option>
                <option value="小矢部市">小矢部市</option>
              </select>
            </div>
          </div>

          {/* 住所（自動補完） */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-800">住所</label>
              <span className="text-[10px] text-emerald-700 flex items-center gap-0.5">
                <Sparkles size={10} /> クリック地点から自動補完
              </span>
            </div>
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="富山県富山市..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* 産地・安全ステータス */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-600" />
              食材の産地・安全こだわり設定
            </h4>

            {/* 中国産排除トグル */}
            <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl">
              <div>
                <span className="font-bold text-slate-800">🇨🇳 中国産食材の不使用</span>
                <p className="text-[11px] text-slate-400">主要メニューに中国産野菜・加工肉を使わない</p>
              </div>
              <button
                type="button"
                onClick={() => setExcludeChina(!excludeChina)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                  excludeChina ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {excludeChina ? '完全不使用 (安心)' : '一部あり / 不明'}
              </button>
            </div>

            {/* 野菜の産地 */}
            <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl">
              <div>
                <span className="font-bold text-slate-800">🥗 野菜の産地</span>
                <p className="text-[11px] text-slate-400">富山県産または国産野菜</p>
              </div>
              <button
                type="button"
                onClick={() => setVegDomestic100(!vegDomestic100)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                  vegDomestic100 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {vegDomestic100 ? '国産100%' : '国産メイン'}
              </button>
            </div>

            {/* お肉の産地 */}
            <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl">
              <div>
                <span className="font-bold text-slate-800">🥩 お肉の産地</span>
              </div>
              <div className="flex gap-1">
                {(['国産', '欧米豪', 'その他'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setMeatOrigin(opt)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                      meatOrigin === opt
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* お米 */}
            <div>
              <label className="block font-medium mb-1 text-slate-700">お米・主食の産地</label>
              <input
                type="text"
                value={riceOrigin}
                onChange={(e) => setRiceOrigin(e.target.value)}
                placeholder="例: 富山県産コシヒカリ100%、富山県産ハトムギ"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* こだわりメモ */}
          <div>
            <label className="block font-bold mb-1 text-slate-800">こだわり詳細・メモ</label>
            <textarea
              rows={2}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="例: 店主の実家の農家から無農薬野菜を直送。氷見牛指定店。化学調味料無添加。"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          {/* Googleマップリンク */}
          <div>
            <label className="block font-bold mb-1 text-slate-800">
              Googleマップ共有リンク（任意）
            </label>
            <input
              type="url"
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              placeholder="Googleマップの共有URLをペースト（口コミ・写真に飛べます）"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          {/* 送信ボタン */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-200 transition-colors"
            >
              この店舗を登録する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
