-- ============================================================
-- SUPER LIGA DE LOS VIERNES X — LOS DOS AMISTOSOS
-- ------------------------------------------------------------
-- Al echar a No Comai quedaron 6 equipos y 2 fechas de la primera
-- rueda con un partido menos, así que en la J6 y en la J7 hay dos
-- equipos que no tenían rival. Juegan un amistoso entre ellos:
--
--   J6, viernes 25-09, 19:00   Vasco de Gramo - Violeta Parra
--   J7, viernes 02-10, 19:00   Malajax - Lord Cochrane
--
-- Son justo los dos que quedaban sin partido cada noche, así que
-- con esto no descansa nadie en toda la edición.
--
-- LOS AMISTOSOS NO SUMAN
-- No dan puntos, no cuentan partidos jugados, no mueven la
-- diferencia de gol y sus goles no entran a la tabla de goleadores.
-- Para eso se agrega matches.is_friendly y las dos vistas pasan a
-- ignorar esos partidos.
--
-- No sirve la columna competition: dice 'Amistoso' en los 42
-- partidos de esta liga —quedó así desde que se cargó el torneo— y
-- por eso no distingue nada.
--
-- Ojo que la vista standings arma la lista de equipos desde los
-- partidos, así que el filtro va también ahí: si no, un equipo que
-- solo jugara amistosos aparecería en la tabla con todo en cero.
--
-- LOS HORARIOS DE LA J7
-- Los dos amistosos van a las 19:00, que es la hora que quedó
-- libre. En la J6 nadie se mueve. En la J7 sí: Motafogo - Violeta
-- Parra pasa de las 19:00 a las 20:00, y Vasco de Gramo -
-- Charchalax de las 20:00 a las 22:00, que es la hora que dejó
-- vacía el partido borrado de No Comai.
--
--   J6   19:00 Vasco - Violeta (amistoso)  ·  20:00 Malajax - Lord
--        Cochrane  ·  22:00 Charchalax - Motafogo
--   J7   19:00 Malajax - Lord Cochrane (amistoso)  ·  20:00
--        Motafogo - Violeta Parra  ·  22:00 Vasco - Charchalax
--
-- Las horas van en UTC como el resto de la tabla, con Chile en -3.
--
-- Es idempotente: la columna se agrega si falta, los amistosos no
-- se duplican y las horas son valores fijos.
--
-- CÓMO CORRER:
--   1) Supabase > SQL Editor (proyecto las-galaxias)
--   2) Pegar este archivo y ejecutar
--   3) Correr las verificaciones del final
--   4) Abrir /liga > Super Liga de los Viernes X: la J6 y la J7 con
--      tres partidos, el de las 19:00 con la etiqueta amarilla, y
--      la tabla sin moverse
-- ============================================================


-- ---------- 1. La marca ----------
alter table public.matches
    add column if not exists is_friendly boolean not null default false;

comment on column public.matches.is_friendly is
    'Partido que se juega pero no cuenta: ni puntos, ni partidos jugados, ni goleadores. Las vistas standings y top_scorers lo ignoran. No confundir con competition, que dice "Amistoso" en toda la liga de los viernes por un error de carga.';


-- ---------- 2. Los dos amistosos ----------
insert into public.matches
       (tournament_id, home_team_id, away_team_id, match_date, location, status, round, competition, is_local, is_friendly)
select (select id from public.tournaments where name = 'Super Liga de los Viernes X'),
       h.id, a.id, v.cuando::timestamptz,
       'Bellavista Stadium', 'scheduled', v.jornada, 'Amistoso', true, true
  from (values
        (6, 'Vasco de Gramo', 'Violeta Parra', '2026-09-25 22:00:00+00'),
        (7, 'Malajax',        'Lord Cochrane', '2026-10-02 22:00:00+00')
       ) as v(jornada, local, visita, cuando)
  join public.teams h on lower(h.name) = lower(v.local)
  join public.teams a on lower(a.name) = lower(v.visita)
 where not exists (select 1
                     from public.matches m
                    where m.tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X')
                      and m.is_friendly);


-- ---------- 3. Los horarios de la J7 ----------
update public.matches m
   set match_date = v.cuando::timestamptz
  from (values
        (7, 'Motafogo',       'Violeta Parra', '2026-10-02 23:00:00+00'),
        (7, 'Vasco de Gramo', 'Charchalax',    '2026-10-03 01:00:00+00')
       ) as v(jornada, local, visita, cuando),
       public.teams h,
       public.teams a
 where lower(h.name) = lower(v.local)
   and lower(a.name) = lower(v.visita)
   and m.home_team_id = h.id
   and m.away_team_id = a.id
   and m.round = v.jornada
   and m.is_friendly = false
   and m.tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X');


