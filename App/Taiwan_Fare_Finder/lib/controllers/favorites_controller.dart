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

  String _resolveUserId(String? userId) {
    if (userId == null || userId.isEmpty) return 'local';
    return userId;
  }

  Future<void> bindUser(String? userId) async {
    final resolved = _resolveUserId(userId);

    if (_boundUserId == resolved) return;
    _boundUserId = resolved;

    // If already loaded for this user, skip.
    if (_userId == resolved && !_loading) return;

    _userId = resolved;
    await reload();
  }

  Future<void> reload() async {
    if (_userId == null) return;

    _loading = true;
    notifyListeners();

    try {
      _favorites = await favoritesService.load(userId: _userId!);
    } catch (e) {
      debugPrint('FavoritesController: load failed: $e');
      _favorites = const [];
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  bool isFavorite({
    required String origin,
    required String destination,
    required List<TransportMode> modes,
  }) {
    return _favorites.any((f) =>
        f.origin == origin &&
        f.destination == destination &&
        _sameModes(f.modes, modes));
  }

  String? favoriteIdFor({
    required String origin,
    required String destination,
    required List<TransportMode> modes,
  }) {
    final found = _favorites.where((f) =>
        f.origin == origin &&
        f.destination == destination &&
        _sameModes(f.modes, modes));
    return found.isEmpty ? null : found.first.id;
  }

  Future<void> toggleFavorite({
    required String origin,
    required String destination,
    required List<TransportMode> modes,
  }) async {
    if (_userId == null) return;

    final existingId =
        favoriteIdFor(origin: origin, destination: destination, modes: modes);

    try {
      if (existingId != null) {
        _favorites = await favoritesService.remove(
          userId: _userId!,
          favoriteId: existingId,
        );
      } else {
        _favorites = await favoritesService.add(
          userId: _userId!,
          origin: origin,
          destination: destination,
          modes: modes,
        );
      }
    } catch (e) {
      debugPrint('FavoritesController: toggle failed: $e');
      // Keep current list if operation failed.
    }

    notifyListeners();
  }

  Future<void> remove(String favoriteId) async {
    if (_userId == null) return;

    try {
      _favorites = await favoritesService.remove(
        userId: _userId!,
        favoriteId: favoriteId,
      );
    } catch (e) {
      debugPrint('FavoritesController: remove failed: $e');
    }

    notifyListeners();
  }

  Future<void> clear() async {
    if (_userId == null) return;
    await favoritesService.clear(userId: _userId!);
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
