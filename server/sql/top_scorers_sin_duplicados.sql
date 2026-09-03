-- ============================================================
-- LA TABLA DE GOLEADORES DEJA DE REPETIR AL QUE ROTA DE EQUIPO
-- ------------------------------------------------------------
-- El problema, tal como se ve hoy en /liga > Liga de los Martes:
--
--     26  Cristobal  Unión Roma
--     26  Cristobal  Isla Fantasía FC
--
-- Es el mismo jugador (players.id = 198) dos veces, con el mismo
-- número en las dos filas. No es que haya hecho 26 goles con cada
-- camiseta: 26 es su total en el torneo, mostrado dos veces.
--
-- POR QUÉ PASA
-- La vista top_scorers cuenta los goles desde goals, pero para saber
-- de qué equipo es cada goleador se apoya en tournament_players, que
-- es la nómina. En la Liga de los Martes las nóminas rotan fecha a
-- fecha, así que tournament_players tiene a un mismo jugador inscrito
-- en más de un equipo (es a propósito, ver liga_martes_bohemia.sql).
-- Ese join devuelve una fila por inscripción, y como el conteo de
-- goles es por jugador y torneo, las dos filas salen con el total
-- completo. Dos filas, dos puestos del top 10 gastados en la misma
-- persona.
--
-- LA SOLUCIÓN
-- La nómina deja de participar. goals ya guarda el team_id del
-- partido, así que el equipo de cada gol está en el propio gol y no
-- hace falta preguntarle a tournament_players:
--
--   . los goles se cuentan por jugador y torneo (una sola fila);
--   . el equipo que se muestra es aquel con el que hizo más goles,
--     y si empata, el de la fecha más reciente.
--
-- QUÉ CAMBIA EN LA PÁGINA
--   . Cristobal aparece una vez, con sus 26, y entra un goleador más
--     al top 10.
--   . Los totales de todos los demás quedan exactamente igual.
--   . Puede aparecer alguien que antes faltaba: si un jugador hizo
--     goles pero nadie lo dejó inscrito en tournament_players, el
--     join viejo lo borraba del ranking. Ahora cuenta.
--
-- OJO CON EL DROP
-- Va drop + create en vez de create or replace porque replace exige
-- que las columnas queden en el mismo orden que las de la vista
-- vieja, y esta se reescribe entera. No se pierde nada: la vista no
-- guarda datos, se recalcula sola desde goals cada vez que se
-- consulta. Nada más en la base depende de ella; el único que la usa
-- es la API (server/routes/leagues.routes.js).
--
-- CÓMO CORRER:
--   1) Supabase > SQL Editor (proyecto las-galaxias)
--   2) Correr la VERIFICACIÓN 0 de más abajo ANTES de tocar nada y
--      guardarse el resultado, para poder comparar
--   3) Pegar este archivo entero y ejecutar
--   4) Correr las verificaciones 1, 2 y 3
--   5) Abrir /liga > Liga de los Martes y revisar que Cristobal
--      salga una sola vez
-- ============================================================


-- ---------- La vista ----------
drop view if exists public.top_scorers;

create view public.top_scorers as
with goles_por_equipo as (
        -- Cuántos goles hizo cada jugador con cada camiseta, y cuándo
        -- fue el último. El torneo sale del partido, no del gol.
        select m.tournament_id,
               g.player_id,
               g.team_id,
               count(*)          as goles,
               max(m.match_date) as ultimo_gol
          from public.goals g
          join public.matches m on m.id = g.match_id
         group by m.tournament_id, g.player_id, g.team_id
     ),
     total_por_jugador as (
        -- Una fila por jugador y torneo: este es el número que va en
        -- la tabla de goleadores.
        select tournament_id,
               player_id,
               sum(goles) as goles
          from goles_por_equipo
         group by tournament_id, player_id
     ),
     equipo_principal as (
        -- Con qué camiseta se lo muestra: la de más goles; si empata,
        -- la de la fecha más reciente. El team_id del final es solo
        -- para que el desempate nunca quede al azar.
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


-- ---------- Volver a cerrarla ----------
-- La vista nace sin las opciones de seguridad, y sin security_invoker
-- corre con los permisos de su dueño y se saltea el RLS de goals,
-- matches y players. Ver enable_rls.sql.
alter view public.top_scorers set (security_invoker = on);
revoke all on public.top_scorers from anon, authenticated;


-- ============================================================
-- VERIFICACIÓN 0 - la foto de antes (correr ANTES del cambio)
-- Los goleadores de la Liga de los Martes como están hoy. Sirve
-- para comparar después: los totales tienen que ser los mismos.
-- ============================================================
-- select name, team_name, goals
--   from public.top_scorers
--  where tournament_id = 6
--  order by goals desc, name;


-- ============================================================
-- VERIFICACIÓN 1 - no queda nadie repetido
-- Tiene que devolver cero filas, en todos los torneos.
-- ============================================================
-- select tournament_id, player_id, name, count(*) as filas
--   from public.top_scorers
--  group by tournament_id, player_id, name
-- having count(*) > 1;


-- ============================================================
-- VERIFICACIÓN 2 - los totales no se movieron
-- La suma de los goles de la vista tiene que dar lo mismo que la
-- cantidad de filas de goals, torneo por torneo. La columna
-- "cuadra" tiene que decir si en todas las filas.
-- ============================================================
-- select tor.name as torneo,
--        v.goles_en_la_vista,
--        c.goles_cargados,
--        case when v.goles_en_la_vista = c.goles_cargados
--             then 'si' else 'NO' end as cuadra
--   from public.tournaments tor
--   cross join lateral (select coalesce(sum(ts.goals), 0) as goles_en_la_vista
--                         from public.top_scorers ts
--                        where ts.tournament_id = tor.id) v
--   cross join lateral (select count(*) as goles_cargados
--                         from public.goals g
--                         join public.matches m on m.id = g.match_id
--                        where m.tournament_id = tor.id) c
--  order by tor.name;


-- ============================================================
-- VERIFICACIÓN 3 - que la vista siga cerrada
-- invoker tiene que decir true.
-- ============================================================
-- select coalesce((select option_value
--                    from pg_options_to_table(c.reloptions)
--                   where option_name = 'security_invoker'), 'false') as invoker
--   from pg_class c
--   join pg_namespace n on n.oid = c.relnamespace
--  where n.nspname = 'public' and c.relname = 'top_scorers';


-- ============================================================
-- DE YAPA - con qué camisetas hizo sus goles el que rotó
-- Para chequear que el equipo que se muestra sea el que corresponde.
-- ============================================================
-- select p.name as jugador, t.name as equipo, count(*) as goles
--   from public.goals g
--   join public.matches m on m.id = g.match_id
--   join public.players p on p.id = g.player_id
--   join public.teams   t on t.id = g.team_id
--  where m.tournament_id = 6
--    and g.player_id in (select g2.player_id
--                          from public.goals g2
--                          join public.matches m2 on m2.id = g2.match_id
--                         where m2.tournament_id = 6
--                         group by g2.player_id
--                        having count(distinct g2.team_id) > 1)
--  group by p.name, t.name
--  order by jugador, goles desc;
