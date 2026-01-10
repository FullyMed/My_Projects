import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:taiwan_fare_finder/controllers/fare_controller.dart';
import 'package:taiwan_fare_finder/controllers/history_controller.dart';
import 'package:taiwan_fare_finder/controllers/settings_controller.dart';
import 'package:taiwan_fare_finder/localization/tff_localizations.dart';
import 'package:taiwan_fare_finder/models/fare_result.dart';
import 'package:taiwan_fare_finder/models/location.dart';
import 'package:taiwan_fare_finder/models/search_history_entry.dart';
import 'package:taiwan_fare_finder/models/transport_mode.dart';
import 'package:taiwan_fare_finder/services/location_service.dart';
import 'package:taiwan_fare_finder/services/analytics_service.dart';
import 'package:taiwan_fare_finder/theme.dart';
import 'package:taiwan_fare_finder/ui/location_field.dart';
import 'package:taiwan_fare_finder/ui/tff_button.dart';
import 'package:taiwan_fare_finder/ui/tff_card.dart';
import 'package:taiwan_fare_finder/ui/tff_empty_state.dart';
import 'package:taiwan_fare_finder/ui/fare_result_card.dart';
import 'package:taiwan_fare_finder/ui/tff_mode_chip.dart';
import 'package:taiwan_fare_finder/ui/tff_page_scaffold.dart';
import 'package:taiwan_fare_finder/ui/tff_swap_button.dart';
import 'package:taiwan_fare_finder/ui/tff_error_card.dart';
import 'package:taiwan_fare_finder/ui/tff_skeleton.dart';

class ComparePage extends StatefulWidget {
  const ComparePage({super.key});

  @override
  State<ComparePage> createState() => _ComparePageState();
}

class _ComparePageState extends State<ComparePage> {
  Location? _origin;
  Location? _destination;
  final Set<TransportMode> _modes = {TransportMode.hsr, TransportMode.tra, TransportMode.mrt};
  CompareSort _sort = CompareSort.cheapest;

