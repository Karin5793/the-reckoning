const CITIES = [
  // Osmanlı
  { id: 'istanbul', name: 'İstanbul', empire: 'Osmanlı İmparatorluğu', lng: 28.97, lat: 41.01, resources: { bugday: 8, demir: 6, petrol: 1, para: 15, nig: 12 } },
  { id: 'ankara', name: 'Ankara', empire: 'Osmanlı İmparatorluğu', lng: 32.86, lat: 39.93, resources: { bugday: 7, demir: 5, petrol: 0, para: 6, nig: 6 } },
  { id: 'izmir', name: 'İzmir', empire: 'Osmanlı İmparatorluğu', lng: 27.14, lat: 38.42, resources: { bugday: 6, demir: 4, petrol: 0, para: 9, nig: 7 } },
  { id: 'bursa', name: 'Bursa', empire: 'Osmanlı İmparatorluğu', lng: 29.06, lat: 40.18, resources: { bugday: 8, demir: 5, petrol: 0, para: 7, nig: 6 } },
  { id: 'edirne', name: 'Edirne', empire: 'Osmanlı İmparatorluğu', lng: 26.56, lat: 41.67, resources: { bugday: 7, demir: 3, petrol: 0, para: 5, nig: 5 } },
  { id: 'trabzon', name: 'Trabzon', empire: 'Osmanlı İmparatorluğu', lng: 39.73, lat: 41.0, resources: { bugday: 5, demir: 4, petrol: 0, para: 5, nig: 4 } },
  { id: 'erzurum', name: 'Erzurum', empire: 'Osmanlı İmparatorluğu', lng: 41.27, lat: 39.9, resources: { bugday: 4, demir: 5, petrol: 2, para: 3, nig: 4 } },
  { id: 'diyarbakir', name: 'Diyarbakır', empire: 'Osmanlı İmparatorluğu', lng: 40.23, lat: 37.91, resources: { bugday: 5, demir: 6, petrol: 4, para: 4, nig: 5 } },
  { id: 'halep', name: 'Halep', empire: 'Osmanlı İmparatorluğu', lng: 37.16, lat: 36.2, resources: { bugday: 7, demir: 3, petrol: 2, para: 6, nig: 7 } },
  { id: 'sam', name: 'Şam', empire: 'Osmanlı İmparatorluğu', lng: 36.29, lat: 33.51, resources: { bugday: 6, demir: 2, petrol: 2, para: 7, nig: 8 } },
  { id: 'bagdat', name: 'Bağdat', empire: 'Osmanlı İmparatorluğu', lng: 44.44, lat: 33.34, resources: { bugday: 5, demir: 2, petrol: 10, para: 7, nig: 7 } },
  { id: 'basra', name: 'Basra', empire: 'Osmanlı İmparatorluğu', lng: 47.78, lat: 30.51, resources: { bugday: 3, demir: 1, petrol: 14, para: 8, nig: 6 } },
  { id: 'mekke', name: 'Mekke', empire: 'Osmanlı İmparatorluğu', lng: 39.82, lat: 21.39, resources: { bugday: 2, demir: 1, petrol: 3, para: 10, nig: 5 } },
  { id: 'beyrut', name: 'Beyrut', empire: 'Osmanlı İmparatorluğu', lng: 35.5, lat: 33.89, resources: { bugday: 5, demir: 2, petrol: 1, para: 8, nig: 6 } },

  // Rusya
  { id: 'petersburg', name: 'St. Petersburg', empire: 'Çarlık Rusyası', lng: 30.32, lat: 59.95, resources: { bugday: 4, demir: 12, petrol: 2, para: 14, nig: 11 } },
  { id: 'moskova', name: 'Moskova', empire: 'Çarlık Rusyası', lng: 37.62, lat: 55.75, resources: { bugday: 7, demir: 14, petrol: 3, para: 12, nig: 10 } },
  { id: 'kiev', name: 'Kiev', empire: 'Çarlık Rusyası', lng: 30.52, lat: 50.45, resources: { bugday: 15, demir: 9, petrol: 4, para: 8, nig: 8 } },
  { id: 'varsova', name: 'Varşova', empire: 'Çarlık Rusyası', lng: 21.01, lat: 52.23, resources: { bugday: 9, demir: 11, petrol: 1, para: 7, nig: 8 } },
  { id: 'tiflis', name: 'Tiflis', empire: 'Çarlık Rusyası', lng: 44.83, lat: 41.69, resources: { bugday: 5, demir: 7, petrol: 8, para: 6, nig: 6 } },
  { id: 'baku', name: 'Bakü', empire: 'Çarlık Rusyası', lng: 49.87, lat: 40.41, resources: { bugday: 3, demir: 5, petrol: 20, para: 8, nig: 6 } },
  { id: 'odessa', name: 'Odessa', empire: 'Çarlık Rusyası', lng: 30.73, lat: 46.48, resources: { bugday: 12, demir: 6, petrol: 2, para: 8, nig: 7 } },
  { id: 'taskent', name: 'Taşkent', empire: 'Çarlık Rusyası', lng: 69.29, lat: 41.3, resources: { bugday: 6, demir: 4, petrol: 5, para: 4, nig: 6 } },

  // Avusturya-Macaristan
  { id: 'viyana', name: 'Viyana', empire: 'Avusturya-Macaristan', lng: 16.37, lat: 48.21, resources: { bugday: 8, demir: 13, petrol: 1, para: 13, nig: 10 } },
  { id: 'budapeste', name: 'Budapeşte', empire: 'Avusturya-Macaristan', lng: 19.04, lat: 47.5, resources: { bugday: 12, demir: 9, petrol: 2, para: 10, nig: 9 } },
  { id: 'prag', name: 'Prag', empire: 'Avusturya-Macaristan', lng: 14.42, lat: 50.08, resources: { bugday: 9, demir: 15, petrol: 1, para: 11, nig: 9 } },
  { id: 'lvov', name: 'Lvov', empire: 'Avusturya-Macaristan', lng: 24.03, lat: 49.84, resources: { bugday: 10, demir: 7, petrol: 6, para: 6, nig: 7 } },
  { id: 'saraybosna', name: 'Saraybosna', empire: 'Avusturya-Macaristan', lng: 18.41, lat: 43.85, resources: { bugday: 6, demir: 9, petrol: 0, para: 5, nig: 6 } },

  // Almanya
  { id: 'berlin', name: 'Berlin', empire: 'Alman İmparatorluğu', lng: 13.41, lat: 52.52, resources: { bugday: 9, demir: 16, petrol: 2, para: 16, nig: 13 } },
  { id: 'hamburg', name: 'Hamburg', empire: 'Alman İmparatorluğu', lng: 10.0, lat: 53.57, resources: { bugday: 6, demir: 12, petrol: 1, para: 13, nig: 10 } },
  { id: 'munih', name: 'Münih', empire: 'Alman İmparatorluğu', lng: 11.58, lat: 48.14, resources: { bugday: 8, demir: 11, petrol: 1, para: 11, nig: 9 } },
  { id: 'koln', name: 'Köln', empire: 'Alman İmparatorluğu', lng: 6.96, lat: 50.94, resources: { bugday: 6, demir: 18, petrol: 1, para: 12, nig: 10 } },
  { id: 'konigsberg', name: 'Königsberg', empire: 'Alman İmparatorluğu', lng: 20.51, lat: 54.71, resources: { bugday: 9, demir: 7, petrol: 0, para: 7, nig: 7 } },

  // Britanya
  { id: 'londra', name: 'Londra', empire: 'Büyük Britanya İmparatorluğu', lng: -0.13, lat: 51.51, resources: { bugday: 7, demir: 16, petrol: 3, para: 22, nig: 14 } },
  { id: 'kahire', name: 'Kahire', empire: 'Büyük Britanya İmparatorluğu', lng: 31.24, lat: 30.04, resources: { bugday: 8, demir: 3, petrol: 6, para: 9, nig: 9 } },
  { id: 'bombay', name: 'Bombay', empire: 'Büyük Britanya İmparatorluğu', lng: 72.88, lat: 19.08, resources: { bugday: 10, demir: 7, petrol: 3, para: 10, nig: 12 } },
  { id: 'delhi', name: 'Delhi', empire: 'Büyük Britanya İmparatorluğu', lng: 77.21, lat: 28.64, resources: { bugday: 12, demir: 8, petrol: 2, para: 8, nig: 13 } },
  { id: 'pretoria', name: 'Pretoria', empire: 'Büyük Britanya İmparatorluğu', lng: 28.19, lat: -25.75, resources: { bugday: 5, demir: 9, petrol: 0, para: 10, nig: 8 } },

  // Fransa
  { id: 'paris', name: 'Paris', empire: 'Fransa Cumhuriyeti', lng: 2.35, lat: 48.86, resources: { bugday: 9, demir: 14, petrol: 1, para: 16, nig: 11 } },
  { id: 'marsilya', name: 'Marsilya', empire: 'Fransa Cumhuriyeti', lng: 5.37, lat: 43.3, resources: { bugday: 7, demir: 8, petrol: 1, para: 10, nig: 8 } },
  { id: 'cezayir', name: 'Cezayir', empire: 'Fransa Cumhuriyeti', lng: 3.06, lat: 36.74, resources: { bugday: 6, demir: 5, petrol: 4, para: 5, nig: 7 } },

  // İtalya
  { id: 'roma', name: 'Roma', empire: 'İtalya Krallığı', lng: 12.5, lat: 41.9, resources: { bugday: 7, demir: 10, petrol: 1, para: 11, nig: 9 } },
  { id: 'milano', name: 'Milano', empire: 'İtalya Krallığı', lng: 9.19, lat: 45.46, resources: { bugday: 8, demir: 12, petrol: 1, para: 12, nig: 9 } },

  // ABD
  { id: 'washington', name: 'Washington', empire: 'Amerika Birleşik Devletleri', lng: -77.04, lat: 38.91, resources: { bugday: 10, demir: 16, petrol: 9, para: 22, nig: 14 } },
  { id: 'newyork', name: 'New York', empire: 'Amerika Birleşik Devletleri', lng: -74.01, lat: 40.71, resources: { bugday: 6, demir: 14, petrol: 7, para: 20, nig: 13 } },
  { id: 'chicago', name: 'Chicago', empire: 'Amerika Birleşik Devletleri', lng: -87.63, lat: 41.88, resources: { bugday: 14, demir: 15, petrol: 8, para: 14, nig: 11 } },
  { id: 'sanfrancisco', name: 'San Francisco', empire: 'Amerika Birleşik Devletleri', lng: -122.42, lat: 37.77, resources: { bugday: 7, demir: 11, petrol: 14, para: 12, nig: 9 } },

  // Japonya
  { id: 'tokyo', name: 'Tokyo', empire: 'Japon İmparatorluğu', lng: 139.69, lat: 35.69, resources: { bugday: 5, demir: 13, petrol: 1, para: 15, nig: 11 } },
  { id: 'osaka', name: 'Osaka', empire: 'Japon İmparatorluğu', lng: 135.5, lat: 34.69, resources: { bugday: 6, demir: 11, petrol: 1, para: 12, nig: 10 } },
  { id: 'seul', name: 'Seul', empire: 'Japon İmparatorluğu', lng: 126.98, lat: 37.57, resources: { bugday: 8, demir: 10, petrol: 1, para: 6, nig: 8 } },

  // Küçük devletler
  { id: 'belgrad', name: 'Belgrad', empire: 'Sırbistan Krallığı', lng: 20.46, lat: 44.82, resources: { bugday: 9, demir: 8, petrol: 1, para: 5, nig: 6 } },
  { id: 'bukres', name: 'Bükreş', empire: 'Romanya Krallığı', lng: 26.1, lat: 44.44, resources: { bugday: 12, demir: 7, petrol: 10, para: 6, nig: 7 } },
  { id: 'sofya', name: 'Sofya', empire: 'Bulgaristan Çarlığı', lng: 23.32, lat: 42.7, resources: { bugday: 10, demir: 6, petrol: 0, para: 5, nig: 6 } },
  { id: 'atina', name: 'Atina', empire: 'Yunanistan Krallığı', lng: 23.73, lat: 37.98, resources: { bugday: 5, demir: 5, petrol: 0, para: 6, nig: 5 } },
  { id: 'bruksel', name: 'Brüksel', empire: 'Belçika Krallığı', lng: 4.35, lat: 50.85, resources: { bugday: 7, demir: 14, petrol: 0, para: 11, nig: 8 } },
  { id: 'tahran', name: 'Tahran', empire: 'Persia (İran)', lng: 51.39, lat: 35.69, resources: { bugday: 5, demir: 4, petrol: 16, para: 5, nig: 6 } },
]

export default CITIES
