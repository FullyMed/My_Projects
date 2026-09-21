import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:taiwan_fare_finder/localization/tff_localizations.dart';
import 'package:taiwan_fare_finder/theme.dart';
import 'package:taiwan_fare_finder/ui/legal_section.dart';
import 'package:taiwan_fare_finder/ui/tff_page_scaffold.dart';

class PrivacyPolicyPage extends StatelessWidget {
  const PrivacyPolicyPage({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    final cs = Theme.of(context).colorScheme;

    return TffPageScaffold(
      title: l10n.privacyPolicyTitle,
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
                      l10n.privacyLastUpdated,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      l10n.privacyPolicyIntro,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: cs.onSurfaceVariant, height: 1.5),
                    ),
                    const SizedBox(height: AppSpacing.xl),
                    LegalSection(title: l10n.privacySection1Title, body: l10n.privacySection1Body),
                    LegalSection(title: l10n.privacySection2Title, body: l10n.privacySection2Body),
                    LegalSection(title: l10n.privacySection3Title, body: l10n.privacySection3Body),
                    LegalSection(title: l10n.privacySection4Title, body: l10n.privacySection4Body),
                    LegalSection(title: l10n.privacySection5Title, body: l10n.privacySection5Body),
                    LegalSection(title: l10n.privacySection6Title, body: l10n.privacySection6Body),
                    LegalSection(title: l10n.privacySection7Title, body: l10n.privacySection7Body),
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
