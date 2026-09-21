import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:taiwan_fare_finder/localization/tff_localizations.dart';
import 'package:taiwan_fare_finder/theme.dart';
import 'package:taiwan_fare_finder/ui/legal_section.dart';
import 'package:taiwan_fare_finder/ui/tff_page_scaffold.dart';

class TermsPage extends StatelessWidget {
  const TermsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    final cs = Theme.of(context).colorScheme;

    return TffPageScaffold(
      title: l10n.termsOfUse,
      actions: [
        IconButton(
          tooltip: l10n.cancel,
          onPressed: () => context.pop(),
          icon: Icon(Icons.close_rounded, color: cs.onSurface),
        ),
        const SizedBox(width: AppSpacing.sm),
      ],
      child: LayoutBuilder(
        builder: (context, constraints) {
          const maxContentWidth = 720.0;

          return Align(
            alignment: Alignment.topCenter,
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: constraints.maxWidth < maxContentWidth ? constraints.maxWidth : maxContentWidth,
              ),
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, AppSpacing.xxl),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      l10n.termsLastUpdated,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      l10n.termsIntro,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: cs.onSurfaceVariant, height: 1.5),
                    ),
                    const SizedBox(height: AppSpacing.xl),
                    LegalSection(title: l10n.termsSection1Title, body: l10n.termsSection1Body),
                    LegalSection(title: l10n.termsSection2Title, body: l10n.termsSection2Body),
                    LegalSection(title: l10n.termsSection3Title, body: l10n.termsSection3Body),
                    LegalSection(title: l10n.termsSection4Title, body: l10n.termsSection4Body),
                    LegalSection(title: l10n.termsSection5Title, body: l10n.termsSection5Body),
                    LegalSection(title: l10n.termsSection6Title, body: l10n.termsSection6Body),
                    LegalSection(title: l10n.termsSection7Title, body: l10n.termsSection7Body),
                    LegalSection(title: l10n.termsSection8Title, body: l10n.termsSection8Body),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