  Location _fallbackLocation(String raw) {
    final trimmed = raw.trim();
    return Location(id: 'legacy_${trimmed.toLowerCase()}', nameEn: trimmed, nameZhHant: trimmed, nameId: trimmed, cityEn: trimmed, cityZhHant: trimmed, cityId: trimmed);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    final cs = Theme.of(context).colorScheme;
    final fare = context.watch<FareController>();
    final snack = fare.snackMessage;
    if (snack != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!context.mounted) return;
        final msg = switch (snack) {
          'showing_cached_results' => l10n.showingCachedResults,
          _ => '',
        };
        if (msg.isNotEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(msg),
              behavior: SnackBarBehavior.floating,
              duration: const Duration(seconds: 3),
            ),
          );
        }
        context.read<FareController>().consumeSnackMessage();
      });
    }
    final settings = context.watch<SettingsController>();
    final history = context.watch<HistoryController>();

    final canCompare = _origin != null && _destination != null && _origin!.id != _destination!.id && _modes.isNotEmpty;
    final recentLocations = _recentFromHistory(history.history);

    final sorted = [...fare.results]..sort((a, b) => _compareResults(a, b, _sort));

    return TffPageScaffold(
      title: l10n.tabCompare,
      actions: [
        IconButton(
          tooltip: l10n.settings,
          onPressed: () => context.push('/settings'),
          icon: Icon(Icons.tune_rounded, color: cs.onSurface),
        ),
        const SizedBox(width: AppSpacing.sm),
      ],
      child: LayoutBuilder(
        builder: (context, constraints) {
          final isWide = constraints.maxWidth >= 840;

          final form = TffCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(child: Text(l10n.compareFares, style: Theme.of(context).textTheme.titleLarge)),
                    TffSwapButton(
                      tooltip: l10n.swap,
                      enabled: !fare.isLoading,
                      onPressed: () {
                        if (_origin == null || _destination == null) return;
                        setState(() {
                          final a = _origin;
                          _origin = _destination;
                          _destination = a;
                        });
                      },
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(l10n.compareHint, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: cs.onSurfaceVariant), maxLines: 3, overflow: TextOverflow.ellipsis),
                const SizedBox(height: AppSpacing.lg),
                LocationField(label: l10n.origin, value: _origin, recent: recentLocations, popular: LocationService.popular(), onChanged: (v) => setState(() => _origin = v), enabled: !fare.isLoading),
                const SizedBox(height: AppSpacing.md),
                LocationField(label: l10n.destination, value: _destination, recent: recentLocations, popular: LocationService.popular(), onChanged: (v) => setState(() => _destination = v), enabled: !fare.isLoading),
                const SizedBox(height: AppSpacing.lg),
                Text(l10n.transportModes, style: Theme.of(context).textTheme.labelLarge?.copyWith(color: cs.onSurfaceVariant)),
                const SizedBox(height: AppSpacing.sm),
                Row(
                  children: [
                    Expanded(child: Text(l10n.compareSelectedCountLabel(_modes.length), style: Theme.of(context).textTheme.bodySmall?.copyWith(color: cs.onSurfaceVariant))),
                    TffTextButton(
                      label: l10n.selectAll,
                      icon: Icons.select_all_rounded,
                      onPressed: fare.isLoading
                          ? null
                          : () {
                              setState(() {
                                _modes
                                  ..clear()
                                  ..addAll(TransportMode.values);
                              });
                            },
                    ),
                    TffTextButton(
                      label: l10n.clear,
                      icon: Icons.clear_all_rounded,
                      onPressed: (fare.isLoading || _modes.isEmpty) ? null : () => setState(() => _modes.clear()),
                    ),
                  ],
                ),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    _multiChip(context, TransportMode.hsr, l10n.modesHSR, enabled: !fare.isLoading),
                    _multiChip(context, TransportMode.tra, l10n.modesTRA, enabled: !fare.isLoading),
                    _multiChip(context, TransportMode.mrt, l10n.modesMRT, enabled: !fare.isLoading),
                    _multiChip(context, TransportMode.bus, l10n.modesBus, enabled: !fare.isLoading),
                    _multiChip(context, TransportMode.youBike, l10n.modesYouBike, enabled: !fare.isLoading),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                Row(
                  children: [
                    Expanded(child: Text(l10n.compareSortLabel, style: Theme.of(context).textTheme.labelLarge?.copyWith(color: cs.onSurfaceVariant))),
                    SizedBox(
                      width: 220,
                      child: DropdownButtonFormField<CompareSort>(
                        value: _sort,
                        decoration: InputDecoration(
                          isDense: true,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                          filled: true,
                          fillColor: cs.surfaceContainerHighest.withValues(alpha: 0.55),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppRadius.lg), borderSide: BorderSide(color: cs.outline.withValues(alpha: 0.2))),
                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(AppRadius.lg), borderSide: BorderSide(color: cs.outline.withValues(alpha: 0.2))),
                        ),
                        items: [
                          DropdownMenuItem(value: CompareSort.cheapest, child: Text(l10n.compareSortCheapest, maxLines: 1, overflow: TextOverflow.ellipsis)),
                          DropdownMenuItem(value: CompareSort.fastest, child: Text(l10n.compareSortFastest, maxLines: 1, overflow: TextOverflow.ellipsis)),
                          DropdownMenuItem(value: CompareSort.fewestTransfers, child: Text(l10n.compareSortFewestTransfers, maxLines: 1, overflow: TextOverflow.ellipsis)),
                        ],
                        onChanged: fare.isLoading ? null : (v) => setState(() => _sort = v ?? CompareSort.cheapest),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),
                TffPrimaryButton(
                  label: l10n.compareFares,
                  icon: Icons.compare_arrows_rounded,
                  isLoading: fare.isLoading,
                  onPressed: canCompare
                      ? () async {
                          final modes = _modes.toList();
                          context.read<AnalyticsService>().logEvent('search_run', params: {'type': 'compare', 'modes': modes.map((e) => e.storageKey).join(',')});
                          await context.read<FareController>().search(origin: _origin!.queryToken, destination: _destination!.queryToken, modes: modes, offline: settings.offlineMode, dataMode: settings.dataMode);
                          await context.read<HistoryController>().add(origin: _origin!.queryToken, destination: _destination!.queryToken, modes: modes);
                        }
                      : null,
                ),
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 180),
                  child: (!fare.isLoading && !canCompare)
                      ? Padding(
                          padding: const EdgeInsets.only(top: AppSpacing.sm),
                          child: Text(
                            l10n.compareDisabledHelper,
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                          ),
                        )
                      : const SizedBox.shrink(),
                ),
              ],
            ),
          );

          late final Widget results;
          if (fare.isLoading) {
            results = const CompareResultsSkeletonList();
          } else if (fare.errorMessage == 'offline_no_cache') {
            results = TffEmptyState(title: l10n.noResults, body: l10n.offlineNoCache, icon: Icons.wifi_off_rounded);
          } else if (fare.errorMessage == 'api_not_ready') {
            results = TffErrorCard(
              title: l10n.errorTitle,
              message: l10n.errorApiNotReady,
              onRetry: (canCompare && !fare.isLoading)
                  ? () => context.read<FareController>().search(origin: _origin!.queryToken, destination: _destination!.queryToken, modes: _modes.toList(), offline: settings.offlineMode, dataMode: settings.dataMode)
                  : null,
            );
          } else if (fare.errorMessage == 'search_failed') {
            results = TffErrorCard(
              title: l10n.errorTitle,
              message: l10n.errorSearchFailed,
              onRetry: (canCompare && !fare.isLoading)
                  ? () => context.read<FareController>().search(origin: _origin!.queryToken, destination: _destination!.queryToken, modes: _modes.toList(), offline: settings.offlineMode, dataMode: settings.dataMode)
                  : null,
            );
          } else if (sorted.isEmpty) {
            results = TffEmptyState(title: l10n.noResults, body: l10n.pickRouteFirst, icon: Icons.compare_arrows_rounded);
          } else {
            results = _CompareResults(results: sorted);
          }

          if (!isWide) {
            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, AppSpacing.xxl),
              child: Column(children: [form, const SizedBox(height: AppSpacing.lg), results]),
            );
          }

          return Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, AppSpacing.xxl),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [Flexible(flex: 5, child: form), const SizedBox(width: AppSpacing.lg), Flexible(flex: 6, child: results)]),
          );
        },
      ),
    );
  }

  Widget _multiChip(BuildContext context, TransportMode mode, String label, {required bool enabled}) {
    final selected = _modes.contains(mode);
    return TffModeChip(
      mode: mode,
      selected: selected,
      label: label,
      enabled: enabled,
      onSelected: (v) {
        setState(() {
          if (v) {
            _modes.add(mode);
          } else {
            _modes.remove(mode);
          }
        });
      },
    );
  }
}

