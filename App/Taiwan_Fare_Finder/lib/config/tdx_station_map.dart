/// Maps Location.queryToken → TDX station ID strings.
///
/// HSR IDs confirmed via GET /api/basic/v2/Rail/THSR/Station.
/// Note: the THSR station IDs differ from the 4-digit scheme (0100, 0200…)
/// sometimes cited in external docs — the actual TDX values are used here.
/// Kaohsiung maps to Zuoying (左營), the THSR terminus in Kaohsiung City.
/// Keelung and New Taipei have no THSR service and are omitted.
///
/// TRA IDs confirmed via GET /api/basic/v2/Rail/TRA/Station.
/// Yunlin maps to Douliu (斗六), the prefectural-seat station of Yunlin County.

const Map<String, String> hsrStationId = {
  'Taipei': '1000',
  'Banqiao': '1010',
  'Taoyuan': '1020',
  'Hsinchu': '1030',
  'Miaoli': '1035',
  'Taichung': '1040',
  'Changhua': '1043',
  'Yunlin': '1047',
  'Chiayi': '1050',
  'Tainan': '1060',
  'Kaohsiung': '1070',
};

const Map<String, String> traStationId = {
  'Keelung': '0900',
  'Taipei': '1000',
  'Banqiao': '1020',
  'Taoyuan': '1080',
  'Hsinchu': '1210',
  'Miaoli': '3160',
  'Taichung': '3300',
  'Changhua': '3360',
  'Yunlin': '3470',
  'Chiayi': '4080',
  'Tainan': '4220',
  'Kaohsiung': '4400',
};
