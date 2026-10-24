import 'package:flutter/material.dart';
import 'package:taiwan_fare_finder/localization/tff_localizations.dart';
import 'package:taiwan_fare_finder/models/location.dart';
import 'package:taiwan_fare_finder/theme.dart';
import 'package:taiwan_fare_finder/ui/tff_focus_ring.dart';
import 'package:taiwan_fare_finder/ui/location_picker_sheet.dart';

class LocationField extends StatelessWidget {
  const LocationField({
    super.key,
    required this.label,
    required this.value,
    required this.onChanged,
    required this.recent,
    required this.popular,
    this.enabled = true,
  });

  final String label;
  final Location? value;
  final ValueChanged<Location?> onChanged;
  final List<Location> recent;
  final List<Location> popular;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    final l10n = TffLocalizations.of(context);
    final cs = Theme.of(context).colorScheme;

    final display = value == null ? '' : value!.nameForLocale(l10n.locale);
    final city = value == null ? '' : value!.cityForLocale(l10n.locale);

    Future<void> pick() async {
      final picked = await LocationPickerSheet.show(
        context,
        title: label,
        initial: value,
        recent: recent,
        popular: popular,
      );
      if (picked != null) onChanged(picked);
    }

    // One button for screen readers: "Origin, Taipei" (or "Origin, Choose a place").
    // excludeSemantics drops the InkWell's tap action, so the node needs its
    // own onTap or a TalkBack/VoiceOver double-tap does nothing.
    return Semantics(
      button: true,
      enabled: enabled,
      label: '$label, ${value == null ? l10n.locationPickerCtaChoose : display}',
      onTap: enabled ? pick : null,
      excludeSemantics: true,
      child: IgnorePointer(
      ignoring: !enabled,
      child: AnimatedOpacity(
        duration: TffMotion.of(context, TffMotion.fast),
        opacity: enabled ? 1 : 0.65,
        child: TffFocusRing(
          radius: BorderRadius.circular(AppRadius.lg),
          builder: (context, onFocusChange) => InkWell(
          onFocusChange: onFocusChange,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          onTap: enabled ? pick : null,
          child: InputDecorator(
            decoration: InputDecoration(
              labelText: label,
              filled: true,
              fillColor: cs.surfaceContainerHighest.withValues(alpha: 0.55),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppRadius.lg), borderSide: BorderSide(color: cs.outline.withValues(alpha: 0.15))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(AppRadius.lg), borderSide: BorderSide(color: cs.outline.withValues(alpha: 0.15))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(AppRadius.lg), borderSide: BorderSide(color: cs.primary.withValues(alpha: 0.65), width: 1.4)),
              contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.md),
            ),
            child: Row(
          children: [
            Icon(Icons.place_rounded, color: cs.onSurfaceVariant, size: 20),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: value == null
                  ? Text(l10n.locationPickerCtaChoose, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: cs.onSurfaceVariant))
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(display, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700), maxLines: 1, overflow: TextOverflow.ellipsis),
                        const SizedBox(height: 2),
                        Text(city, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: cs.onSurfaceVariant), maxLines: 1, overflow: TextOverflow.ellipsis),
                      ],
                    ),
            ),
            const SizedBox(width: AppSpacing.md),
            Icon(Icons.expand_more_rounded, color: cs.onSurfaceVariant),
          ],
            ),
          ),
        )),
      ),
      ),
    );
  }
}
