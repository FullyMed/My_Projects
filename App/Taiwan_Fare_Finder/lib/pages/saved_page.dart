import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:taiwan_fare_finder/controllers/fare_controller.dart';
import 'package:taiwan_fare_finder/controllers/favorites_controller.dart';
import 'package:taiwan_fare_finder/controllers/history_controller.dart';
import 'package:taiwan_fare_finder/controllers/settings_controller.dart';
import 'package:taiwan_fare_finder/localization/tff_localizations.dart';
import 'package:taiwan_fare_finder/models/app_settings.dart';
import 'package:taiwan_fare_finder/models/favorite_route.dart';
import 'package:taiwan_fare_finder/models/search_history_entry.dart';
import 'package:taiwan_fare_finder/models/transport_mode.dart';
import 'package:taiwan_fare_finder/services/analytics_service.dart';
import 'package:taiwan_fare_finder/theme.dart';
import 'package:taiwan_fare_finder/ui/tff_adaptive.dart';
import 'package:taiwan_fare_finder/ui/tff_button.dart';
import 'package:taiwan_fare_finder/ui/tff_card.dart';
import 'package:taiwan_fare_finder/ui/tff_empty_state.dart';
import 'package:taiwan_fare_finder/ui/tff_page_scaffold.dart';

class SavedPage extends StatefulWidget {
  const SavedPage({super.key});

  @override
  State<SavedPage> createState() => _SavedPageState();
}

class _SavedPageState extends State<SavedPage>
    with SingleTickerProviderStateMixin {
  late final TabController _tab = TabController(length: 2, vsync: this);

  @override
  void dispose() {
    _tab.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    final cs = Theme.of(context).colorScheme;
    final fav = context.watch<FavoritesController>();
    final hist = context.watch<HistoryController>();
    final settings = context.watch<SettingsController>();
    final isWide = TffAdaptive.isWide(context);

    final favContent = _buildFavoritesContent(context, l10n, fav, settings);
    final histContent = _buildHistoryContent(context, l10n, hist, settings, showHeader: !isWide);

    return TffPageScaffold(
      title: l10n.tabSaved,
      actions: [
        IconButton(
          tooltip: l10n.settings,
          onPressed: () => context.push('/settings'),
          icon: Icon(Icons.tune_rounded, color: cs.onSurface),
        ),
        const SizedBox(width: AppSpacing.sm),
      ],
      child: isWide
          ? _WideLayout(
              favContent: favContent,
              histContent: histContent,
              favCount: fav.favorites.length,
              histCount: hist.history.length,
              onClearHistory: hist.history.isEmpty
                  ? null
                  : () async {
                      final histCtrl = context.read<HistoryController>();
                      final confirmed = await _confirmClearHistory(context);
                      if (confirmed != true) return;
                      await histCtrl.clear();
                    },
            )
          : _NarrowLayout(
              tab: _tab,
              favContent: favContent,
              histContent: histContent,
            ),
    );
  }

  Widget _buildFavoritesContent(
    BuildContext context,
    TffLocalizations l10n,
    FavoritesController fav,
    SettingsController settings,
  ) {
    if (fav.isLoading) return const Center(child: CircularProgressIndicator());
    if (fav.favorites.isEmpty) {
      return TffEmptyState(
        title: l10n.emptyFavorites,
        body: l10n.emptyFavoritesBody,
        icon: Icons.bookmark_border_rounded,
      );
    }
    return _FavoritesList(
      items: fav.favorites,
      offline: settings.offlineMode,
      dataMode: settings.dataMode,
    );
  }

  Widget _buildHistoryContent(
    BuildContext context,
    TffLocalizations l10n,
    HistoryController hist,
    SettingsController settings, {
    bool showHeader = true,
  }) {
    if (hist.isLoading) return const Center(child: CircularProgressIndicator());
    if (hist.history.isEmpty) {
      return TffEmptyState(
        title: l10n.emptyHistory,
        body: l10n.emptyHistoryBody,
        icon: Icons.history_rounded,
      );
    }
    return _HistoryList(
      items: hist.history,
      offline: settings.offlineMode,
      dataMode: settings.dataMode,
      showHeader: showHeader,
    );
  }
}

// ── Wide layout: two side-by-side columns ─────────────────────────────────────

class _WideLayout extends StatelessWidget {
  const _WideLayout({
    required this.favContent,
    required this.histContent,
    required this.favCount,
    required this.histCount,
    required this.onClearHistory,
  });

