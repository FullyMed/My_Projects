# Flutter / embedding — keep the engine entry points R8 can't see are used.
-keep class io.flutter.app.** { *; }
-keep class io.flutter.embedding.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.** { *; }
-dontwarn io.flutter.embedding.**

# Plugins used by this app ship their own consumer rules
# (shared_preferences, package_info_plus, path_provider) — nothing extra needed.

# Keep annotations and generic signatures for reflective JSON handling.
-keepattributes *Annotation*, Signature, InnerClasses, EnclosingMethod
