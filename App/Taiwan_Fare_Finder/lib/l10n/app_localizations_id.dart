// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Indonesian (`id`).
class AppLocalizationsId extends AppLocalizations {
  AppLocalizationsId([String locale = 'id']) : super(locale);

  @override
  String get appTitle => 'Pencari Tarif Taiwan';

  @override
  String get tabSearch => 'Cari';

  @override
  String get tabCompare => 'Bandingkan';

  @override
  String get tabSaved => 'Simpan';

  @override
  String get settings => 'Pengaturan';

  @override
  String get origin => 'Asal';

  @override
  String get destination => 'Tujuan';

  @override
  String get swap => 'Tukar';

  @override
  String get transportMode => 'Moda transportasi';

  @override
  String get transportModes => 'Moda transportasi';

  @override
  String get searchFares => 'Cari tarif';

  @override
  String get compareFares => 'Bandingkan tarif';

  @override
  String get results => 'Hasil';

  @override
  String get noResults => 'Belum ada hasil';

  @override
  String get noResultsBody =>
      'Pilih asal, tujuan, dan moda untuk melihat tarif.';

  @override
  String get searchEmptyPickTitle => 'Pilih rute';

  @override
  String get searchEmptyPickBody =>
      'Pilih dari mana Anda berangkat, ke mana tujuan Anda, dan naik apa.';

  @override
  String get searchEmptyReadyTitle => 'Siap untuk mencari';

  @override
  String get searchEmptyReadyBody =>
      'Ketuk Cari tarif untuk melihat harga dan waktu tempuh.';

  @override
  String get searchEmptyNoResultsTitle => 'Tidak ada hasil';

  @override
  String get searchEmptyNoResultsBody => 'Coba rute atau moda lain.';

  @override
  String get offlineNoCache =>
      'Belum ada hasil tersimpan untuk rute ini. Cari sekali saat online, nanti hasilnya tetap ada saat offline.';

  @override
  String get offlineDataBadge => 'Data offline';

  @override
  String get showingCachedResults =>
      'Server tidak bisa dihubungi. Ini hasil yang sudah Anda simpan.';

  @override
  String get manageOfflineData => 'Kelola Data Offline';

  @override
  String get manageOfflineDataBody =>
      'Lihat apa yang tersimpan untuk offline, dan hapus kapan pun Anda mau.';

  @override
  String get cachedQueries => 'Pencarian tersimpan';

  @override
  String get cachedResults => 'Tarif tersimpan';

  @override
  String get clearOfflineData => 'Hapus data offline';

  @override
  String get duration => 'Durasi';

  @override
  String get transfers => 'Transit';

  @override
  String get fareByCategory => 'Tarif per kategori';

  @override
  String get adult => 'Dewasa';

  @override
  String get student => 'Pelajar';

  @override
  String get child => 'Anak';

  @override
  String get senior => 'Lansia';

  @override
  String get minutesShort => 'mnt';

  @override
  String get kmShort => 'km';

  @override
  String get favorite => 'Favorit';

  @override
  String get unfavorite => 'Batal favorit';

  @override
  String get favorites => 'Favorit';

  @override
  String get history => 'Riwayat';

  @override
  String get emptyFavorites => 'Belum ada rute tersimpan';

  @override
  String get emptyFavoritesBody =>
      'Ketuk ikon penanda pada hasil pencarian untuk menyimpan rutenya di sini.';

  @override
  String get emptyHistory => 'Belum ada riwayat';

  @override
  String get emptyHistoryBody => 'Rute yang Anda cari akan muncul di sini.';

  @override
  String get rerun => 'Jalankan lagi';

  @override
  String get delete => 'Hapus';

  @override
  String get clear => 'Bersihkan';

  @override
  String get clearAll => 'Hapus semua';

  @override
  String get language => 'Bahasa';

  @override
  String get theme => 'Tema';

  @override
  String get themeSystem => 'Sistem';

  @override
  String get themeLight => 'Terang';

  @override
  String get themeDark => 'Gelap';

  @override
  String get dataMode => 'Sumber data';

