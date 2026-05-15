class AppConfig {
  // URL del backend. En emulador Android usar 10.0.2.2; en dispositivo físico
  // usar la IP LAN del PC (ej: http://192.168.1.20:3001).
  //
  // Para release, pasar con --dart-define:
  //   flutter run --dart-define=API_URL=https://tu-backend.vercel.app
  static const String apiUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://10.0.2.2:3001',
  );

  // Etiqueta del dispositivo (para que el admin sepa de dónde vino el dato).
  static const String defaultDeviceLabel = 'app-cancha';
}
