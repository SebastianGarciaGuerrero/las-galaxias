# Marcador en cancha — flujo de extremo a extremo

Este documento describe **qué se agregó** al proyecto para reemplazar
el papel y lápiz de la foto por una app, sin tocar la data oficial.

## Diagrama del flujo

```
┌──────────────┐     POST /api/staging/submissions      ┌────────────┐
│ App Flutter  │ ─────────────────────────────────────► │  Backend   │
│ (en cancha)  │                                        │  Express   │
└──────────────┘                                        └─────┬──────┘
                                                              │
                              ┌────────── inserta en ─────────┤
                              ▼                               │
                     staging_match_results                    │
                     staging_match_goals                      │
                              ▲                               │
                              │  GET /api/staging/submissions │
                              │                               │
                       ┌──────┴──────┐                        │
                       │  Admin Web  │                        │
                       │  /admin →   │                        │
                       │  "Validar"  │                        │
                       └──────┬──────┘                        │
                              │  Aprueba                      │
                              │  POST /:id/approve            │
                              ▼                               │
                         matches.update                       │
                         goals.insert  ◄───────────────────── (oficial)
```

Solo cuando el admin aprueba, los datos pasan a las tablas oficiales
(`matches` y `goals`). Mientras tanto **nada se sobreescribe**.

## Archivos nuevos

### Backend
- [server/routes/staging.routes.js](../server/routes/staging.routes.js) — endpoints REST
- [server/sql/staging_tables.sql](../server/sql/staging_tables.sql) — DDL de las dos tablas nuevas
- [server/index.js](../server/index.js) — montado en `/api/staging`

### Admin Web
- [client/src/pages/admin/ValidateManager.jsx](../client/src/pages/admin/ValidateManager.jsx) — pantalla "Validar"
- [client/src/pages/admin/Dashboard.jsx](../client/src/pages/admin/Dashboard.jsx) — nuevo botón en el menú

### App móvil
- Carpeta completa [mobile/](../mobile/) con la app Flutter

## Endpoints expuestos

| Método | Ruta | Quién la usa | Para qué |
|--------|------|--------------|----------|
| GET    | `/api/staging/tournaments`                 | app    | Listar torneos para el selector |
| GET    | `/api/staging/tournaments/:id/matches`     | app    | Fixture del torneo |
| GET    | `/api/staging/tournaments/:id/players`     | app, admin | Plantilla de jugadores |
| POST   | `/api/staging/submissions`                 | app    | Enviar resultado pendiente |
| GET    | `/api/staging/submissions?status=pending`  | admin  | Lista de pendientes / aprobados / rechazados |
| PATCH  | `/api/staging/submissions/:id`             | admin  | Editar marcador y goleadores antes de aprobar |
| POST   | `/api/staging/submissions/:id/approve`     | admin  | Aprueba → escribe en `matches` + `goals` |
| POST   | `/api/staging/submissions/:id/reject`      | admin  | Rechaza con motivo opcional |

## Pasos para que el flujo quede operativo

### 1) Crear las dos tablas nuevas en Supabase

> ⚠ Esto **no toca** la data actual. Solo agrega dos tablas vacías.

Abre **Supabase → SQL Editor**, pega el contenido de
[server/sql/staging_tables.sql](../server/sql/staging_tables.sql) y
ejecuta.

Resultado esperado: dos tablas nuevas
`staging_match_results` y `staging_match_goals` con RLS activa y sin
políticas (solo el backend con `service key` accede).

### 2) Variables de entorno del server

Asegúrate de tener `server/.env` con (estas variables ya existían):

```env
SUPABASE_URL=https://opvnwbkyrnnejhmkiool.supabase.co
SUPABASE_KEY=<service_role_key>
PORT=3001
```

> Para producción (Vercel) ya están configuradas; estos pasos son para
> correr en local.

### 3) Correr todo en local

Abre **tres terminales** dentro de la carpeta del proyecto:

**Terminal 1 — backend Express**
```bash
cd server
npm install        # solo la primera vez
npx nodemon index.js
# → 🚀 Servidor corriendo en http://localhost:3001
```

**Terminal 2 — web (admin + sitio público)**
```bash
cd client
npm install        # solo la primera vez
npm run dev
# → Local: http://localhost:5173
# Admin: http://localhost:5173/admin
```

**Terminal 3 — app Flutter**
```bash
cd mobile
flutter pub get    # solo la primera vez

# Si pruebas en emulador Android (10.0.2.2 = localhost del host):
flutter run

# Si pruebas en dispositivo físico Android, reemplaza por la IP LAN:
flutter run --dart-define=API_URL=http://192.168.1.20:3001
```

> Para encontrar tu IP LAN en Windows: `ipconfig` → "Dirección IPv4".
> El dispositivo y el PC tienen que estar en la misma WiFi y el
> firewall debe dejar pasar el puerto 3001.

### 4) Generar APK para entregar (sin Play Store)

```bash
cd mobile
flutter build apk --release --dart-define=API_URL=https://tu-backend.vercel.app
# El .apk queda en: build/app/outputs/flutter-apk/app-release.apk
```

Se instala con `adb install` o pasándolo por WhatsApp / USB al
teléfono que usen en cancha.

## Cambios sobre la web existente

Se agregó **solo un botón nuevo** al sidebar del dashboard admin:
**✅ Validar**. El resto del admin sigue funcionando igual y la web
pública no fue tocada.

La pantalla Validar permite:

- Filtrar por **pendientes / aprobados / rechazados**
- Ver el marcador propuesto y la lista de goleadores
- **Editar** marcador y goles antes de aprobar (sin afectar nada
  oficial todavía)
- **Aprobar**: escribe en `matches` y `goals` reutilizando la misma
  lógica que ya usaba el `LeagueManager`. Si el partido ya tenía
  resultado, se sobreescribe (se avisa con un banner amarillo).
- **Rechazar**: marca el envío como rechazado con motivo opcional.

## Decisiones a destacar

- **Sin auth en la app**: el dueño del APK puede enviar. Si más
  adelante quieren restringir, basta con agregar un header
  `X-Device-Token` y validarlo en `staging.routes.js`.
- **La app no habla directo con Supabase**: pasa siempre por el backend.
  Esto permite cambiar la base más adelante y mantiene la `service
  key` fuera del APK.
- **Idempotencia al aprobar**: si el admin aprueba dos veces, el segundo
  intento falla con `409`. Si quiere re-aprobar tras una edición,
  primero rechaza y vuelve a enviar (o lo dejamos abierto si lo
  prefieres — se cambia con dos líneas).
