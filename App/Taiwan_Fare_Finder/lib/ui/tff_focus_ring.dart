import 'package:flutter/material.dart';

/// Draws a 2 dp primary-colored outline around an `InkWell`-based control
/// while it has keyboard focus (web / desktop Tab navigation).
///
/// Flutter has no global focus ring, and the default focus tint is easy to
/// miss on our light surfaces. The ring only shows in keyboard ("traditional")
/// highlight mode, so tapping on a phone never leaves an outline behind.
///
/// Pass the `onFocusChange` it hands you to the control's `InkWell`:
///
/// ```dart
/// TffFocusRing(
///   radius: BorderRadius.circular(999),
///   builder: (context, onFocusChange) => InkWell(onFocusChange: onFocusChange, ...),
/// )
/// ```
class TffFocusRing extends StatefulWidget {
  const TffFocusRing({super.key, required this.builder, required this.radius});

  final Widget Function(BuildContext context, ValueChanged<bool> onFocusChange) builder;
  final BorderRadius radius;

  @override
  State<TffFocusRing> createState() => _TffFocusRingState();
}

class _TffFocusRingState extends State<TffFocusRing> {
  bool _focused = false;

  void _onFocusChange(bool focused) {
    if (focused != _focused) setState(() => _focused = focused);
  }

  @override
  Widget build(BuildContext context) {
    final keyboard = FocusManager.instance.highlightMode == FocusHighlightMode.traditional;
    final show = _focused && keyboard;
    return DecoratedBox(
      position: DecorationPosition.foreground,
      decoration: BoxDecoration(
        borderRadius: widget.radius,
        border: show ? Border.all(color: Theme.of(context).colorScheme.primary, width: 2) : null,
      ),
      child: widget.builder(context, _onFocusChange),
    );
  }
}
