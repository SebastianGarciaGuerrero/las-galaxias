-- ============================================================
-- HABILITAR ROW LEVEL SECURITY EN TODAS LAS TABLAS PÚBLICAS
-- ------------------------------------------------------------
-- Problema: el esquema "public" está expuesto por PostgREST y las
-- tablas no tienen RLS. Como la key publishable viaja en el bundle
-- del sitio (client/.env), cualquiera puede leer Y ESCRIBIR en la
-- base apuntando directo a https://<proyecto>.supabase.co/rest/v1.
--
-- Solución: activar RLS sin crear ninguna política.
-- Sin políticas, anon y authenticated no ven ni tocan nada.
-- El backend (server/) usa la key service_role, que se salta RLS
-- por diseño, así que la API y el panel de admin siguen igual.
--
-- Esto NO rompe nada porque ni el sitio ni la app móvil consultan
-- tablas directo: el cliente web solo usa supabase.auth (login) y
-- todo el resto de los datos pasa por la API en Vercel.
--
-- ANTES DE CORRERLO:
--   Confirmá en Vercel > las-galaxias-api > Settings > Environment
--   Variables que SUPABASE_KEY sea la service_role. Si ahí estuviera
--   por error la key publishable, al activar RLS el sitio se queda
--   sin datos.
--
-- CÓMO CORRER:
--   1) Supabase > SQL Editor (proyecto las-galaxias)
--   2) Pegar este archivo y ejecutar
--   3) Abrir www.lasgalaxias.cl y revisar que la liga cargue
--   4) Correr el bloque de verificación del final
-- ============================================================

-- ---------- Tablas de la liga ----------
alter table public.tournaments          enable row level security;
alter table public.teams                enable row level security;
alter table public.players              enable row level security;
alter table public.matches              enable row level security;
alter table public.goals                enable row level security;
alter table public.tournament_players   enable row level security;
alter table public.tournament_teams     enable row level security;
alter table public.bye_weeks            enable row level security;
alter table public.news                 enable row level security;

-- ---------- Tablas de la app de marcador ----------
alter table public.staging_match_results enable row level security;
alter table public.staging_match_goals   enable row level security;

-- ---------- Perfiles de usuario ----------
alter table public.profiles             enable row level security;

-- ---------- Vistas ----------
-- Las vistas no llevan RLS propio: por defecto corren con los permisos
-- de su dueño (postgres) y se saltan el RLS de las tablas de abajo.
-- Con security_invoker pasan a ejecutarse como quien consulta, así que
-- heredan el RLS de matches/goals/teams y anon deja de ver filas.
alter view public.standings   set (security_invoker = on);
alter view public.top_scorers set (security_invoker = on);

-- Además les sacamos el permiso directo, por si acaso.
revoke all on public.standings   from anon, authenticated;
revoke all on public.top_scorers from anon, authenticated;


-- ============================================================
-- VERIFICACIÓN
-- Todas las tablas tienen que quedar con rls_activo = true.
-- ============================================================
-- select c.relname as tabla,
--        c.relrowsecurity as rls_activo,
--        (select count(*) from pg_policies p
--          where p.schemaname = 'public' and p.tablename = c.relname) as politicas
--   from pg_class c
--   join pg_namespace n on n.oid = c.relnamespace
--  where n.nspname = 'public' and c.relkind = 'r'
--  order by c.relname;
