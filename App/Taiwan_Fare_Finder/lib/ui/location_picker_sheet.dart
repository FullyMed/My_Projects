import 'dart:async';

import 'package:flutter/material.dart';
import 'package:taiwan_fare_finder/localization/tff_localizations.dart';
import 'package:taiwan_fare_finder/models/location.dart';
import 'package:taiwan_fare_finder/services/location_service.dart';
import 'package:taiwan_fare_finder/theme.dart';
import 'package:taiwan_fare_finder/ui/tff_empty_state.dart';

/// Bottom-sheet location picker designed for large lists.
///
/// Provides:
/// - Search w/ debounce
/// - Recent + Popular sections when search is empty
/// - Optional grouping (city)
/// - Localized primary + secondary labels
class LocationPickerSheet extends StatefulWidget {
  const LocationPickerSheet({
    super.key,
    required this.title,
    required this.initial,
    required this.recent,
    required this.popular,
    this.enableCityGrouping = true,
  });

  final String title;
  final Location? initial;
  final List<Location> recent;
  final List<Location> popular;
  final bool enableCityGrouping;

  static Future<Location?> show(
    BuildContext context, {
    required String title,
    required Location? initial,
    required List<Location> recent,
    required List<Location> popular,
    bool enableCityGrouping = true,
  }) {
    return showModalBottomSheet<Location>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      showDragHandle: true,
      backgroundColor: Theme.of(context).colorScheme.surface,
      builder: (context) => LocationPickerSheet(
        title: title,
        initial: initial,
        recent: recent,
        popular: popular,
        enableCityGrouping: enableCityGrouping,
      ),
    );
  }

  @override
  State<LocationPickerSheet> createState() => _LocationPickerSheetState();
}

class _LocationPickerSheetState extends State<LocationPickerSheet> {
  final _controller = TextEditingController();
  Timer? _debounce;
  String _query = '';

  @override
  void initState() {
    super.initState();
    _controller.addListener(_onChanged);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.removeListener(_onChanged);
    _controller.dispose();
    super.dispose();
  }

