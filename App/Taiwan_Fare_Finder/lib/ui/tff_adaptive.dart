import 'package:flutter/widgets.dart';

class TffAdaptive {
  const TffAdaptive._();

  static bool isTablet(BuildContext context) => MediaQuery.sizeOf(context).width >= 840;
  static bool isCompact(BuildContext context) => MediaQuery.sizeOf(context).width < 420;
}
