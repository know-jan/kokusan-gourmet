// 富山県の一般飲食店（個人店・ローカル店含む）を一括取得するスクリプト
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 富山県主要エリアのバウンディングボックス
const BBOX = '36.35,136.85,36.95,137.45';

const OVERPASS_QUERY = `
[out:json][timeout:60];
(
  node["amenity"~"restaurant|cafe|fast_food|pub"](${BBOX});
);
out 1500;
`.trim();

function fetchOverpass(query) {
  return new Promise((resolve, reject) => {
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    https
      .get(url, { headers: { 'User-Agent': 'KokusanMapGeneralRestaurants/1.0' } }, (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Overpass HTTP ${res.statusCode}`));
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
  console.log('=== 富山県内の一般飲食店（個人店含む）取得開始 ===');
  const osmData = await fetchOverpass(OVERPASS_QUERY);
  const elements = osmData.elements || [];
  console.log(`取得された飲食店の要素数: ${elements.length} 件`);

  const places = [];
  for (const el of elements) {
    const tags = el.tags || {};
    const name = tags.name || tags['name:ja'] || '';
    if (!name) continue; // 名前がないノードはスキップ

    places.push({
      id: `poi-${el.id}`,
      name,
      lat: Number(el.lat.toFixed(6)),
      lng: Number(el.lon.toFixed(6)),
      cuisine: tags.cuisine || tags.amenity || '飲食店',
      city: tags['addr:city'] || '',
      address: tags['addr:full'] || tags['addr:street'] || '',
    });
  }

  console.log(`名前のある実店舗: ${places.length} 件`);
  const outPath = path.resolve(__dirname, '../src/data/general-restaurants.json');
  fs.writeFileSync(outPath, JSON.stringify(places, null, 2), 'utf-8');
  console.log(`保存完了: ${outPath}`);
}

main().catch(console.error);
