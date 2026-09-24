-- ============================================================
-- SUPER LIGA DE LOS VIERNES X — SE ELIMINA A NO COMAI
-- ------------------------------------------------------------
-- A No Comai lo echaron de la liga con la primera rueda a medio
-- jugar. Este archivo lo saca del torneo, anula todo lo que jugó
-- y rearma las fechas que quedan por jugar.
--
-- QUÉ SE BORRA
--   · Los 4 partidos que alcanzó a jugar (J2 a J5) con sus goles:
--     Violeta Parra 10-21, No Comai 24-15 Motafogo, Charchalax
--     13-16 y Malajax 19-15. Son 133 goles cargados uno por uno,
--     76 suyos y 57 de los rivales.
--   · Los 8 partidos que le quedaban, de la J6 a la J14.
--   · Su nómina en este torneo y su inscripción.
--   · Los 14 descansos del torneo, los de todos los equipos.
--
-- Anular lo jugado es lo que lo saca de la tabla de posiciones: la
-- vista standings no mira tournament_teams, arma la lista de
-- equipos desde los partidos. Mientras le quede un partido sigue
-- apareciendo.
--
-- CÓMO QUEDA LA TABLA
-- Malajax pierde los 3 puntos de la victoria sobre No Comai, que
-- era el único que le había ganado. Violeta Parra, Motafogo y
-- Charchalax pierden esa derrota. Nadie más se mueve.
--
--   Malajax        4 PJ  3G 0E 1P  62-46  +16   9 pts
--   Lord Cochrane  4 PJ  2G 0E 2P  67-67    0   6 pts
--   Vasco de Gramo 4 PJ  2G 0E 2P  61-65   -4   6 pts
--   Motafogo       3 PJ  2G 0E 1P  48-56   -8   6 pts
--   Charchalax     3 PJ  1G 0E 2P  42-41   +1   3 pts
--   Violeta Parra  4 PJ  1G 0E 3P  54-59   -5   3 pts
--
-- En goleadores desaparecen Maikel (22) y Joceban (16), que eran
-- de No Comai, y los demás bajan los goles que hayan hecho contra
-- ellos.
--
-- EL FIXTURE QUE QUEDA
-- Sin No Comai quedan 6 equipos, así que cada fecha son 3 partidos
-- y no descansa nadie. Esta edición se juega sin fechas libres.
--
-- Primera rueda (J6 y J7): se dejan tal cual, con los 2 partidos
-- oficiales que ya tenían. Los dos equipos que esa noche quedan sin
-- rival juegan un amistoso entre ellos, que no entra a la tabla
-- (viernes_x_amistosos.sql). Con eso la ida cierra completa: los 6
-- equipos jugaron 5 partidos, todos contra todos.
--
-- Segunda rueda (J8 a J12): los 15 partidos que quedaban sueltos en
-- 7 fechas —una de 3 y seis de 2— se aprietan en 5 fechas de 3.
-- Cada equipo juega las 5 y enfrenta una vez a cada rival, así que
-- la liga termina el 06-11 en vez del 20-11. Las jornadas 13 y 14
-- dejan de existir.
--
-- Los horarios siguen siendo 19:00, 20:00 y 22:00 de cancha
-- (22:00Z, 23:00Z y 01:00Z del día siguiente, con Chile en -3).
-- En la vuelta cada equipo juega 2 veces en un horario, 2 en otro
-- y 1 en el que sobra.
--
-- Es idempotente: los borrados no tienen nada que borrar la
-- segunda vez y las fechas se escriben con valores fijos. Este es el
-- fixture como quedó, con los cambios de hora que vinieron después,
-- así que volver a correrlo no pisa nada. Eso sí, ahora necesita la
-- columna matches.is_friendly, que nace en viernes_x_amistosos.sql:
-- si se corriera en una base donde no existe, falla en el bloque 5.
--
-- CÓMO CORRER:
--   1) Supabase > SQL Editor (proyecto las-galaxias)
--   2) Pegar este archivo y ejecutar
--   3) Correr las verificaciones del final
--   4) Abrir /liga > Super Liga de los Viernes X: 6 equipos en la
--      tabla, 12 jornadas y ningún "Descansa"
-- ============================================================


-- ---------- 1. Los goles de los partidos de No Comai ----------
-- Van primero: si goals no tiene on delete cascade, borrar el
-- partido antes falla.
delete from public.goals g
 using public.matches m
 where g.match_id = m.id
   and m.tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X')
   and (select id from public.teams where lower(name) = 'no comai') in (m.home_team_id, m.away_team_id);


-- ---------- 2. Los partidos de No Comai ----------
-- Los 4 jugados y los 8 que le quedaban. staging_match_results cae
-- solo con su on delete cascade.
delete from public.matches m
 where m.tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X')
   and (select id from public.teams where lower(name) = 'no comai') in (m.home_team_id, m.away_team_id);


-- ---------- 3. La nómina y la inscripción ----------
-- Los jugadores no se borran de public.players: varios ya venían
-- de ediciones anteriores. El equipo tampoco se borra de
-- public.teams, que guarda su historial en la IX.
delete from public.tournament_players
 where tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X')
   and team_id = (select id from public.teams where lower(name) = 'no comai');

delete from public.tournament_teams
 where tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X')
   and team_id = (select id from public.teams where lower(name) = 'no comai');


-- ---------- 4. Los descansos ----------
-- Todos, no solo los de No Comai: con 6 equipos ya no descansa
-- nadie. Es solo para esta edición; bye_weeks sigue existiendo
-- para las ligas que la necesiten.
delete from public.bye_weeks
 where tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X');


