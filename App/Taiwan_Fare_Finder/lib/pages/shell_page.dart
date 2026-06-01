import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:taiwan_fare_finder/localization/tff_localizations.dart';
import 'package:taiwan_fare_finder/ui/tff_adaptive.dart';

class ShellPage extends StatelessWidget {
  const ShellPage({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  void _onDestinationSelected(int index) {
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    final cs = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    final useRail = TffAdaptive.useNavRail(context);
    final extendRail = TffAdaptive.useExtendedNavRail(context);

    final destinations = [
      (icon: Icons.search_rounded, label: l10n.tabSearch),
      (icon: Icons.compare_arrows_rounded, label: l10n.tabCompare),
      (icon: Icons.bookmark_rounded, label: l10n.tabSaved),
    ];

    // ── Wide: NavigationRail on the left ─────────────────────────────────
    if (useRail) {
      return Scaffold(
        body: Row(
          children: [
            NavigationRail(
              extended: extendRail,
              selectedIndex: navigationShell.currentIndex,
              onDestinationSelected: _onDestinationSelected,
              backgroundColor: cs.surface,
              indicatorColor: cs.primaryContainer.withValues(alpha: 0.85),
              selectedIconTheme: IconThemeData(color: cs.onPrimaryContainer),
              unselectedIconTheme: IconThemeData(color: cs.onSurfaceVariant),
              selectedLabelTextStyle: textTheme.labelSmall?.copyWith(
                fontWeight: FontWeight.w600,
                color: cs.onSurface,
              ),
              unselectedLabelTextStyle: textTheme.labelSmall?.copyWith(
                color: cs.onSurfaceVariant,
              ),
              destinations: [
                for (final d in destinations)
                  NavigationRailDestination(
                    icon: Icon(d.icon),
                    label: Text(d.label),
                  ),
              ],
            ),
            VerticalDivider(
              width: 1,
              thickness: 1,
              color: cs.outline.withValues(alpha: 0.12),
            ),
            Expanded(child: navigationShell),
          ],
        ),
      );
    }

    // ── Narrow: BottomNavigationBar ──────────────────────────────────────
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: cs.surface.withValues(alpha: 0.92),
          border: Border(
            top: BorderSide(
              color: cs.outline.withValues(alpha: 0.12),
              width: 0.5,
            ),
          ),
        ),
        child: SafeArea(
          top: false,
          child: NavigationBarTheme(
            data: NavigationBarThemeData(
              backgroundColor: Colors.transparent,
              indicatorColor: cs.primaryContainer.withValues(alpha: 0.85),
              labelTextStyle: WidgetStatePropertyAll(
                textTheme.labelSmall?.copyWith(fontWeight: FontWeight.w600),
              ),
              iconTheme: WidgetStateProperty.resolveWith((states) {
                final selected = states.contains(WidgetState.selected);
                return IconThemeData(
                  color: selected ? cs.onPrimaryContainer : cs.onSurfaceVariant,
                );
              }),
            ),
            child: NavigationBar(
              height: 72,
              selectedIndex: navigationShell.currentIndex,
              onDestinationSelected: _onDestinationSelected,
              destinations: [
                for (final d in destinations)
                  NavigationDestination(icon: Icon(d.icon), label: d.label),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
