import 'package:flutter/material.dart';
import 'package:taiwan_fare_finder/theme.dart';

/// The main call to action on a page (Search fares, Compare fares).
///
/// Presses scale the button to 0.97 for 100 ms: quick physical feedback on
/// top of the ripple. Disabled buttons stay full size (they just fade), and
/// reduced motion skips the scale.
class TffPrimaryButton extends StatefulWidget {
  const TffPrimaryButton({super.key, required this.label, required this.onPressed, this.icon, this.isLoading = false});

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool isLoading;

  @override
  State<TffPrimaryButton> createState() => _TffPrimaryButtonState();
}

class _TffPrimaryButtonState extends State<TffPrimaryButton> {
  bool _pressed = false;

  void _setPressed(bool v) {
    if (_pressed != v) setState(() => _pressed = v);
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final enabled = widget.onPressed != null && !widget.isLoading;
    return Listener(
      onPointerDown: enabled ? (_) => _setPressed(true) : null,
      onPointerUp: (_) => _setPressed(false),
      onPointerCancel: (_) => _setPressed(false),
      child: AnimatedScale(
        duration: TffMotion.of(context, TffMotion.press),
        curve: TffMotion.easeOut,
        scale: _pressed && enabled ? 0.97 : 1,
        child: SizedBox(
          width: double.infinity,
          height: 52,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: cs.primary,
              foregroundColor: cs.onPrimary,
              disabledBackgroundColor: cs.primary.withValues(alpha: 0.35),
              disabledForegroundColor: cs.onPrimary.withValues(alpha: 0.85),
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.xl)),
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            ),
            onPressed: widget.isLoading ? null : widget.onPressed,
            child: AnimatedSwitcher(
              duration: TffMotion.of(context, TffMotion.medium),
              child: widget.isLoading
                  ? SizedBox(
                      key: const ValueKey('loading'),
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2.5, valueColor: AlwaysStoppedAnimation<Color>(cs.onPrimary)),
                    )
                  : Row(
                      key: const ValueKey('content'),
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (widget.icon != null) ...[Icon(widget.icon, size: 20, color: cs.onPrimary), const SizedBox(width: AppSpacing.sm)],
                        Flexible(child: Text(widget.label, maxLines: 1, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.labelLarge?.copyWith(color: cs.onPrimary, fontWeight: FontWeight.w600))),
                      ],
                    ),
            ),
          ),
        ),
      ),
    );
  }
}

class TffTextButton extends StatelessWidget {
  const TffTextButton({super.key, required this.label, required this.onPressed, this.icon});

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final color = onPressed == null ? cs.onSurface.withValues(alpha: 0.38) : cs.primary;
    return TextButton(
      style: TextButton.styleFrom(
        foregroundColor: cs.primary,
        minimumSize: const Size(48, 48),
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.lg)),
      ),
      onPressed: onPressed,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[Icon(icon, size: 18, color: color), const SizedBox(width: AppSpacing.xs)],
          Flexible(child: Text(label, maxLines: 1, overflow: TextOverflow.ellipsis)),
        ],
      ),
    );
  }
}
