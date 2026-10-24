// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Chinese (`zh`).
class AppLocalizationsZh extends AppLocalizations {
  AppLocalizationsZh([String locale = 'zh']) : super(locale);

  @override
  String get appTitle => '台灣票價查詢';

  @override
  String get tabSearch => '查詢';

  @override
  String get tabCompare => '比較';

  @override
  String get tabSaved => '收藏';

  @override
  String get settings => '設定';

  @override
  String get origin => '起點';

  @override
  String get destination => '終點';

  @override
  String get swap => '交換';

  @override
  String get transportMode => '交通方式';

  @override
  String get transportModes => '交通方式';

  @override
  String get searchFares => '查詢票價';

  @override
  String get compareFares => '比較票價';

  @override
  String get results => '結果';

  @override
  String get noResults => '尚無結果';

  @override
  String get searchEmptyPickTitle => '先選路線';

  @override
  String get searchEmptyPickBody => '選好從哪裡出發、要去哪裡，以及怎麼去。';

  @override
  String get searchEmptyReadyTitle => '準備好了';

  @override
  String get searchEmptyReadyBody => '按「查詢票價」就能看到票價和時間。';

  @override
  String get searchEmptyNoResultsTitle => '找不到結果';

  @override
  String get searchEmptyNoResultsBody => '換條路線或交通方式試試。';

  @override
  String get offlineNoCache => '這條路線還沒有儲存的結果。連上網路查一次，之後離線也看得到。';

  @override
  String get showingCachedResults => '連不上伺服器，先顯示你儲存的結果。';

  @override
  String get manageOfflineData => '管理離線資料';

  @override
  String get manageOfflineDataBody => '查看哪些資料存起來供離線使用，隨時都能清除。';

  @override
  String get cachedQueries => '已存的查詢';

  @override
  String get cachedResults => '已存的票價';

  @override
  String get clearOfflineData => '清除離線資料';

  @override
  String get adult => '成人';

  @override
  String get student => '學生';

  @override
  String get child => '孩童';

  @override
  String get senior => '敬老';

  @override
  String get minutesShort => '分';

  @override
  String get kmShort => '公里';

  @override
  String get favorite => '加入收藏';

  @override
  String get unfavorite => '取消收藏';

  @override
  String get favorites => '我的收藏';

  @override
  String get history => '搜尋紀錄';

  @override
  String get emptyFavorites => '還沒有收藏的路線';

  @override
  String get emptyFavoritesBody => '在查詢結果上按書籤圖示，就能把路線收藏在這裡。';

  @override
  String get emptyHistory => '還沒有紀錄';

  @override
  String get emptyHistoryBody => '你查過的路線會出現在這裡。';

  @override
  String get rerun => '再查一次';

  @override
  String get delete => '刪除';

  @override
  String get clear => '清除';

  @override
  String get clearAll => '全部清除';

  @override
  String get language => '語言';

  @override
  String get theme => '外觀';

  @override
  String get themeSystem => '系統';

  @override
  String get themeLight => '淺色';

  @override
  String get themeDark => '深色';

  @override
  String get dataMode => '資料來源';

  @override
  String get dataModeBody =>
      '模擬資料是虛構但固定的票價，離線也能用。API 模式會從 TDX 取得高鐵與台鐵的真實票價，其他交通方式仍使用模擬資料。';

  @override
  String get dataModeMock => '模擬';

  @override
  String get dataModeApi => 'API（高鐵 & 台鐵）';

  @override
  String get offlineMode => '離線模式';

  @override
  String get offlineModeBody => '只顯示你查過的票價，不會連網取得或產生新資料。';

  @override
  String get dataManagement => '資料管理';

  @override
  String get clearCache => '清除票價快取';

  @override
  String get clearHistory => '清除搜尋紀錄';

  @override
  String get clearFavorites => '清除收藏路線';

  @override
  String get cancel => '取消';

  @override
  String get confirm => '確認';

  @override
  String get confirmDialogBody => '這個動作無法復原。';

  @override
  String get cleared => '已清除';

  @override
  String get settingsLanguageEnglish => 'English';

  @override
  String get settingsLanguageChineseHant => '繁體中文';

  @override
  String get settingsLanguageIndonesian => 'Bahasa Indonesia';

  @override
  String get modesHSR => '高鐵';

  @override
  String get modesTRA => '台鐵';

