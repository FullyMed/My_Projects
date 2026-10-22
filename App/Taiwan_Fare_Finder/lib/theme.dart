import 'package:flutter/material.dart';

/// Bundled font family: five static weights (400-800) in `assets/fonts/`,
/// declared in `pubspec.yaml`. No runtime download, no third-party origin.
const String _fontFamily = 'Plus Jakarta Sans';

/// Motion tokens. Durations stay short (UI feedback, not decoration) and every
/// animation goes through [TffMotion.of] so "reduce motion" turns it off.
class TffMotion {
  static const Duration press = Duration(milliseconds: 100);
  static const Duration fast = Duration(milliseconds: 160);
  static const Duration medium = Duration(milliseconds: 220);

  /// Strong ease-out: moves at once, settles softly.
  static const Curve easeOut = Cubic(0.23, 1, 0.32, 1);

  /// True when the OS asks for reduced motion.
  static bool reduced(BuildContext context) => MediaQuery.maybeDisableAnimationsOf(context) ?? false;

  /// [d], or zero when the OS asks for reduced motion.
  static Duration of(BuildContext context, Duration d) => reduced(context) ? Duration.zero : d;
}

class AppSpacing {
  // Spacing values
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xxl = 48.0;

  // Edge insets shortcuts
  static const EdgeInsets paddingXs = EdgeInsets.all(xs);
  static const EdgeInsets paddingSm = EdgeInsets.all(sm);
  static const EdgeInsets paddingMd = EdgeInsets.all(md);
  static const EdgeInsets paddingLg = EdgeInsets.all(lg);
  static const EdgeInsets paddingXl = EdgeInsets.all(xl);

  // Horizontal padding
  static const EdgeInsets horizontalXs = EdgeInsets.symmetric(horizontal: xs);
  static const EdgeInsets horizontalSm = EdgeInsets.symmetric(horizontal: sm);
  static const EdgeInsets horizontalMd = EdgeInsets.symmetric(horizontal: md);
  static const EdgeInsets horizontalLg = EdgeInsets.symmetric(horizontal: lg);
  static const EdgeInsets horizontalXl = EdgeInsets.symmetric(horizontal: xl);

  // Vertical padding
  static const EdgeInsets verticalXs = EdgeInsets.symmetric(vertical: xs);
  static const EdgeInsets verticalSm = EdgeInsets.symmetric(vertical: sm);
  static const EdgeInsets verticalMd = EdgeInsets.symmetric(vertical: md);
  static const EdgeInsets verticalLg = EdgeInsets.symmetric(vertical: lg);
  static const EdgeInsets verticalXl = EdgeInsets.symmetric(vertical: xl);
}

/// Border radius constants for consistent rounded corners
class AppRadius {
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 24.0;
}

// =============================================================================
// TEXT STYLE EXTENSIONS
// =============================================================================

/// Extension to add text style utilities to BuildContext
/// Access via context.textStyles
extension TextStyleContext on BuildContext {
  TextTheme get textStyles => Theme.of(this).textTheme;
}

/// Helper methods for common text style modifications
extension TextStyleExtensions on TextStyle {
  /// Make text bold
  TextStyle get bold => copyWith(fontWeight: FontWeight.bold);

  /// Make text semi-bold
  TextStyle get semiBold => copyWith(fontWeight: FontWeight.w600);

  /// Make text medium weight
  TextStyle get medium => copyWith(fontWeight: FontWeight.w500);

  /// Make text normal weight
  TextStyle get normal => copyWith(fontWeight: FontWeight.w400);

  /// Make text light
  TextStyle get light => copyWith(fontWeight: FontWeight.w300);

  /// Add custom color
  TextStyle withColor(Color color) => copyWith(color: color);

  /// Add custom size
  TextStyle withSize(double size) => copyWith(fontSize: size);
}

// =============================================================================
// COLORS
// =============================================================================

/// Modern, neutral color palette for light mode
/// Uses soft grays and blues instead of purple for a contemporary look
class LightModeColors {
  // Primary: Soft blue-gray for a modern, professional look
  static const lightPrimary = Color(0xFF0F766E);
  static const lightOnPrimary = Color(0xFFFFFFFF);
  static const lightPrimaryContainer = Color(0xFFCFF7F2);
  static const lightOnPrimaryContainer = Color(0xFF064E48);

