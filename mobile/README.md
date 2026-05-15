# Las Galaxias · Marcador (App Flutter)

App Flutter para anotar goles **en cancha**, en vivo, en reemplazo del
papel y lápiz. Los resultados se envían al backend (`/api/staging`)
y quedan en estado **pendiente** hasta que el admin los aprueba
desde la web (`/admin` → menú **Validar**).

## Stack

- Flutter 3.41 / Dart 3.11
- `http` para llamadas REST
- `shared_preferences` para guardar la etiqueta del dispositivo
- **Sin Supabase directo**: la app habla siempre con el backend Express;
  así el día de mañana se puede cambiar la base sin tocar la app.

## Estructura

```
mobile/
├─ lib/
│  ├─ main.dart                       Entry + theme
│  ├─ config/app_config.dart          URL del backend (--dart-define)
│  ├─ api/api_client.dart             Wrapper http
│  ├─ models/                         tournament / match / player
│  ├─ services/staging_service.dart   Cliente del API staging
│  └─ screens/
│     ├─ tournaments_screen.dart      Lista de torneos
│     ├─ matches_screen.dart          Fixture agrupado por jornada
│     └─ goal_tracker_screen.dart     Pantalla principal: tap-a-marcar
└─ pubspec.yaml
```

## Configurar la URL del backend

La URL se inyecta en build/run con `--dart-define`:

```bash
# Emulador Android (alias de localhost del host) -- valor por defecto
flutter run --dart-define=API_URL=http://10.0.2.2:3001

# Dispositivo físico Android conectado a tu WiFi
flutter run --dart-define=API_URL=http://192.168.1.20:3001

# Build APK apuntando a producción
flutter build apk --release --dart-define=API_URL=https://tu-backend.vercel.app
```

> Si tu PC tiene firewall, habilita el puerto 3001 para tu red local
> al probar con dispositivo físico.

## Cómo se usa en cancha

1. Abre la app → elige **Torneo**.
2. Elige la **jornada** y el **partido**.
3. Toca el nombre de un jugador cada vez que mete gol (tap +1,
   mantener apretado para −1; también hay botones ± visibles).
4. El marcador grande arriba se actualiza solo.
5. Al final, **Enviar resultado** → queda pendiente para el admin.

El admin verá ese envío en `lasgalaxias.cl/admin` → **Validar**, podrá
editarlo si hay un error y aprobarlo. Solo ahí se escribe en las
tablas oficiales (`matches`, `goals`).
