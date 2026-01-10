import 'package:flutter/foundation.dart';
import 'package:taiwan_fare_finder/models/user.dart';
import 'package:taiwan_fare_finder/services/local_storage_service.dart';
import 'package:taiwan_fare_finder/utils/id_generator.dart';

class UserService {
  UserService({required this.storage});

  final LocalStorageService storage;

  static const _key = 'tff_user';

  Future<User> getOrCreateUser() async {
    try {
      final existing = await storage.readMap(_key);
      if (existing != null) {
        final user = User.fromJson(existing);
        if (user.id.isNotEmpty) return user;
      }
    } catch (e) {
      debugPrint('UserService: failed to load user: $e');
    }

    final now = DateTime.now();
    final user = User(id: IdGenerator.next(), displayName: 'Local User', createdAt: now, updatedAt: now);
    await storage.writeMap(_key, user.toJson());
    return user;
  }
}
