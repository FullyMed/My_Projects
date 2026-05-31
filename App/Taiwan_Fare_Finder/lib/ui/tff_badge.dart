import 'package:flutter/material.dart';

/// A small pill-shaped badge used for metadata like "Mock data" or "Saved".
///
/// Pass [iconColor], [backgroundColor], and [borderColor] to differentiate
/// badge types without creating separate widgets.
class TffBadge extends StatelessWidget {
  const TffBadge({
    super.key,
    required this.label,
    required this.icon,
    this.iconColor,
    this.labelColor,
    this.backgroundColor,
    this.borderColor,
  });

  final String label;
  final IconData icon;
  final Color? iconColor;
  final Color? labelColor;
  final Color? backgroundColor;
  final Color? borderColor;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final effectiveIcon = iconColor ?? cs.onSurfaceVariant;
    final effectiveBg = backgroundColor ?? cs.surfaceContainerHighest.withValues(alpha: 0.6);
    final effectiveBorder = borderColor ?? cs.outline.withValues(alpha: 0.18);
    final effectiveLabel = labelColor ?? cs.onSurfaceVariant;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        color: effectiveBg,
        border: Border.all(color: effectiveBorder),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: effectiveIcon),
          const SizedBox(width: 5),
          Text(label, style: Theme.of(context).textTheme.labelSmall?.copyWith(color: effectiveLabel, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
