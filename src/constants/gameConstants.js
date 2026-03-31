export const EMPTY_RESOURCES = { bugday: 0, demir: 0, petrol: 0, para: 0, nig: 0 }

export const BOTTOM_BAR_ITEMS = [
  { icon: '🌾', label: 'Buğday', key: 'bugday' },
  { icon: '⚙️', label: 'Demir', key: 'demir' },
  { icon: '🛢️', label: 'Petrol', key: 'petrol' },
  { icon: '💰', label: 'Para', key: 'para' },
  { icon: '👤', label: 'NİG', key: 'nig' },
]

export const UNIT_TYPES = {
  infantry: { label: 'Piyade Yerleştir', icon: '⚔', cost: { bugday: 10, para: 5 } },
  artillery: { label: 'Topçu Yerleştir', icon: '💣', cost: { demir: 15, para: 10 } },
  cavalry: { label: 'Süvari Yerleştir', icon: '🐴', cost: { bugday: 8, para: 8 } },
}

export const RES_LABELS = { bugday: 'Buğday', demir: 'Demir', petrol: 'Petrol', para: 'Para', nig: 'NİG' }

export const PLAYABLE_COUNTRIES = [
  'Osmanlı İmparatorluğu',
  'Alman İmparatorluğu',
  'Çarlık Rusyası',
  'Avusturya-Macaristan',
  'Büyük Britanya İmparatorluğu',
  'Fransa Cumhuriyeti',
  'İtalya Krallığı',
  'Japon İmparatorluğu',
  'Amerika Birleşik Devletleri',
  'Sırbistan Krallığı',
  'Romanya Krallığı',
  'Bulgaristan Çarlığı',
]

export const WAR_TACTIC_SECONDS = 60

export const NEWSPAPER_NAME = 'The World Dispatch'
