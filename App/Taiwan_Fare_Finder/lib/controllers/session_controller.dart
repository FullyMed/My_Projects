import 'package:flutter/foundation.dart';
import 'package:taiwan_fare_finder/models/user.dart';
import 'package:taiwan_fare_finder/services/user_service.dart';

class SessionController extends ChangeNotifier {
  SessionController({required this.userService}) {
    _init();
  }

  final UserService userService;

  User? _user;
  bool _loading = true;

  User? get user => _user;
  bool get isLoading => _loading;

  Future<void> _init() async {
    try {
      _user = await userService.getOrCreateUser();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }
}
