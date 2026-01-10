import 'package:flutter/material.dart';

/// A small pill-shaped badge used for metadata like "Offline data".
class TffBadge extends StatelessWidget {
  const TffBadge({super.key, required this.label, required this.icon});

  final String label;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        color: cs.secondaryContainer.withValues(alpha: 0.55),
        border: Border.all(color: cs.secondary.withValues(alpha: 0.22)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: cs.secondary),
          const SizedBox(width: 6),
          Text(label, style: Theme.of(context).textTheme.labelMedium?.copyWith(color: cs.onSecondaryContainer)),
        ],
      ),
    );
  }
}
