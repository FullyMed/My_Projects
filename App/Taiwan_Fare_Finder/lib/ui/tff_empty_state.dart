import 'package:flutter/material.dart';
import 'package:taiwan_fare_finder/theme.dart';
import 'package:taiwan_fare_finder/ui/tff_card.dart';

class TffEmptyState extends StatelessWidget {
  const TffEmptyState({super.key, required this.title, required this.body, this.icon, this.action});

  final String title;
  final String body;
  final IconData? icon;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 520),
          child: TffCard(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: cs.primaryContainer.withValues(alpha: 0.55),
                    border: Border.all(color: cs.primary.withValues(alpha: 0.25)),
                  ),
                  child: Icon(icon ?? Icons.route_rounded, color: cs.primary, size: 24),
                ),
                const SizedBox(height: AppSpacing.md),
                Text(title, style: Theme.of(context).textTheme.titleLarge, textAlign: TextAlign.center, maxLines: 2, overflow: TextOverflow.ellipsis),
                const SizedBox(height: AppSpacing.sm),
                Text(body, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: cs.onSurfaceVariant), textAlign: TextAlign.center, maxLines: 3, overflow: TextOverflow.ellipsis),
                if (action != null) ...[const SizedBox(height: AppSpacing.lg), action!],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
