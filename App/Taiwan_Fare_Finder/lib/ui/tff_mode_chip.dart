import 'package:flutter/material.dart';
import 'package:taiwan_fare_finder/models/transport_mode.dart';

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
    return AnimatedScale(
      duration: const Duration(milliseconds: 170),
      curve: Curves.easeOutCubic,
      scale: effectiveSelected ? 1.03 : 1,
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: 170),
        opacity: enabled ? 1 : 0.65,
        child: ChoiceChip(
          label: Text(label, maxLines: 1, overflow: TextOverflow.ellipsis),
          selected: effectiveSelected,
          onSelected: enabled ? onSelected : null,
          labelStyle: Theme.of(context).textTheme.labelMedium?.copyWith(color: effectiveSelected ? cs.onPrimary : cs.onSurface),
          selectedColor: cs.primary,
          backgroundColor: cs.surfaceContainerHighest.withValues(alpha: 0.55),
          side: BorderSide(color: effectiveSelected ? Colors.transparent : cs.outline.withValues(alpha: 0.22)),
          showCheckmark: false,
          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        ),
      ),
    );
  }
}
