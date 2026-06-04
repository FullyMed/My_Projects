import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:taiwan_fare_finder/controllers/fare_controller.dart';
import 'package:taiwan_fare_finder/controllers/favorites_controller.dart';
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
import 'package:taiwan_fare_finder/ui/tff_adaptive.dart';
import 'package:taiwan_fare_finder/ui/tff_button.dart';
import 'package:taiwan_fare_finder/ui/tff_card.dart';
import 'package:taiwan_fare_finder/ui/tff_empty_state.dart';
import 'package:taiwan_fare_finder/ui/fare_result_card.dart';
import 'package:taiwan_fare_finder/ui/tff_mode_chip.dart';
import 'package:taiwan_fare_finder/ui/tff_page_scaffold.dart';
import 'package:taiwan_fare_finder/ui/tff_swap_button.dart';
import 'package:taiwan_fare_finder/ui/tff_error_card.dart';
import 'package:taiwan_fare_finder/ui/tff_skeleton.dart';

class SearchPage extends StatefulWidget {
  const SearchPage({super.key});

  @override
  State<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  Location? _origin;
  Location? _destination;
  TransportMode? _mode = TransportMode.hsr;
  bool _hydratedFromLastQuery = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final fare = context.read<FareController>();
    if (_hydratedFromLastQuery) return;
    final last = fare.lastQuery;
    if (last != null && last.modes.length == 1) {
      _origin = LocationService.findByAnyName(last.origin) ?? Location.fromRaw(last.origin);
      _destination = LocationService.findByAnyName(last.destination) ?? Location.fromRaw(last.destination);
      _mode = last.modes.first;
      _hydratedFromLastQuery = true;
      setState(() {});
    }
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
    final favorites = context.watch<FavoritesController>();
    final history = context.watch<HistoryController>();

    final canSearch = _origin != null && _destination != null && _origin!.id != _destination!.id && _mode != null;

    final recentLocations = _recentFromHistory(history.history);

    final resultsEmpty = fare.results.isEmpty;
    final result = (_mode == null || resultsEmpty) ? null : fare.results.firstWhere((e) => e.mode == _mode, orElse: () => fare.results.first);

    return TffPageScaffold(
      title: l10n.tabSearch,
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
          final isWide = TffAdaptive.isWide(context);
          final form = _SearchFormCard(
            origin: _origin,
            destination: _destination,
            mode: _mode,
            recent: recentLocations,
            popular: LocationService.popular(),
            onOriginChanged: (v) => setState(() => _origin = v),
            onDestinationChanged: (v) => setState(() => _destination = v),
            onSwap: () {
              if (_origin == null || _destination == null) return;
              setState(() {
                final a = _origin;
                _origin = _destination;
                _destination = a;
              });
            },
            onModeChanged: (m) => setState(() => _mode = m),
            onSearch: canSearch
                ? () async {
                    final mode = _mode;
                    if (mode == null) return;
                    final fareCtrl = context.read<FareController>();
                    final histCtrl = context.read<HistoryController>();
                    context.read<AnalyticsService>().logEvent('search_run', params: {'type': 'single', 'mode': mode.storageKey});
                    await fareCtrl.search(origin: _origin!.queryToken, destination: _destination!.queryToken, modes: [mode], offline: settings.offlineMode, dataMode: settings.dataMode);
                    await histCtrl.add(origin: _origin!.queryToken, destination: _destination!.queryToken, modes: [mode]);
                  }
                : null,
            isLoading: fare.isLoading,
          );

          final results = _ResultsCard(
            result: result,
            resultsEmpty: resultsEmpty,
            isLoading: fare.isLoading,
            errorKey: fare.errorMessage,
            hasSearched: fare.hasSearched,
            inputsComplete: canSearch,
            isFavorite: _origin != null && _destination != null && _mode != null && favorites.isFavorite(origin: _origin!.queryToken, destination: _destination!.queryToken, modes: [_mode!]),
            onToggleFavorite: (_origin != null && _destination != null && _mode != null)
                ? () {
                    final mode = _mode;
                    if (mode == null) return;
                    context.read<AnalyticsService>().logEvent('favorite_toggle', params: {'mode': mode.storageKey});
                    context.read<FavoritesController>().toggleFavorite(origin: _origin!.queryToken, destination: _destination!.queryToken, modes: [mode]);
                  }
                : null,
            onRetry: (canSearch && !fare.isLoading)
                ? () => context.read<FareController>().search(origin: _origin!.queryToken, destination: _destination!.queryToken, modes: [_mode!], offline: settings.offlineMode, dataMode: settings.dataMode)
                : null,
          );

          if (!isWide) {
            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, AppSpacing.xxl),
              child: Column(
                children: [form, const SizedBox(height: AppSpacing.lg), results],
              ),
            );
          }

          return Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, AppSpacing.xxl),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Flexible(flex: 5, child: form),
                const SizedBox(width: AppSpacing.lg),
                Flexible(flex: 6, child: results),
              ],
            ),
          );
        },
      ),
    );
  }
}

List<Location> _recentFromHistory(List<SearchHistoryEntry> history) {
  final seen = <String>{};
  final out = <Location>[];
  for (final entry in history) {
    final originRaw = entry.origin;
    final destRaw = entry.destination;
    final a = LocationService.findByAnyName(originRaw);
    if (a != null && seen.add(a.id)) out.add(a);
    final b = LocationService.findByAnyName(destRaw);
    if (b != null && seen.add(b.id)) out.add(b);
    if (out.length >= 8) break;
  }
  return out;
}

class _SearchFormCard extends StatelessWidget {
  const _SearchFormCard({
    required this.origin,
    required this.destination,
    required this.mode,
    required this.recent,
    required this.popular,
    required this.onOriginChanged,
    required this.onDestinationChanged,
    required this.onSwap,
    required this.onModeChanged,
    required this.onSearch,
    required this.isLoading,
  });

