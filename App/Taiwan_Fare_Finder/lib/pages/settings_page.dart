import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:provider/provider.dart';
import 'package:taiwan_fare_finder/controllers/fare_controller.dart';
import 'package:taiwan_fare_finder/controllers/favorites_controller.dart';
import 'package:taiwan_fare_finder/controllers/history_controller.dart';
import 'package:taiwan_fare_finder/controllers/settings_controller.dart';
import 'package:taiwan_fare_finder/localization/tff_localizations.dart';
import 'package:taiwan_fare_finder/models/app_settings.dart';
import 'package:taiwan_fare_finder/theme.dart';
import 'package:taiwan_fare_finder/ui/tff_card.dart';
import 'package:taiwan_fare_finder/ui/tff_page_scaffold.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    final cs = Theme.of(context).colorScheme;
    final settings = context.watch<SettingsController>();
    final fare = context.watch<FareController>();

    return TffPageScaffold(
      title: l10n.settings,
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
          const maxContentWidth = 720.0; // tablet/desktop sweet spot

          return Align(
            alignment: Alignment.topCenter,
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: constraints.maxWidth < maxContentWidth
                    ? constraints.maxWidth
                    : maxContentWidth,
              ),
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  AppSpacing.lg,
                  AppSpacing.lg,
                  AppSpacing.xxl,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // =========================
                    // Language
                    // =========================
                    TffCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            l10n.language,
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          const SizedBox(height: AppSpacing.md),
                          _SegmentRow(
                            value: settings.settings?.localeTag ?? 'en',
                            enabled: !settings.isLoading,
                            onChanged: (v) => context
                                .read<SettingsController>()
                                .setLocaleTag(v),
                            items: [
                              _SegmentItem(
                                value: 'en',
                                label: l10n.settingsLanguageEnglish,
                              ),
                              _SegmentItem(
                                value: 'zh_Hant',
                                label: l10n.settingsLanguageChineseHant,
                              ),
                              _SegmentItem(
                                value: 'id',
                                label: l10n.settingsLanguageIndonesian,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: AppSpacing.lg),

                    // =========================
                    // Theme
                    // =========================
                    TffCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            l10n.theme,
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          const SizedBox(height: AppSpacing.md),
                          _SegmentRow(
                            value: settings.themeMode.name,
                            enabled: !settings.isLoading,
                            onChanged: (v) {
                              final mode = switch (v) {
                                'light' => ThemeMode.light,
                                'dark' => ThemeMode.dark,
                                _ => ThemeMode.system,
                              };
                              context
                                  .read<SettingsController>()
                                  .setThemeMode(mode);
                            },
                            items: [
                              _SegmentItem(
                                value: ThemeMode.system.name,
                                label: l10n.themeSystem,
                              ),
                              _SegmentItem(
                                value: ThemeMode.light.name,
                                label: l10n.themeLight,
                              ),
                              _SegmentItem(
                                value: ThemeMode.dark.name,
                                label: l10n.themeDark,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: AppSpacing.lg),

                    // =========================
                    // Offline mode
                    // =========================
                    TffCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  l10n.offlineMode,
                                  style: Theme.of(context).textTheme.titleLarge,
                                ),
                              ),
                              Switch.adaptive(
                                value: settings.offlineMode,
                                onChanged: (v) => context
                                    .read<SettingsController>()
                                    .setOfflineMode(v),
                              ),
                            ],
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          Text(
                            l10n.offlineModeBody,
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(color: cs.onSurfaceVariant),
                            maxLines: 3,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: AppSpacing.lg),

                    // =========================
                    // Data source
                    // =========================
                    TffCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            l10n.dataMode,
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          const SizedBox(height: AppSpacing.md),
                          _SegmentRow(
                            value: settings.dataMode.name,
                            enabled: !settings.isLoading,
                            onChanged: (v) {
                              final mode = switch (v) {
                                'api' => DataMode.api,
                                _ => DataMode.mock,
                              };
                              context
                                  .read<SettingsController>()
                                  .setDataMode(mode);
                            },
                            items: [
                              _SegmentItem(
                                value: DataMode.mock.name,
                                label: l10n.dataModeMock,
                              ),
                              _SegmentItem(
                                value: DataMode.api.name,
                                label: l10n.dataModeApi,
                              ),
                            ],
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          Text(
                            l10n.dataModeBody,
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(color: cs.onSurfaceVariant),
                            maxLines: 4,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: AppSpacing.lg),

                    // =========================
                    // Manage offline data
                    // =========================
                    TffCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            l10n.manageOfflineData,
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          Text(
                            l10n.manageOfflineDataBody,
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(color: cs.onSurfaceVariant),
                            maxLines: 3,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: AppSpacing.lg),
                          _InfoRow(
                            icon: Icons.route_rounded,
                            label: l10n.cachedQueries,
                            value: '${fare.cachedQueries}',
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          _InfoRow(
                            icon: Icons.layers_rounded,
                            label: l10n.cachedResults,
                            value: '${fare.cachedResults}',
                          ),
                          const SizedBox(height: AppSpacing.lg),
                          _DangerAction(
                            icon: Icons.delete_outline_rounded,
                            title: l10n.clearOfflineData,
                            onTap: () => _confirm(
                              context,
                              title: l10n.clearOfflineData,
                              onConfirm: () =>
                                  context.read<FareController>().clearCache(),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: AppSpacing.lg),

                    // =========================
                    // Data management
                    // =========================
                    TffCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            l10n.dataManagement,
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          const SizedBox(height: AppSpacing.md),
                          _DangerAction(
                            icon: Icons.history_rounded,
                            title: l10n.clearHistory,
                            onTap: () => _confirm(
                              context,
                              title: l10n.clearHistory,
                              onConfirm: () =>
                                  context.read<HistoryController>().clear(),
                            ),
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          _DangerAction(
                            icon: Icons.bookmark_remove_rounded,
                            title: l10n.clearFavorites,
                            onTap: () => _confirm(
                              context,
                              title: l10n.clearFavorites,
                              onConfirm: () =>
                                  context.read<FavoritesController>().clear(),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: AppSpacing.lg),
                    PrivacyCard(onReadMore: () => _showPrivacySheet(context)),
                    const SizedBox(height: AppSpacing.lg),
                    AboutCard(dataMode: settings.dataMode),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  void _showPrivacySheet(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    final cs = Theme.of(context).colorScheme;

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      backgroundColor: cs.surface,
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              AppSpacing.md,
              AppSpacing.lg,
              AppSpacing.xl,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.privacy,
                  style: Theme.of(context)
                      .textTheme
                      .titleLarge
                      ?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: AppSpacing.md),
                Text(
                  l10n.privacyBody,
                  style: Theme.of(context)
                      .textTheme
                      .bodyMedium
                      ?.copyWith(color: cs.onSurfaceVariant, height: 1.5),
                ),
                const SizedBox(height: AppSpacing.lg),
                Text(
                  l10n.dataModeBody,
                  style: Theme.of(context)
                      .textTheme
                      .bodyMedium
                      ?.copyWith(color: cs.onSurfaceVariant, height: 1.5),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _confirm(
    BuildContext context, {
    required String title,
    required Future<void> Function() onConfirm,
  }) async {
    final l10n = TffLocalizations.of(context);
    final cs = Theme.of(context).colorScheme;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(title, maxLines: 2, overflow: TextOverflow.ellipsis),
          content: Text(
            l10n.confirmDialogBody,
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(color: cs.onSurfaceVariant),
          ),
          actions: [
            TextButton(
              onPressed: () => context.pop(false),
              child: Text(l10n.cancel),
            ),
            FilledButton(
              onPressed: () => context.pop(true),
              child: Text(l10n.confirm),
            ),
          ],
        );
      },
    );

    if (confirmed == true) {
      try {
        await onConfirm();
      } catch (e) {
        debugPrint('SettingsPage confirm action failed ($title): $e');
      }
      if (!context.mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(l10n.cleared)));
    }
  }
}

class PrivacyCard extends StatelessWidget {
  const PrivacyCard({super.key, required this.onReadMore});

  final VoidCallback onReadMore;

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    final cs = Theme.of(context).colorScheme;

    return TffCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  l10n.privacy,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ),
              TextButton(
                onPressed: onReadMore,
                child: Text(l10n.privacyReadMore),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            l10n.privacyBody,
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(color: cs.onSurfaceVariant, height: 1.5),
            maxLines: 4,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class AboutCard extends StatefulWidget {
  const AboutCard({super.key, required this.dataMode});

  final DataMode dataMode;

  @override
  State<AboutCard> createState() => _AboutCardState();
}

class _AboutCardState extends State<AboutCard> {
  late final Future<PackageInfo> _infoFuture;

  @override
  void initState() {
    super.initState();
    _infoFuture = _loadInfo();
  }

  Future<PackageInfo> _loadInfo() async {
    try {
      return await PackageInfo.fromPlatform();
    } catch (e) {
      debugPrint('AboutCard: failed to read package info: $e');
      return PackageInfo(
        appName: 'Taiwan Fare Finder',
        packageName: 'taiwan_fare_finder',
        version: '-',
        buildNumber: '-',
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);

    final dataModeLabel = switch (widget.dataMode) {
      DataMode.api => l10n.dataModeApi,
      _ => l10n.dataModeMock,
    };

    final cs = Theme.of(context).colorScheme;

    return TffCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(l10n.about, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: AppSpacing.lg),
          FutureBuilder<PackageInfo>(
            future: _infoFuture,
            builder: (context, snap) {
              final versionText = (snap.data == null)
                  ? '—'
                  : '${snap.data!.version} (${snap.data!.buildNumber})';
              return Column(
                children: [
                  _InfoRow(
                    icon: Icons.info_outline_rounded,
                    label: l10n.aboutVersion,
                    value: versionText,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoRow(
                    icon: Icons.storage_rounded,
                    label: l10n.aboutDataSource,
                    value: dataModeLabel,
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            l10n.dataModeBody,
            style: Theme.of(context)
                .textTheme
                .bodySmall
                ?.copyWith(color: cs.onSurfaceVariant, height: 1.45),
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _DangerAction extends StatelessWidget {
  const _DangerAction({
    required this.icon,
    required this.title,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.md,
        ),
        child: Row(
          children: [
            Icon(icon, color: cs.error),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Text(
                title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(fontWeight: FontWeight.w600),
              ),
            ),
            Icon(Icons.chevron_right_rounded, color: cs.onSurfaceVariant),
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Row(
      children: [
        Icon(icon, size: 18, color: cs.onSurfaceVariant),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: Text(
            label,
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(color: cs.onSurfaceVariant),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        const SizedBox(width: AppSpacing.sm),
        Text(
          value,
          style: Theme.of(context)
              .textTheme
              .bodyMedium
              ?.copyWith(fontWeight: FontWeight.w700),
        ),
      ],
    );
  }
}

class _SegmentItem {
  const _SegmentItem({required this.value, required this.label});

  final String value;
  final String label;
}

class _SegmentRow extends StatelessWidget {
  const _SegmentRow({
    required this.value,
    required this.onChanged,
    required this.items,
    this.enabled = true,
  });

  final String value;
  final ValueChanged<String> onChanged;
  final List<_SegmentItem> items;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: [
        for (final item in items)
          InkWell(
            onTap: enabled ? () => onChanged(item.value) : null,
            borderRadius: BorderRadius.circular(999),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              curve: Curves.easeOutCubic,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(999),
                color: item.value == value
                    ? cs.primary
                    : cs.surfaceContainerHighest
                        .withValues(alpha: enabled ? 0.55 : 0.35),
                border: Border.all(
                  color: item.value == value
                      ? cs.primary.withValues(alpha: 0.25)
                      : cs.outline.withValues(alpha: 0.18),
                ),
              ),
              child: Text(
                item.label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                      color: item.value == value
                          ? cs.onPrimary
                          : cs.onSurface.withValues(alpha: enabled ? 1 : 0.55),
                    ),
              ),
            ),
          ),
      ],
    );
  }
}