  @override
  String get modesMRT => '捷運';

  @override
  String get modesBus => '公車';

  @override
  String get modesYouBike => 'YouBike';

  @override
  String get compareHint => '選幾種交通方式，就能並排比較價格和時間。';

  @override
  String get pickRouteFirst => '請先選路線';

  @override
  String get searchDisabledHelper => '選好起點、終點和交通方式後再查詢。';

  @override
  String get compareDisabledHelper => '選好起點、終點，並至少選一種交通方式後再比較。';

  @override
  String get locationPickerSearchTitle => '搜尋地點';

  @override
  String get locationPickerCtaChoose => '選擇地點';

  @override
  String get locationPickerRecentTitle => '最近地點';

  @override
  String get locationPickerPopularTitle => '熱門地點';

  @override
  String get locationPickerBrowseByCity => '依城市瀏覽';

  @override
  String get locationPickerNoResultsTitle => '沒有符合的地點';

  @override
  String get locationPickerNoResultsBody => '試試其他名稱，或輸入英文名稱。';

  @override
  String get lastUpdated => '更新時間';

  @override
  String get sourceMock => '模擬';

  @override
  String get sourceCached => '快取';

  @override
  String get sourceLive => '即時';

  @override
  String get routeNotServedTitle => '此路線無此服務';

  @override
  String routeNotServedBody(Object mode) {
    return '$mode在出發地或目的地沒有車站，請改選其他交通方式。';
  }

  @override
  String routeNotServedList(Object modes) {
    return '此路線未提供服務：$modes';
  }

  @override
  String get estimatedShort => '估算';

  @override
  String get transferDirect => '直達';

  @override
  String get transferOne => '1 次轉乘';

  @override
  String get transferOneToTwo => '1–2 次轉乘';

  @override
  String get transferDockSwap => '途中換車';

  @override
  String get errorTitle => '無法取得票價';

  @override
  String get errorSearchFailed => '請檢查網路連線後再試一次。';

  @override
  String get retry => '重試';

  @override
  String compareSelectedCountLabel(Object count) {
    return '已選擇：$count';
  }

  @override
  String get selectAll => '全選';

  @override
  String get compareSortLabel => '排序依據';

  @override
  String get compareSortCheapest => '最便宜';

  @override
  String get compareSortFastest => '最快';

  @override
  String get compareSortFewestTransfers => '最少轉乘';

  @override
  String get privacy => '隱私';

  @override
  String get privacyBody => '你查詢和收藏的內容都只存在這台裝置上。不需要帳號，App 也不會追蹤你。';

  @override
  String get privacyReadMore => '查看更多';

  @override
  String get about => '關於';

  @override
  String get aboutVersion => '版本';

  @override
  String get aboutDataSource => '資料來源';

  @override
  String get notFoundTitle => '找不到頁面';

  @override
  String get notFoundBody => '找不到這個頁面。';

  @override
  String get notFoundBackToSearch => '返回查詢';

  @override
  String get termsOfUse => '使用條款';

  @override
  String get termsLastUpdated => '最後更新：2026年10月15日';

  @override
  String get termsIntro =>
      '本《使用條款》（以下稱「條款」）規範您使用「台灣票價查詢」（以下稱「本應用程式」）的行為。使用本應用程式即表示您同意本條款；如不同意，請勿使用本應用程式。';

  @override
  String get termsSection1Title => '條款的接受';

  @override
  String get termsSection1Body =>
      '下載、安裝或使用「台灣票價查詢」，即表示您完全接受本條款。我們可能不時更新本條款；於更新後繼續使用本應用程式，即表示您接受修訂後的條款。';

  @override
  String get termsSection2Title => '服務內容';

  @override
  String get termsSection2Body =>
      '「台灣票價查詢」是一款用於查詢、比較並收藏台灣大眾運輸票價的資訊工具。本應用程式不販售車票、不處理付款，也不連接任何運輸業者的訂票系統。';

  @override
  String get termsSection3Title => '票價準確性與資料來源';

  @override
  String get termsSection3Body =>
      '開啟 API 模式時，本應用程式的高鐵與台鐵票價取自交通部 TDX 運輸資料流通服務平台。捷運、公車、YouBike 的票價，以及高鐵與台鐵的學生票價，都是本應用程式自行估算的數字，並非官方定價。任何票價與時間都可能過期或有誤，出發前請以各運輸業者公告為準。';