enum CompareSort { cheapest, fastest, fewestTransfers }

int _compareResults(FareResult a, FareResult b, CompareSort sort) {
  final modeOrder = _modeOrderIndex;
  final modeCmp = (modeOrder[a.mode] ?? 99).compareTo(modeOrder[b.mode] ?? 99);
  int cmp;
  switch (sort) {
    case CompareSort.cheapest:
      cmp = a.fares.adult.compareTo(b.fares.adult);
      if (cmp != 0) return cmp;
      cmp = a.durationMinutes.compareTo(b.durationMinutes);
      if (cmp != 0) return cmp;
      return modeCmp;
    case CompareSort.fastest:
      cmp = a.durationMinutes.compareTo(b.durationMinutes);
      if (cmp != 0) return cmp;
      cmp = a.fares.adult.compareTo(b.fares.adult);
      if (cmp != 0) return cmp;
      return modeCmp;
    case CompareSort.fewestTransfers:
      cmp = _transferCount(a.transferSummary).compareTo(_transferCount(b.transferSummary));
      if (cmp != 0) return cmp;
      cmp = a.fares.adult.compareTo(b.fares.adult);
      if (cmp != 0) return cmp;
      cmp = a.durationMinutes.compareTo(b.durationMinutes);
      if (cmp != 0) return cmp;
      return modeCmp;
  }
}

final Map<TransportMode, int> _modeOrderIndex = {
  TransportMode.hsr: 0,
  TransportMode.tra: 1,
  TransportMode.mrt: 2,
  TransportMode.bus: 3,
  TransportMode.youBike: 4,
};

int _transferCount(String summary) {
  final s = summary.toLowerCase().trim();
  if (s.isEmpty) return 99;
  if (s == 'transfer_direct') return 0;
  if (s == 'transfer_one') return 1;
  if (s == 'transfer_one_to_two') return 1;
  if (s == 'transfer_dock_swap') return 0;
  if (s.contains('direct')) return 0;
  final m = RegExp(r'\d+').firstMatch(s);
  if (m == null) return 99;
  return int.tryParse(m.group(0)!) ?? 99;
}

List<Location> _recentFromHistory(List<SearchHistoryEntry> history) {
  final seen = <String>{};
  final out = <Location>[];
  for (final entry in history) {
    final a = LocationService.findByAnyName(entry.origin);
    if (a != null && seen.add(a.id)) out.add(a);
    final b = LocationService.findByAnyName(entry.destination);
    if (b != null && seen.add(b.id)) out.add(b);
    if (out.length >= 8) break;
  }
  return out;
}

class _CompareResults extends StatelessWidget {
  const _CompareResults({required this.results});

  final List<FareResult> results;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        for (final r in results) ...[
          FareResultCard(result: r),
          const SizedBox(height: AppSpacing.lg),
        ]
      ],
    );
  }
}
