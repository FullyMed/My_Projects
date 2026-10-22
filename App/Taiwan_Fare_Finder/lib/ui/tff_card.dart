import 'package:flutter/material.dart';
import 'package:taiwan_fare_finder/theme.dart';

/// A solid surface card: white on the tinted page in light mode, a lifted
/// charcoal in dark mode.
///
/// The child sits on a transparent [Material], so `InkWell` ripples inside the
/// card paint above the card's background instead of hidden underneath it.
class TffCard extends StatelessWidget {
  const TffCard({super.key, required this.child, this.padding});

  final Widget child;
  final EdgeInsets? padding;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final radius = BorderRadius.circular(AppRadius.xl);
    return DecoratedBox(
      decoration: BoxDecoration(
        color: cs.surface,
        borderRadius: radius,
        border: Border.all(color: cs.outline.withValues(alpha: isDark ? 0.22 : 0.14)),
        // Light mode only: a soft teal-tinted shadow. Shadows don't read on a
        // dark page, so dark mode relies on the lighter surface and the border.
        boxShadow: isDark
            ? null
            : [BoxShadow(color: cs.primary.withValues(alpha: 0.06), blurRadius: 16, offset: const Offset(0, 4))],
      ),
      child: Material(
        type: MaterialType.transparency,
        borderRadius: radius,
        clipBehavior: Clip.antiAlias,
        child: Padding(padding: padding ?? const EdgeInsets.all(AppSpacing.lg), child: child),
      ),
    );
  }
}