  @override
  String get termsSection4Title => '使用規範';

  @override
  String get termsSection4Body =>
      '本應用程式僅供個人、非商業用途使用。您同意不濫用本應用程式或其後端服務，例如發送大量自動化請求、嘗試取得 API 憑證，或干擾本應用程式的正常運作。';

  @override
  String get termsSection5Title => '免責聲明與責任限制';

  @override
  String get termsSection5Body =>
      '本應用程式係以「現狀」及「現有」方式提供，不提供任何明示或默示的保證，包括準確性、可靠性或特定用途之適用性。在法律允許的最大範圍內，我們對因使用本應用程式而產生的任何損失或損害（包括錯過班次或票價落差）概不負責。';

  @override
  String get termsSection6Title => '第三方服務';

  @override
  String get termsSection6Body =>
      '即時的高鐵與台鐵票價資料，係取自由交通部營運的 TDX 運輸資料流通服務平台（tdx.transportdata.tw）。該平台資料之使用，受其自身條款規範，非我們所能控制。';

  @override
  String get termsSection7Title => '條款變更';

  @override
  String get termsSection7Body => '隨著本應用程式更新，我們可能修訂本條款。上方的「最後更新」日期即為最近一次修訂的時間。';

  @override
  String get termsSection8Title => '聯絡我們';

  @override
  String get termsSection8Body => '對本條款有疑問嗎？請寄信至 maxfelix05@gmail.com。';

  @override
  String get privacyPolicyTitle => '隱私權政策';

  @override
  String get privacyLastUpdated => '最後更新：2026年10月15日';

  @override
  String get privacyPolicyIntro =>
      '「台灣票價查詢」不需要註冊帳號、沒有登入機制，也不會將您的任何資料保存在伺服器上。本政策說明本應用程式會處理的少量資料，以及這些資料的流向。';

  @override
  String get privacySection1Title => '儲存於您裝置上的資料';

  @override
  String get privacySection1Body =>
      '您的搜尋紀錄、收藏路線、快取的票價結果，以及應用程式設定（語言、外觀、離線模式、資料來源）皆以標準應用程式儲存方式，儲存在您的裝置本機，不會上傳至任何地方。';

  @override
  String get privacySection2Title => '會傳送哪些資料、傳給誰';

  @override
  String get privacySection2Body =>
      '在「模擬」資料模式下，您搜尋的任何內容都不會離開您的裝置。在「API」資料模式下，高鐵與台鐵查詢的起訖站代碼會傳送至我們的小型中繼伺服器（架設於 Cloudflare 的代理），再由其轉送至交通部 TDX 運輸資料流通服務平台以取得真實票價。中繼伺服器保管 TDX 存取金鑰，因此金鑰不會內建於應用程式中；它會將票價資料暫存數小時以加快速度，但不會記錄是誰發出請求。這些請求不會附帶任何姓名、帳號或裝置識別碼，因為本應用程式沒有這類資訊可傳送。如同任何網路請求，傳輸過程中的網路可看見您的 IP 位址。';

  @override
  String get privacySection3Title => '使用分析';

  @override
  String get privacySection3Body =>
      '本應用程式會在您自己裝置的開發者紀錄中寫入少數事件名稱，用於除錯，不會傳送到任何地方。如果日後加入真正的分析功能，我們會先徵求您的同意。';

  @override
  String get privacySection4Title => '兒童隱私';

  @override
  String get privacySection4Body => '本應用程式不向任何人（包括兒童）蒐集個人資料，適合所有年齡層使用。';

  @override
  String get privacySection5Title => '您的選擇與資料刪除';

  @override
  String get privacySection5Body =>
      '您可以隨時清除快取票價（設定 → 管理離線資料），以及搜尋紀錄或收藏路線（設定 → 資料管理）。解除安裝本應用程式，就會刪除它存在您裝置上的所有資料。';

  @override
  String get privacySection6Title => '政策變更';

  @override
  String get privacySection6Body =>
      '隨著本應用程式的發展，我們可能更新本隱私權政策。上方「最後更新」日期即為最近一次修訂時間。';

  @override
  String get privacySection7Title => '聯絡我們';

  @override
  String get privacySection7Body => '對本隱私權政策有疑問嗎？請寄信至 maxfelix05@gmail.com。';
}

