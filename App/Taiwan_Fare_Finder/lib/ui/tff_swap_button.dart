import 'package:flutter/material.dart';
import 'package:taiwan_fare_finder/theme.dart';

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
    return Tooltip(
      message: widget.tooltip,
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: 160),
        opacity: widget.enabled ? 1 : 0.55,
        child: InkWell(
          borderRadius: BorderRadius.circular(999),
          onTap: widget.enabled ? _tap : null,
          child: Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: cs.primaryContainer.withValues(alpha: widget.enabled ? 0.55 : 0.35),
              borderRadius: BorderRadius.circular(999),
              border: Border.all(color: cs.primary.withValues(alpha: 0.20)),
            ),
            child: AnimatedRotation(
              duration: const Duration(milliseconds: 220),
              curve: Curves.easeOut,
              turns: _turns,
              child: Icon(Icons.swap_vert_rounded, color: cs.primary.withValues(alpha: widget.enabled ? 1 : 0.6)),
            ),
          ),
        ),
      ),
    );
  }
}
