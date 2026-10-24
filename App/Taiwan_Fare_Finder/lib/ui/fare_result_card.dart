import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:taiwan_fare_finder/localization/tff_localizations.dart';
import 'package:taiwan_fare_finder/models/fare_result.dart';
import 'package:taiwan_fare_finder/theme.dart';
import 'package:taiwan_fare_finder/ui/tff_badge.dart';
import 'package:taiwan_fare_finder/ui/tff_card.dart';

/// Tabular figures so prices line up digit for digit down a column.
const List<FontFeature> _tabular = [FontFeature.tabularFigures()];

/// One fare result.
///
/// - Header: mode name, source badge (Live / Mock data / Saved) and an optional
///   [trailing] action; the route [subtitle] gets its own full-width line so it
///   never gets cut off by the badge.
/// - The adult fare is the big number. The other passenger fares sit in rows
///   below it, label on the left and price on the right, so they stay readable
///   at any width and any system text size.
/// - Then distance, duration and transfers, and when the result was fetched.
class FareResultCard extends StatelessWidget {
  const FareResultCard({
    super.key,
    required this.result,
    this.title,
    this.subtitle,
    this.trailing,
  });

  final FareResult result;

  /// Optional title. If omitted, uses the mode label.
  final String? title;

  /// Optional line under the title (e.g. the localized route).
  final String? subtitle;

  /// Optional widget placed at the far right of the header row.
  /// (e.g., favorite button).
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    final cs = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;
    final localeTag = Localizations.localeOf(context).toLanguageTag();
    final moneyFmt = NumberFormat.decimalPattern(localeTag);
    final updatedFmt = DateFormat.yMMMd(localeTag).add_Hm();
    String money(int v) => 'NT\$${moneyFmt.format(v)}';

    final headerTitle = title ?? l10n.modeLabel(result.mode);
    final metaLine =
        '${result.distanceKm} ${l10n.kmShort} • ${result.durationMinutes} ${l10n.minutesShort} • ${_transferText(l10n, result.transferSummary)}';
    final updatedLine = '${l10n.lastUpdated}: ${updatedFmt.format(result.updatedAt)}';
    final fares = result.fares;

    return TffCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Title and badge share a Wrap: with large system text the
              // badge drops under the title instead of overflowing the row.
              Expanded(
                child: Wrap(
                  spacing: AppSpacing.sm,
                  runSpacing: AppSpacing.xs,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    Text(headerTitle, style: text.titleLarge, maxLines: 1, overflow: TextOverflow.ellipsis),
                    _SourceBadge(source: result.source),
                  ],
                ),
              ),
              if (trailing != null) ...[
                const SizedBox(width: AppSpacing.xs),
                trailing!,
              ],
            ],
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 2),
            Text(subtitle!, style: text.bodyMedium?.copyWith(color: cs.onSurfaceVariant), maxLines: 3, overflow: TextOverflow.ellipsis),
          ],
          const SizedBox(height: AppSpacing.md),
          Text(l10n.adult, style: text.labelLarge?.copyWith(color: cs.onSurfaceVariant)),
          const SizedBox(height: 2),
          // A price must never end in "…": with large system text it shrinks
          // to fit the card instead (NT$1,490 was cut to "NT$1.4…" at 200%).
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: AlignmentDirectional.centerStart,
            child: Text(
              money(fares.adult),
              style: text.displaySmall?.copyWith(fontWeight: FontWeight.w800, letterSpacing: -0.6, fontFeatures: _tabular),
              maxLines: 1,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          DecoratedBox(
            decoration: BoxDecoration(
              color: cs.surfaceContainerHighest.withValues(alpha: 0.6),
              borderRadius: BorderRadius.circular(AppRadius.lg),
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.xs),
              child: Column(
                children: [
                  _TierRow(
                    icon: Icons.school_rounded,
                    label: fares.studentEstimated ? '${l10n.student} (${l10n.estimatedShort})' : l10n.student,
                    value: money(fares.student),
                  ),
                  _TierRow(icon: Icons.child_care_rounded, label: l10n.child, value: money(fares.child)),
                  _TierRow(icon: Icons.elderly_rounded, label: l10n.senior, value: money(fares.senior)),
                ],
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            metaLine,
            style: text.bodyMedium?.copyWith(color: cs.onSurfaceVariant, fontFeatures: _tabular),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(updatedLine, style: text.bodySmall?.copyWith(color: cs.onSurfaceVariant), maxLines: 2, overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }

  String _transferText(TffLocalizations l10n, String keyOrText) {
    return switch (keyOrText) {
      'transfer_direct' => l10n.transferDirect,
      'transfer_one' => l10n.transferOne,
      'transfer_one_to_two' => l10n.transferOneToTwo,
      'transfer_dock_swap' => l10n.transferDockSwap,
      _ => keyOrText,
    };
  }
}

/// Where a fare came from. Live (teal, the brand color) is the one to trust;
/// Mock data is an amber caution; Saved is neutral.
class _SourceBadge extends StatelessWidget {
  const _SourceBadge({required this.source});

  final FareSource source;

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    final cs = Theme.of(context).colorScheme;
    return switch (source) {
      FareSource.live => TffBadge(
          label: l10n.sourceLive,
          icon: Icons.bolt_rounded,
          iconColor: cs.onPrimaryContainer,
          labelColor: cs.onPrimaryContainer,
          backgroundColor: cs.primaryContainer,
          borderColor: cs.primary.withValues(alpha: 0.25),
        ),
      FareSource.mock => TffBadge(
          label: l10n.sourceMock,
          icon: Icons.science_rounded,
          iconColor: cs.onTertiaryContainer,
          labelColor: cs.onTertiaryContainer,
          backgroundColor: cs.tertiaryContainer,
          borderColor: cs.tertiary.withValues(alpha: 0.25),
        ),
      FareSource.cache => TffBadge(
          label: l10n.sourceCached,
          icon: Icons.cloud_done_rounded,
        ),
    };
  }
}

class _TierRow extends StatelessWidget {
  const _TierRow({required this.label, required this.value, required this.icon});

  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;
    // Read as one item by screen readers: "Child, NT$745".
    return MergeSemantics(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
        child: Row(
          children: [
            Icon(icon, size: 18, color: cs.onSurfaceVariant),
            const SizedBox(width: AppSpacing.sm),
            // Label and price share one line when they fit. With large system
            // text the price drops under the label, so the label wraps between
            // words instead of splitting one ("perkira-an" at 200%).
            Expanded(
              child: Wrap(
                alignment: WrapAlignment.spaceBetween,
                crossAxisAlignment: WrapCrossAlignment.center,
                spacing: AppSpacing.sm,
                children: [
                  Text(label, style: text.bodyMedium?.copyWith(color: cs.onSurfaceVariant)),
                  Text(value, style: text.titleSmall?.copyWith(fontWeight: FontWeight.w700, fontFeatures: _tabular)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