  @override
  String get dataModeBody =>
      'Simulasi menampilkan tarif rekaan yang konsisten dan bisa dipakai offline. Mode API mengambil tarif HSR dan TRA asli dari TDX; moda lain tetap memakai data simulasi.';

  @override
  String get dataModeMock => 'Simulasi';

  @override
  String get dataModeApi => 'API (HSR & TRA)';

  @override
  String get offlineMode => 'Mode offline';

  @override
  String get offlineModeBody =>
      'Hanya tampilkan tarif yang sudah pernah Anda cari. Aplikasi tidak akan mengambil atau membuat data baru.';

  @override
  String get dataManagement => 'Kelola data';

  @override
  String get clearCache => 'Hapus cache tarif';

  @override
  String get clearHistory => 'Hapus riwayat';

  @override
  String get clearFavorites => 'Hapus rute tersimpan';

  @override
  String get cancel => 'Batal';

  @override
  String get confirm => 'Konfirmasi';

  @override
  String get confirmDialogBody => 'Tindakan ini tidak bisa dibatalkan.';

  @override
  String get cleared => 'Sudah dibersihkan';

  @override
  String get settingsLanguageEnglish => 'English';

  @override
  String get settingsLanguageChineseHant => '繁體中文';

  @override
  String get settingsLanguageIndonesian => 'Bahasa Indonesia';

  @override
  String get modesHSR => 'HSR';

  @override
  String get modesTRA => 'TRA';

  @override
  String get modesMRT => 'MRT';

  @override
  String get modesBus => 'Bus';

  @override
  String get modesYouBike => 'YouBike';

  @override
  String get compareHint =>
      'Pilih beberapa moda untuk melihat harga dan waktunya berdampingan.';

  @override
  String get selectAtLeastOneMode => 'Pilih minimal satu moda';

  @override
  String get pickRouteFirst => 'Pilih rute dulu';

  @override
  String get searchDisabledHelper =>
      'Pilih asal, tujuan, dan moda untuk mencari.';

  @override
  String get compareDisabledHelper =>
      'Pilih asal, tujuan, dan minimal satu moda untuk membandingkan.';

  @override
  String get locationPickerSearchTitle => 'Cari tempat';

  @override
  String get locationPickerCtaChoose => 'Pilih tempat';

  @override
  String get locationPickerRecentTitle => 'Lokasi terbaru';

  @override
  String get locationPickerPopularTitle => 'Lokasi populer';

  @override
  String get locationPickerBrowseByCity => 'Telusuri berdasarkan kota';

  @override
  String get locationPickerNoResultsTitle => 'Tidak ada yang cocok';

  @override
  String get locationPickerNoResultsBody =>
      'Coba ejaan lain, atau nama Mandarinnya.';

  @override
  String get lastUpdated => 'Terakhir diperbarui';

  @override
  String get sourceMock => 'Simulasi';

  @override
  String get sourceCached => 'Tersimpan';

  @override
  String get sourceLive => 'Langsung';

  @override
  String get routeNotServedTitle => 'Tidak ada layanan di rute ini';

  @override
  String routeNotServedBody(Object mode) {
    return '$mode tidak memiliki stasiun di asal atau tujuan Anda. Coba moda lain.';
  }

  @override
  String routeNotServedList(Object modes) {
    return 'Tidak melayani rute ini: $modes';
  }

  @override
  String get estimatedShort => 'perkiraan';

  @override
  String get transferDirect => 'Langsung';

  @override
  String get transferOne => '1 kali transit';

  @override
  String get transferOneToTwo => '1–2 kali transit';

  @override
  String get transferDockSwap => 'Ganti sepeda di tengah jalan';

  @override
  String get errorTitle => 'Tarif tidak bisa dimuat';

  @override
  String get errorSearchFailed =>
      'Periksa koneksi internet Anda, lalu coba lagi.';

  @override
  String get errorApiNotReady =>
      'Tarif langsung tidak tersedia di versi ini. Ubah sumber data ke Simulasi di Pengaturan.';

  @override
  String get retry => 'Coba lagi';

  @override
  String compareSelectedCountLabel(Object count) {
    return 'Dipilih: $count';
  }

  @override
  String get selectAll => 'Pilih semua';

  @override
  String get compareSortLabel => 'Urutkan berdasarkan';