-- ---------- 4. La tabla de posiciones ignora los amistosos ----------
-- Es la misma vista de standings_points_per_win.sql con el filtro
-- de is_friendly en los dos lados: en el CTE que arma la lista de
-- equipos y en el join que suma los partidos.
create or replace view public.standings as
with tournament_teams as (
         select distinct matches.tournament_id,
            matches.home_team_id as team_id
           from matches
          where not matches.is_friendly
        union
         select distinct matches.tournament_id,
            matches.away_team_id as team_id
           from matches
          where not matches.is_friendly
        )
 select tt.tournament_id,
    t.id as team_id,
    t.name,
    t.logo_url as shield_url,
    t.bio_title,
    t.bio_description,
    count(m.id) as played,
    coalesce(sum(
        case
            when m.home_team_id = t.id and m.home_score > m.away_score or m.away_team_id = t.id and m.away_score > m.home_score then 1
            else 0
        end), 0::bigint) as won,
    coalesce(sum(
        case
            when m.home_score = m.away_score then 1
            else 0
        end), 0::bigint) as drawn,
    coalesce(sum(
        case
            when m.home_team_id = t.id and m.home_score < m.away_score or m.away_team_id = t.id and m.away_score < m.home_score then 1
            else 0
        end), 0::bigint) as lost,
    coalesce(sum(
        case
            when m.home_team_id = t.id then m.home_score
            else m.away_score
        end), 0::bigint) as goals_for,
    coalesce(sum(
        case
            when m.home_team_id = t.id then m.away_score
            else m.home_score
        end), 0::bigint) as goals_against,
    coalesce(sum(
        case
            when m.home_team_id = t.id then m.home_score
            else m.away_score
        end -
        case
            when m.home_team_id = t.id then m.away_score
            else m.home_score
        end), 0::bigint) as gd,
    coalesce(sum(
        case
            when m.home_team_id = t.id and m.home_score > m.away_score or m.away_team_id = t.id and m.away_score > m.home_score then tor.points_per_win
            when m.home_score = m.away_score then 1
            else 0
        end), 0::bigint) as points
   from tournament_teams tt
     join teams t on tt.team_id = t.id
     join tournaments tor on tor.id = tt.tournament_id
     left join matches m on (t.id = m.home_team_id or t.id = m.away_team_id) and m.tournament_id = tt.tournament_id and m.status = 'finished'::text and not m.is_friendly
  where t.name <> 'Ghost Team'::text
  group by tt.tournament_id, t.id, t.name, t.logo_url, t.bio_title, t.bio_description;

alter view public.standings set (security_invoker = on);
revoke all on public.standings from anon, authenticated;


-- ---------- 5. Los goleadores ignoran los amistosos ----------
-- La misma vista de top_scorers_sin_duplicados.sql: el torneo ya
-- salía del partido, así que alcanza con descartar ahí los goles de
-- los amistosos.
drop view if exists public.top_scorers;

create view public.top_scorers as
with goles_por_equipo as (
        select m.tournament_id,
               g.player_id,
               g.team_id,
               count(*)          as goles,
               max(m.match_date) as ultimo_gol
          from public.goals g
          join public.matches m on m.id = g.match_id
         where not m.is_friendly
         group by m.tournament_id, g.player_id, g.team_id
     ),
     total_por_jugador as (
        select tournament_id,
               player_id,
               sum(goles) as goles
          from goles_por_equipo
         group by tournament_id, player_id
     ),
     equipo_principal as (
        select distinct on (tournament_id, player_id)
               tournament_id,
               player_id,
               team_id
          from goles_por_equipo
         order by tournament_id, player_id, goles desc, ultimo_gol desc nulls last, team_id
     )
select tj.tournament_id,
       p.id     as player_id,
       p.name,
       p.photo_url,
       t.name   as team_name,
       tj.goles as goals
  from total_por_jugador tj
  join equipo_principal ep on ep.tournament_id = tj.tournament_id
                          and ep.player_id     = tj.player_id
  join public.players p on p.id = tj.player_id
  join public.teams   t on t.id = ep.team_id
 order by tj.tournament_id, tj.goles desc, p.name;

alter view public.top_scorers set (security_invoker = on);
revoke all on public.top_scorers from anon, authenticated;


-- ============================================================
-- VERIFICACIÓN 1 — la J6 y la J7 completas
-- Tres partidos cada una, el de las 19:00 con amistoso = true.
-- ============================================================
-- select m.round as jornada,
--        to_char(m.match_date at time zone 'America/Santiago', 'DD-MM HH24:MI') as hora_cancha,
--        h.name as local, a.name as visita, m.is_friendly as amistoso
--   from public.matches m
--   join public.teams h on h.id = m.home_team_id
--   join public.teams a on a.id = m.away_team_id
--  where m.tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X')
--    and m.round in (6, 7)
--  order by m.match_date;


-- ============================================================
-- VERIFICACIÓN 2 — la tabla no se movió
-- Malajax 4 PJ y 9 puntos, los seis equipos y nadie con partidos
-- de más.
-- ============================================================
-- select name, played as pj, won as pg, lost as pp, gd, points as pts
--   from public.standings
--  where tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X')
--  order by points desc, gd desc;


-- ============================================================
-- VERIFICACIÓN 3 — ningún torneo perdió partidos de golpe
-- Compara lo que cuenta la tabla contra los partidos terminados que
-- no son amistosos. "cuadra" tiene que decir sí en todas las filas.
-- ============================================================
-- select tor.name as torneo,
--        sum(s.played) as pj_en_la_tabla,
--        (select count(*) * 2 from public.matches m
--           where m.tournament_id = tor.id and m.status = 'finished' and not m.is_friendly) as pj_reales,
--        case when sum(s.played) = (select count(*) * 2 from public.matches m
--                                     where m.tournament_id = tor.id and m.status = 'finished' and not m.is_friendly)
--             then 'sí' else 'NO' end as cuadra
--   from public.standings s
--   join public.tournaments tor on tor.id = s.tournament_id
--  group by tor.id, tor.name
--  order by tor.name;
