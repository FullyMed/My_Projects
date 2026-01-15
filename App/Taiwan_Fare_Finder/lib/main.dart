import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:taiwan_fare_finder/controllers/fare_controller.dart';
import 'package:taiwan_fare_finder/controllers/favorites_controller.dart';
import 'package:taiwan_fare_finder/controllers/history_controller.dart';
import 'package:taiwan_fare_finder/controllers/session_controller.dart';
import 'package:taiwan_fare_finder/controllers/settings_controller.dart';
import 'package:taiwan_fare_finder/localization/tff_localizations.dart';
import 'package:taiwan_fare_finder/nav.dart';
import 'package:taiwan_fare_finder/services/analytics_service.dart';
import 'package:taiwan_fare_finder/services/fare_service.dart';
import 'package:taiwan_fare_finder/services/favorites_service.dart';
import 'package:taiwan_fare_finder/services/history_service.dart';
import 'package:taiwan_fare_finder/services/local_storage_service.dart';
import 'package:taiwan_fare_finder/services/settings_service.dart';
import 'package:taiwan_fare_finder/services/user_service.dart';
import 'package:taiwan_fare_finder/theme.dart';

void main() => runApp(const TffApp());

class TffApp extends StatelessWidget {
  const TffApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider(create: (_) => const LocalStorageService()),
        Provider(create: (_) => const AnalyticsService()),
        Provider(
            create: (c) => UserService(storage: c.read<LocalStorageService>())),
        Provider(
            create: (c) =>
                SettingsService(storage: c.read<LocalStorageService>())),
        Provider(
            create: (c) => FareService(storage: c.read<LocalStorageService>())),
        Provider(
            create: (c) =>
                FavoritesService(storage: c.read<LocalStorageService>())),
        Provider(
            create: (c) =>
                HistoryService(storage: c.read<LocalStorageService>())),
        ChangeNotifierProvider(
            create: (c) =>
                SessionController(userService: c.read<UserService>())),
        ChangeNotifierProxyProvider2<SessionController, SettingsService,
            SettingsController>(
          create: (c) =>
              SettingsController(settingsService: c.read<SettingsService>()),
          update: (c, session, service, controller) {
            final next =
                controller ?? SettingsController(settingsService: service);
            // IMPORTANT: avoid notifyListeners() during Provider update/build.
            // On Flutter Web, hot reload can be picky about calling newly-added methods.
            // Keep this logic self-contained here by scheduling `bindUser` directly.
            Future.microtask(() async {
              try {
                await next.bindUser(session.user?.id);
              } catch (_) {}
            });
            return next;
          },
        ),
        ChangeNotifierProxyProvider2<SessionController, FareService,
            FareController>(
          create: (c) => FareController(fareService: c.read<FareService>()),
          update: (c, session, service, controller) {
            final next = controller ?? FareController(fareService: service);
            next.bindUser(session.user?.id);
            return next;
          },
        ),
        ChangeNotifierProxyProvider2<SessionController, FavoritesService,
            FavoritesController>(
          create: (c) =>
              FavoritesController(favoritesService: c.read<FavoritesService>()),
          update: (c, session, service, controller) {
            final next =
                controller ?? FavoritesController(favoritesService: service);
            next.bindUser(session.user?.id);
            return next;
          },
        ),
        ChangeNotifierProxyProvider2<SessionController, HistoryService,
            HistoryController>(
          create: (c) =>
              HistoryController(historyService: c.read<HistoryService>()),
          update: (c, session, service, controller) {
            final next =
                controller ?? HistoryController(historyService: service);
            next.bindUser(session.user?.id);
            return next;
          },
        ),
      ],
      child: Consumer<SettingsController>(
        builder: (context, settings, _) {
          return MaterialApp.router(
            debugShowCheckedModeBanner: false,
            theme: lightTheme,
            darkTheme: darkTheme,
            themeMode: settings.themeMode,
            locale: settings.locale,
            supportedLocales: const [
              Locale('en'),
              Locale('id'),
              Locale('zh'),
              Locale.fromSubtags(languageCode: 'zh', scriptCode: 'Hant'),
            ],
            localizationsDelegates: const [
              TffLocalizations.delegate,
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            onGenerateTitle: (context) => TffLocalizations.of(context).appTitle,
            routerConfig: AppRouter.router,
          );
        },
      ),
    );
  }
}
