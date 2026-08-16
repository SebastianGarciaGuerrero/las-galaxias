-- ============================================================
-- LA TABLA DEJA DE TENER LOS PUNTOS ESCRITOS A MANO
-- ------------------------------------------------------------
-- La vista standings repartía los puntos así:
--
--     case when tt.tournament_id = 3 then 3 else 2 end
--
-- O sea: el torneo con id 3 —la Super Liga de los Viernes IX— paga
-- 3 puntos por victoria y todos los demás pagan 2.
--
-- Eso funcionó mientras la IX fue la única liga de viernes. Ya no:
-- la Super Liga de los Viernes X tiene otro id, así que hoy está
-- sumando 2 puntos por victoria cuando le corresponden 3. A cada
-- equipo le faltan tantos puntos como victorias tenga, y como el
-- que gana mucho pierde más puntos que el que empata mucho, el
-- orden de la tabla también puede salir cambiado.
--
-- Las ligas de los martes no se ven afectadas: se juegan con 2
-- puntos, que es justo lo que les daba el "else".
--
-- La solución es que el número deje de estar en la vista y pase a
-- ser un dato del torneo: tournaments.points_per_win. Así cada liga
-- nueva trae su regla y nadie tiene que acordarse de editar la
-- vista.
--
-- No se pierde nada al correrlo: la vista no guarda datos, se
-- recalcula sola desde matches cada vez que se consulta.
--
-- CÓMO CORRER:
--   1) Supabase > SQL Editor (proyecto las-galaxias)
--   2) Pegar este archivo entero y ejecutar
--   3) Correr las verificaciones del final
--   4) Abrir /liga > Super Liga de los Viernes X y revisar que los
--      puntos ahora sean 3 por victoria
-- ============================================================


-- ---------- 1. El dato en el torneo ----------
-- Si ya creaste la columna al cargar la Liga de los Martes, esta
-- parte no hace nada.
alter table public.tournaments
    add column if not exists points_per_win int not null default 3;

do $$
begin
    if not exists (select 1 from pg_constraint where conname = 'tournaments_points_per_win_check') then
        alter table public.tournaments
            add constraint tournaments_points_per_win_check
            check (points_per_win between 1 and 5);
    end if;
end $$;

comment on column public.tournaments.points_per_win is
    'Puntos que paga una victoria. 3 en casi todos los torneos, 2 en la Liga de los Martes. El empate siempre vale 1.';

-- La regla que pidió Sebastián: las ligas de los viernes pagan 3 y el
-- resto paga 2.
--
-- El "o id = 3" está para que la Super Liga de los Viernes IX no cambie
-- ni aunque le falte la categoría: es el único torneo que hoy cobra 3 y
-- tiene que seguir igual. Es un arreglo de datos de una sola vez, no una
-- regla: de acá en adelante el número lo decide points_per_win.
--
-- Poner 2 en todo lo demás deja a las ligas que no son de viernes
-- mostrando exactamente lo mismo que hoy, porque el "else 2" de la vista
-- vieja les daba eso.
update public.tournaments
   set points_per_win = case when category = 'viernes' or id = 3 then 3 else 2 end;


-- ---------- 2. La vista ----------
-- Es la misma de antes con dos cambios: entra tournaments al FROM y
-- los puntos salen de points_per_win en vez del case con el id.
--
-- Ojo con el nombre: el CTE se llama igual que la tabla
-- public.tournament_teams pero no es esa tabla, son los equipos
-- deducidos de los partidos. Se deja como estaba para no cambiar
-- nada de más.
create or replace view public.standings as
with tournament_teams as (
         select distinct matches.tournament_id,
            matches.home_team_id as team_id
           from matches
        union
         select distinct matches.tournament_id,
            matches.away_team_id as team_id
           from matches
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
     left join matches m on (t.id = m.home_team_id or t.id = m.away_team_id) and m.tournament_id = tt.tournament_id and m.status = 'finished'::text
  where t.name <> 'Ghost Team'::text
  group by tt.tournament_id, t.id, t.name, t.logo_url, t.bio_title, t.bio_description;


-- ---------- 3. Volver a cerrarla ----------
-- create or replace no garantiza conservar las opciones, y sin
-- security_invoker la vista corre con los permisos de su dueño y se
-- saltea el RLS de las tablas de abajo. Ver enable_rls.sql.
alter view public.standings set (security_invoker = on);
revoke all on public.standings from anon, authenticated;


-- ============================================================
-- VERIFICACIÓN 1 — cada torneo con su regla
-- Las de viernes tienen que quedar en 3 y todas las demás en 2.
-- ============================================================
-- select id, name, season, category, points_per_win
--   from public.tournaments
--  order by category nulls last, name;


-- ============================================================
-- VERIFICACIÓN 2 — los puntos salen de la regla del torneo
-- La columna "cuadra" tiene que decir sí en todas las filas.
-- ============================================================
-- select tor.name as torneo,
--        tor.points_per_win as paga,
--        s.name as equipo,
--        s.won as pg, s.drawn as pe, s.points as puntos,
--        case when s.points = s.won * tor.points_per_win + s.drawn
--             then 'sí' else 'NO' end as cuadra
--   from public.standings s
--   join public.tournaments tor on tor.id = s.tournament_id
--  order by tor.name, s.points desc;


-- ============================================================
-- VERIFICACIÓN 3 — que la vista siga cerrada
-- invoker tiene que decir true.
-- ============================================================
-- select coalesce((select option_value
--                    from pg_options_to_table(c.reloptions)
--                   where option_name = 'security_invoker'), 'false') as invoker
--   from pg_class c
--   join pg_namespace n on n.oid = c.relnamespace
--  where n.nspname = 'public' and c.relname = 'standings';
