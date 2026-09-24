-- ============================================================
-- SUPER LIGA DE LOS VIERNES X — HORARIOS DE LA VUELTA
-- ------------------------------------------------------------
-- Charchalax había quedado con 3 de sus 5 partidos a las 19:00.
-- Esto reparte las horas de la J8 a la J12 con dos condiciones que
-- puso Sebastián:
--
--   · Malajax juega una sola vez a las 19:00, y es contra
--     Charchalax (J8).
--   · Motafogo juega una sola vez a las 19:00, y es contra Violeta
--     Parra (J10).
--
-- El resto se repartió lo más parejo que permiten esas dos.
--
--   EQUIPO           19:00  20:00  22:00
--   Malajax            1      3      1
--   Charchalax         2      1      2
--   Motafogo           1      2      2
--   Lord Cochrane      1      2      2
--   Violeta Parra      2      1      2
--   Vasco de Gramo     3      1      1
--
-- POR QUÉ VASCO QUEDA CON 3
-- No es una elección, es lo que queda. Si Malajax y Motafogo usan
-- su único partido temprano contra Charchalax y Violeta, esas dos
-- noches ya están ocupadas. En las otras tres fechas, los partidos
-- que no incluyen ni a Malajax ni a Motafogo son Cochrane - Vasco,
-- Charchalax - Vasco y Violeta - Vasco: Vasco está en los tres.
-- Probamos las 243 repartijas posibles con las fechas quietas y las
-- 6 formas de rearmar el calendario moviendo partidos de día; con
-- estas dos condiciones, alguien queda con 3 sí o sí.
--
-- LOS CRUCES NO SE MUEVEN
-- Cambian las horas, no los partidos: las cinco fechas siguen con
-- los mismos tres cruces, cada equipo enfrenta una vez a cada rival
-- y ninguno cambia de día. La J10 mantiene el cambiazo que ya se
-- corrió: Vasco - Malajax a las 22:00.
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
        (8,  'Malajax',        'Charchalax',     '2026-10-09 22:00:00+00'),
        (8,  'Vasco de Gramo', 'Motafogo',       '2026-10-09 23:00:00+00'),
        (8,  'Lord Cochrane',  'Violeta Parra',  '2026-10-10 01:00:00+00'),
        -- J9, viernes 16-10
        (9,  'Lord Cochrane',  'Vasco de Gramo', '2026-10-16 22:00:00+00'),
        (9,  'Malajax',        'Motafogo',       '2026-10-16 23:00:00+00'),
        (9,  'Violeta Parra',  'Charchalax',     '2026-10-17 01:00:00+00'),
        -- J10, viernes 23-10
        (10, 'Violeta Parra',  'Motafogo',       '2026-10-23 22:00:00+00'),
        (10, 'Lord Cochrane',  'Charchalax',     '2026-10-23 23:00:00+00'),
        (10, 'Vasco de Gramo', 'Malajax',        '2026-10-24 01:00:00+00'),
        -- J11, viernes 30-10
        (11, 'Charchalax',     'Vasco de Gramo', '2026-10-30 22:00:00+00'),
        (11, 'Violeta Parra',  'Malajax',        '2026-10-30 23:00:00+00'),
        (11, 'Lord Cochrane',  'Motafogo',       '2026-10-31 01:00:00+00'),
        -- J12, viernes 06-11
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
   and m.round = v.jornada
   and m.tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X');


-- ============================================================
-- VERIFICACIÓN 1 — la vuelta en orden de cancha
-- Tres partidos por fecha, a las 19:00, 20:00 y 22:00. Malajax -
-- Charchalax abre la J8 y Violeta - Motafogo abre la J10.
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
-- Malajax y Motafogo tienen que decir 1 en la columna de las 19:00.
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