  final Widget favContent;
  final Widget histContent;
  final int favCount;
  final int histCount;
  final VoidCallback? onClearHistory;

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    final cs = Theme.of(context).colorScheme;

    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.md),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Favorites column
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(
                      AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.md),
                  child: Row(
                    children: [
                      Icon(Icons.bookmark_rounded,
                          size: 18, color: cs.tertiary),
                      const SizedBox(width: AppSpacing.sm),
                      Text(
                        l10n.favorites,
                        style: Theme.of(context)
                            .textTheme
                            .titleMedium
                            ?.copyWith(fontWeight: FontWeight.w700),
                      ),
                      if (favCount > 0) ...[
                        const SizedBox(width: AppSpacing.sm),
                        _CountChip(count: favCount, cs: cs),
                      ],
                    ],
                  ),
                ),
                Expanded(child: favContent),
              ],
            ),
          ),
          // Divider
          VerticalDivider(
            width: 1,
            thickness: 1,
            color: cs.outline.withValues(alpha: 0.12),
          ),
          // History column
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(
                      AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.md),
                  child: Row(
                    children: [
                      Icon(Icons.history_rounded,
                          size: 18, color: cs.secondary),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Text(
                          l10n.history,
                          style: Theme.of(context)
                              .textTheme
                              .titleMedium
                              ?.copyWith(fontWeight: FontWeight.w700),
                        ),
                      ),
                      if (histCount > 0) ...[
                        _CountChip(count: histCount, cs: cs),
                        const SizedBox(width: AppSpacing.sm),
                        TffTextButton(
                          label: l10n.clearAll,
                          icon: Icons.delete_sweep_rounded,
                          onPressed: onClearHistory,
                        ),
                      ],
                    ],
                  ),
                ),
                Expanded(child: histContent),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CountChip extends StatelessWidget {
  const _CountChip({required this.count, required this.cs});
  final int count;
  final ColorScheme cs;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: cs.secondaryContainer,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        '$count',
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: cs.onSecondaryContainer,
              fontWeight: FontWeight.w700,
            ),
      ),
    );
  }
}

// ── Narrow layout: tabbed ─────────────────────────────────────────────────────

class _NarrowLayout extends StatelessWidget {
  const _NarrowLayout({
    required this.tab,
    required this.favContent,
    required this.histContent,
  });

  final TabController tab;
  final Widget favContent;
  final Widget histContent;

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    final cs = Theme.of(context).colorScheme;

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg, AppSpacing.sm, AppSpacing.lg, AppSpacing.md),
          child: Container(
            decoration: BoxDecoration(
              color: cs.surface.withValues(alpha: 0.8),
              borderRadius: BorderRadius.circular(999),
              border: Border.all(
                  color: cs.outline.withValues(alpha: 0.14)),
            ),
            child: TabBar(
              controller: tab,
              dividerHeight: 0,
              labelPadding:
                  const EdgeInsets.symmetric(horizontal: 18),
              indicator: BoxDecoration(
                color: cs.primaryContainer.withValues(alpha: 0.85),
                borderRadius: BorderRadius.circular(999),
              ),
              labelColor: cs.onPrimaryContainer,
              unselectedLabelColor: cs.onSurfaceVariant,
              tabs: [
                Tab(text: l10n.favorites),
                Tab(text: l10n.history),
              ],
            ),
          ),
        ),
        Expanded(
          child: TabBarView(
            controller: tab,
            children: [favContent, histContent],
          ),
        ),
      ],
    );
  }
}

// ── Favorites list ─────────────────────────────────────────────────────────────

class _FavoritesList extends StatelessWidget {
  const _FavoritesList({
    required this.items,
    required this.offline,
    required this.dataMode,
  });