  @override
  String get compareSortCheapest => 'Termurah';

  @override
  String get compareSortFastest => 'Tercepat';

  @override
  String get compareSortFewestTransfers => 'Paling sedikit transit';

  @override
  String get privacy => 'Privasi';

  @override
  String get privacyBody =>
      'Semua yang Anda cari dan simpan tetap ada di perangkat ini. Anda tidak perlu akun, dan aplikasi ini tidak melacak Anda.';

  @override
  String get privacyReadMore => 'Baca selengkapnya';

  @override
  String get about => 'Tentang';

  @override
  String get aboutVersion => 'Versi aplikasi';

  @override
  String get aboutDataSource => 'Sumber data';

  @override
  String get notFoundTitle => 'Halaman tidak ditemukan';

  @override
  String get notFoundBody => 'Halaman itu tidak ditemukan.';

  @override
  String get notFoundBackToSearch => 'Kembali ke pencarian';

  @override
  String get termsOfUse => 'Ketentuan Penggunaan';

  @override
  String get termsLastUpdated => 'Terakhir diperbarui: 15 Oktober 2026';

  @override
  String get termsIntro =>
      'Ketentuan ini mengatur penggunaan Taiwan Fare Finder (\"Aplikasi\") oleh Anda. Dengan memakai Aplikasi, Anda menyetujuinya. Jika tidak setuju, mohon jangan gunakan Aplikasi.';

  @override
  String get termsSection1Title => 'Penerimaan ketentuan ini';

  @override
  String get termsSection1Body =>
      'Dengan mengunduh, memasang, atau memakai Aplikasi, Anda menerima ketentuan ini. Kami bisa memperbaruinya. Jika Anda tetap memakai Aplikasi setelah pembaruan, Anda menerima versi barunya.';

  @override
  String get termsSection2Title => 'Apa yang dilakukan Aplikasi';

  @override
  String get termsSection2Body =>
      'Taiwan Fare Finder membantu Anda mencari, membandingkan, dan menyimpan tarif transportasi umum di Taiwan. Aplikasi ini tidak menjual tiket, tidak menerima pembayaran, dan tidak terhubung ke sistem pemesanan operator mana pun.';

  @override
  String get termsSection3Title => 'Akurasi tarif dan sumber data';

  @override
  String get termsSection3Body =>
      'Saat mode API aktif, Aplikasi mengambil tarif High Speed Rail (HSR) dan Taiwan Railway (TRA) dari platform data terbuka resmi TDX Taiwan. Tarif MRT, bus, dan YouBike adalah perkiraan Aplikasi sendiri, bukan harga resmi, begitu pula tarif pelajar untuk HSR dan TRA. Tarif dan waktu tempuh apa pun bisa usang atau keliru, jadi pastikan dulu ke operator sebelum Anda berangkat.';

  @override
  String get termsSection4Title => 'Penggunaan yang diizinkan';

  @override
  String get termsSection4Body =>
      'Aplikasi ini untuk penggunaan pribadi dan non-komersial. Mohon jangan menyalahgunakan Aplikasi atau server di baliknya, misalnya dengan mengirim permintaan otomatis dalam jumlah besar, mencoba mengambil kredensial API, atau mengganggu cara kerja Aplikasi.';

  @override
  String get termsSection5Title => 'Tanpa jaminan dan batasan tanggung jawab';

  @override
  String get termsSection5Body =>
      'Aplikasi ini disediakan \"apa adanya\" dan \"sebagaimana tersedia\", tanpa jaminan dalam bentuk apa pun, baik tersurat maupun tersirat, termasuk keakuratan, keandalan, atau kesesuaian untuk tujuan tertentu. Sejauh diizinkan oleh hukum, kami tidak bertanggung jawab atas kerugian atau kerusakan apa pun yang timbul dari penggunaan Aplikasi, termasuk keterlambatan perjalanan atau selisih tarif.';

  @override
  String get termsSection6Title => 'Layanan pihak ketiga';

  @override
  String get termsSection6Body =>
      'Tarif HSR dan TRA langsung berasal dari TDX (Transport Data eXchange), platform data terbuka yang dikelola Kementerian Perhubungan dan Komunikasi Taiwan (tdx.transportdata.tw). Ketentuan TDX sendiri berlaku untuk data tersebut, dan kami tidak mengendalikannya.';

