import 'package:flutter/material.dart';
import 'package:taiwan_fare_finder/theme.dart';

/// Swaps origin and destination. The icon turns half a revolution on each
/// tap so you can see the swap happened (no turn with reduced motion).
class TffSwapButton extends StatefulWidget {
  const TffSwapButton({super.key, required this.tooltip, required this.onPressed, this.enabled = true});

  final String tooltip;
  final VoidCallback onPressed;
  final bool enabled;

  @override
  State<TffSwapButton> createState() => _TffSwapButtonState();
}

class _TffSwapButtonState extends State<TffSwapButton> {
  double _turns = 0;

  void _tap() {
    if (!widget.enabled) return;
    setState(() => _turns += 0.5);
    widget.onPressed();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return IconButton.filledTonal(
      tooltip: widget.tooltip,
      onPressed: widget.enabled ? _tap : null,
      constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
      style: IconButton.styleFrom(
        backgroundColor: cs.primaryContainer,
        foregroundColor: cs.onPrimaryContainer,
        side: BorderSide(color: cs.primary.withValues(alpha: 0.2)),
      ),
      icon: AnimatedRotation(
        duration: TffMotion.of(context, TffMotion.medium),
        curve: TffMotion.easeOut,
        turns: _turns,
        child: const Icon(Icons.swap_vert_rounded),
      ),
    );
  }
}
