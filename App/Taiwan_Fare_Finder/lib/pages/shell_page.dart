import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:taiwan_fare_finder/localization/tff_localizations.dart';

class ShellPage extends StatelessWidget {
  const ShellPage({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    final cs = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: cs.surface.withValues(alpha: 0.92),
          border: Border(top: BorderSide(color: cs.outline.withValues(alpha: 0.12), width: 0.5)),
        ),
        child: SafeArea(
          top: false,
          child: NavigationBarTheme(
            data: NavigationBarThemeData(
              backgroundColor: Colors.transparent,
              indicatorColor: cs.primaryContainer.withValues(alpha: 0.85),
              labelTextStyle: WidgetStatePropertyAll(textTheme.labelSmall?.copyWith(fontWeight: FontWeight.w600)),
              iconTheme: WidgetStateProperty.resolveWith((states) {
                final selected = states.contains(WidgetState.selected);
                return IconThemeData(color: selected ? cs.onPrimaryContainer : cs.onSurfaceVariant);
              }),
            ),
            child: NavigationBar(
              height: 72,
              selectedIndex: navigationShell.currentIndex,
              onDestinationSelected: (index) => navigationShell.goBranch(index, initialLocation: index == navigationShell.currentIndex),
              destinations: [
                NavigationDestination(icon: const Icon(Icons.search_rounded), label: l10n.tabSearch),
                NavigationDestination(icon: const Icon(Icons.compare_arrows_rounded), label: l10n.tabCompare),
                NavigationDestination(icon: const Icon(Icons.bookmark_rounded), label: l10n.tabSaved),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