  @override
  String get termsSection7Title => 'Perubahan ketentuan ini';

  @override
  String get termsSection7Body =>
      'Kami bisa merevisi ketentuan ini seiring berubahnya Aplikasi. Tanggal \"Terakhir diperbarui\" di atas menunjukkan revisi terbaru.';

  @override
  String get termsSection8Title => 'Kontak';

  @override
  String get termsSection8Body =>
      'Ada pertanyaan tentang ketentuan ini? Kirim email ke maxfelix05@gmail.com.';

  @override
  String get privacyPolicyTitle => 'Kebijakan Privasi';

  @override
  String get privacyLastUpdated => 'Terakhir diperbarui: 15 Oktober 2026';

  @override
  String get privacyPolicyIntro =>
      'Taiwan Fare Finder tidak memakai akun atau login, dan kami tidak menyimpan data Anda di server. Kebijakan ini menjelaskan sedikit data yang ditangani Aplikasi dan ke mana data itu pergi.';

  @override
  String get privacySection1Title => 'Yang tetap ada di perangkat Anda';

  @override
  String get privacySection1Body =>
      'Aplikasi menyimpan riwayat pencarian, rute tersimpan, tarif yang di-cache, dan pengaturan (bahasa, tema, mode offline, sumber data) di penyimpanan aplikasi biasa di perangkat Anda. Aplikasi tidak pernah mengunggah data itu ke mana pun.';

  @override
  String get privacySection2Title => 'Apa yang dikirim, dan ke mana';

  @override
  String get privacySection2Body =>
      'Dalam mode Simulasi, apa pun yang Anda cari tidak keluar dari perangkat Anda. Dalam mode API, Aplikasi mengirim kode stasiun asal dan tujuan pencarian HSR dan TRA ke server perantara kecil kami, sebuah proxy di Cloudflare. Server itu meneruskannya ke platform data terbuka resmi TDX Taiwan untuk mengambil tarif asli. Server perantara menyimpan kunci akses TDX, jadi kunci itu tidak ikut di dalam Aplikasi. Server ini menyimpan data tarif selama beberapa jam agar tetap cepat, tetapi tidak mencatat siapa yang bertanya. Permintaan itu tidak membawa nama, akun, atau ID perangkat, karena Aplikasi tidak punya data semacam itu. Seperti permintaan internet lainnya, alamat IP Anda terlihat oleh jaringan yang membawanya.';

  @override
  String get privacySection3Title => 'Analitik';

  @override
  String get privacySection3Body =>
      'Aplikasi mencatat beberapa nama peristiwa di log developer pada perangkat Anda sendiri untuk keperluan debugging, dan tidak mengirimkannya ke mana pun. Jika kami menambahkan analitik sungguhan, kami akan meminta persetujuan Anda lebih dulu.';

  @override
  String get privacySection4Title => 'Privasi anak';

  @override
  String get privacySection4Body =>
      'Aplikasi ini tidak mengumpulkan informasi pribadi dari siapa pun, termasuk anak-anak, dan cocok untuk semua usia.';

  @override
  String get privacySection5Title => 'Pilihan Anda dan penghapusan data';

  @override
  String get privacySection5Body =>
      'Anda bisa menghapus tarif yang di-cache (Pengaturan → Kelola Data Offline) serta riwayat atau rute tersimpan (Pengaturan → Kelola data) kapan saja. Menghapus instalasi Aplikasi akan menghapus semua data yang disimpannya di perangkat Anda.';

  @override
  String get privacySection6Title => 'Perubahan kebijakan ini';

  @override
  String get privacySection6Body =>
      'Kami bisa memperbarui kebijakan ini seiring berubahnya Aplikasi. Tanggal \"Terakhir diperbarui\" di atas menunjukkan revisi terbaru.';

  @override
  String get privacySection7Title => 'Kontak';

  @override
  String get privacySection7Body =>
      'Ada pertanyaan tentang kebijakan ini? Kirim email ke maxfelix05@gmail.com.';
}
