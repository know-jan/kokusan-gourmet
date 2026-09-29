// OpenStreetMap (Overpass API) から富山県内の対象チェーン店舗を一括自動取得するスクリプト（強化版）
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 富山県のバウンディングボックス (南, 西, 北, 東)
const BBOX = '36.20,136.70,37.05,137.80';

// 検索対象のチェーンブランド名（日本語・英語・ブランドタグ対応）
const BRAND_REGEX =
  'ジョイフル|Joyfull|サイゼリヤ|Saizeriya|ガスト|Gusto|ココス|COCO|８番|8番|Hachiban|王将|Ohsho|リンガーハット|Ringer|ケンタッキー|KFC|モスバーガー|MOS|大戸屋|Ootoya|松屋|Matsuya|しゃぶ葉|丸亀製麺|Marugame|すき家|Sukiya|吉野家|Yoshinoya|スシロー|Sushiro|くら寿司|Kura|やよい軒|Yayoi|バーミヤン|Bamiyan';

// Overpass QL クエリ（nameタグ または brandタグでヒットさせる）
const OVERPASS_QUERY = `
[out:json][timeout:60];
(
  node["name"~"${BRAND_REGEX}",i](${BBOX});
  way["name"~"${BRAND_REGEX}",i](${BBOX});
  node["brand"~"${BRAND_REGEX}",i](${BBOX});
  way["brand"~"${BRAND_REGEX}",i](${BBOX});
);
out center;
`.trim();

// 店名・ブランド名からブランドIDを判定
function detectBrandId(name, brandTag) {
  const target = `${name || ''} ${brandTag || ''}`;
  if (/ジョイフル|Joyfull/i.test(target)) return 'joyfull';
  if (/サイゼリヤ|Saizeriya/i.test(target)) return 'saizeriya';
  if (/ガスト|Gusto/i.test(target)) return 'gusto';
  if (/ココス|COCO/i.test(target)) return 'cocos';
  if (/８番|8番|Hachiban/i.test(target)) return 'hachiban';
  if (/餃子の王将|王将|Ohsho/i.test(target)) return 'gyoza-no-ohsho';
  if (/リンガーハット|Ringer/i.test(target)) return 'ringerhut';
  if (/ケンタッキー|KFC/i.test(target)) return 'kfc';
  if (/モスバーガー|MOS\s*Burger/i.test(target)) return 'mos-burger';
  if (/大戸屋|Ootoya/i.test(target)) return 'ootoya';
  if (/松屋|Matsuya/i.test(target)) return 'matsuya';
  if (/しゃぶ葉|Syabuyo|Shabuyo/i.test(target)) return 'syabuyo';
  if (/丸亀製麺|Marugame/i.test(target)) return 'marugame';
  if (/すき家|Sukiya/i.test(target)) return 'sukiya';
  if (/吉野家|Yoshinoya/i.test(target)) return 'yoshinoya';
  if (/スシロー|Sushiro/i.test(target)) return 'sushiro';
  if (/くら寿司|Kura/i.test(target)) return 'kurasushi';
  if (/やよい軒|Yayoi/i.test(target)) return 'yayoiken';
  if (/バーミヤン|Bamiyan/i.test(target)) return 'bamiyan';
  return null;
}

// ブランドIDごとの標準表示名
const BRAND_NAMES = {
  joyfull: 'ジョイフル',
  saizeriya: 'サイゼリヤ',
  gusto: 'ガスト',
  cocos: 'ココス',
  hachiban: '8番らーめん',
  'gyoza-no-ohsho': '餃子の王将',
  ringerhut: 'リンガーハット',
  kfc: 'ケンタッキーフライドチキン',
  'mos-burger': 'モスバーガー',
  ootoya: '大戸屋 ごはん処',
  matsuya: '松屋',
  syabuyo: 'しゃぶ葉',
  marugame: '丸亀製麺',
  sukiya: 'すき家',
  yoshinoya: '吉野家',
  sushiro: 'スシロー',
  kurasushi: 'くら寿司',
  yayoiken: 'やよい軒',
  bamiyan: 'バーミヤン',
};

// 座標から富山県内の市町村を推測
function guessCity(lat, lng, addr) {
  if (addr) {
    const match = addr.match(/(富山市|高岡市|射水市|氷見市|砺波市|魚津市|黒部市|滑川市|南砺市|小矢部市)/);
    if (match) return match[1];
  }
  if (lng < 137.05) {
    if (lat > 36.8) return '氷見市';
    if (lat < 36.65) return '砺波市';
    return '高岡市';
  } else if (lng < 137.15) {
    return '射水市';
  } else if (lng < 137.33) {
    return '富山市';
  } else {
    return '魚津市';
  }
}

function fetchOverpass(query) {
  return new Promise((resolve, reject) => {
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    https
      .get(url, { headers: { 'User-Agent': 'KokusanRestaurantMap/2.0' } }, (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Overpass API responded with HTTP ${res.statusCode}`));
        }
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

async function main() {
  console.log('=== 富山県内チェーン店舗 Overpass API一括自動取得開始 (強化版) ===');

  const osmData = await fetchOverpass(OVERPASS_QUERY);
  const elements = osmData.elements || [];
  console.log(`OpenStreetMapから取得した生の要素数: ${elements.length} 件`);

  const stores = [];
  const seenCoords = new Set();

  for (const el of elements) {
    const tags = el.tags || {};
    const name = tags.name || tags['name:ja'] || tags['name:en'] || '';
    const brandTag = tags.brand || tags['brand:ja'] || tags['brand:en'] || '';
    const brandId = detectBrandId(name, brandTag);
    if (!brandId) continue;

    const lat = el.lat || el.center?.lat;
    const lng = el.lon || el.center?.lon;
    if (!lat || !lng) continue;

    // 重複除外キー (おおむね50m以内)
    const coordKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
    if (seenCoords.has(coordKey)) continue;
    seenCoords.add(coordKey);

    const addr = tags['addr:full'] || tags['addr:street'] || tags['addr:city'] || '';
    const city = guessCity(lat, lng, addr);
    const fullAddress = addr.includes('富山県') ? addr : `富山県${city}${addr ? ' ' + addr : ''}`;

    // 店名の正規化（例: "Joyfull" ➔ "ジョイフル" 等）
    let formattedName = name;
    const defaultBrandName = BRAND_NAMES[brandId];
    if (!formattedName || formattedName.toLowerCase() === defaultBrandName.toLowerCase()) {
      formattedName = `${defaultBrandName} (${city})`;
    }

    stores.push({
      id: `osm-${el.type}-${el.id}`,
      brandId,
      brandName: defaultBrandName,
      name: formattedName,
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      city,
      address: fullAddress,
      phone: tags.phone || undefined,
      openingHours: tags.opening_hours || undefined,
    });
  }

  console.log(`抽出＆重複除外完了: ${stores.length} 店舗の富山県内実店舗を検出！`);

  // ブランドごとの集計表示
  const brandCount = {};
  for (const s of stores) {
    brandCount[s.brandName] = (brandCount[s.brandName] || 0) + 1;
  }
  console.log('\n--- 検出されたチェーン別店舗数 ---');
  for (const [bName, count] of Object.entries(brandCount)) {
    console.log(`  - ${bName}: ${count} 店舗`);
  }

  const outPath = path.resolve(__dirname, '../src/data/osm-stores.json');
  fs.writeFileSync(outPath, JSON.stringify(stores, null, 2), 'utf-8');
  console.log(`\n自動取得データを保存しました: ${outPath}`);
}

main().catch((err) => {
  console.error('取得エラー:', err);
  process.exit(1);
});