/// The translations for Chinese, using the Han script (`zh_Hant`).
class AppLocalizationsZhHant extends AppLocalizationsZh {
  AppLocalizationsZhHant() : super('zh_Hant');

  @override
  String get appTitle => '台灣票價查詢';

  @override
  String get tabSearch => '查詢';

  @override
  String get tabCompare => '比較';

  @override
  String get tabSaved => '收藏';

  @override
  String get settings => '設定';

  @override
  String get origin => '起點';

  @override
  String get destination => '終點';

  @override
  String get swap => '交換';

  @override
  String get transportMode => '交通方式';

  @override
  String get transportModes => '交通方式';

  @override
  String get searchFares => '查詢票價';

  @override
  String get compareFares => '比較票價';

  @override
  String get results => '結果';

  @override
  String get noResults => '尚無結果';

  @override
  String get searchEmptyPickTitle => '先選路線';

  @override
  String get searchEmptyPickBody => '選好從哪裡出發、要去哪裡，以及怎麼去。';

  @override
  String get searchEmptyReadyTitle => '準備好了';

  @override
  String get searchEmptyReadyBody => '按「查詢票價」就能看到票價和時間。';

  @override
  String get searchEmptyNoResultsTitle => '找不到結果';

  @override
  String get searchEmptyNoResultsBody => '換條路線或交通方式試試。';

  @override
  String get offlineNoCache => '這條路線還沒有儲存的結果。連上網路查一次，之後離線也看得到。';

  @override
  String get showingCachedResults => '連不上伺服器，先顯示你儲存的結果。';

  @override
  String get manageOfflineData => '管理離線資料';

  @override
  String get manageOfflineDataBody => '查看哪些資料存起來供離線使用，隨時都能清除。';

  @override
  String get cachedQueries => '已存的查詢';

  @override
  String get cachedResults => '已存的票價';

  @override
  String get clearOfflineData => '清除離線資料';

  @override
  String get adult => '成人';

  @override
  String get student => '學生';

  @override
  String get child => '孩童';

  @override
  String get senior => '敬老';

  @override
  String get minutesShort => '分';

  @override
  String get kmShort => '公里';

  @override
  String get favorite => '加入收藏';

  @override
  String get unfavorite => '取消收藏';

  @override
  String get favorites => '我的收藏';

  @override
  String get history => '搜尋紀錄';

  @override
  String get emptyFavorites => '還沒有收藏的路線';

  @override
  String get emptyFavoritesBody => '在查詢結果上按書籤圖示，就能把路線收藏在這裡。';

  @override
  String get emptyHistory => '還沒有紀錄';

  @override
  String get emptyHistoryBody => '你查過的路線會出現在這裡。';

  @override
  String get rerun => '再查一次';

  @override
  String get delete => '刪除';

  @override
  String get clear => '清除';

  @override
  String get clearAll => '全部清除';

  @override
  String get language => '語言';

  @override
  String get theme => '外觀';

  @override
  String get themeSystem => '系統';

  @override
  String get themeLight => '淺色';

  @override
  String get themeDark => '深色';

  @override
  String get dataMode => '資料來源';

  @override
  String get dataModeBody =>
      '模擬資料是虛構但固定的票價，離線也能用。API 模式會從 TDX 取得高鐵與台鐵的真實票價，其他交通方式仍使用模擬資料。';

  @override
  String get dataModeMock => '模擬';

  @override
  String get dataModeApi => 'API（高鐵 & 台鐵）';

  @override
  String get offlineMode => '離線模式';

  @override
  String get offlineModeBody => '只顯示你查過的票價，不會連網取得或產生新資料。';

  @override
  String get dataManagement => '資料管理';

  @override
  String get clearCache => '清除票價快取';

  @override
  String get clearHistory => '清除搜尋紀錄';

  @override
  String get clearFavorites => '清除收藏路線';

  @override
  String get cancel => '取消';

  @override
  String get confirm => '確認';

  @override
  String get confirmDialogBody => '這個動作無法復原。';

  @override
  String get cleared => '已清除';

  @override
  String get settingsLanguageEnglish => 'English';

  @override
  String get settingsLanguageChineseHant => '繁體中文';

  @override
  String get settingsLanguageIndonesian => 'Bahasa Indonesia';

  @override
  String get modesHSR => '高鐵';

  @override
  String get modesTRA => '台鐵';

