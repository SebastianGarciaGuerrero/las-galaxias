class AppConfig {
  // URL del backend. Default = producción para que F5 desde VS Code o el APK
  // de release "simplemente funcionen" sin tener que pasar flags.
  //
  // Para apuntar a un backend local (emulador o LAN), pasar:
  //   flutter run --dart-define=API_URL=http://10.0.2.2:3001
  //   flutter run --dart-define=API_URL=http://192.168.1.20:3001
  static const String apiUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'https://las-galaxias-api.vercel.app',
  );

  // Etiqueta del dispositivo (para que el admin sepa de dónde vino el dato).
  static const String defaultDeviceLabel = 'app-cancha';

  // Timeout HTTP. Si el server no responde en este tiempo, la app muestra
  // error en vez de quedarse cargando indefinidamente.
  static const Duration httpTimeout = Duration(seconds: 12);
}