  // Secondary: Sky blue — complements teal without clashing
  static const lightSecondary = Color(0xFF0284C7);
  static const lightOnSecondary = Color(0xFFFFFFFF);
  static const lightSecondaryContainer = Color(0xFFE0F2FE);
  static const lightOnSecondaryContainer = Color(0xFF0C4A6E);

  // Tertiary: amber, used only for "estimate / mock data" cautions
  static const lightTertiary = Color(0xFFC2410C);
  static const lightOnTertiary = Color(0xFFFFFFFF);
  static const lightTertiaryContainer = Color(0xFFFFEDD5);
  static const lightOnTertiaryContainer = Color(0xFF7C2D12);

  // Error colors
  static const lightError = Color(0xFFBA1A1A);
  static const lightOnError = Color(0xFFFFFFFF);
  static const lightErrorContainer = Color(0xFFFFDAD6);
  static const lightOnErrorContainer = Color(0xFF410002);

  // Surfaces: a teal-tinted grey page with white cards on top, so cards
  // separate from the page without heavy borders or shadows.
  static const lightSurface = Color(0xFFFFFFFF); // cards, sheets
  static const lightOnSurface = Color(0xFF1A1C1E);
  static const lightBackground = Color(0xFFEEF3F4); // page
  static const lightSurfaceVariant = Color(0xFFE4ECEE); // chips, tiles, fields
  static const lightOnSurfaceVariant = Color(0xFF44474E);

  // Outline and shadow
  static const lightOutline = Color(0xFF74777F);
  static const lightShadow = Color(0xFF000000);
  static const lightInversePrimary = Color(0xFF2DD4BF);
}

/// Dark mode colors with good contrast
class DarkModeColors {
  // Primary: Lighter blue for dark background
  static const darkPrimary = Color(0xFF2DD4BF);
  static const darkOnPrimary = Color(0xFF042F2E);
  static const darkPrimaryContainer = Color(0xFF115E59);
  static const darkOnPrimaryContainer = Color(0xFFCFF7F2);

  // Secondary: Sky blue tonal — lighter for dark backgrounds
  static const darkSecondary = Color(0xFF38BDF8);
  static const darkOnSecondary = Color(0xFF082F49);
  static const darkSecondaryContainer = Color(0xFF0369A1);
  static const darkOnSecondaryContainer = Color(0xFFE0F2FE);

  // Tertiary: amber, used only for "estimate / mock data" cautions
  static const darkTertiary = Color(0xFFFDBA74);
  static const darkOnTertiary = Color(0xFF7C2D12);
  static const darkTertiaryContainer = Color(0xFF5A2410);
  static const darkOnTertiaryContainer = Color(0xFFFFEDD5);

  // Error colors
  static const darkError = Color(0xFFFFB4AB);
  static const darkOnError = Color(0xFF690005);
  static const darkErrorContainer = Color(0xFF93000A);
  static const darkOnErrorContainer = Color(0xFFFFDAD6);

  // Surfaces: an off-black, teal-tinted page with lifted cards.
  static const darkSurface = Color(0xFF1C2325); // cards, sheets
  static const darkOnSurface = Color(0xFFE2E8F0);
  static const darkBackground = Color(0xFF111617); // page
  static const darkSurfaceVariant = Color(0xFF263033); // chips, tiles, fields
  static const darkOnSurfaceVariant = Color(0xFFC4C7CF);

  // Outline and shadow
  static const darkOutline = Color(0xFF8E9099);
  static const darkShadow = Color(0xFF000000);
  static const darkInversePrimary = Color(0xFF0F766E);
}

/// Font size constants
class FontSizes {
  static const double displayLarge = 57.0;
  static const double displayMedium = 45.0;
  static const double displaySmall = 36.0;
  static const double headlineLarge = 32.0;
  static const double headlineMedium = 28.0;
  static const double headlineSmall = 24.0;
  static const double titleLarge = 22.0;
  static const double titleMedium = 16.0;
  static const double titleSmall = 14.0;
  static const double labelLarge = 14.0;
  static const double labelMedium = 12.0;
  static const double labelSmall = 11.0;
  static const double bodyLarge = 16.0;
  static const double bodyMedium = 14.0;
  static const double bodySmall = 12.0;
}

// =============================================================================
// THEMES
// =============================================================================

/// A 2 dp outline on keyboard focus for every Material button, on top of the
/// default focus tint (which is too faint to find on its own).
WidgetStateProperty<BorderSide?> _focusSide(Color color) =>
    WidgetStateProperty.resolveWith((states) => states.contains(WidgetState.focused) ? BorderSide(color: color, width: 2) : null);