  @override
  String get modesMRT => '捷運';

  @override
  String get modesBus => '公車';

  @override
  String get modesYouBike => 'YouBike';

  @override
  String get compareHint => '選幾種交通方式，就能並排比較價格和時間。';

  @override
  String get pickRouteFirst => '請先選路線';

  @override
  String get searchDisabledHelper => '選好起點、終點和交通方式後再查詢。';

  @override
  String get compareDisabledHelper => '選好起點、終點，並至少選一種交通方式後再比較。';

  @override
  String get locationPickerSearchTitle => '搜尋地點';

  @override
  String get locationPickerCtaChoose => '選擇地點';

  @override
  String get locationPickerRecentTitle => '最近地點';

  @override
  String get locationPickerPopularTitle => '熱門地點';

  @override
  String get locationPickerBrowseByCity => '依城市瀏覽';

  @override
  String get locationPickerNoResultsTitle => '沒有符合的地點';

  @override
  String get locationPickerNoResultsBody => '試試其他名稱，或輸入英文名稱。';

  @override
  String get lastUpdated => '更新時間';

  @override
  String get sourceMock => '模擬';

  @override
  String get sourceCached => '快取';

  @override
  String get sourceLive => '即時';

  @override
  String get routeNotServedTitle => '此路線無此服務';

  @override
  String routeNotServedBody(Object mode) {
    return '$mode在出發地或目的地沒有車站，請改選其他交通方式。';
  }

  @override
  String routeNotServedList(Object modes) {
    return '此路線未提供服務：$modes';
  }

  @override
  String get estimatedShort => '估算';

  @override
  String get transferDirect => '直達';

  @override
  String get transferOne => '1 次轉乘';

  @override
  String get transferOneToTwo => '1–2 次轉乘';

  @override
  String get transferDockSwap => '途中換車';

  @override
  String get errorTitle => '無法取得票價';

  @override
  String get errorSearchFailed => '請檢查網路連線後再試一次。';

  @override
  String get retry => '重試';

  @override
  String compareSelectedCountLabel(Object count) {
    return '已選擇：$count';
  }

  @override
  String get selectAll => '全選';

  @override
  String get compareSortLabel => '排序依據';

  @override
  String get compareSortCheapest => '最便宜';

  @override
  String get compareSortFastest => '最快';

  @override
  String get compareSortFewestTransfers => '最少轉乘';

  @override
  String get privacy => '隱私';

  @override
  String get privacyBody => '你查詢和收藏的內容都只存在這台裝置上。不需要帳號，App 也不會追蹤你。';

  @override
  String get privacyReadMore => '查看更多';

  @override
  String get about => '關於';

  @override
  String get aboutVersion => '版本';

  @override
  String get aboutDataSource => '資料來源';

  @override
  String get notFoundTitle => '找不到頁面';

  @override
  String get notFoundBody => '找不到這個頁面。';

  @override
  String get notFoundBackToSearch => '返回查詢';

  @override
  String get termsOfUse => '使用條款';

  @override
  String get termsLastUpdated => '最後更新：2026年10月15日';

  @override
  String get termsIntro =>
      '本《使用條款》（以下稱「條款」）規範您使用「台灣票價查詢」（以下稱「本應用程式」）的行為。使用本應用程式即表示您同意本條款；如不同意，請勿使用本應用程式。';

  @override
  String get termsSection1Title => '條款的接受';

  @override
  String get termsSection1Body =>
      '下載、安裝或使用「台灣票價查詢」，即表示您完全接受本條款。我們可能不時更新本條款；於更新後繼續使用本應用程式，即表示您接受修訂後的條款。';

  @override
  String get termsSection2Title => '服務內容';

  @override
  String get termsSection2Body =>
      '「台灣票價查詢」是一款用於查詢、比較並收藏台灣大眾運輸票價的資訊工具。本應用程式不販售車票、不處理付款，也不連接任何運輸業者的訂票系統。';

  @override
  String get termsSection3Title => '票價準確性與資料來源';

  @override
  String get termsSection3Body =>
      '開啟 API 模式時，本應用程式的高鐵與台鐵票價取自交通部 TDX 運輸資料流通服務平台。捷運、公車、YouBike 的票價，以及高鐵與台鐵的學生票價，都是本應用程式自行估算的數字，並非官方定價。任何票價與時間都可能過期或有誤，出發前請以各運輸業者公告為準。';

