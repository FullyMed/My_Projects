export const translations = {
  en: {
    // Navigation
    search: 'Search',
    compare: 'Compare',
    favorites: 'Favorites',
    history: 'History',
    settings: 'Settings',
    
    // Search Screen
    fareSearch: 'Fare Search',
    from: 'From',
    to: 'To',
    selectOrigin: 'Select starting location',
    selectDestination: 'Select destination',
    transportMode: 'Transport Mode',
    searchFares: 'Search Fares',
    swapLocations: 'Swap locations',
    
    // Transport Modes
    hsr: 'High-Speed Rail',
    tra: 'Taiwan Railway',
    mrt: 'MRT/Metro',
    bus: 'City Bus',
    youbike: 'YouBike',
    
    // Results
    price: 'Price',
    travelTime: 'Travel Time',
    adult: 'Adult',
    child: 'Child',
    senior: 'Senior',
    student: 'Student',
    minutes: 'min',
    hours: 'hr',
    transfers: 'Transfers',
    direct: 'Direct',
    
    // Actions
    addToFavorites: 'Add to Favorites',
    removeFromFavorites: 'Remove from Favorites',
    viewDetails: 'View Details',
    clearAll: 'Clear All',
    
    // Settings
    language: 'Language',
    english: 'English',
    chinese: 'Chinese',
    indonesian: 'Indonesian',
    offlineMode: 'Offline Mode',
    notifications: 'Notifications',
    
    // Status
    loading: 'Loading...',
    noResults: 'No results found',
    offline: 'Offline Mode',
    cached: 'Cached Result',
    error: 'Error occurred',
    tryAgain: 'Try Again',
  },
  
  zh: {
    // Navigation
    search: '搜尋',
    compare: '比較',
    favorites: '我的最愛',
    history: '歷史記錄',
    settings: '設定',
    
    // Search Screen
    fareSearch: '票價查詢',
    from: '起點',
    to: '終點',
    selectOrigin: '選擇起點',
    selectDestination: '選擇終點',
    transportMode: '交通方式',
    searchFares: '查詢票價',
    swapLocations: '交換地點',
    
    // Transport Modes
    hsr: '高鐵',
    tra: '台鐵',
    mrt: '捷運',
    bus: '市區公車',
    youbike: 'YouBike',
    
    // Results
    price: '票價',
    travelTime: '行程時間',
    adult: '成人',
    child: '兒童',
    senior: '敬老',
    student: '學生',
    minutes: '分鐘',
    hours: '小時',
    transfers: '轉乘',
    direct: '直達',
    
    // Actions
    addToFavorites: '加入我的最愛',
    removeFromFavorites: '移除我的最愛',
    viewDetails: '查看詳情',
    clearAll: '清除全部',
    
    // Settings
    language: '語言',
    english: 'English',
    chinese: '繁體中文',
    indonesian: 'Bahasa Indonesia',
    offlineMode: '離線模式',
    notifications: '通知',
    
    // Status
    loading: '載入中...',
    noResults: '查無結果',
    offline: '離線模式',
    cached: '快取結果',
    error: '發生錯誤',
    tryAgain: '重試',
  },
  
  id: {
    // Navigation
    search: 'Cari',
    compare: 'Bandingkan',
    favorites: 'Favorit',
    history: 'Riwayat',
    settings: 'Pengaturan',
    
    // Search Screen
    fareSearch: 'Pencarian Tarif',
    from: 'Dari',
    to: 'Ke',
    selectOrigin: 'Pilih lokasi asal',
    selectDestination: 'Pilih tujuan',
    transportMode: 'Mode Transportasi',
    searchFares: 'Cari Tarif',
    swapLocations: 'Tukar lokasi',
    
    // Transport Modes
    hsr: 'Kereta Cepat',
    tra: 'Kereta Taiwan',
    mrt: 'MRT/Metro',
    bus: 'Bus Kota',
    youbike: 'YouBike',
    
    // Results
    price: 'Harga',
    travelTime: 'Waktu Perjalanan',
    adult: 'Dewasa',
    child: 'Anak',
    senior: 'Lansia',
    student: 'Pelajar',
    minutes: 'mnt',
    hours: 'jam',
    transfers: 'Transit',
    direct: 'Langsung',
    
    // Actions
    addToFavorites: 'Tambah ke Favorit',
    removeFromFavorites: 'Hapus dari Favorit',
    viewDetails: 'Lihat Detail',
    clearAll: 'Hapus Semua',
    
    // Settings
    language: 'Bahasa',
    english: 'English',
    chinese: '繁體中文',
    indonesian: 'Bahasa Indonesia',
    offlineMode: 'Mode Offline',
    notifications: 'Notifikasi',
    
    // Status
    loading: 'Memuat...',
    noResults: 'Tidak ada hasil',
    offline: 'Mode Offline',
    cached: 'Hasil Tersimpan',
    error: 'Terjadi kesalahan',
    tryAgain: 'Coba Lagi',
  }
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

export const getTranslation = (language: Language, key: TranslationKey): string => {
  return translations[language][key] || translations.en[key];
};