  final Location? origin;
  final Location? destination;
  final TransportMode? mode;
  final List<Location> recent;
  final List<Location> popular;
  final ValueChanged<Location?> onOriginChanged;
  final ValueChanged<Location?> onDestinationChanged;
  final VoidCallback onSwap;
  final ValueChanged<TransportMode?> onModeChanged;
  final VoidCallback? onSearch;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    final cs = Theme.of(context).colorScheme;
    final isDisabled = onSearch == null;

    return TffCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: Text(l10n.searchFares, style: Theme.of(context).textTheme.titleLarge)),
              TffSwapButton(tooltip: l10n.swap, onPressed: onSwap, enabled: !isLoading),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          LocationField(label: l10n.origin, value: origin, recent: recent, popular: popular, onChanged: onOriginChanged, enabled: !isLoading),
          const SizedBox(height: AppSpacing.md),
          LocationField(label: l10n.destination, value: destination, recent: recent, popular: popular, onChanged: onDestinationChanged, enabled: !isLoading),
          const SizedBox(height: AppSpacing.lg),
          Text(l10n.transportMode, style: Theme.of(context).textTheme.labelLarge?.copyWith(color: cs.onSurfaceVariant)),
          const SizedBox(height: AppSpacing.sm),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              TffModeChip(
                mode: TransportMode.hsr,
                selected: mode == TransportMode.hsr,
                label: l10n.modesHSR,
                onSelected: (v) => onModeChanged(v ? TransportMode.hsr : null),
                enabled: !isLoading,
              ),
              TffModeChip(
                mode: TransportMode.tra,
                selected: mode == TransportMode.tra,
                label: l10n.modesTRA,
                onSelected: (v) => onModeChanged(v ? TransportMode.tra : null),
                enabled: !isLoading,
              ),
              TffModeChip(
                mode: TransportMode.mrt,
                selected: mode == TransportMode.mrt,
                label: l10n.modesMRT,
                onSelected: (v) => onModeChanged(v ? TransportMode.mrt : null),
                enabled: !isLoading,
              ),
              TffModeChip(
                mode: TransportMode.bus,
                selected: mode == TransportMode.bus,
                label: l10n.modesBus,
                onSelected: (v) => onModeChanged(v ? TransportMode.bus : null),
                enabled: !isLoading,
              ),
              TffModeChip(
                mode: TransportMode.youBike,
                selected: mode == TransportMode.youBike,
                label: l10n.modesYouBike,
                onSelected: (v) => onModeChanged(v ? TransportMode.youBike : null),
                enabled: !isLoading,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          TffPrimaryButton(label: l10n.searchFares, icon: Icons.search_rounded, isLoading: isLoading, onPressed: onSearch),
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 180),
            child: (!isLoading && isDisabled)
                ? Padding(
                    padding: const EdgeInsets.only(top: AppSpacing.sm),
                    child: Text(
                      l10n.searchDisabledHelper,
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                    ),
                  )
                : const SizedBox.shrink(),
          ),
        ],
      ),
    );
  }
}

class _ResultsCard extends StatelessWidget {
  const _ResultsCard({
    required this.result,
    required this.resultsEmpty,
    required this.isLoading,
    required this.errorKey,
    required this.hasSearched,
    required this.inputsComplete,
    required this.isFavorite,
    required this.onToggleFavorite,
    required this.onRetry,
  });

  final FareResult? result;
  final bool resultsEmpty;
  final bool isLoading;
  final String? errorKey;
  final bool hasSearched;
  final bool inputsComplete;
  final bool isFavorite;
  final VoidCallback? onToggleFavorite;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);

    if (isLoading) {
      return const FareResultSkeletonCard();
    }

    if (errorKey == 'offline_no_cache') {
      return TffEmptyState(title: l10n.noResults, body: l10n.offlineNoCache, icon: Icons.wifi_off_rounded);
    }

    if (errorKey == 'api_not_ready') {
      return TffErrorCard(title: l10n.errorTitle, message: l10n.errorApiNotReady, onRetry: onRetry);
    }

    if (errorKey == 'search_failed') {
      return TffErrorCard(title: l10n.errorTitle, message: l10n.errorSearchFailed, onRetry: onRetry);
    }

    if (!hasSearched) {
      if (!inputsComplete) {
        return TffEmptyState(title: l10n.searchEmptyPickTitle, body: l10n.searchEmptyPickBody, icon: Icons.place_rounded);
      }
      return TffEmptyState(title: l10n.searchEmptyReadyTitle, body: l10n.searchEmptyReadyBody, icon: Icons.search_rounded);
    }

    if (resultsEmpty) {
      return TffEmptyState(
        title: l10n.searchEmptyNoResultsTitle,
        body: l10n.searchEmptyNoResultsBody,
        icon: Icons.search_off_rounded,
        action: TffTextButton(label: l10n.retry, icon: Icons.refresh_rounded, onPressed: onRetry),
      );
    }

    if (result == null) {
      return TffEmptyState(title: l10n.searchEmptyNoResultsTitle, body: l10n.searchEmptyNoResultsBody, icon: Icons.search_off_rounded);
    }

    final cs = Theme.of(context).colorScheme;
    return FareResultCard(
      title: l10n.results,
      result: result!,
      trailing: IconButton(
        tooltip: isFavorite ? l10n.unfavorite : l10n.favorite,
        onPressed: onToggleFavorite,
        icon: Icon(isFavorite ? Icons.bookmark_rounded : Icons.bookmark_border_rounded, color: isFavorite ? cs.tertiary : cs.onSurfaceVariant),
      ),
    );
  }
}
