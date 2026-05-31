import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:taiwan_fare_finder/localization/tff_localizations.dart';
import 'package:taiwan_fare_finder/models/fare_result.dart';
import 'package:taiwan_fare_finder/models/transport_mode.dart';
import 'package:taiwan_fare_finder/theme.dart';
import 'package:taiwan_fare_finder/ui/tff_badge.dart';
import 'package:taiwan_fare_finder/ui/tff_card.dart';

/// A modern, decision-oriented card for showing a single [FareResult].
///
/// Features:
/// - Adult fare is emphasized as the primary decision signal.
/// - Other tiers are shown in a compact responsive grid.
/// - Duration + transfers shown as a single concise line.
/// - Localized "Last updated" timestamp.
/// - Source badge (Mock / Cached).
class FareResultCard extends StatelessWidget {
  const FareResultCard({
    super.key,
    required this.result,
    this.title,
    this.trailing,
  });

  final FareResult result;

  /// Optional title. If omitted, uses the mode label.
  final String? title;

  /// Optional widget placed at the far right of the header row.
  /// (e.g., favorite button).
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    final cs = Theme.of(context).colorScheme;
    final localeTag = Localizations.localeOf(context).toLanguageTag();
    final moneyFmt = NumberFormat.decimalPattern(localeTag);
    final updatedFmt = DateFormat.yMMMd(localeTag).add_Hm();

    return LayoutBuilder(
      builder: (context, c) {
        final isWide = c.maxWidth >= 520;
        final headerTitle = title ?? _modeLabel(context, result.mode);

        final adultPrice = 'NT\$${moneyFmt.format(result.fares.adult)}';
        final metaLine =
            '${result.distanceKm} ${l10n.kmShort} • ${result.durationMinutes} ${l10n.minutesShort} • ${_transferText(l10n, result.transferSummary)}';
        final updatedLine =
            '${l10n.lastUpdated}: ${updatedFmt.format(result.updatedAt)}';

        return TffCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      headerTitle,
                      style: Theme.of(context).textTheme.titleLarge,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  _SourceBadge(source: result.source),
                  if (trailing != null) ...[
                    const SizedBox(width: AppSpacing.xs),
                    trailing!,
                  ],
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              if (!isWide) ...[
                _PriceBlock(adultPrice: adultPrice, fares: result.fares),
                const SizedBox(height: AppSpacing.md),
                Text(metaLine,
                    style: Theme.of(context)
                        .textTheme
                        .bodyMedium
                        ?.copyWith(color: cs.onSurfaceVariant),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis),
                const SizedBox(height: AppSpacing.sm),
                Text(updatedLine,
                    style: Theme.of(context)
                        .textTheme
                        .labelSmall
                        ?.copyWith(color: cs.onSurfaceVariant),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
              ] else ...[
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                        flex: 7,
                        child: _PriceBlock(
                            adultPrice: adultPrice, fares: result.fares)),
                    const SizedBox(width: AppSpacing.lg),
                    Expanded(
                      flex: 5,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(metaLine,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyMedium
                                  ?.copyWith(color: cs.onSurfaceVariant),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis),
                          const SizedBox(height: AppSpacing.sm),
                          Text(updatedLine,
                              style: Theme.of(context)
                                  .textTheme
                                  .labelSmall
                                  ?.copyWith(color: cs.onSurfaceVariant),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        );
      },
    );
  }

  String _modeLabel(BuildContext context, TransportMode mode) {
    final l10n = TffLocalizations.of(context);
    return switch (mode) {
      TransportMode.hsr => l10n.modesHSR,
      TransportMode.tra => l10n.modesTRA,
      TransportMode.mrt => l10n.modesMRT,
      TransportMode.bus => l10n.modesBus,
      TransportMode.youBike => l10n.modesYouBike,
    };
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

class _SourceBadge extends StatelessWidget {
  const _SourceBadge({required this.source});

  final FareSource source;

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    final cs = Theme.of(context).colorScheme;
    return switch (source) {
      FareSource.mock => TffBadge(
          label: l10n.sourceMock,
          icon: Icons.science_rounded,
          iconColor: cs.primary,
          labelColor: cs.onPrimaryContainer,
          backgroundColor: cs.primaryContainer.withValues(alpha: 0.55),
          borderColor: cs.primary.withValues(alpha: 0.2),
        ),
      FareSource.cache => TffBadge(
          label: l10n.sourceCached,
          icon: Icons.cloud_done_rounded,
        ),
    };
  }
}

class _PriceBlock extends StatelessWidget {
  const _PriceBlock({required this.adultPrice, required this.fares});

  final String adultPrice;
  final FareBreakdown fares;

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    final cs = Theme.of(context).colorScheme;
    final localeTag = Localizations.localeOf(context).toLanguageTag();
    final moneyFmt = NumberFormat.decimalPattern(localeTag);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(l10n.adult,
            style: Theme.of(context)
                .textTheme
                .labelLarge
                ?.copyWith(color: cs.onSurfaceVariant)),
        const SizedBox(height: AppSpacing.xs),
        Text(
          adultPrice,
          style: Theme.of(context)
              .textTheme
              .displaySmall
              ?.copyWith(fontWeight: FontWeight.w800, letterSpacing: -0.6),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: AppSpacing.md),
        LayoutBuilder(
          builder: (context, c) {
            final cross = c.maxWidth >= 420 ? 3 : 2;
            return GridView.count(
              crossAxisCount: cross,
              physics: const NeverScrollableScrollPhysics(),
              shrinkWrap: true,
              mainAxisSpacing: AppSpacing.sm,
              crossAxisSpacing: AppSpacing.sm,
              childAspectRatio: cross == 3 ? 2.8 : 2.6,
              children: [
                _TierTile(
                    label: l10n.student,
                    value: 'NT\$${moneyFmt.format(fares.student)}',
                    icon: Icons.school_rounded),
                _TierTile(
                    label: l10n.child,
                    value: 'NT\$${moneyFmt.format(fares.child)}',
                    icon: Icons.child_care_rounded),
                _TierTile(
                    label: l10n.senior,
                    value: 'NT\$${moneyFmt.format(fares.senior)}',
                    icon: Icons.elderly_rounded),
              ],
            );
          },
        ),
      ],
    );
  }
}

class _TierTile extends StatelessWidget {
  const _TierTile(
      {required this.label, required this.value, required this.icon});

  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      padding:
          const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 6),
      decoration: BoxDecoration(
        color: cs.surfaceContainerHighest.withValues(alpha: 0.55),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: cs.onSurfaceVariant),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(label,
                    style: Theme.of(context)
                        .textTheme
                        .labelSmall
                        ?.copyWith(color: cs.onSurfaceVariant),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
                Text(value,
                    style: Theme.of(context)
                        .textTheme
                        .bodyMedium
                        ?.copyWith(fontWeight: FontWeight.w700),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