  final List<FavoriteRoute> items;
  final bool offline;
  final DataMode dataMode;

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    final cs = Theme.of(context).colorScheme;
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(
          AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.xxl),
      itemCount: items.length,
      separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.md),
      itemBuilder: (context, i) {
        final f = items[i];
        final favController = context.read<FavoritesController>();
        return Dismissible(
          key: ValueKey('fav_${f.id}'),
          direction: DismissDirection.endToStart,
          background: const _SwipeDeleteBg(),
          onDismissed: (_) => favController.remove(f.id),
          child: _RouteTile(
            title: f.label,
            subtitle: _modesLabel(context, f.modes),
            onRun: () async {
              final fareCtrl = context.read<FareController>();
              context.read<AnalyticsService>().logEvent('saved_rerun',
                  params: {
                    'type': 'favorite',
                    'modes': f.modes.map((e) => e.storageKey).join(',')
                  });
              await fareCtrl.search(
                  origin: f.origin,
                  destination: f.destination,
                  modes: f.modes,
                  offline: offline,
                  dataMode: dataMode);
              if (context.mounted) context.go('/search');
            },
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.bookmark_rounded, color: cs.tertiary),
                const SizedBox(width: 6),
                IconButton(
                  tooltip: l10n.delete,
                  onPressed: () => favController.remove(f.id),
                  icon: Icon(Icons.delete_outline_rounded,
                      color:
                          Theme.of(context).colorScheme.onSurfaceVariant),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  String _modesLabel(BuildContext context, List<TransportMode> modes) {
    final l10n = TffLocalizations.of(context);
    final parts = modes
        .map((m) => switch (m) {
              TransportMode.hsr => l10n.modesHSR,
              TransportMode.tra => l10n.modesTRA,
              TransportMode.mrt => l10n.modesMRT,
              TransportMode.bus => l10n.modesBus,
              TransportMode.youBike => l10n.modesYouBike,
            })
        .toList();
    return parts.join(' • ');
  }
}

// ── History list ──────────────────────────────────────────────────────────────

class _HistoryList extends StatelessWidget {
  const _HistoryList({
    required this.items,
    required this.offline,
    required this.dataMode,
    this.showHeader = true,
  });

  final List<SearchHistoryEntry> items;
  final bool offline;
  final DataMode dataMode;
  final bool showHeader;

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    final cs = Theme.of(context).colorScheme;
    final histController = context.read<HistoryController>();

    return Column(
      children: [
        if (showHeader)
          Padding(
            padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.sm),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    l10n.history,
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(fontWeight: FontWeight.w700),
                  ),
                ),
                TffTextButton(
                  label: l10n.clearAll,
                  icon: Icons.delete_sweep_rounded,
                  onPressed: () async {
                    final confirmed = await _confirmClearHistory(context);
                    if (confirmed != true) return;
                    await histController.clear();
                  },
                ),
              ],
            ),
          ),
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.xxl),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.md),
            itemBuilder: (context, i) {
              final h = items[i];
              return Dismissible(
                key: ValueKey('hist_${h.id}'),
                direction: DismissDirection.endToStart,
                background: const _SwipeDeleteBg(),
                onDismissed: (_) => histController.remove(h.id),
                child: _RouteTile(
                  title: '${h.origin} → ${h.destination}',
                  subtitle: _modesLabel(context, h.modes),
                  onRun: () async {
                    final fareCtrl = context.read<FareController>();
                    context.read<AnalyticsService>().logEvent('saved_rerun',
                        params: {
                          'type': 'history',
                          'modes':
                              h.modes.map((e) => e.storageKey).join(',')
                        });
                    await fareCtrl.search(
                        origin: h.origin,
                        destination: h.destination,
                        modes: h.modes,
                        offline: offline,
                        dataMode: dataMode);
                    if (context.mounted) context.go(h.modes.length == 1 ? '/search' : '/compare');
                  },
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.history_rounded, color: cs.secondary),
                      const SizedBox(width: 6),
                      IconButton(
                        tooltip: l10n.delete,
                        onPressed: () => histController.remove(h.id),
                        icon: Icon(Icons.delete_outline_rounded,
                            color: Theme.of(context)
                                .colorScheme
                                .onSurfaceVariant),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  String _modesLabel(BuildContext context, List<TransportMode> modes) {
    final l10n = TffLocalizations.of(context);
    final parts = modes
        .map((m) => switch (m) {
              TransportMode.hsr => l10n.modesHSR,
              TransportMode.tra => l10n.modesTRA,
              TransportMode.mrt => l10n.modesMRT,
              TransportMode.bus => l10n.modesBus,
              TransportMode.youBike => l10n.modesYouBike,
            })
        .toList();
    return parts.join(' • ');
  }
}

// ── Shared tile ───────────────────────────────────────────────────────────────

class _RouteTile extends StatelessWidget {
  const _RouteTile({
    required this.title,
    required this.subtitle,
    required this.onRun,
    required this.trailing,
  });

  final String title;
  final String subtitle;
  final VoidCallback onRun;
  final Widget trailing;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final l10n = TffLocalizations.of(context);

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onRun,
      child: TffCard(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(fontWeight: FontWeight.w700),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: Theme.of(context)
                        .textTheme
                        .bodySmall
                        ?.copyWith(color: cs.onSurfaceVariant),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            trailing,
            const SizedBox(width: AppSpacing.sm),
            TffTextButton(
                label: l10n.rerun,
                icon: Icons.play_arrow_rounded,
                onPressed: onRun),
          ],
        ),
      ),
    );
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

Future<bool?> _confirmClearHistory(BuildContext context) async {
  final l10n = TffLocalizations.of(context);
  final cs = Theme.of(context).colorScheme;
  return showDialog<bool>(
    context: context,
    builder: (context) {
      return AlertDialog(
        title: Text(l10n.clearHistory,
            maxLines: 2, overflow: TextOverflow.ellipsis),
        content: Text(
          l10n.confirmDialogBody,
          style: Theme.of(context)
              .textTheme
              .bodyMedium
              ?.copyWith(color: cs.onSurfaceVariant),
        ),
        actions: [
          TextButton(
              onPressed: () => context.pop(false), child: Text(l10n.cancel)),
          FilledButton(
              onPressed: () => context.pop(true), child: Text(l10n.confirm)),
        ],
      );
    },
  );
}

class _SwipeDeleteBg extends StatelessWidget {
  const _SwipeDeleteBg();

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      alignment: Alignment.centerRight,
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      decoration: BoxDecoration(
        color: cs.errorContainer.withValues(alpha: 0.85),
        borderRadius: BorderRadius.circular(AppRadius.xl),
      ),
      child: Icon(Icons.delete_rounded, color: cs.onErrorContainer),
    );
  }
}
