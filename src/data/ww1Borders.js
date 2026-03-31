const WW1_BORDERS_URL =
  'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_1914.geojson'

export async function fetchWW1Borders() {
  const res = await fetch(WW1_BORDERS_URL)
  if (!res.ok) throw new Error(`world_1914 GeoJSON: HTTP ${res.status}`)
  return await res.json()
}
