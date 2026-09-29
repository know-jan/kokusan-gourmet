// 国産食材こだわりチェーン レストランマップ 型定義ファイル

// 食材の国産対応レベル
export type DomesticHighlight = {
  // 野菜の国産状況
  vegetable: {
    is100Percent: boolean;
    description: string;
  };
  // お肉の国産状況
  meat: {
    available: boolean;
    description: string;
  };
  // その他食材（米・小麦粉など）
  others?: string;
};

// チェーン（ブランド）マスタ情報
export interface ChainBrand {
  id: string;
  name: string;
  genre: 'ちゃんぽん・麺類' | '中華・餃子' | 'ハンバーガー' | '和食・定食' | '鍋・しゃぶしゃぶ' | '洋食・ファミレス';
  color: string; // ピンやバッジのテーマカラー
  iconText: string; // ピンに表示する短縮名（例: "王将", "リンガー", "モス"）
  commitmentSummary: string; // 国産へのこだわり要約
  domesticHighlight: DomesticHighlight;
  officialSourceUrl: string; // 公式HPの産地情報ページURL（自動更新用）
  officialSiteUrl: string; // 公式サイトURL
}

// 個別店舗データ
export interface Store {
  id: string;
  brandId: string;
  brandName: string;
  name: string; // 例: "餃子の王将 富山店"
  prefecture: string; // 例: "富山県"
  city: string; // 例: "富山市"
  address: string; // 例: "富山県富山市中川原309-1"
  lat: number; // 緯度
  lng: number; // 経度
  phone?: string;
  openingHours?: string;
  hasParking?: boolean;
  takeoutAvailable?: boolean;
}
