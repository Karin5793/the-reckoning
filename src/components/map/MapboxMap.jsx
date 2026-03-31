import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MAPBOX_TOKEN, MAPBOX_STYLE } from '../../constants/mapConstants'
import { resolveCountryName } from '../../constants/ww1Names'
import CITIES from '../../data/cities'

const GEOJSON_URL = 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_1900.geojson'

export function updateMilitaryLabels(map, military) {
  if (!map || !military || !map.isStyleLoaded()) return
  const features = Object.entries(military)
    .map(([cityId, units]) => {
      const city = CITIES.find((c) => c.id === cityId)
      if (!city) return null
      const total = (units.piyade || 0) + (units.topcu || 0) + (units.suvari || 0)
      if (total === 0) return null
      return {
        type: 'Feature',
        properties: {
          id: cityId,
          militaryText: `⚔${units.piyade || 0} 💣${units.topcu || 0} 🐴${units.suvari || 0}`,
        },
        geometry: { type: 'Point', coordinates: [city.lng, city.lat] },
      }
    })
    .filter(Boolean)

  const collection = { type: 'FeatureCollection', features }

  try {
    if (map.getSource('military-labels')) {
      map.getSource('military-labels').setData(collection)
    } else {
      map.addSource('military-labels', {
        type: 'geojson',
        data: collection,
      })
      map.addLayer({
        id: 'military-label',
        type: 'symbol',
        source: 'military-labels',
        layout: {
          'text-field': ['get', 'militaryText'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 11,
          'text-offset': [0, -1.8],
          'text-anchor': 'bottom',
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': '#ffdd88',
          'text-halo-color': '#1a0800',
          'text-halo-width': 1.5,
        },
      })
    }
  } catch {
    /* stil henüz hazır olmayabilir */
  }
}

export default function MapboxMap({
  player,
  onCountrySelect,
  onCityClick,
  onMapClick,
  onRightClick,
  military,
}) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const [mapLayersReady, setMapLayersReady] = useState(false)
  const onCityClickRef = useRef(onCityClick)
  const onMapClickRef = useRef(onMapClick)
  const onRightClickRef = useRef(onRightClick)
  useLayoutEffect(() => {
    onCityClickRef.current = onCityClick
  }, [onCityClick])
  useLayoutEffect(() => {
    onMapClickRef.current = onMapClick
  }, [onMapClick])
  useLayoutEffect(() => {
    onRightClickRef.current = onRightClick
  }, [onRightClick])

  useEffect(() => {
    if (!player) return
    if (mapRef.current) return
    setMapLayersReady(false)

    mapboxgl.accessToken = MAPBOX_TOKEN

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAPBOX_STYLE,
      center: [20, 45],
      zoom: 3,
      projection: 'globe',
    })

    mapRef.current = map

    map.on('load', () => {
      // Tüm modern label ve sınırları gizle
      map.getStyle().layers.forEach((layer) => {
        if (
          layer.type === 'symbol' ||
          layer.id.includes('label') ||
          layer.id.includes('boundary') ||
          layer.id.includes('admin')
        ) {
          try {
            map.setLayoutProperty(layer.id, 'visibility', 'none')
          } catch {
            /* visibility / layout desteklenmeyebilir */
          }
        }
      })

      // GeoJSON yükle
      fetch(GEOJSON_URL)
        .then((r) => r.json())
        .then((data) => {
          map.addSource('historical', {
            type: 'geojson',
            data: data,
            promoteId: 'NAME',
          })

          map.addLayer({
            id: 'historical-fill',
            type: 'fill',
            source: 'historical',
            paint: {
              'fill-color': '#8b7355',
              'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'selected'], false],
                0.85,
                0.55,
              ],
            },
          })

          map.addLayer({
            id: 'historical-line',
            type: 'line',
            source: 'historical',
            paint: {
              'line-color': '#2c1810',
              'line-width': 1.5,
            },
          })

          map.addSource('cities', {
            type: 'geojson',
            promoteId: 'id',
            data: {
              type: 'FeatureCollection',
              features: CITIES.map((c) => ({
                type: 'Feature',
                properties: { ...c },
                geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
              })),
            },
          })

          map.addLayer({
            id: 'cities-circle',
            type: 'circle',
            source: 'cities',
            paint: {
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                3,
                5,
                6,
                7,
                10,
                10,
                14,
                14,
              ],
              'circle-color': '#f5e6c8',
              'circle-stroke-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                3,
                1.5,
                6,
                2,
                10,
                2.5,
              ],
              'circle-stroke-color': '#3d2b1a',
            },
          })

          map.addLayer({
            id: 'cities-label',
            type: 'symbol',
            source: 'cities',
            layout: {
              'text-field': ['get', 'name'],
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                3,
                0,
                4,
                10,
                6,
                12,
                10,
                15,
                14,
                18,
              ],
              'text-offset': [0, 1.2],
              'text-anchor': 'top',
              'text-allow-overlap': false,
              'text-optional': true,
            },
            paint: {
              'text-color': '#f5e6c8',
              'text-halo-color': '#1a0f00',
              'text-halo-width': 1.5,
            },
          })

          map.on('click', 'cities-circle', (e) => {
            const props = e.features?.[0]?.properties
            if (!props) return
            const pid = props.id != null ? String(props.id) : ''
            const city = CITIES.find((c) => c.id === pid)
            if (!city) return
            const fn = onCityClickRef.current
            fn && fn(city)
          })

          map.on('mouseenter', 'cities-circle', () => {
            map.getCanvas().style.cursor = 'pointer'
          })
          map.on('mouseleave', 'cities-circle', () => {
            map.getCanvas().style.cursor = ''
          })

          map.on('click', (e) => {
            const cityFeats = map.queryRenderedFeatures(e.point, { layers: ['cities-circle'] })
            if (cityFeats.length > 0) return
            const landFeats = map.queryRenderedFeatures(e.point, { layers: ['historical-fill'] })
            if (landFeats.length > 0) return
            const { lng, lat } = e.lngLat
            const fn = onMapClickRef.current
            fn && fn({ lng, lat })
          })

          map.on('contextmenu', (e) => {
            e.preventDefault()
            e.originalEvent?.preventDefault?.()
            const { lng, lat } = e.lngLat
            const cityFeatures = map.queryRenderedFeatures(e.point, { layers: ['cities-circle'] })
            let targetName = null
            let targetId = null
            if (cityFeatures.length > 0) {
              const props = cityFeatures[0].properties
              targetName = props?.name != null ? String(props.name) : null
              targetId = props?.id != null ? String(props.id) : null
            }
            const fn = onRightClickRef.current
            fn &&
              fn({
                x: e.originalEvent.clientX,
                y: e.originalEvent.clientY,
                lng,
                lat,
                targetName,
                targetId,
              })
          })

          let selectedId = null

          map.on('click', 'historical-fill', (e) => {
            const feature = e.features?.[0]
            if (!feature) return

            if (selectedId !== null) {
              map.setFeatureState({ source: 'historical', id: selectedId }, { selected: false })
            }

            selectedId = feature.id
            map.setFeatureState({ source: 'historical', id: selectedId }, { selected: true })

            const rawName =
              feature.properties?.NAME || feature.properties?.name || 'Bilinmiyor'
            const ww1Name = resolveCountryName(rawName)
            onCountrySelect && onCountrySelect(ww1Name)
          })

          map.on('mouseenter', 'historical-fill', () => {
            map.getCanvas().style.cursor = 'pointer'
          })
          map.on('mouseleave', 'historical-fill', () => {
            map.getCanvas().style.cursor = ''
          })

          setMapLayersReady(true)
          console.log('Harita hazır! Feature sayısı:', data.features.length)
        })
        .catch((err) => console.error('GeoJSON yüklenemedi:', err))
    })

    return () => {
      map.remove()
      mapRef.current = null
      setMapLayersReady(false)
    }
  }, [player])

  useEffect(() => {
    if (!mapLayersReady || !mapRef.current) return
    updateMilitaryLabels(mapRef.current, military)
  }, [military, mapLayersReady])

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
}
