import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:taiwan_fare_finder/theme.dart';

class TffCard extends StatelessWidget {
  const TffCard({super.key, required this.child, this.padding});

  final Widget child;
  final EdgeInsets? padding;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = cs.surfaceContainerHighest.withValues(alpha: isDark ? 0.78 : 0.82);
    final border = cs.outline.withValues(alpha: isDark ? 0.18 : 0.12);
    final shadow = isDark
        ? const Color(0xFF000000)
        : const Color(0xFF0F766E); // teal-tinted shadow in light mode
    return ClipRRect(
      borderRadius: BorderRadius.circular(AppRadius.xl),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: bg,
            border: Border.all(color: border),
            borderRadius: BorderRadius.circular(AppRadius.xl),
            boxShadow: [
              BoxShadow(
                color: shadow.withValues(alpha: isDark ? 0.28 : 0.07),
                blurRadius: 18,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Padding(padding: padding ?? const EdgeInsets.all(AppSpacing.lg), child: child),
        ),
      ),
    );
  }
}