ButtonStyle _focusStyle(Color color) => ButtonStyle(side: _focusSide(color));

/// Button and chip themes that share the keyboard focus outline.
ThemeData _withFocusRings(ThemeData base) {
  final c = base.colorScheme.primary;
  // Filled primary buttons get an onSurface ring: a primary one would vanish
  // into the fill.
  final onFill = base.colorScheme.onSurface;
  return base.copyWith(
    textButtonTheme: TextButtonThemeData(style: _focusStyle(c)),
    elevatedButtonTheme: ElevatedButtonThemeData(style: _focusStyle(onFill)),
    filledButtonTheme: FilledButtonThemeData(style: _focusStyle(c)),
    outlinedButtonTheme: OutlinedButtonThemeData(style: _focusStyle(c)),
    iconButtonTheme: IconButtonThemeData(style: _focusStyle(c)),
  );
}

/// Light theme with modern, neutral aesthetic
ThemeData get lightTheme => _withFocusRings(ThemeData(
  useMaterial3: true,
  colorScheme: ColorScheme.light(
    primary: LightModeColors.lightPrimary,
    onPrimary: LightModeColors.lightOnPrimary,
    primaryContainer: LightModeColors.lightPrimaryContainer,
    onPrimaryContainer: LightModeColors.lightOnPrimaryContainer,
    secondary: LightModeColors.lightSecondary,
    onSecondary: LightModeColors.lightOnSecondary,
    secondaryContainer: LightModeColors.lightSecondaryContainer,
    onSecondaryContainer: LightModeColors.lightOnSecondaryContainer,
    tertiary: LightModeColors.lightTertiary,
    onTertiary: LightModeColors.lightOnTertiary,
    tertiaryContainer: LightModeColors.lightTertiaryContainer,
    onTertiaryContainer: LightModeColors.lightOnTertiaryContainer,
    error: LightModeColors.lightError,
    onError: LightModeColors.lightOnError,
    errorContainer: LightModeColors.lightErrorContainer,
    onErrorContainer: LightModeColors.lightOnErrorContainer,
    surface: LightModeColors.lightSurface,
    onSurface: LightModeColors.lightOnSurface,
    surfaceContainerHighest: LightModeColors.lightSurfaceVariant,
    onSurfaceVariant: LightModeColors.lightOnSurfaceVariant,
    outline: LightModeColors.lightOutline,
    shadow: LightModeColors.lightShadow,
    inversePrimary: LightModeColors.lightInversePrimary,
  ),
  brightness: Brightness.light,
  fontFamily: _fontFamily,
  scaffoldBackgroundColor: LightModeColors.lightBackground,
  // Keyboard focus on web/desktop: a clearly visible tint, not the faint default.
  focusColor: LightModeColors.lightPrimary.withValues(alpha: 0.18),
  appBarTheme: const AppBarTheme(
    backgroundColor: Colors.transparent,
    foregroundColor: LightModeColors.lightOnSurface,
    elevation: 0,
    scrolledUnderElevation: 0,
  ),
  cardTheme: CardThemeData(
    elevation: 0,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(12),
      side: BorderSide(
        color: LightModeColors.lightOutline.withValues(alpha: 0.2),
        width: 1,
      ),
    ),
  ),
  textTheme: _buildTextTheme(Brightness.light),
));

