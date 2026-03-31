import { SOURCE_WW1 } from '../constants/mapConstants'
import { resolveCountryName } from '../constants/ww1Names'

export function processGeoForMap(geo) {
  if (!geo?.features) return null
  return {
    type: 'FeatureCollection',
    features: geo.features.map((f, i) => ({
      ...f,
      properties: {
        ...f.properties,
        featureId: i,
        ww1Name: resolveCountryName(f.properties?.NAME || f.properties?.name || ''),
      },
    })),
  }
}

export function syncTerritoryFeatureStates(map, processed, playersRec, territoriesRec, myCountry) {
  if (!map?.getSource?.(SOURCE_WW1) || !processed?.features) return
  for (const f of processed.features) {
    const id = f.properties.featureId
    const ww1 = f.properties.ww1Name
    const ctrl = territoryController(ww1, playersRec, territoriesRec)
    let t = 'neutral'
    if (ctrl && myCountry && ctrl === myCountry) t = 'mine'
    else if (ctrl) t = 'other'
    map.setFeatureState({ source: SOURCE_WW1, id }, { territory: t })
  }
}

export function isOwnTerritory(countryKey, myCountry) {
  if (!myCountry || !countryKey) return false
  if (countryKey === myCountry) return true
  return countryKey.startsWith(myCountry + ' (')
}

export function empireAtTerritory(ww1Name, playersRecord) {
  const sorted = Object.values(playersRecord)
    .filter((p) => p?.country)
    .sort((a, b) => b.country.length - a.country.length)
  for (const p of sorted) {
    if (ww1Name === p.country || ww1Name.startsWith(p.country + ' (')) return p.country
  }
  return null
}

export function effectiveEmpireWithConquests(baseEmpire, conquests) {
  if (!baseEmpire || !conquests || typeof conquests !== 'object') return baseEmpire
  let e = baseEmpire
  const seen = new Set()
  while (conquests[e] != null && conquests[e] !== '') {
    if (seen.has(e)) break
    seen.add(e)
    e = conquests[e]
  }
  return e
}

/** Harita bölgesinin efektif sahibi (fetihler: territories[eskiSahip] = yeniSahip) */
export function territoryController(ww1Name, playersRecord, conquests) {
  const base = empireAtTerritory(ww1Name, playersRecord)
  if (!base) return null
  return effectiveEmpireWithConquests(base, conquests || {})
}

export function collectOwnUnits(units, myCountry) {
  const totals = { infantry: 0, artillery: 0, cavalry: 0 }
  Object.entries(units || {}).forEach(([region, u]) => {
    if (!u || typeof u !== 'object') return
    if (!isOwnTerritory(region, myCountry)) return
    totals.infantry += u.infantry || 0
    totals.artillery += u.artillery || 0
    totals.cavalry += u.cavalry || 0
  })
  return totals
}
