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
      'Pilih asal, tujuan, dan moda untuk melanjutkan.';

  @override
  String get searchEmptyReadyTitle => 'Siap untuk mencari';

  @override
  String get searchEmptyReadyBody =>
      'Tekan Cari tarif untuk melihat harga dan durasi.';

  @override
  String get searchEmptyNoResultsTitle => 'Tidak ada hasil';

  @override
  String get searchEmptyNoResultsBody =>
      'Coba rute lain atau periksa pilihan Anda.';

  @override
  String get offlineNoCache =>
      'Belum ada hasil tersimpan. Lakukan pencarian saat online untuk menyimpan hasil agar bisa digunakan offline.';

  @override
  String get offlineDataBadge => 'Data offline';

  @override
  String get showingCachedResults => 'Menampilkan hasil tersimpan.';

  @override
  String get manageOfflineData => 'Kelola Data Offline';

  @override
  String get manageOfflineDataBody =>
      'Lihat data yang tersimpan untuk offline dan hapus kapan saja.';

  @override
  String get cachedQueries => 'Rute tersimpan';

  @override
  String get cachedResults => 'Hasil tersimpan';

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
  String get emptyFavorites => 'Belum ada favorit';

  @override
  String get emptyFavoritesBody =>
      'Belum ada favorit. Simpan rute agar bisa diakses dengan cepat.';

  @override
  String get emptyHistory => 'Belum ada riwayat';

  @override
  String get emptyHistoryBody =>
      'Belum ada riwayat. Pencarian Anda akan muncul di sini.';

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
      'Data simulasi stabil dan ramah offline. Mode API mengambil tarif HSR dan TRA secara nyata; moda lain menggunakan data simulasi.';

  @override
  String get dataModeMock => 'Simulasi';

  @override
  String get dataModeApi => 'API (HSR & TRA)';

  @override
  String get offlineMode => 'Mode offline';

  @override
  String get offlineModeBody =>
      'Hanya tampilkan tarif yang tersimpan. Pencarian baru tidak akan mengambil data simulasi.';

  @override
  String get dataManagement => 'Kelola data';

  @override
  String get clearCache => 'Hapus cache tarif';

  @override
  String get clearHistory => 'Hapus riwayat';

  @override
  String get clearFavorites => 'Hapus favorit';

  @override
  String get cancel => 'Batal';

  @override
  String get confirm => 'Konfirmasi';

  @override
  String get confirmDialogBody =>
      'Apakah Anda yakin? Tindakan ini tidak bisa dibatalkan.';

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
      'Pilih beberapa moda untuk membandingkan harga dan waktu berdampingan.';

  @override
  String get selectAtLeastOneMode => 'Pilih minimal satu moda';

  @override
  String get pickRouteFirst => 'Pilih rute terlebih dahulu';

  @override
  String get searchDisabledHelper =>
      'Pilih asal, tujuan, dan satu moda untuk mencari.';

  @override
  String get compareDisabledHelper =>
      'Pilih asal, tujuan, dan minimal satu moda untuk membandingkan.';

  @override
  String get locationPickerSearchTitle => 'Cari lokasi';

  @override
  String get locationPickerCtaChoose => 'Pilih lokasi';

  @override
  String get locationPickerRecentTitle => 'Lokasi terbaru';

  @override
  String get locationPickerPopularTitle => 'Lokasi populer';

  @override
  String get locationPickerBrowseByCity => 'Telusuri berdasarkan kota';

  @override
  String get locationPickerNoResultsTitle => 'Lokasi tidak ditemukan';

  @override
  String get locationPickerNoResultsBody =>
      'Coba cari berdasarkan nama atau kota';

  @override
  String get lastUpdated => 'Terakhir diperbarui';

  @override
  String get sourceMock => 'Simulasi';

  @override
  String get sourceCached => 'Tersimpan';

  @override
  String get sourceLive => 'Langsung';

  @override
  String get transferDirect => 'Langsung';

  @override
  String get transferOne => '1 kali transit';

  @override
  String get transferOneToTwo => '1–2 kali transit';

  @override
  String get transferDockSwap => 'Disarankan ganti docking';

  @override
  String get errorTitle => 'Terjadi kesalahan';

  @override
  String get errorSearchFailed =>
      'Tarif tidak dapat dimuat saat ini. Silakan coba lagi.';

  @override
  String get errorApiNotReady =>
      'Mode API belum tersedia. Silakan kembali ke Simulasi di Pengaturan.';

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
      'Pencarian, favorit, riwayat, dan hasil cache disimpan secara lokal di perangkat Anda. Tidak perlu akun. Tanpa pelacakan secara default.';

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
  String get notFoundBody =>
      'Halaman yang Anda cari tidak ada atau mungkin telah dipindahkan.';

  @override
  String get notFoundBackToSearch => 'Kembali ke pencarian';

  @override
  String get termsOfUse => 'Ketentuan Penggunaan';

  @override
  String get termsLastUpdated => 'Terakhir diperbarui: 21 September 2026';

  @override
  String get termsIntro =>
      'Ketentuan Penggunaan ini (\"Ketentuan\") mengatur penggunaan Anda atas Taiwan Fare Finder (\"Aplikasi\"). Dengan menggunakan Aplikasi, Anda menyetujui Ketentuan ini. Jika Anda tidak setuju, mohon untuk tidak menggunakan Aplikasi.';

  @override
  String get termsSection1Title => 'Penerimaan Ketentuan Ini';

  @override
  String get termsSection1Body =>
      'Dengan mengunduh, memasang, atau menggunakan Taiwan Fare Finder, Anda menerima sepenuhnya Ketentuan ini. Kami dapat memperbarui Ketentuan ini dari waktu ke waktu; melanjutkan penggunaan Aplikasi setelah pembaruan berarti Anda menerima Ketentuan yang telah direvisi.';

  @override
  String get termsSection2Title => 'Layanan Ini';

  @override
  String get termsSection2Body =>
      'Taiwan Fare Finder adalah alat informasi untuk mencari, membandingkan, dan menyimpan tarif transportasi umum di Taiwan. Aplikasi ini tidak menjual tiket, tidak memproses pembayaran, dan tidak terhubung ke sistem pemesanan operator transportasi mana pun.';

  @override
  String get termsSection3Title => 'Akurasi Tarif & Sumber Data';

  @override
  String get termsSection3Body =>
      'Tarif High Speed Rail (HSR) dan Taiwan Railway (TRA) diambil dari platform data terbuka resmi TDX Taiwan saat mode API diaktifkan. Tarif MRT, Bus, dan YouBike menggunakan estimasi internal yang konsisten, bukan harga resmi. Dalam semua kasus, tarif dan waktu tempuh dapat sudah usang, tersimpan dalam cache, atau tidak akurat. Selalu konfirmasi tarif sebenarnya kepada operator transportasi terkait sebelum bepergian.';

  @override
  String get termsSection4Title => 'Penggunaan yang Diizinkan';

  @override
  String get termsSection4Body =>
      'Aplikasi ini ditujukan untuk penggunaan pribadi dan non-komersial. Anda setuju untuk tidak menyalahgunakan Aplikasi atau layanan backend-nya — misalnya dengan mengirim permintaan otomatis dalam jumlah berlebihan, mencoba mengambil kredensial API, atau mengganggu operasional normal Aplikasi.';

  @override
  String get termsSection5Title => 'Tanpa Jaminan & Batasan Tanggung Jawab';

  @override
  String get termsSection5Body =>
      'Aplikasi ini disediakan \"apa adanya\" dan \"sebagaimana tersedia\", tanpa jaminan dalam bentuk apa pun, baik tersurat maupun tersirat, termasuk keakuratan, keandalan, atau kesesuaian untuk tujuan tertentu. Sejauh diizinkan oleh hukum, kami tidak bertanggung jawab atas kerugian atau kerusakan apa pun yang timbul dari penggunaan Aplikasi, termasuk keterlambatan perjalanan atau selisih tarif.';

  @override
  String get termsSection6Title => 'Layanan Pihak Ketiga';

  @override
  String get termsSection6Body =>
      'Data tarif HSR dan TRA langsung bersumber dari platform data terbuka TDX (Transport Data eXchange) Taiwan, yang dioperasikan oleh Kementerian Perhubungan dan Komunikasi Taiwan (tdx.transportdata.tw). Penggunaan data tersebut tunduk pada ketentuan TDX sendiri, yang tidak kami kendalikan.';

  @override
  String get termsSection7Title => 'Perubahan Ketentuan Ini';

  @override
  String get termsSection7Body =>
      'Kami dapat merevisi Ketentuan ini seiring perkembangan Aplikasi. Tanggal \"Terakhir diperbarui\" di atas mencerminkan revisi terbaru. Kami menyarankan Anda meninjau Ketentuan ini secara berkala.';

  @override
  String get termsSection8Title => 'Kontak';

  @override
  String get termsSection8Body =>
      'Pertanyaan mengenai Ketentuan ini dapat dikirimkan ke maxfelix05@gmail.com.';

  @override
  String get privacyPolicyTitle => 'Kebijakan Privasi';

  @override
  String get privacyLastUpdated => 'Terakhir diperbarui: 21 September 2026';

  @override
  String get privacyPolicyIntro =>
      'Taiwan Fare Finder tidak memerlukan akun, tidak memiliki sistem login, dan tidak mengoperasikan server backend miliknya sendiri. Kebijakan ini menjelaskan sedikit data yang ditangani Aplikasi, dan ke mana data tersebut pergi.';

  @override
  String get privacySection1Title =>
      'Informasi yang Kami Simpan di Perangkat Anda';

  @override
  String get privacySection1Body =>
      'Riwayat pencarian, rute favorit yang disimpan, hasil tarif yang di-cache, dan pengaturan aplikasi (bahasa, tema, mode offline) disimpan secara lokal di perangkat Anda menggunakan penyimpanan aplikasi standar. Data ini tidak pernah diunggah ke server yang kami operasikan — karena kami tidak memilikinya.';

  @override
  String get privacySection2Title => 'Informasi yang Dikirim ke Pihak Ketiga';

  @override
  String get privacySection2Body =>
      'Dalam mode data Simulasi, tidak ada yang Anda cari yang pernah meninggalkan perangkat Anda. Dalam mode data API, ID stasiun asal dan tujuan untuk pencarian High Speed Rail dan Taiwan Railway dikirim — melalui server proxy kami — ke platform data terbuka resmi TDX Taiwan untuk mengambil tarif sebenarnya. Tidak ada nama, akun, atau ID perangkat yang disertakan dalam permintaan tersebut, karena Aplikasi memang tidak memilikinya untuk dikirim.';

  @override
  String get privacySection3Title => 'Analitik';

  @override
  String get privacySection3Body =>
      'Saat ini Aplikasi hanya mencatat beberapa nama peristiwa secara lokal untuk tujuan debugging (terlihat di log developer pada perangkat Anda sendiri) dan tidak mengirimkannya ke mana pun. Jika suatu saat kami menambahkan analitik atau pelacakan sungguhan, kami akan meminta persetujuan Anda terlebih dahulu.';

  @override
  String get privacySection4Title => 'Privasi Anak-Anak';

  @override
  String get privacySection4Body =>
      'Aplikasi ini tidak dengan sengaja mengumpulkan informasi pribadi dari siapa pun, termasuk anak-anak, karena Aplikasi memang tidak mengumpulkan informasi pribadi dari siapa pun. Aplikasi ini cocok untuk pengguna umum.';

  @override
  String get privacySection5Title => 'Pilihan Anda & Penghapusan Data';

  @override
  String get privacySection5Body =>
      'Anda dapat menghapus tarif yang di-cache, riwayat pencarian, atau favorit kapan saja melalui Pengaturan → Kelola data. Menghapus instalasi Aplikasi akan menghapus semua data yang disimpannya di perangkat Anda.';

  @override
  String get privacySection6Title => 'Perubahan Kebijakan Ini';

  @override
  String get privacySection6Body =>
      'Kami dapat memperbarui Kebijakan Privasi ini seiring perkembangan Aplikasi. Tanggal \"Terakhir diperbarui\" di atas mencerminkan revisi terbaru.';

  @override
  String get privacySection7Title => 'Kontak';

  @override
  String get privacySection7Body =>
      'Pertanyaan mengenai Kebijakan Privasi ini dapat dikirimkan ke maxfelix05@gmail.com.';
}
