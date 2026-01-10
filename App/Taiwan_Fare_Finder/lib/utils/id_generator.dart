import 'dart:math';

class IdGenerator {
  static final Random _rng = Random();

  static String next() {
    // Always > 0 and safe on web.
    final ts = DateTime.now().microsecondsSinceEpoch;
    // Fixed positive upper bound (never 0).
    final r = _rng.nextInt(1 << 20); // 0..1,048,575
    return '${ts}_$r';
  }
}
