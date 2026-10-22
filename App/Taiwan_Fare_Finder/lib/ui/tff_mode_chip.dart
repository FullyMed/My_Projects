import 'package:flutter/material.dart';
import 'package:taiwan_fare_finder/models/transport_mode.dart';
import 'package:taiwan_fare_finder/theme.dart';

/// Selectable transport-mode chip. Selection is shown by color alone (no
/// scale bump: people switch modes many times a session, and growing chips
/// read as jitter). The tap target is padded to 48 dp.
class TffModeChip extends StatelessWidget {
  const TffModeChip({super.key, required this.mode, required this.selected, required this.label, required this.onSelected, this.enabled = true});

  final TransportMode mode;
  final bool selected;
  final String label;
  final ValueChanged<bool> onSelected;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final effectiveSelected = selected && enabled;
    return AnimatedOpacity(
      duration: TffMotion.of(context, TffMotion.fast),
      opacity: enabled ? 1 : 0.6,
      child: ChoiceChip(
        label: Text(label, maxLines: 1, overflow: TextOverflow.ellipsis),
        selected: effectiveSelected,
        onSelected: enabled ? onSelected : null,
        labelStyle: Theme.of(context).textTheme.labelLarge?.copyWith(
              color: effectiveSelected ? cs.onPrimary : cs.onSurface,
              fontWeight: effectiveSelected ? FontWeight.w600 : FontWeight.w500,
            ),
        selectedColor: cs.primary,
        backgroundColor: cs.surfaceContainerHighest,
        // 2 dp primary outline on keyboard focus; otherwise a hairline when
        // unselected and none when selected.
        side: WidgetStateBorderSide.resolveWith((states) {
          if (states.contains(WidgetState.focused)) return BorderSide(color: effectiveSelected ? cs.onSurface : cs.primary, width: 2);
          return BorderSide(color: effectiveSelected ? Colors.transparent : cs.outline.withValues(alpha: 0.28));
        }),
        showCheckmark: false,
        materialTapTargetSize: MaterialTapTargetSize.padded,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
      ),
    );
  }
}
