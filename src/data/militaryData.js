// 1910 yılı gerçek askeri güç verileri
// Kaynaklar: Wikipedia, Encyclopedia Britannica, WW1 Military Statistics
// Birimler: piyade (bin), topcu (top sayısı), suvari (bin), savas_gemi (adet)

const MILITARY_1910 = {
  'Osmanlı İmparatorluğu': {
    toplam_asker: 350000,
    dagılım: {
      'istanbul':   { piyade: 40, topcu: 80,  suvari: 5,  moral: 60 },
      'edirne':     { piyade: 25, topcu: 50,  suvari: 3,  moral: 58 },
      'erzurum':    { piyade: 30, topcu: 40,  suvari: 4,  moral: 62 },
      'diyarbakir': { piyade: 20, topcu: 30,  suvari: 3,  moral: 60 },
      'halep':      { piyade: 22, topcu: 35,  suvari: 4,  moral: 58 },
      'sam':        { piyade: 18, topcu: 28,  suvari: 3,  moral: 57 },
      'bagdat':     { piyade: 25, topcu: 32,  suvari: 5,  moral: 60 },
      'basra':      { piyade: 15, topcu: 20,  suvari: 2,  moral: 55 },
      'ankara':     { piyade: 20, topcu: 30,  suvari: 3,  moral: 60 },
      'beyrut':     { piyade: 12, topcu: 18,  suvari: 2,  moral: 56 },
      'mekke':      { piyade: 10, topcu: 12,  suvari: 2,  moral: 52 },
    }
  },
  'Çarlık Rusyası': {
    toplam_asker: 1350000,
    dagılım: {
      'petersburg': { piyade: 80,  topcu: 200, suvari: 20, moral: 65 },
      'moskova':    { piyade: 90,  topcu: 180, suvari: 25, moral: 67 },
      'kiev':       { piyade: 70,  topcu: 150, suvari: 30, moral: 65 },
      'varsova':    { piyade: 100, topcu: 160, suvari: 20, moral: 63 },
      'tiflis':     { piyade: 50,  topcu: 80,  suvari: 15, moral: 64 },
      'baku':       { piyade: 30,  topcu: 50,  suvari: 8,  moral: 62 },
      'odessa':     { piyade: 45,  topcu: 90,  suvari: 12, moral: 64 },
      'taskent':    { piyade: 35,  topcu: 60,  suvari: 10, moral: 60 },
      'beyaz_rusya':{ piyade: 60,  topcu: 100, suvari: 15, moral: 63 },
    }
  },
  'Alman İmparatorluğu': {
    toplam_asker: 760000,
    dagılım: {
      'berlin':      { piyade: 100, topcu: 300, suvari: 20, moral: 82 },
      'hamburg':     { piyade: 40,  topcu: 120, suvari: 8,  moral: 80 },
      'munih':       { piyade: 55,  topcu: 160, suvari: 12, moral: 81 },
      'koln':        { piyade: 60,  topcu: 180, suvari: 10, moral: 82 },
      'konigsberg':  { piyade: 45,  topcu: 130, suvari: 10, moral: 80 },
      'alsas':       { piyade: 50,  topcu: 140, suvari: 8,  moral: 79 },
    }
  },
  'Avusturya-Macaristan': {
    toplam_asker: 450000,
    dagılım: {
      'viyana':      { piyade: 60,  topcu: 150, suvari: 15, moral: 72 },
      'budapeste':   { piyade: 50,  topcu: 120, suvari: 18, moral: 70 },
      'prag':        { piyade: 45,  topcu: 110, suvari: 10, moral: 71 },
      'lvov':        { piyade: 40,  topcu: 90,  suvari: 12, moral: 69 },
      'saraybosna':  { piyade: 30,  topcu: 70,  suvari: 8,  moral: 67 },
      'transilvanya':{ piyade: 25,  topcu: 60,  suvari: 10, moral: 68 },
    }
  },
  'Büyük Britanya İmparatorluğu': {
    toplam_asker: 380000,
    dagılım: {
      'londra':   { piyade: 50,  topcu: 120, suvari: 10, moral: 78 },
      'kahire':   { piyade: 35,  topcu: 80,  suvari: 12, moral: 75 },
      'delhi':    { piyade: 70,  topcu: 90,  suvari: 20, moral: 73 },
      'bombay':   { piyade: 40,  topcu: 60,  suvari: 10, moral: 72 },
      'pretoria': { piyade: 30,  topcu: 50,  suvari: 8,  moral: 74 },
    }
  },
  'Fransa Cumhuriyeti': {
    toplam_asker: 600000,
    dagılım: {
      'paris':    { piyade: 90,  topcu: 200, suvari: 15, moral: 76 },
      'marsilya': { piyade: 50,  topcu: 120, suvari: 8,  moral: 74 },
      'cezayir':  { piyade: 35,  topcu: 70,  suvari: 10, moral: 70 },
      'fas':      { piyade: 20,  topcu: 40,  suvari: 8,  moral: 68 },
    }
  },
  'İtalya Krallığı': {
    toplam_asker: 270000,
    dagılım: {
      'roma':   { piyade: 50,  topcu: 100, suvari: 8,  moral: 65 },
      'milano': { piyade: 40,  topcu: 90,  suvari: 6,  moral: 66 },
      'eritre': { piyade: 15,  topcu: 25,  suvari: 4,  moral: 60 },
    }
  },
  'Amerika Birleşik Devletleri': {
    toplam_asker: 127000,
    dagılım: {
      'washington':  { piyade: 20,  topcu: 50,  suvari: 5,  moral: 70 },
      'newyork':     { piyade: 15,  topcu: 40,  suvari: 3,  moral: 70 },
      'chicago':     { piyade: 12,  topcu: 35,  suvari: 3,  moral: 69 },
      'sanfrancisco':{ piyade: 10,  topcu: 30,  suvari: 2,  moral: 68 },
    }
  },
  'Japon İmparatorluğu': {
    toplam_asker: 250000,
    dagılım: {
      'tokyo':  { piyade: 60,  topcu: 140, suvari: 8,  moral: 80 },
      'osaka':  { piyade: 40,  topcu: 90,  suvari: 5,  moral: 79 },
      'seul':   { piyade: 35,  topcu: 70,  suvari: 6,  moral: 77 },
    }
  },
  'Sırbistan Krallığı': {
    toplam_asker: 50000,
    dagılım: {
      'belgrad': { piyade: 30, topcu: 60, suvari: 8, moral: 72 },
    }
  },
  'Romanya Krallığı': {
    toplam_asker: 90000,
    dagılım: {
      'bukres': { piyade: 40, topcu: 80, suvari: 12, moral: 65 },
    }
  },
  'Bulgaristan Çarlığı': {
    toplam_asker: 80000,
    dagılım: {
      'sofya': { piyade: 35, topcu: 70, suvari: 8, moral: 68 },
    }
  },
  'Yunanistan Krallığı': {
    toplam_asker: 40000,
    dagılım: {
      'atina': { piyade: 20, topcu: 40, suvari: 4, moral: 64 },
    }
  },
  'Belçika Krallığı': {
    toplam_asker: 45000,
    dagılım: {
      'bruksel': { piyade: 25, topcu: 60, suvari: 4, moral: 66 },
    }
  },
  'Persia (İran)': {
    toplam_asker: 30000,
    dagılım: {
      'tahran': { piyade: 15, topcu: 25, suvari: 8, moral: 50 },
    }
  },
}

export default MILITARY_1910