  void _onChanged() {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 380), () {
      if (!mounted) return;
      setState(() => _query = _controller.text);
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    final cs = Theme.of(context).colorScheme;

    final q = _query.trim();
    final searching = q.isNotEmpty;
    final results = searching ? LocationService.filter(q) : const <Location>[];

    final bottomPad = MediaQuery.viewInsetsOf(context).bottom;

    return Padding(
      padding: EdgeInsets.fromLTRB(AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.lg + bottomPad),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: AppSpacing.sm),
          Row(
            children: [
              Expanded(child: Text(widget.title, style: Theme.of(context).textTheme.titleLarge)),
              IconButton(
                tooltip: l10n.cancel,
                onPressed: () => Navigator.of(context).pop(),
                icon: Icon(Icons.close_rounded, color: cs.onSurface),
              )
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          TextField(
            controller: _controller,
            textInputAction: TextInputAction.search,
            decoration: InputDecoration(
              prefixIcon: Icon(Icons.search_rounded, color: cs.onSurfaceVariant),
              hintText: l10n.locationPickerSearchTitle,
              filled: true,
              fillColor: cs.surfaceContainerHighest.withValues(alpha: 0.55),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppRadius.xl), borderSide: BorderSide(color: cs.outline.withValues(alpha: 0.15))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(AppRadius.xl), borderSide: BorderSide(color: cs.outline.withValues(alpha: 0.15))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(AppRadius.xl), borderSide: BorderSide(color: cs.primary.withValues(alpha: 0.75), width: 1.4)),
              contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.md),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Flexible(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 180),
              switchInCurve: Curves.easeOut,
              switchOutCurve: Curves.easeIn,
              child: searching
                  ? _SearchResultsList(
                      key: const ValueKey('search'),
                      results: results,
                      onPick: (l) => Navigator.of(context).pop(l),
                      selectedId: widget.initial?.id,
                    )
                  : _BrowseSections(
                      key: const ValueKey('browse'),
                      recent: widget.recent,
                      popular: widget.popular,
                      enableCityGrouping: widget.enableCityGrouping,
                      onPick: (l) => Navigator.of(context).pop(l),
                      selectedId: widget.initial?.id,
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SearchResultsList extends StatelessWidget {
  const _SearchResultsList({super.key, required this.results, required this.onPick, required this.selectedId});

  final List<Location> results;
  final ValueChanged<Location> onPick;
  final String? selectedId;

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    if (results.isEmpty) {
      return TffEmptyState(title: l10n.locationPickerNoResultsTitle, body: l10n.locationPickerNoResultsBody, icon: Icons.location_off_rounded);
    }
    return ListView.separated(
      itemCount: results.length,
      separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.xs),
      itemBuilder: (context, i) => LocationListItem(location: results[i], selected: results[i].id == selectedId, onTap: () => onPick(results[i])),
    );
  }
}

class _BrowseSections extends StatelessWidget {
  const _BrowseSections({super.key, required this.recent, required this.popular, required this.enableCityGrouping, required this.onPick, required this.selectedId});

  final List<Location> recent;
  final List<Location> popular;
  final bool enableCityGrouping;
  final ValueChanged<Location> onPick;
  final String? selectedId;

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    final groups = enableCityGrouping ? LocationService.groupByCityEn(LocationService.starterLocations) : const <String, List<Location>>{};

    return ListView(
      children: [
        if (recent.isNotEmpty) ...[
          _SectionHeader(title: l10n.locationPickerRecentTitle),
          const SizedBox(height: AppSpacing.sm),
          for (final l in recent) ...[
            LocationListItem(location: l, selected: l.id == selectedId, onTap: () => onPick(l)),
            const SizedBox(height: AppSpacing.xs),
          ],
          const SizedBox(height: AppSpacing.lg),
        ],
        _SectionHeader(title: l10n.locationPickerPopularTitle),
        const SizedBox(height: AppSpacing.sm),
        for (final l in popular) ...[
          LocationListItem(location: l, selected: l.id == selectedId, onTap: () => onPick(l)),
          const SizedBox(height: AppSpacing.xs),
        ],
        if (enableCityGrouping) ...[
          const SizedBox(height: AppSpacing.lg),
          _SectionHeader(title: l10n.locationPickerBrowseByCity),
          const SizedBox(height: AppSpacing.sm),
          for (final entry in groups.entries) ...[
            _CityGroupTile(cityEn: entry.key, locations: entry.value, onPick: onPick, selectedId: selectedId),
            const SizedBox(height: AppSpacing.sm),
          ]
        ],
        const SizedBox(height: AppSpacing.xxl),
      ],
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Row(
      children: [
        Expanded(child: Text(title, style: Theme.of(context).textTheme.labelLarge?.copyWith(color: cs.onSurfaceVariant, letterSpacing: 0.3))),
      ],
    );
  }
}

class _CityGroupTile extends StatefulWidget {
  const _CityGroupTile({required this.cityEn, required this.locations, required this.onPick, required this.selectedId});

  final String cityEn;
  final List<Location> locations;
  final ValueChanged<Location> onPick;
  final String? selectedId;

  @override
  State<_CityGroupTile> createState() => _CityGroupTileState();
}

class _CityGroupTileState extends State<_CityGroupTile> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final l10n = TffLocalizations.of(context);
    final locale = l10n.locale;

    final cityLocalized = LocationService.starterLocations.firstWhere((l) => l.cityEn == widget.cityEn, orElse: () => widget.locations.first).cityForLocale(locale);
    return Container(
      decoration: BoxDecoration(
        color: cs.surfaceContainerHighest.withValues(alpha: 0.35),
        borderRadius: BorderRadius.circular(AppRadius.xl),
        border: Border.all(color: cs.outline.withValues(alpha: 0.12)),
      ),
      child: Column(
        children: [
          InkWell(
            borderRadius: BorderRadius.circular(AppRadius.xl),
            onTap: () => setState(() => _expanded = !_expanded),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.md),
              child: Row(
                children: [
                  Expanded(child: Text(cityLocalized, style: Theme.of(context).textTheme.titleMedium)),
                  AnimatedRotation(
                    duration: const Duration(milliseconds: 180),
                    turns: _expanded ? 0.5 : 0,
                    child: Icon(Icons.expand_more_rounded, color: cs.onSurfaceVariant),
                  ),
                ],
              ),
            ),
          ),
          AnimatedCrossFade(
            duration: const Duration(milliseconds: 200),
            crossFadeState: _expanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
            firstChild: const SizedBox.shrink(),
            secondChild: Padding(
              padding: const EdgeInsets.fromLTRB(AppSpacing.md, 0, AppSpacing.md, AppSpacing.md),
              child: Column(
                children: [
                  for (final l in widget.locations) ...[
                    LocationListItem(location: l, dense: true, selected: l.id == widget.selectedId, onTap: () => widget.onPick(l)),
                    const SizedBox(height: AppSpacing.xs),
                  ]
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class LocationListItem extends StatelessWidget {
  const LocationListItem({super.key, required this.location, required this.onTap, required this.selected, this.dense = false});

  final Location location;
  final VoidCallback onTap;
  final bool selected;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    final cs = Theme.of(context).colorScheme;
    final locale = l10n.locale;

    final title = location.nameForLocale(locale);
    final city = location.cityForLocale(locale);
    return InkWell(
      borderRadius: BorderRadius.circular(AppRadius.xl),
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: dense ? 10 : 12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppRadius.xl),
          color: selected ? cs.primaryContainer.withValues(alpha: 0.55) : cs.surfaceContainerHighest.withValues(alpha: 0.22),
          border: Border.all(color: selected ? cs.primary.withValues(alpha: 0.25) : cs.outline.withValues(alpha: 0.12)),
        ),
        child: Row(
          children: [
            Icon(Icons.place_rounded, color: selected ? cs.primary : cs.onSurfaceVariant, size: 20),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700), maxLines: 1, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 2),
                  Text(city, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: cs.onSurfaceVariant), maxLines: 1, overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            AnimatedScale(
              duration: const Duration(milliseconds: 180),
              scale: selected ? 1 : 0.9,
              child: Icon(selected ? Icons.check_circle_rounded : Icons.chevron_right_rounded, color: selected ? cs.primary : cs.onSurfaceVariant),
            ),
          ],
        ),
      ),
    );
  }
}
