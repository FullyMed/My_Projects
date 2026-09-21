# Apple App Store — Listing Metadata

Source-of-truth copy for App Store Connect → **App Information** / **App Store**
tab, localized per language. Paste directly into the matching fields; character
counts are given so you can verify against Apple's current limits before
submitting. This file has no effect on the app itself — it's reference copy
for submission.

**Bundle ID note:** the Xcode project still has the Flutter template bundle ID
(`com.mycompany.CounterApp` in `ios/Runner.xcodeproj/project.pbxproj`), while
Android already uses `com.felix.taiwanfarefinder`. Set the iOS bundle ID (and
matching App ID / provisioning profile in your Apple Developer account) before
creating the App Store Connect record.

**Fields not filled in below** (need real values from you before submission):
- Privacy Policy URL (required by Apple even though the app collects no personal data — see [`SECURITY.md`](../SECURITY.md)). The app now has an in-app Privacy Policy screen (`lib/pages/privacy_page.dart`, strings in the ARB files under the `privacy*` keys, contact address `maxfelix05@gmail.com`) — host that same content at a public URL for this field.
- Support URL
- Marketing URL (optional)
- Contact email / phone for App Review (the in-app pages use `maxfelix05@gmail.com` as a placeholder contact — fine for now, but consider a dedicated address before this ships broadly)
- Age rating questionnaire answers (likely 4+ — no objectionable content, no user-generated content, no accounts)
- Primary category suggestion: **Travel**; secondary: **Navigation**
- Price: Free (no IAP — nothing in the codebase implements purchases)

---

## English (en-US)

| Field | Limit | Value |
|---|---|---|
| App Name | 30 | `Taiwan Fare Finder` (19) |
| Subtitle | 30 | `Compare HSR, TRA & MRT fares` (27) |
| Promotional Text | 170 | see below (130) |
| Keywords | 100, comma-separated | see below (89) |

**Promotional Text**
```
Live HSR & TRA fares from Taiwan's TDX open data. Compare every mode side-by-side, save favorite routes, and search fully offline.
```

**Keywords**
```
transit,fare,HSR,TRA,MRT,bus,YouBike,Taiwan,ticket,price,rail,train,commute,offline,route
```

**Description**
```
Taiwan Fare Finder helps you search, compare, and save public transportation fares across Taiwan — all in one clean, fast, multilingual app.

FIND FARES IN SECONDS
Pick an origin and destination from 13 major Taiwan cities and see fares by passenger category (adult, student, child, senior) plus estimated travel time.

COMPARE EVERY MODE SIDE-BY-SIDE
See High Speed Rail (HSR), Taiwan Railway (TRA), MRT, Bus, and YouBike fares together, sorted by price, speed, or number of transfers — so you always know the best way to go.

LIVE DATA WHERE IT MATTERS
HSR and TRA fares are pulled live from Taiwan's official TDX open-data platform. Other modes use a consistent estimate so you always get an answer, even for routes without live data.

WORKS OFFLINE
Every fare you look up is cached on your device. Switch on Offline Mode and keep browsing your saved results with no connection at all.

SAVE YOUR ROUTES
Bookmark the routes you take often and jump straight back to them. Your search history is kept automatically so you can re-run a recent search in one tap.

BUILT FOR EVERYONE IN TAIWAN
Available in English, Traditional Chinese, and Indonesian, with automatic light/dark theme support and a layout that adapts from phone to tablet.

PRIVACY BY DESIGN
No account, no login, no ads, and no personal data collected. Everything you save stays on your device.

Supported cities: Taipei, New Taipei (Banqiao), Taoyuan, Hsinchu, Miaoli, Taichung, Changhua, Yunlin, Chiayi, Tainan, Kaohsiung, and Keelung.
```

**What's New in This Version** (v1.0.0)
```
Initial release: search and compare Taiwan transit fares (HSR, TRA, MRT, Bus, YouBike), save favorites, view history, and use fully offline.
```

---

## Chinese, Traditional — Taiwan (zh-Hant)

| Field | Limit | Value |
|---|---|---|
| App Name | 30 | `台灣票價查詢` (6) |
| Subtitle | 30 | `查詢比較高鐵、台鐵、捷運、公車票價` (17) |
| Promotional Text | 170 | see below |
| Keywords | 100, comma-separated | see below (47) |

**Promotional Text**
```
整合 TDX 即時高鐵與台鐵票價，一次比較各種交通方式的價格與時間，並支援收藏路線與離線查詢。
```

**Keywords**
```
台灣,票價,高鐵,台鐵,捷運,公車,YouBike,交通,轉乘,離線,收藏,查詢,比較,時刻表
```

