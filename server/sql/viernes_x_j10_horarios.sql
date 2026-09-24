-- ============================================================
-- SUPER LIGA DE LOS VIERNES X — CAMBIAZO DE HORA EN LA J10
-- Viernes 23-10-2026
-- ------------------------------------------------------------
-- Los dos partidos de las puntas se intercambian la hora. El del
-- medio, Violeta Parra - Motafogo, no se mueve.
--
--   19:00   Lord Cochrane - Charchalax     (venía de las 22:00)
--   20:00   Violeta Parra - Motafogo       (igual que antes)
--   22:00   Vasco de Gramo - Malajax       (venía de las 19:00)
--
-- Las horas van en UTC como el resto de la tabla. El 23-10 Chile
-- está en -3, así que las 19:00 de cancha son las 22:00Z del mismo
-- día y las 22:00 de cancha son la 01:00Z del 24.
--
-- El local y la visita no cambian: siguen siendo los del fixture
-- original, que en esta liga solo deciden de qué lado se muestra
-- cada equipo.
--
-- El filtro por jornada no sobra: Vasco de Gramo - Malajax y Lord
-- Cochrane - Charchalax son cruces de la vuelta y sus espejos de la
-- ida —Malajax - Vasco y Charchalax - Cochrane— tienen al otro de
-- local, pero más vale que la consulta diga exactamente cuál toca.
--
-- Es idempotente: escribe valores fijos.
--
-- CÓMO CORRER:
--   1) Supabase > SQL Editor (proyecto las-galaxias)
--   2) Pegar este archivo y ejecutar
--   3) Correr la verificación del final
-- ============================================================

update public.matches m
   set match_date = v.cuando::timestamptz
  from (values
        (10, 'Lord Cochrane',  'Charchalax', '2026-10-23 22:00:00+00'),
        (10, 'Vasco de Gramo', 'Malajax',    '2026-10-24 01:00:00+00')
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
-- VERIFICACIÓN — la J10 en orden de cancha
-- Cochrane 19:00, Violeta 20:00 y Vasco 22:00.
-- ============================================================
-- select to_char(m.match_date at time zone 'America/Santiago', 'DD-MM HH24:MI') as hora_cancha,
--        h.name as local, a.name as visita
--   from public.matches m
--   join public.teams h on h.id = m.home_team_id
--   join public.teams a on a.id = m.away_team_id
--  where m.tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X')
--    and m.round = 10
--  order by m.match_date;
