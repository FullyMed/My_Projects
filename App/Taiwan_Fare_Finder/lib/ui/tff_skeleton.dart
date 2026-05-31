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
///
/// Structure mirrors [FareResultCard]: header row → adult label → big price →
/// three tier tiles → meta line → updated line.
class FareResultSkeletonCard extends StatelessWidget {
  const FareResultSkeletonCard({super.key, this.showTitleLine = true});

  final bool showTitleLine;

  @override
  Widget build(BuildContext context) {
    return TffCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (showTitleLine) ...[
            Row(children: const [
              TffSkeletonBox(height: 20, width: 120, radius: 8),
              Spacer(),
              TffSkeletonBox(height: 22, width: 60, radius: 999),
            ]),
            const SizedBox(height: AppSpacing.lg),
          ],
          // "Adult" label
          const TffSkeletonBox(height: 12, width: 44, radius: 6),
          const SizedBox(height: AppSpacing.xs),
          // Big NT$ price (mirrors displaySmall ~36px + padding)
          const TffSkeletonBox(height: 44, width: 140, radius: 8),
          const SizedBox(height: AppSpacing.md),
          // Three tier tiles (student / child / senior)
          Row(children: const [
            Expanded(child: TffSkeletonBox(height: 50, radius: 16)),
            SizedBox(width: AppSpacing.sm),
            Expanded(child: TffSkeletonBox(height: 50, radius: 16)),
            SizedBox(width: AppSpacing.sm),
            Expanded(child: TffSkeletonBox(height: 50, radius: 16)),
          ]),
          const SizedBox(height: AppSpacing.md),
          // Meta line (distance · duration · transfers)
          const TffSkeletonBox(height: 14, radius: 6),
          const SizedBox(height: AppSpacing.sm),
          // "Last updated" line
          const TffSkeletonBox(height: 11, width: 170, radius: 6),
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
