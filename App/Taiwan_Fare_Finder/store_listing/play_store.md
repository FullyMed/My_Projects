# Google Play Console listing

Copy for Play Console → Store presence → Main store listing, one language tab per locale below. Paste each block into the matching field. The counts next to each field are character counts, so you can check them against Play's limits before you submit. Nothing in this file affects the app.

Play has no separate keywords field. It ranks on the title and both descriptions, so the terms from the keyword lists in [`app_store.md`](app_store.md) already appear in the descriptions below.

Still needed before you submit:
- Privacy Policy URL (required). The text already exists in the app (`lib/pages/privacy_page.dart`, strings under the `privacy*` keys in the ARB files). Host the same content at a public URL and paste that URL here. [`SECURITY.md`](../SECURITY.md) explains why the app collects no personal data.
- Contact email. The in-app pages use `maxfelix05@gmail.com` for now. A dedicated support address would be better before a wide release.
- Category: Travel & Local (suggested, not confirmed yet).
- Content rating questionnaire. Expect Everyone: no objectionable content, no user-generated content, no accounts.
- Price: Free. The app has no in-app purchases.

The package name is already set to `com.felix.taiwanfarefinder` (`android/app/build.gradle`).

---

## English (en-US)

| Field | Limit | Value |
|---|---|---|
| App name | 30 | `Taiwan Fare Finder` (18) |
| Short description | 80 | see below |
| Full description | 4000 | see below |

**Short description**
```
Compare HSR, TRA, MRT, bus and YouBike fares across Taiwan.
```

**Full description**
```
Taiwan Fare Finder shows you what a trip across Taiwan costs before you go. Pick where you're starting and where you're headed, and you'll see the fare for adults, students, children and seniors, plus a rough travel time.

Compare modes
Put High Speed Rail (HSR), Taiwan Railway (TRA), MRT, bus and YouBike side by side and sort them by price, travel time or number of transfers.

Real HSR and TRA fares
HSR and TRA fares come from TDX, Taiwan's official transport open-data platform. Child and senior prices are the real concession fares. MRT, bus and YouBike prices are still estimates, and the app labels them that way.

Works offline
The app keeps your last 100 searches. Turn on offline mode and you can still check them with no signal, in a tunnel or on a mountain line.

Saved routes and history
Bookmark the trips you take often. Your recent searches stay in the list too, so running one again takes a single tap.

Three languages
English, Traditional Chinese and Indonesian, with light and dark themes and layouts for phones and tablets.

Private
No account, no login, no ads. The app doesn't collect personal data, and everything you save stays on your device.

Cities: Taipei, New Taipei (Banqiao), Taoyuan, Hsinchu, Miaoli, Taichung, Changhua, Yunlin, Chiayi, Tainan, Kaohsiung and Keelung.
```

**Release notes** (v1.0.0, 500 characters max per language)
```
First release. Look up and compare HSR, TRA, MRT, bus and YouBike fares, save the routes you use often, and check saved results offline.
```

---

## Chinese, Traditional (Taiwan, zh-TW)

| Field | Limit | Value |
|---|---|---|
| App name | 30 | `台灣票價查詢` (6) |
| Short description | 80 | see below |
| Full description | 4000 | see below |

**Short description**
```
查詢並比較高鐵、台鐵、捷運、公車與 YouBike 票價
```

**Full description**
```
「台灣票價查詢」讓你出發前就知道一趟車要花多少錢。選好起點和終點，就能看到成人、學生、孩童、敬老的票價，以及大概的搭乘時間。

比較交通方式
把高鐵、台鐵、捷運、公車和 YouBike 放在一起看，可依價格、時間或轉乘次數排序。

真實的高鐵、台鐵票價
高鐵與台鐵票價來自交通部 TDX 運輸資料流通服務平台，孩童和敬老票都是實際的優待票價。捷運、公車和 YouBike 目前是估算值，App 裡也會標示出來。

離線也能查
App 會保留你最近 100 次的查詢結果。開啟離線模式後，在隧道裡或山區沒有訊號時也看得到。

收藏路線與紀錄
常搭的路線可以加入收藏，最近的查詢也會留著，再查一次只要點一下。

三種語言
英文、繁體中文和印尼文，有淺色和深色主題，手機和平板都能用。

重視隱私
不需要帳號、不用登入、沒有廣告。App 不蒐集個人資料，你存的東西都只留在你的裝置上。

支援城市：台北、新北（板橋）、桃園、新竹、苗栗、台中、彰化、雲林、嘉義、台南、高雄、基隆。
```

**Release notes** (v1.0.0, 500 characters max per language)
```
首次上線：查詢並比較高鐵、台鐵、捷運、公車和 YouBike 的票價，收藏常用路線，離線時也能查看查過的結果。
```

---

## Indonesian (id)

| Field | Limit | Value |
|---|---|---|
| App name | 30 | `Pencari Tarif Taiwan` (20) |
| Short description | 80 | see below |
| Full description | 4000 | see below |

**Short description**
```
Bandingkan tarif HSR, TRA, MRT, bus, dan YouBike di Taiwan.
```

**Full description**
```
Pencari Tarif Taiwan menunjukkan berapa biaya perjalanan Anda di Taiwan sebelum berangkat. Pilih asal dan tujuan, lalu lihat tarif untuk dewasa, pelajar, anak, dan lansia, beserta perkiraan waktu tempuh.

Bandingkan moda
Lihat High Speed Rail (HSR), Taiwan Railway (TRA), MRT, bus, dan YouBike berdampingan, lalu urutkan berdasarkan harga, waktu tempuh, atau jumlah transit.

Tarif HSR dan TRA asli
Tarif HSR dan TRA berasal dari TDX, platform data terbuka resmi transportasi Taiwan. Harga anak dan lansia adalah tarif konsesi yang sebenarnya. Harga MRT, bus, dan YouBike masih berupa perkiraan, dan aplikasi menandainya seperti itu.

Bisa offline
Aplikasi menyimpan 100 pencarian terakhir Anda. Nyalakan mode offline, dan Anda tetap bisa melihatnya saat tidak ada sinyal, misalnya di terowongan atau di jalur pegunungan.

Rute tersimpan dan riwayat
Simpan perjalanan yang sering Anda lakukan. Pencarian terakhir juga tetap ada di daftar, jadi mengulanginya cukup dengan satu ketukan.

Tiga bahasa
Inggris, Mandarin Tradisional, dan Indonesia, dengan tema terang dan gelap serta tampilan untuk ponsel dan tablet.

Privat
Tanpa akun, tanpa login, tanpa iklan. Aplikasi tidak mengumpulkan data pribadi, dan semua yang Anda simpan tetap ada di perangkat Anda.

Kota: Taipei, New Taipei (Banqiao), Taoyuan, Hsinchu, Miaoli, Taichung, Changhua, Yunlin, Chiayi, Tainan, Kaohsiung, dan Keelung.
```

**Release notes** (v1.0.0, 500 characters max per language)
```
Rilis pertama: cari dan bandingkan tarif HSR, TRA, MRT, bus, dan YouBike, simpan rute yang sering dipakai, dan lihat hasil tersimpan saat offline.
```
