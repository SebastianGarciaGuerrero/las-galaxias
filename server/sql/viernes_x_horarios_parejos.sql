-- ============================================================
-- SUPER LIGA DE LOS VIERNES X — HORARIOS PAREJOS EN LA VUELTA
-- ------------------------------------------------------------
-- Charchalax había quedado con 3 partidos a las 19:00 de los 5 de
-- la vuelta, y Vasco de Gramo con uno solo. Esto reparte las horas
-- para que todos jueguen 1 vez en un horario y 2 en cada uno de los
-- otros dos.
--
--   EQUIPO           19:00  20:00  22:00
--   Malajax            1      2      2
--   Charchalax         2      2      1
--   Motafogo           1      2      2
--   Lord Cochrane      2      1      2
--   Violeta Parra      2      2      1
--   Vasco de Gramo     2      1      2
--
-- Malajax y Motafogo quedan con uno solo a las 19:00, como pidió
-- Sebastián. Son los dos que juegan entre ellos esa noche: sacarle
-- el tercero a Charchalax sin tocarlos a ellos obliga a que su
-- partido sea justo el temprano de la J9.
--
-- LOS CRUCES NO SE MUEVEN
-- Cambian las horas, no los partidos: las cinco fechas siguen con
-- los mismos tres cruces y cada equipo sigue enfrentando una vez a
-- cada rival. La J10 queda igual que como quedó con el cambiazo de
-- viernes_x_j10_horarios.sql; se repite acá para que el archivo
-- muestre la vuelta entera.
--
-- Las horas van en UTC, con Chile en -3: 22:00Z son las 19:00 de
-- cancha, 23:00Z las 20:00 y la 01:00Z del día siguiente las 22:00.
--
-- Es idempotente: escribe valores fijos y filtra por jornada.
--
-- CÓMO CORRER:
--   1) Supabase > SQL Editor (proyecto las-galaxias)
--   2) Pegar este archivo y ejecutar
--   3) Correr las dos verificaciones del final
-- ============================================================

update public.matches m
   set match_date = v.cuando::timestamptz
  from (values
        -- J8, viernes 09-10
        (8,  'Lord Cochrane',  'Violeta Parra',  '2026-10-09 22:00:00+00'),
        (8,  'Malajax',        'Charchalax',     '2026-10-09 23:00:00+00'),
        (8,  'Vasco de Gramo', 'Motafogo',       '2026-10-10 01:00:00+00'),
        -- J9, viernes 16-10
        (9,  'Malajax',        'Motafogo',       '2026-10-16 22:00:00+00'),
        (9,  'Lord Cochrane',  'Vasco de Gramo', '2026-10-16 23:00:00+00'),
        (9,  'Violeta Parra',  'Charchalax',     '2026-10-17 01:00:00+00'),
        -- J10, viernes 23-10: sin cambios
        (10, 'Lord Cochrane',  'Charchalax',     '2026-10-23 22:00:00+00'),
        (10, 'Violeta Parra',  'Motafogo',       '2026-10-23 23:00:00+00'),
        (10, 'Vasco de Gramo', 'Malajax',        '2026-10-24 01:00:00+00'),
        -- J11, viernes 30-10
        (11, 'Charchalax',     'Vasco de Gramo', '2026-10-30 22:00:00+00'),
        (11, 'Violeta Parra',  'Malajax',        '2026-10-30 23:00:00+00'),
        (11, 'Lord Cochrane',  'Motafogo',       '2026-10-31 01:00:00+00'),
        -- J12, viernes 06-11
        (12, 'Violeta Parra',  'Vasco de Gramo', '2026-11-06 22:00:00+00'),
        (12, 'Motafogo',       'Charchalax',     '2026-11-06 23:00:00+00'),
        (12, 'Lord Cochrane',  'Malajax',        '2026-11-07 01:00:00+00')
       ) as v(jornada, local, visita, cuando),
       public.teams h,
       public.teams a
 where lower(h.name) = lower(v.local)
   and lower(a.name) = lower(v.visita)
   and m.home_team_id = h.id
   and m.away_team_id = a.id
   and m.round = v.jornada
   and m.tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X');


-- ============================================================
-- VERIFICACIÓN 1 — la vuelta en orden de cancha
-- Tres partidos por fecha, a las 19:00, 20:00 y 22:00.
-- ============================================================
-- select m.round as jornada,
--        to_char(m.match_date at time zone 'America/Santiago', 'DD-MM HH24:MI') as hora_cancha,
--        h.name as local, a.name as visita
--   from public.matches m
--   join public.teams h on h.id = m.home_team_id
--   join public.teams a on a.id = m.away_team_id
--  where m.tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X')
--    and m.round between 8 and 12
--  order by m.match_date;


-- ============================================================
-- VERIFICACIÓN 2 — cuántas veces juega cada uno a cada hora
-- Tiene que dar 1, 2 y 2 en las seis filas, en algún orden.
-- ============================================================
-- select t.name as equipo,
--        count(*) filter (where to_char(m.match_date at time zone 'America/Santiago', 'HH24:MI') = '19:00') as a_las_19,
--        count(*) filter (where to_char(m.match_date at time zone 'America/Santiago', 'HH24:MI') = '20:00') as a_las_20,
--        count(*) filter (where to_char(m.match_date at time zone 'America/Santiago', 'HH24:MI') = '22:00') as a_las_22
--   from public.matches m
--   join public.teams t on t.id in (m.home_team_id, m.away_team_id)
--  where m.tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X')
--    and m.round between 8 and 12
--  group by t.name
--  order by t.name;
