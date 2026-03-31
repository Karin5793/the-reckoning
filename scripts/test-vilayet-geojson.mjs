/**
 * Vilayet / 1880 haritası GeoJSON testi — mevcut uygulamayı değiştirmez.
 * Çalıştır: node scripts/test-vilayet-geojson.mjs
 */
const url =
  'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_1880.geojson';

const res = await fetch(url);
if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

const geo = await res.json();
const features = Array.isArray(geo.features) ? geo.features : [];

console.log('Feature sayısı:', features.length);
console.log('İlk 5 feature name:');
for (let i = 0; i < Math.min(5, features.length); i++) {
  const p = features[i].properties || {};
  const name = p.NAME ?? p.name ?? '(name yok)';
  console.log(`  [${i}]`, name);
}
