-- ============================================================
-- TABLAS DE STAGING PARA APP MOBILE DE MARCADOR
-- ------------------------------------------------------------
-- Estas tablas NO tocan la data oficial (matches, goals).
-- Sirven como buzón de entrada: la app inserta aquí y el admin
-- aprueba/edita/rechaza desde /admin > Validar.
-- Solo cuando se aprueba se hace el "merge" hacia matches y
-- goals (lo hace el endpoint /api/staging/submissions/:id/approve).
--
-- CÓMO CORRER:
--   1) Abre Supabase > SQL Editor (proyecto las-galaxias)
--   2) Pega este archivo y ejecuta
--   3) Verifica en Table Editor que aparezcan las dos tablas
-- ============================================================

create table if not exists public.staging_match_results (
    id              bigserial primary key,
    match_id        bigint not null references public.matches(id) on delete cascade,
    home_score      int not null check (home_score >= 0),
    away_score      int not null check (away_score >= 0),
    device_label    text,
    status          text not null default 'pending'
                       check (status in ('pending','approved','rejected')),
    review_notes    text,
    created_at      timestamptz not null default now(),
    reviewed_at     timestamptz
);

create index if not exists idx_staging_match_results_status
    on public.staging_match_results(status);

create index if not exists idx_staging_match_results_match
    on public.staging_match_results(match_id);

create table if not exists public.staging_match_goals (
    id              bigserial primary key,
    submission_id   bigint not null references public.staging_match_results(id) on delete cascade,
    player_id       bigint not null references public.players(id),
    team_id         bigint not null references public.teams(id),
    count           int not null check (count > 0),
    created_at      timestamptz not null default now()
);

create index if not exists idx_staging_match_goals_submission
    on public.staging_match_goals(submission_id);

-- ============================================================
-- RLS: deshabilitada en línea con las otras tablas del proyecto
-- (matches, goals, tournaments...). Si más adelante se activa
-- RLS global, habrá que crear políticas para estas dos tablas.
-- ============================================================
alter table public.staging_match_results disable row level security;
alter table public.staging_match_goals disable row level security;
