import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:taiwan_fare_finder/localization/tff_localizations.dart';
import 'package:taiwan_fare_finder/nav.dart';
import 'package:taiwan_fare_finder/ui/tff_button.dart';
import 'package:taiwan_fare_finder/ui/tff_empty_state.dart';
import 'package:taiwan_fare_finder/ui/tff_page_scaffold.dart';

class NotFoundPage extends StatelessWidget {
  const NotFoundPage({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    return TffPageScaffold(
      title: l10n.notFoundTitle,
      child: Center(
        child: TffEmptyState(
          title: l10n.notFoundTitle,
          body: l10n.notFoundBody,
          icon: Icons.signpost_outlined,
          action: TffPrimaryButton(
            label: l10n.notFoundBackToSearch,
            icon: Icons.home_rounded,
            onPressed: () => context.go(AppRoutes.search),
          ),
        ),
      ),
    );
  }
}