/// Dark theme with good contrast and readability
ThemeData get darkTheme => _withFocusRings(ThemeData(
  useMaterial3: true,
  colorScheme: ColorScheme.dark(
    primary: DarkModeColors.darkPrimary,
    onPrimary: DarkModeColors.darkOnPrimary,
    primaryContainer: DarkModeColors.darkPrimaryContainer,
    onPrimaryContainer: DarkModeColors.darkOnPrimaryContainer,
    secondary: DarkModeColors.darkSecondary,
    onSecondary: DarkModeColors.darkOnSecondary,
    secondaryContainer: DarkModeColors.darkSecondaryContainer,
    onSecondaryContainer: DarkModeColors.darkOnSecondaryContainer,
    tertiary: DarkModeColors.darkTertiary,
    onTertiary: DarkModeColors.darkOnTertiary,
    tertiaryContainer: DarkModeColors.darkTertiaryContainer,
    onTertiaryContainer: DarkModeColors.darkOnTertiaryContainer,
    error: DarkModeColors.darkError,
    onError: DarkModeColors.darkOnError,
    errorContainer: DarkModeColors.darkErrorContainer,
    onErrorContainer: DarkModeColors.darkOnErrorContainer,
    surface: DarkModeColors.darkSurface,
    onSurface: DarkModeColors.darkOnSurface,
    surfaceContainerHighest: DarkModeColors.darkSurfaceVariant,
    onSurfaceVariant: DarkModeColors.darkOnSurfaceVariant,
    outline: DarkModeColors.darkOutline,
    shadow: DarkModeColors.darkShadow,
    inversePrimary: DarkModeColors.darkInversePrimary,
  ),
  brightness: Brightness.dark,
  fontFamily: _fontFamily,
  scaffoldBackgroundColor: DarkModeColors.darkBackground,
  focusColor: DarkModeColors.darkPrimary.withValues(alpha: 0.22),
  appBarTheme: const AppBarTheme(
    backgroundColor: Colors.transparent,
    foregroundColor: DarkModeColors.darkOnSurface,
    elevation: 0,
    scrolledUnderElevation: 0,
  ),
  cardTheme: CardThemeData(
    elevation: 0,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(12),
      side: BorderSide(
        color: DarkModeColors.darkOutline.withValues(alpha: 0.2),
        width: 1,
      ),
    ),
  ),
  textTheme: _buildTextTheme(Brightness.dark),
));

/// Build text theme using the bundled Plus Jakarta Sans font family.
///
/// Each [FontWeight] used here has its own static font file (see pubspec.yaml).
TextTheme _buildTextTheme(Brightness brightness) {
  return const TextTheme(
    displayLarge: TextStyle(
      fontFamily: _fontFamily,
      fontSize: FontSizes.displayLarge,
      fontWeight: FontWeight.w400,
      letterSpacing: -0.25,
    ),
    displayMedium: TextStyle(
      fontFamily: _fontFamily,
      fontSize: FontSizes.displayMedium,
      fontWeight: FontWeight.w400,
    ),
    displaySmall: TextStyle(
      fontFamily: _fontFamily,
      fontSize: FontSizes.displaySmall,
      fontWeight: FontWeight.w400,
    ),
    headlineLarge: TextStyle(
      fontFamily: _fontFamily,
      fontSize: FontSizes.headlineLarge,
      fontWeight: FontWeight.w600,
      letterSpacing: -0.5,
    ),
    headlineMedium: TextStyle(
      fontFamily: _fontFamily,
      fontSize: FontSizes.headlineMedium,
      fontWeight: FontWeight.w600,
    ),
    headlineSmall: TextStyle(
      fontFamily: _fontFamily,
      fontSize: FontSizes.headlineSmall,
      fontWeight: FontWeight.w600,
    ),
    titleLarge: TextStyle(
      fontFamily: _fontFamily,
      fontSize: FontSizes.titleLarge,
      fontWeight: FontWeight.w600,
    ),
    titleMedium: TextStyle(
      fontFamily: _fontFamily,
      fontSize: FontSizes.titleMedium,
      fontWeight: FontWeight.w500,
    ),
    titleSmall: TextStyle(
      fontFamily: _fontFamily,
      fontSize: FontSizes.titleSmall,
      fontWeight: FontWeight.w500,
    ),
    labelLarge: TextStyle(
      fontFamily: _fontFamily,
      fontSize: FontSizes.labelLarge,
      fontWeight: FontWeight.w500,
      letterSpacing: 0.1,
    ),
    labelMedium: TextStyle(
      fontFamily: _fontFamily,
      fontSize: FontSizes.labelMedium,
      fontWeight: FontWeight.w500,
      letterSpacing: 0.5,
    ),
    labelSmall: TextStyle(
      fontFamily: _fontFamily,
      fontSize: FontSizes.labelSmall,
      fontWeight: FontWeight.w500,
      letterSpacing: 0.5,
    ),
    bodyLarge: TextStyle(
      fontFamily: _fontFamily,
      fontSize: FontSizes.bodyLarge,
      fontWeight: FontWeight.w400,
      letterSpacing: 0.15,
    ),
    bodyMedium: TextStyle(
      fontFamily: _fontFamily,
      fontSize: FontSizes.bodyMedium,
      fontWeight: FontWeight.w400,
      letterSpacing: 0.25,
    ),
    bodySmall: TextStyle(
      fontFamily: _fontFamily,
      fontSize: FontSizes.bodySmall,
      fontWeight: FontWeight.w400,
      letterSpacing: 0.4,
    ),
  );
}
