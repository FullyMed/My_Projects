import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:taiwan_fare_finder/config/app_config.dart';

class TdxAuthService {
  static const _tokenEndpoint = 'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token';
  static const _expiryBufferSeconds = 60;

  String? _cachedToken;
  DateTime? _expiresAt;

  /// Returns a valid Bearer token, fetching a new one only when expired.
  ///
  /// Direct mode only — throws when no credentials were provided at build time,
  /// so the caller falls back to cache then mock. Never called in proxy mode.
  Future<String> getToken() async {
    if (!AppConfig.hasDirectCredentials) {
      throw StateError(
          'TdxAuthService: no TDX credentials. Pass --dart-define TDX_CLIENT_ID '
          '/ TDX_CLIENT_SECRET for direct mode, or set TFF_PROXY_BASE_URL to use '
          'the proxy.');
    }

    final now = DateTime.now();
    if (_cachedToken != null && _expiresAt != null && now.isBefore(_expiresAt!)) {
      return _cachedToken!;
    }

    final response = await http.post(
      Uri.parse(_tokenEndpoint),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: {
        'grant_type': 'client_credentials',
        'client_id': AppConfig.tdxClientId,
        'client_secret': AppConfig.tdxClientSecret,
      },
    );

    if (response.statusCode != 200) {
      // Body is deliberately not logged — it can echo back request parameters.
      throw Exception('TdxAuthService: token request failed (${response.statusCode})');
    }

    final Object? decoded;
    try {
      decoded = jsonDecode(response.body);
    } catch (_) {
      throw Exception('TdxAuthService: token response was not valid JSON');
    }
    if (decoded is! Map<String, dynamic>) {
      throw Exception('TdxAuthService: unexpected token response shape');
    }
    final token = decoded['access_token'] as String?;
    final expiresIn = decoded['expires_in'] as int?;

    if (token == null || token.isEmpty) {
      throw Exception('TdxAuthService: response missing access_token');
    }
    if (expiresIn == null || expiresIn <= _expiryBufferSeconds) {
      throw Exception('TdxAuthService: expires_in ($expiresIn) too short to cache safely');
    }

    _cachedToken = token;
    _expiresAt = DateTime.now().add(Duration(seconds: expiresIn - _expiryBufferSeconds));

    return _cachedToken!;
  }
}
