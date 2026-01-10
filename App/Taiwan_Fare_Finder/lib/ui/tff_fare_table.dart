import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:taiwan_fare_finder/localization/tff_localizations.dart';
import 'package:taiwan_fare_finder/models/fare_result.dart';
import 'package:taiwan_fare_finder/theme.dart';

class TffFareTable extends StatelessWidget {
  const TffFareTable({super.key, required this.fares});

  final FareBreakdown fares;

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    final cs = Theme.of(context).colorScheme;
    final fmt = NumberFormat.decimalPattern();

    Widget row(String label, int value, IconData icon) {
      return Row(
        children: [
          Icon(icon, size: 18, color: cs.onSurfaceVariant),
          const SizedBox(width: AppSpacing.sm),
          Expanded(child: Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.bodyMedium)),
          Text('NT\$${fmt.format(value)}', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
        ],
      );
    }

    return Column(
      children: [
        row(l10n.adult, fares.adult, Icons.person_rounded),
        const SizedBox(height: AppSpacing.sm),
        row(l10n.student, fares.student, Icons.school_rounded),
        const SizedBox(height: AppSpacing.sm),
        row(l10n.child, fares.child, Icons.child_care_rounded),
        const SizedBox(height: AppSpacing.sm),
        row(l10n.senior, fares.senior, Icons.elderly_rounded),
      ],
    );
  }
}
