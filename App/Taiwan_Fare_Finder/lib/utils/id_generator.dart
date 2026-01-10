import 'dart:math';

class IdGenerator {
  IdGenerator._();

  static final Random _rnd = Random();

  static String next() => "${DateTime.now().microsecondsSinceEpoch}_${_rnd.nextInt(1 << 32)}";
}
