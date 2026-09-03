/// Build-time app configuration.
///
/// Nothing secret lives here. Values are injected at build time with
/// `--dart-define`, e.g.:
///
/// ```
/// flutter run --dart-define=TFF_PROXY_BASE_URL=https://tff-proxy.example.workers.dev/api/basic/v2
/// ```
class AppConfig {
  const AppConfig._();

  /// Base URL of the TDX proxy (Cloudflare Worker).
  ///
  /// When set, the app talks to the proxy instead of TDX directly and never
  /// needs the TDX client id/secret — the proxy holds them server-side and
  /// injects the bearer token itself.
  ///
  /// When empty (default), the app falls back to calling TDX directly using
  /// the credentials in `lib/config/tdx_credentials.dart`. That path is fine
  /// for local development but must not be shipped: the secret would be
  /// extractable from the release binary.
  static const String tdxProxyBaseUrl =
      String.fromEnvironment('TFF_PROXY_BASE_URL');

  static bool get hasProxy => tdxProxyBaseUrl.isNotEmpty;
}
