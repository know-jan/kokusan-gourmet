// 国産食材・産地こだわりレストランマップ 型定義ファイル

// 産地の安全性ランク区分
export type SafetyRank =
  | 'domestic_pure' // 🟢 純国産（野菜・主要食材100%国産）
  | 'no_china_safe' // 🔵 中国産不使用（国産＋欧米豪産メイン、安心素材）
  | 'custom_local'  // 🟠 個人店（手動登録・地産地消）
  | 'mixed_selective' // 🟡 一部外国産・メニューにより選択可能
  | 'china_included'; // ⚪ 中国産食材あり（主要メニューに中国産野菜・加工肉等を含む）

// 食材の産出国
export type OriginCountry =
  | '日本'
  | '中国'
  | 'オーストラリア・NZ'
  | 'アメリカ・カナダ'
  | '欧州'
  | 'その他';

// 食材の国産・産地対応状況
export type DomesticHighlight = {
  // 野菜の産地
  vegetable: {
    is100PercentDomestic: boolean;
    containsChina: boolean;
    description: string;
    countries: OriginCountry[];
  };
  // お肉の産地
  meat: {
    isDomestic: boolean;
    containsChina: boolean;
    description: string;
    countries: OriginCountry[];
  };
  // 主食（米・小麦等）や調味料
  others?: {
    description: string;
    countries?: OriginCountry[];
  };
};

// チェーン（ブランド）マスタ情報
export interface ChainBrand {
  id: string;
  name: string;
  genre: string;
  safetyRank: SafetyRank;
  containsChinaIngredients: boolean; // 主要メニューに中国産食材が含まれているか
  countriesUsed: OriginCountry[]; // 主に使用されている国
  color: string; // テーマカラー
  iconText: string;
  commitmentSummary: string;
  domesticHighlight: DomesticHighlight;
  officialSourceUrl?: string; // 公式HPの産地情報ページ
  officialSiteUrl?: string;
}

// 店舗データ（チェーン店および個人店）
export interface Store {
  id: string;
  brandId: string;
  brandName: string;
  name: string;
  prefecture: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  openingHours?: string;
  hasParking?: boolean;
  takeoutAvailable?: boolean;
  safetyRank: SafetyRank;
  containsChinaIngredients: boolean;
  countriesUsed: OriginCountry[];
  isCustom?: boolean; // ユーザーが手動登録した個人店か
  customNotes?: string; // 個人店のこだわりメモ
  googleMapsUrl?: string; // Googleマップリンク
}