**Description**
```
「台灣票價查詢」讓你快速查詢、比較並收藏台灣各種大眾運輸的票價，介面簡潔、支援多國語言。

快速查詢票價
從全台 13 個主要城市中選擇起點與終點，即可查看成人、學生、孩童、敬老等不同族群的票價，以及預估搭乘時間。

一次比較所有交通方式
同時查看高鐵、台鐵、捷運、公車、YouBike 的票價，並依價格、時間或轉乘次數排序，輕鬆找到最適合的方案。

高鐵、台鐵即時資料
高鐵與台鐵票價直接串接交通部 TDX 運輸資料流通服務平台，其餘交通方式則採用穩定的估算模式，即使沒有即時資料也能提供參考。

支援離線使用
查詢過的票價會自動儲存在裝置中。開啟離線模式後，即使沒有網路也能瀏覽已儲存的結果。

收藏常用路線
將常搭的路線加入收藏，下次一鍵開啟。搜尋紀錄會自動保存，方便你快速重新查詢。

為台灣量身打造
支援英文、繁體中文、印尼文，並自動配合系統的淺色／深色模式，介面可依手機或平板螢幕自動調整。

重視隱私
不需要註冊帳號、沒有廣告，也不會蒐集個人資料，所有收藏與紀錄都只保存在你的裝置上。

支援城市：台北、新北（板橋）、桃園、新竹、苗栗、台中、彰化、雲林、嘉義、台南、高雄、基隆。
```

**What's New in This Version** (v1.0.0)
```
首次上線：查詢並比較台灣各種交通方式（高鐵、台鐵、捷運、公車、YouBike）的票價與時間，可收藏常用路線、查看搜尋紀錄，並支援離線使用。
```

---

## Indonesian (id)

| Field | Limit | Value |
|---|---|---|
| App Name | 30 | `Pencari Tarif Taiwan` (21) |
| Subtitle | 30 | `Bandingkan tarif transportasi` (29) |
| Promotional Text | 170 | see below (131) |
| Keywords | 100, comma-separated | see below (89) |

**Promotional Text**
```
Data HSR & TRA langsung dari TDX. Bandingkan semua moda transportasi, simpan rute favorit, dan tetap bisa mencari secara offline.
```

**Keywords**
```
transit,tarif,HSR,TRA,MRT,bus,YouBike,Taiwan,tiket,harga,kereta,transportasi,offline,rute
```

**Description**
```
Pencari Tarif Taiwan membantu Anda mencari, membandingkan, dan menyimpan tarif transportasi umum di seluruh Taiwan — dalam satu aplikasi yang cepat dan multibahasa.

TEMUKAN TARIF DALAM HITUNGAN DETIK
Pilih asal dan tujuan dari 13 kota besar di Taiwan, lalu lihat tarif berdasarkan kategori penumpang (dewasa, pelajar, anak, lansia) beserta estimasi waktu tempuh.

BANDINGKAN SEMUA MODA SEKALIGUS
Lihat tarif High Speed Rail (HSR), Taiwan Railway (TRA), MRT, Bus, dan YouBike secara berdampingan, diurutkan berdasarkan harga, kecepatan, atau jumlah transit — agar Anda selalu tahu cara terbaik untuk bepergian.

DATA LANGSUNG UNTUK YANG PENTING
Tarif HSR dan TRA diambil langsung dari platform data terbuka resmi TDX Taiwan. Moda lainnya menggunakan estimasi yang konsisten sehingga Anda tetap mendapat jawaban meski data langsung tidak tersedia.

TETAP BERFUNGSI SAAT OFFLINE
Setiap tarif yang Anda cari otomatis tersimpan di perangkat. Aktifkan Mode Offline untuk tetap melihat hasil tersimpan tanpa koneksi internet sama sekali.

SIMPAN RUTE ANDA
Simpan rute yang sering Anda gunakan agar bisa dibuka kembali dengan cepat. Riwayat pencarian tersimpan otomatis sehingga Anda bisa mengulang pencarian terakhir hanya dengan satu ketukan.

DIBUAT UNTUK SEMUA ORANG DI TAIWAN
Tersedia dalam Bahasa Inggris, Mandarin Tradisional, dan Bahasa Indonesia, dengan dukungan tema terang/gelap otomatis serta tata letak yang menyesuaikan dari ponsel hingga tablet.

PRIVASI SEJAK AWAL
Tanpa akun, tanpa login, tanpa iklan, dan tanpa pengumpulan data pribadi. Semua yang Anda simpan tetap berada di perangkat Anda.

Kota yang didukung: Taipei, New Taipei (Banqiao), Taoyuan, Hsinchu, Miaoli, Taichung, Changhua, Yunlin, Chiayi, Tainan, Kaohsiung, dan Keelung.
```

**What's New in This Version** (v1.0.0)
```
Rilis pertama: cari dan bandingkan tarif transportasi Taiwan (HSR, TRA, MRT, Bus, YouBike), simpan rute favorit, lihat riwayat, dan gunakan sepenuhnya secara offline.
```
