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
  String get noResultsBody => '選擇起點、終點與交通方式即可查看票價。';

  @override
  String get searchEmptyPickTitle => '先選擇路線';

  @override
  String get searchEmptyPickBody => '請選擇起點、終點與交通方式。';

  @override
  String get searchEmptyReadyTitle => '準備好了';

  @override
  String get searchEmptyReadyBody => '按下「查詢票價」即可查看票價與時間。';

  @override
  String get searchEmptyNoResultsTitle => '找不到結果';

  @override
  String get searchEmptyNoResultsBody => '請改用其他路線或重新確認選項。';

  @override
  String get offlineNoCache => '目前沒有可離線使用的結果。請先在線查詢一次以儲存結果。';

  @override
  String get offlineDataBadge => '離線資料';

  @override
  String get showingCachedResults => '正在顯示已儲存的結果。';

  @override
  String get manageOfflineData => '管理離線資料';

  @override
  String get manageOfflineDataBody => '查看已儲存的離線資料，並可隨時清除。';

  @override
  String get cachedQueries => '快取路線';

  @override
  String get cachedResults => '快取結果';

  @override
  String get clearOfflineData => '清除離線資料';

  @override
  String get duration => '時間';

  @override
  String get transfers => '轉乘';

  @override
  String get fareByCategory => '各族群票價';

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
  String get emptyFavorites => '還沒有收藏';

  @override
  String get emptyFavoritesBody => '還沒有收藏。先儲存一條路線，之後就能快速開啟。';

  @override
  String get emptyHistory => '還沒有紀錄';

  @override
  String get emptyHistoryBody => '還沒有搜尋紀錄。你的查詢會出現在這裡。';

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
  String get dataModeBody => '模擬資料穩定且可離線使用；API 模式保留給未來的真實串接。';

  @override
  String get dataModeMock => '模擬';

  @override
  String get dataModeApi => 'API（即將推出）';

  @override
  String get offlineMode => '離線模式';

  @override
  String get offlineModeBody => '僅顯示已快取的票價；不會產生新的模擬資料。';

  @override
  String get dataManagement => '資料管理';

  @override
  String get clearCache => '清除票價快取';

  @override
  String get clearHistory => '清除搜尋紀錄';

  @override
  String get clearFavorites => '清除收藏';

  @override
  String get cancel => '取消';

  @override
  String get confirm => '確認';

  @override
  String get confirmDialogBody => '確定要執行此操作嗎？此動作無法復原。';

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
  String get compareHint => '可選多種交通方式，並排比較票價與時間。';

  @override
  String get selectAtLeastOneMode => '至少選擇一種方式';

  @override
  String get pickRouteFirst => '請先選擇路線';

  @override
  String get searchDisabledHelper => '請先選擇起點、終點與交通方式後再查詢。';

  @override
  String get compareDisabledHelper => '請先選擇起點、終點並至少選一種交通方式後再比較。';

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
  String get locationPickerNoResultsTitle => '找不到地點';

  @override
  String get locationPickerNoResultsBody => '請嘗試以名稱或城市搜尋';

  @override
  String get lastUpdated => '更新時間';

  @override
  String get sourceMock => '模擬';

  @override
  String get sourceCached => '快取';

  @override
  String get sourceLive => '即時';

  @override
  String get transferDirect => '直達';

  @override
  String get transferOne => '1 次轉乘';

  @override
  String get transferOneToTwo => '1–2 次轉乘';

  @override
  String get transferDockSwap => '建議更換停靠站';

  @override
  String get errorTitle => '發生錯誤';

  @override
  String get errorSearchFailed => '目前無法載入票價，請稍後再試。';

  @override
  String get errorApiNotReady => '目前尚未提供 API 模式，請到設定切回「模擬」。';

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
  String get privacyBody => '你的搜尋、收藏、紀錄與快取結果只會儲存在本機裝置。不需要帳號。預設不進行追蹤。';

  @override
  String get privacyReadMore => '查看更多';

  @override
  String get about => '關於';

  @override
  String get aboutVersion => '版本';

  @override
  String get aboutDataSource => '資料來源';
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
  String get noResultsBody => '選擇起點、終點與交通方式即可查看票價。';

  @override
  String get searchEmptyPickTitle => '先選擇路線';

  @override
  String get searchEmptyPickBody => '請選擇起點、終點與交通方式。';

  @override
  String get searchEmptyReadyTitle => '準備好了';

  @override
  String get searchEmptyReadyBody => '按下「查詢票價」即可查看票價與時間。';

  @override
  String get searchEmptyNoResultsTitle => '找不到結果';

  @override
  String get searchEmptyNoResultsBody => '請改用其他路線或重新確認選項。';

  @override
  String get offlineNoCache => '目前沒有可離線使用的結果。請先在線查詢一次以儲存結果。';

  @override
  String get offlineDataBadge => '離線資料';

  @override
  String get showingCachedResults => '正在顯示已儲存的結果。';

  @override
  String get manageOfflineData => '管理離線資料';

  @override
  String get manageOfflineDataBody => '查看已儲存的離線資料，並可隨時清除。';

  @override
  String get cachedQueries => '快取路線';

  @override
  String get cachedResults => '快取結果';

  @override
  String get clearOfflineData => '清除離線資料';

  @override
  String get duration => '時間';

  @override
  String get transfers => '轉乘';

  @override
  String get fareByCategory => '各族群票價';

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
  String get emptyFavorites => '還沒有收藏';

  @override
  String get emptyFavoritesBody => '還沒有收藏。先儲存一條路線，之後就能快速開啟。';

  @override
  String get emptyHistory => '還沒有紀錄';

  @override
  String get emptyHistoryBody => '還沒有搜尋紀錄。你的查詢會出現在這裡。';

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
  String get dataModeBody => '模擬資料穩定且可離線使用；API 模式保留給未來的真實串接。';

  @override
  String get dataModeMock => '模擬';

  @override
  String get dataModeApi => 'API（即將推出）';

  @override
  String get offlineMode => '離線模式';

  @override
  String get offlineModeBody => '僅顯示已快取的票價；不會產生新的模擬資料。';

  @override
  String get dataManagement => '資料管理';

  @override
  String get clearCache => '清除票價快取';

  @override
  String get clearHistory => '清除搜尋紀錄';

  @override
  String get clearFavorites => '清除收藏';

  @override
  String get cancel => '取消';

  @override
  String get confirm => '確認';

  @override
  String get confirmDialogBody => '確定要執行此操作嗎？此動作無法復原。';

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
  String get compareHint => '可選多種交通方式，並排比較票價與時間。';

  @override
  String get selectAtLeastOneMode => '至少選擇一種方式';

  @override
  String get pickRouteFirst => '請先選擇路線';

  @override
  String get searchDisabledHelper => '請先選擇起點、終點與交通方式後再查詢。';

  @override
  String get compareDisabledHelper => '請先選擇起點、終點並至少選一種交通方式後再比較。';

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
  String get locationPickerNoResultsTitle => '找不到地點';

  @override
  String get locationPickerNoResultsBody => '請嘗試以名稱或城市搜尋';

  @override
  String get lastUpdated => '更新時間';

  @override
  String get sourceMock => '模擬';

  @override
  String get sourceCached => '快取';

  @override
  String get sourceLive => '即時';

  @override
  String get transferDirect => '直達';

  @override
  String get transferOne => '1 次轉乘';

  @override
  String get transferOneToTwo => '1–2 次轉乘';

  @override
  String get transferDockSwap => '建議更換停靠站';

  @override
  String get errorTitle => '發生錯誤';

  @override
  String get errorSearchFailed => '目前無法載入票價，請稍後再試。';

  @override
  String get errorApiNotReady => '目前尚未提供 API 模式，請到設定切回「模擬」。';

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
  String get privacyBody => '你的搜尋、收藏、紀錄與快取結果只會儲存在本機裝置。不需要帳號。預設不進行追蹤。';

  @override
  String get privacyReadMore => '查看更多';

  @override
  String get about => '關於';

  @override
  String get aboutVersion => '版本';

  @override
  String get aboutDataSource => '資料來源';
}