  @override
  String get termsSection4Title => '使用規範';

  @override
  String get termsSection4Body =>
      '本應用程式僅供個人、非商業用途使用。您同意不濫用本應用程式或其後端服務，例如發送大量自動化請求、嘗試取得 API 憑證，或干擾本應用程式的正常運作。';

  @override
  String get termsSection5Title => '免責聲明與責任限制';

  @override
  String get termsSection5Body =>
      '本應用程式係以「現狀」及「現有」方式提供，不提供任何明示或默示的保證，包括準確性、可靠性或特定用途之適用性。在法律允許的最大範圍內，我們對因使用本應用程式而產生的任何損失或損害（包括錯過班次或票價落差）概不負責。';

  @override
  String get termsSection6Title => '第三方服務';

  @override
  String get termsSection6Body =>
      '即時的高鐵與台鐵票價資料，係取自由交通部營運的 TDX 運輸資料流通服務平台（tdx.transportdata.tw）。該平台資料之使用，受其自身條款規範，非我們所能控制。';

  @override
  String get termsSection7Title => '條款變更';

  @override
  String get termsSection7Body => '隨著本應用程式更新，我們可能修訂本條款。上方的「最後更新」日期即為最近一次修訂的時間。';

  @override
  String get termsSection8Title => '聯絡我們';

  @override
  String get termsSection8Body => '對本條款有疑問嗎？請寄信至 maxfelix05@gmail.com。';

  @override
  String get privacyPolicyTitle => '隱私權政策';

  @override
  String get privacyLastUpdated => '最後更新：2026年10月15日';

  @override
  String get privacyPolicyIntro =>
      '「台灣票價查詢」不需要註冊帳號、沒有登入機制，也不會將您的任何資料保存在伺服器上。本政策說明本應用程式會處理的少量資料，以及這些資料的流向。';

  @override
  String get privacySection1Title => '儲存於您裝置上的資料';

  @override
  String get privacySection1Body =>
      '您的搜尋紀錄、收藏路線、快取的票價結果，以及應用程式設定（語言、外觀、離線模式、資料來源）皆以標準應用程式儲存方式，儲存在您的裝置本機，不會上傳至任何地方。';

  @override
  String get privacySection2Title => '會傳送哪些資料、傳給誰';

  @override
  String get privacySection2Body =>
      '在「模擬」資料模式下，您搜尋的任何內容都不會離開您的裝置。在「API」資料模式下，高鐵與台鐵查詢的起訖站代碼會傳送至我們的小型中繼伺服器（架設於 Cloudflare 的代理），再由其轉送至交通部 TDX 運輸資料流通服務平台以取得真實票價。中繼伺服器保管 TDX 存取金鑰，因此金鑰不會內建於應用程式中；它會將票價資料暫存數小時以加快速度，但不會記錄是誰發出請求。這些請求不會附帶任何姓名、帳號或裝置識別碼，因為本應用程式沒有這類資訊可傳送。如同任何網路請求，傳輸過程中的網路可看見您的 IP 位址。';

  @override
  String get privacySection3Title => '使用分析';

  @override
  String get privacySection3Body =>
      '本應用程式會在您自己裝置的開發者紀錄中寫入少數事件名稱，用於除錯，不會傳送到任何地方。如果日後加入真正的分析功能，我們會先徵求您的同意。';

  @override
  String get privacySection4Title => '兒童隱私';

  @override
  String get privacySection4Body => '本應用程式不向任何人（包括兒童）蒐集個人資料，適合所有年齡層使用。';

  @override
  String get privacySection5Title => '您的選擇與資料刪除';

  @override
  String get privacySection5Body =>
      '您可以隨時清除快取票價（設定 → 管理離線資料），以及搜尋紀錄或收藏路線（設定 → 資料管理）。解除安裝本應用程式，就會刪除它存在您裝置上的所有資料。';

  @override
  String get privacySection6Title => '政策變更';

  @override
  String get privacySection6Body =>
      '隨著本應用程式的發展，我們可能更新本隱私權政策。上方「最後更新」日期即為最近一次修訂時間。';

  @override
  String get privacySection7Title => '聯絡我們';

  @override
  String get privacySection7Body => '對本隱私權政策有疑問嗎？請寄信至 maxfelix05@gmail.com。';
}
