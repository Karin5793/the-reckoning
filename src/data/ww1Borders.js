const WW1_BORDERS_URL =
  'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_1914.geojson'

const WW1_BORDERS_FALLBACK_URL =
  'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_1880.geojson'

export async function fetchWW1Borders() {
  try {
    const res = await fetch(WW1_BORDERS_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('1914 sınırları yüklenemedi, 1880 yedek verisi deneniyor:', err)
    const res = await fetch(WW1_BORDERS_FALLBACK_URL)
    if (!res.ok) throw new Error(`Yedek URL de başarısız: HTTP ${res.status}`)
    return await res.json()
  }
}
