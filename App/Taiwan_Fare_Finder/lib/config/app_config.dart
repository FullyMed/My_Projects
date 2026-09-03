/// Build-time app configuration.
///
/// Nothing secret is stored in source. All values come from `--dart-define`
/// (or `--dart-define-from-file`) at build time, e.g.:
///
/// ```
/// flutter run --dart-define-from-file=tdx.env.json
/// ```
///
/// with a gitignored `tdx.env.json` like:
///
/// ```json
/// {
///   "TFF_PROXY_BASE_URL": "https://your-worker.workers.dev/api/basic/v2"
/// }
/// ```
class AppConfig {
  const AppConfig._();

  /// Base URL of the TDX proxy (Cloudflare Worker in `proxy/`).
  ///
  /// When set, the app talks to the proxy instead of TDX directly and needs
  /// no TDX credentials at all — the proxy holds them server-side and injects
  /// the bearer token itself. This is the only supported release setup.
  static const String tdxProxyBaseUrl =
      String.fromEnvironment('TFF_PROXY_BASE_URL');

  /// Direct-mode TDX credentials — LOCAL DEVELOPMENT ONLY, and only when no
  /// proxy URL is set. Supply them per build:
  ///
  /// ```
  /// flutter run \
  ///   --dart-define=TDX_CLIENT_ID=... \
  ///   --dart-define=TDX_CLIENT_SECRET=...
  /// ```
  ///
  /// A release build with these baked in exposes the secret as a plaintext
  /// string in the binary (R8 / Dart obfuscation do NOT hide string
  /// constants) — use the proxy instead.
  static const String tdxClientId = String.fromEnvironment('TDX_CLIENT_ID');
  static const String tdxClientSecret =
      String.fromEnvironment('TDX_CLIENT_SECRET');

  static bool get hasProxy => tdxProxyBaseUrl.isNotEmpty;
  static bool get hasDirectCredentials =>
      tdxClientId.isNotEmpty && tdxClientSecret.isNotEmpty;
}
