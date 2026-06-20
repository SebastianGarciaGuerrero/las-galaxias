# CD Las Galaxias

**Fútbol y Conciencia.**

Plataforma digital oficial del Club Deportivo Las Galaxias. Un ecosistema completo que integra sitio web público, panel de administración, API REST y aplicación móvil para el registro de partidos en tiempo real.

---

## Idea original

**Sebastián García Guerrero** — creador y coordinador del proyecto.
[sebastiangarcia.cl](https://www.sebastiangarcia.cl)

**Rodolfo Fuentealba** — diseñador, desarrollo y arquitectura técnica.
[rodfuentealba.com](https://rodfuentealba.com)

**biuspater** — colaborador.

---

## Estructura del proyecto

```
las-galaxias/
├── client/          # Sitio web público + panel admin (React + Vite)
├── server/          # API REST (Express + Supabase)
├── mobile/          # App móvil de marcador (Flutter)
└── docs/            # Documentación técnica
```

---

## Tecnologías

| Capa | Tecnologías |
|------|-------------|
| Frontend | React 19, React Router 7, Vite 7, Tailwind CSS 3 |
| Backend | Node.js, Express 5, Supabase |
| Mobile | Flutter 3.41, Dart 3.11 |
| Base de datos | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Deploy | Vercel (web + serverless functions) |
| Media | Cloudinary |

---

## Inicio rápido

### Requisitos

- Node.js >= 20
- Flutter 3.41+ (solo para móvil)
- Una cuenta de Supabase

### Frontend

```bash
cd client
npm install
npm run dev
```

Disponible en `http://localhost:5173`.

### Backend

```bash
cd server
npm install
cp .env.example .env   # configurar variables de entorno
npm run dev
```

Disponible en `http://localhost:3001`.

### Móvil

```bash
cd mobile
flutter pub get
flutter run --dart-define=API_URL=http://localhost:3001
```

---

## Scripts disponibles

### Frontend (`client/`)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Vista previa del build |
| `npm run lint` | Linting del código |

### Backend (`server/`)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con autorecarga |
| `npm start` | Inicio en producción |

---

## Despliegue

El proyecto está desplegado en **Vercel**:

- **Web**: [lasgalaxias.cl](https://lasgalaxias.cl)
- **API**: Desplegada como serverless functions en el mismo proyecto Vercel

---

## Licencia

Todos los derechos reservados &copy; CD Las Galaxias.