-- ---------- 5. El fixture que queda ----------
-- Los 19 partidos pendientes con su jornada y su hora definitivas.
-- Los de la J6 a la J8 ya estaban así y se repiten igual para que
-- el archivo muestre el fixture completo y se pueda correr de
-- nuevo sin pensar.
update public.matches m
   set round      = v.jornada,
       match_date = v.cuando::timestamptz
  from (values
        -- Primera rueda. A las 19:00 de las dos fechas se juega
        -- además un amistoso entre los dos equipos que esa noche no
        -- tienen rival: Vasco - Violeta Parra en la J6 y Malajax -
        -- Lord Cochrane en la J7. Van en viernes_x_amistosos.sql.
        (6,  'Malajax',        'Lord Cochrane',  '2026-09-25 23:00:00+00'),
        (6,  'Charchalax',     'Motafogo',       '2026-09-26 01:00:00+00'),
        (7,  'Motafogo',       'Violeta Parra',  '2026-10-02 23:00:00+00'),
        (7,  'Vasco de Gramo', 'Charchalax',     '2026-10-03 01:00:00+00'),
        -- Segunda rueda
        (8,  'Malajax',        'Charchalax',     '2026-10-09 22:00:00+00'),
        (8,  'Lord Cochrane',  'Violeta Parra',  '2026-10-09 23:00:00+00'),
        (8,  'Vasco de Gramo', 'Motafogo',       '2026-10-10 01:00:00+00'),
        (9,  'Violeta Parra',  'Charchalax',     '2026-10-16 22:00:00+00'),
        (9,  'Malajax',        'Motafogo',       '2026-10-16 23:00:00+00'),
        (9,  'Lord Cochrane',  'Vasco de Gramo', '2026-10-17 01:00:00+00'),
        (10, 'Lord Cochrane',  'Charchalax',     '2026-10-23 22:00:00+00'),
        (10, 'Violeta Parra',  'Motafogo',       '2026-10-23 23:00:00+00'),
        (10, 'Vasco de Gramo', 'Malajax',        '2026-10-24 01:00:00+00'),
        (11, 'Lord Cochrane',  'Motafogo',       '2026-10-30 22:00:00+00'),
        (11, 'Charchalax',     'Vasco de Gramo', '2026-10-30 23:00:00+00'),
        (11, 'Violeta Parra',  'Malajax',        '2026-10-31 01:00:00+00'),
        (12, 'Violeta Parra',  'Vasco de Gramo', '2026-11-06 22:00:00+00'),
        (12, 'Lord Cochrane',  'Malajax',        '2026-11-06 23:00:00+00'),
        (12, 'Motafogo',       'Charchalax',     '2026-11-07 01:00:00+00')
       ) as v(jornada, local, visita, cuando),
       public.teams h,
       public.teams a
 where lower(h.name) = lower(v.local)
   and lower(a.name) = lower(v.visita)
   and m.home_team_id = h.id
   and m.away_team_id = a.id
   -- Los amistosos quedan afuera: el de la J7 es Malajax - Lord
   -- Cochrane, el mismo cruce que el partido oficial de la J6, y sin
   -- esta línea volver a correr el archivo se lo llevaría a la J6 con
   -- la hora del otro.
   and m.is_friendly = false
   and m.tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X');


-- ============================================================
-- LOS DOS AMISTOSOS
-- ------------------------------------------------------------
-- Van en viernes_x_amistosos.sql, que además agrega la columna
-- matches.is_friendly y hace que standings y top_scorers los
-- ignoren. Antes de eso no había con qué marcarlos: la vista sumaba
-- cualquier partido del torneo que quedara en 'finished' y la
-- columna competition dice 'Amistoso' en los 42 partidos de la liga.
-- ============================================================


-- ============================================================
-- VERIFICACIÓN 1 — no queda rastro de No Comai en el torneo
-- Las cuatro columnas tienen que dar 0.
-- ============================================================
-- select
--     (select count(*) from public.matches m
--       where m.tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X')
--         and (select id from public.teams where lower(name) = 'no comai') in (m.home_team_id, m.away_team_id)) as partidos,
--     (select count(*) from public.tournament_teams
--       where tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X')
--         and team_id = (select id from public.teams where lower(name) = 'no comai')) as inscripcion,
--     (select count(*) from public.tournament_players
--       where tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X')
--         and team_id = (select id from public.teams where lower(name) = 'no comai')) as nomina,
--     (select count(*) from public.bye_weeks
--       where tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X')) as descansos;


-- ============================================================
-- VERIFICACIÓN 2 — el fixture jornada por jornada
-- De la 1 a la 5 quedan 3, 2, 2, 2 y 2 partidos, que es lo que se
-- jugó sin contar a No Comai. La 6 y la 7 dicen 2 porque el
-- tercero es el amistoso, y de la 8 a la 12 dicen 3. No puede
-- aparecer ninguna jornada 13 ni 14.
-- ============================================================
-- select round as jornada, count(*) as partidos, min(match_date) as arranca
--   from public.matches
--  where tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X')
--  group by round
--  order by round;


-- ============================================================
-- VERIFICACIÓN 3 — nadie juega dos veces la misma noche
-- Tiene que devolver 0 filas.
-- ============================================================
-- select round as jornada, team_id, count(*) as veces
--   from (select round, home_team_id as team_id from public.matches
--          where tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X')
--          union all
--         select round, away_team_id from public.matches
--          where tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X')) x
--  group by round, team_id
-- having count(*) > 1;


-- ============================================================
-- VERIFICACIÓN 4 — la tabla con 6 equipos
-- Malajax tiene que quedar con 4 PJ y 9 puntos.
-- ============================================================
-- select name, played as pj, won as pg, drawn as pe, lost as pp,
--        goals_for as gf, goals_against as gc, gd, points as pts
--   from public.standings
--  where tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X')
--  order by points desc, gd desc;
