import 'package:flutter/material.dart';

/// Standard page: app bar + safe-area body on the flat, tinted page color
/// (`scaffoldBackgroundColor`). Cards provide the contrast, not a gradient.
class TffPageScaffold extends StatelessWidget {
  const TffPageScaffold({super.key, required this.title, required this.child, this.actions});

  final String title;
  final Widget child;
  final List<Widget>? actions;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title, maxLines: 1, overflow: TextOverflow.ellipsis),
        actions: actions,
      ),
      body: SafeArea(child: child),
    );
  }
}
