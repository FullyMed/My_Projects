import 'package:flutter/foundation.dart';
import 'package:taiwan_fare_finder/models/favorite_route.dart';
import 'package:taiwan_fare_finder/models/transport_mode.dart';
import 'package:taiwan_fare_finder/services/favorites_service.dart';

class FavoritesController extends ChangeNotifier {
  FavoritesController({required this.favoritesService});

  final FavoritesService favoritesService;

  String? _boundUserId;
  String? get boundUserId => _boundUserId;
  String? _userId;
  bool _loading = true;
  List<FavoriteRoute> _favorites = const [];

  bool get isLoading => _loading;
  List<FavoriteRoute> get favorites => _favorites;

  Future<void> bindUser(String? userId) async {
    if (_boundUserId == userId) return;
    _boundUserId = userId;
    if (userId == null || userId.isEmpty) return;
    if (_userId == userId && !_loading) return;
    _userId = userId;
    await reload();
  }

  Future<void> reload() async {
    if (_userId == null) return;
    _loading = true;
    notifyListeners();
    try {
      _favorites = await favoritesService.load(userId: _userId!);
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  bool isFavorite(
      {required String origin,
      required String destination,
      required List<TransportMode> modes}) {
    return _favorites.any((f) =>
        f.origin == origin &&
        f.destination == destination &&
        _sameModes(f.modes, modes));
  }

  String? favoriteIdFor(
      {required String origin,
      required String destination,
      required List<TransportMode> modes}) {
    final found = _favorites.where((f) =>
        f.origin == origin &&
        f.destination == destination &&
        _sameModes(f.modes, modes));
    return found.isEmpty ? null : found.first.id;
  }

  Future<void> toggleFavorite(
      {required String origin,
      required String destination,
      required List<TransportMode> modes}) async {
    if (_userId == null) return;
    final existingId =
        favoriteIdFor(origin: origin, destination: destination, modes: modes);
    if (existingId != null) {
      _favorites = await favoritesService.remove(
          userId: _userId!, favoriteId: existingId);
    } else {
      _favorites = await favoritesService.add(
          userId: _userId!,
          origin: origin,
          destination: destination,
          modes: modes);
    }
    notifyListeners();
  }

  Future<void> remove(String favoriteId) async {
    if (_userId == null) return;
    _favorites =
        await favoritesService.remove(userId: _userId!, favoriteId: favoriteId);
    notifyListeners();
  }

  Future<void> clear() async {
    await favoritesService.clear();
    _favorites = const [];
    notifyListeners();
  }

  bool _sameModes(List<TransportMode> a, List<TransportMode> b) {
    if (a.length != b.length) return false;
    final aa = [...a]..sort((x, y) => x.storageKey.compareTo(y.storageKey));
    final bb = [...b]..sort((x, y) => x.storageKey.compareTo(y.storageKey));
    for (var i = 0; i < aa.length; i++) {
      if (aa[i] != bb[i]) return false;
    }
    return true;
  }
}
