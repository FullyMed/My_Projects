import 'package:flutter/material.dart';
import 'package:taiwan_fare_finder/localization/tff_localizations.dart';
import 'package:taiwan_fare_finder/theme.dart';
import 'package:taiwan_fare_finder/ui/tff_button.dart';
import 'package:taiwan_fare_finder/ui/tff_card.dart';

class TffErrorCard extends StatelessWidget {
  const TffErrorCard({super.key, required this.title, required this.message, required this.onRetry});

  final String title;
  final String message;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final l10n = TffLocalizations.of(context);
    return TffCard(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(color: cs.errorContainer.withValues(alpha: 0.6), borderRadius: BorderRadius.circular(AppRadius.lg), border: Border.all(color: cs.error.withValues(alpha: 0.22))),
            child: Icon(Icons.error_outline_rounded, color: cs.error),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)),
                const SizedBox(height: 6),
                Text(message, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: cs.onSurfaceVariant)),
                const SizedBox(height: AppSpacing.md),
                Align(
                  alignment: Alignment.centerRight,
                  child: TffTextButton(label: l10n.retry, icon: Icons.refresh_rounded, onPressed: onRetry),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
