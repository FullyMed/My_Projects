import 'package:flutter/material.dart';
import 'package:taiwan_fare_finder/theme.dart';
import 'package:taiwan_fare_finder/ui/tff_card.dart';

/// A lightweight, dependency-free skeleton shimmer.
///
/// Use [TffSkeletonBox] to compose placeholders, or the provided
/// higher-level skeletons for common screens.
class TffSkeletonBox extends StatefulWidget {
  const TffSkeletonBox({super.key, required this.height, this.width, this.radius = 999});

  final double height;
  final double? width;
  final double radius;

  @override
  State<TffSkeletonBox> createState() => _TffSkeletonBoxState();
}

class _TffSkeletonBoxState extends State<TffSkeletonBox> with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))..repeat();

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return AnimatedBuilder(
      animation: _c,
      builder: (context, _) {
        final t = _c.value;
        final a = (0.22 + 0.18 * (0.5 + 0.5 * (1 - (t - 0.5).abs() * 2))).clamp(0.16, 0.52);
        return Container(
          height: widget.height,
          width: widget.width,
          decoration: BoxDecoration(color: cs.onSurface.withValues(alpha: a), borderRadius: BorderRadius.circular(widget.radius)),
        );
      },
    );
  }
}

/// Skeleton placeholder sized like a single fare result card.
class FareResultSkeletonCard extends StatelessWidget {
  const FareResultSkeletonCard({super.key, this.showTitleLine = true});

  final bool showTitleLine;

  @override
  Widget build(BuildContext context) {
    return TffCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (showTitleLine) ...[const TffSkeletonBox(height: 18, width: 140), const SizedBox(height: AppSpacing.lg)],
          const TffSkeletonBox(height: 12),
          const SizedBox(height: AppSpacing.sm),
          const TffSkeletonBox(height: 12),
          const SizedBox(height: AppSpacing.lg),
          const TffSkeletonBox(height: 22, width: 160),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: const [
              Expanded(child: TffSkeletonBox(height: 14)),
              SizedBox(width: AppSpacing.sm),
              Expanded(child: TffSkeletonBox(height: 14)),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Row(
            children: const [
              Expanded(child: TffSkeletonBox(height: 14)),
              SizedBox(width: AppSpacing.sm),
              Expanded(child: TffSkeletonBox(height: 14)),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          const TffSkeletonBox(height: 12, width: 180),
        ],
      ),
    );
  }
}

/// Skeleton list used on Compare page.
class CompareResultsSkeletonList extends StatelessWidget {
  const CompareResultsSkeletonList({super.key, this.count = 3});

  final int count;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        for (var i = 0; i < count; i++) ...[
          const FareResultSkeletonCard(showTitleLine: false),
          if (i != count - 1) const SizedBox(height: AppSpacing.lg),
        ],
      ],
    );
  }
}
