-- ============================================================
-- SUPER LIGA DE LOS VIERNES X — TEMPORADA 2026
-- ------------------------------------------------------------
-- Crea el torneo, los dos equipos nuevos, inscribe a los siete
-- participantes y deja programadas las 14 jornadas: 42 partidos
-- y 14 descansos.
--
-- Los cruces y las fechas libres son los del fixture que definió
-- Sebastián. La vuelta (J8-J14) es el espejo exacto de la ida y
-- cada equipo repite descanso en la jornada +7.
--
-- Los horarios sí se reasignaron: en el fixture original algunos
-- equipos jugaban tres veces a las 19:00 y otros una sola. Acá
-- cada equipo juega 2 partidos a las 19:00, 2 a las 20:00 y 2 a
-- las 22:00, tanto en la ida como en la vuelta. La jornada 1
-- quedó igual al original.
--
-- Viernes corridos desde el 14-08-2026 salteando el 18-09
-- (Fiestas Patrias). Las horas van en UTC como el resto de la
-- tabla; el 06-09 entra el horario de verano en Chile y el offset
-- pasa de -4 a -3, por eso las primeras fechas terminan en 23:00Z
-- y las siguientes en 22:00Z. Las tres son las 19:00 en cancha.
--
-- Nombres: en el fixture aparecen como CHARCHALAX, MALAJAX
-- VALPARAISO, VASCO DE GRAMOS, DEPORTIVO VIOLETA y NO COMAI FC.
-- Acá se usan los nombres que ya tiene la base (Charchalaxias,
-- Malajax, Vasco de Gramo, Violeta Parra, No Comai) para no
-- duplicar equipos.
--
-- Es idempotente: si ya se corrió, no duplica nada.
--
-- CÓMO CORRER:
--   1) Supabase > SQL Editor (proyecto las-galaxias)
--   2) Pegar este archivo y ejecutar
--   3) Correr la verificación del final
--   4) Abrir /liga en el sitio: tiene que aparecer en "En Juego"
-- ============================================================

-- ---------- 1. Equipos nuevos ----------
insert into public.teams (name)
select v.name
  from (values
        ('Charchalaxias'),
        ('Lord Cochrane')
       ) as v(name)
 where not exists (select 1 from public.teams t where t.name = v.name);


-- ---------- 2. El torneo ----------
insert into public.tournaments (name, season, status, day_label, image_url, start_date, is_active, category)
select 'Super Liga de los Viernes X', 'Temporada 2026', 'active', 'Liga Viernes',
       'https://res.cloudinary.com/du4oddnjl/image/upload/v1773720648/nochedefutbol_l4lytv.jpg',   -- misma foto que la IX; cambiala cuando tengas una propia
       '2026-08-14', true, 'viernes'
 where not exists (select 1 from public.tournaments where name = 'Super Liga de los Viernes X');


-- ---------- 3. Equipos participantes ----------
insert into public.tournament_teams (tournament_id, team_id)
select (select id from public.tournaments where name = 'Super Liga de los Viernes X'), e.id
  from (values
        ('Malajax'),
        ('Vasco de Gramo'),
        ('Violeta Parra'),
        ('Motafogo'),
        ('No Comai'),
        ('Charchalaxias'),
        ('Lord Cochrane')
       ) as v(name)
  join public.teams e on e.name = v.name
 where not exists (select 1 from public.tournament_teams tt where tt.tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X'));


-- ---------- 4. Fixture: 42 partidos ----------
insert into public.matches
       (tournament_id, home_team_id, away_team_id, match_date, location, status, round, competition, is_local)
select (select id from public.tournaments where name = 'Super Liga de los Viernes X'), h.id, a.id, v.cuando::timestamptz,
       'Cancha Principal', 'scheduled', v.jornada, 'Amistoso', true
  from (values
        (1, 'Charchalaxias', 'Malajax', '2026-08-14 23:00:00+00'),
        (1, 'Violeta Parra', 'Lord Cochrane', '2026-08-15 00:00:00+00'),
        (1, 'Motafogo', 'Vasco de Gramo', '2026-08-15 02:00:00+00'),
        (2, 'Violeta Parra', 'No Comai', '2026-08-21 23:00:00+00'),
        (2, 'Motafogo', 'Malajax', '2026-08-22 00:00:00+00'),
        (2, 'Vasco de Gramo', 'Lord Cochrane', '2026-08-22 02:00:00+00'),
        (3, 'Malajax', 'Vasco de Gramo', '2026-08-28 23:00:00+00'),
        (3, 'No Comai', 'Motafogo', '2026-08-29 00:00:00+00'),
        (3, 'Charchalaxias', 'Violeta Parra', '2026-08-29 02:00:00+00'),
        (4, 'Motafogo', 'Lord Cochrane', '2026-09-04 23:00:00+00'),
        (4, 'Charchalaxias', 'No Comai', '2026-09-05 00:00:00+00'),
        (4, 'Malajax', 'Violeta Parra', '2026-09-05 02:00:00+00'),
        (5, 'Charchalaxias', 'Lord Cochrane', '2026-09-11 22:00:00+00'),
        (5, 'Vasco de Gramo', 'Violeta Parra', '2026-09-11 23:00:00+00'),
        (5, 'Malajax', 'No Comai', '2026-09-12 01:00:00+00'),
        (6, 'Vasco de Gramo', 'No Comai', '2026-09-25 22:00:00+00'),
        (6, 'Malajax', 'Lord Cochrane', '2026-09-25 23:00:00+00'),
        (6, 'Charchalaxias', 'Motafogo', '2026-09-26 01:00:00+00'),
        (7, 'Motafogo', 'Violeta Parra', '2026-10-02 22:00:00+00'),
        (7, 'Vasco de Gramo', 'Charchalaxias', '2026-10-02 23:00:00+00'),
        (7, 'Lord Cochrane', 'No Comai', '2026-10-03 01:00:00+00'),
        (8, 'Malajax', 'Charchalaxias', '2026-10-09 22:00:00+00'),
        (8, 'Lord Cochrane', 'Violeta Parra', '2026-10-09 23:00:00+00'),
        (8, 'Vasco de Gramo', 'Motafogo', '2026-10-10 01:00:00+00'),
        (9, 'No Comai', 'Violeta Parra', '2026-10-16 22:00:00+00'),
        (9, 'Malajax', 'Motafogo', '2026-10-16 23:00:00+00'),
        (9, 'Lord Cochrane', 'Vasco de Gramo', '2026-10-17 01:00:00+00'),
        (10, 'Vasco de Gramo', 'Malajax', '2026-10-23 22:00:00+00'),
        (10, 'Motafogo', 'No Comai', '2026-10-23 23:00:00+00'),
        (10, 'Violeta Parra', 'Charchalaxias', '2026-10-24 01:00:00+00'),
        (11, 'Lord Cochrane', 'Motafogo', '2026-10-30 22:00:00+00'),
        (11, 'No Comai', 'Charchalaxias', '2026-10-30 23:00:00+00'),
        (11, 'Violeta Parra', 'Malajax', '2026-10-31 01:00:00+00'),
        (12, 'Lord Cochrane', 'Charchalaxias', '2026-11-06 22:00:00+00'),
        (12, 'Violeta Parra', 'Vasco de Gramo', '2026-11-06 23:00:00+00'),
        (12, 'No Comai', 'Malajax', '2026-11-07 01:00:00+00'),
        (13, 'No Comai', 'Vasco de Gramo', '2026-11-13 22:00:00+00'),
        (13, 'Lord Cochrane', 'Malajax', '2026-11-13 23:00:00+00'),
        (13, 'Motafogo', 'Charchalaxias', '2026-11-14 01:00:00+00'),
        (14, 'Violeta Parra', 'Motafogo', '2026-11-20 22:00:00+00'),
        (14, 'Charchalaxias', 'Vasco de Gramo', '2026-11-20 23:00:00+00'),
        (14, 'No Comai', 'Lord Cochrane', '2026-11-21 01:00:00+00')
       ) as v(jornada, local, visita, cuando)
  join public.teams h on h.name = v.local
  join public.teams a on a.name = v.visita
 where not exists (select 1 from public.matches m where m.tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X'));


-- ---------- 5. Descansos ----------
insert into public.bye_weeks (tournament_id, team_id, round)
select (select id from public.tournaments where name = 'Super Liga de los Viernes X'), e.id, v.jornada
  from (values
        (1, 'No Comai'),
        (2, 'Charchalaxias'),
        (3, 'Lord Cochrane'),
        (4, 'Vasco de Gramo'),
        (5, 'Motafogo'),
        (6, 'Violeta Parra'),
        (7, 'Malajax'),
        (8, 'No Comai'),
        (9, 'Charchalaxias'),
        (10, 'Lord Cochrane'),
        (11, 'Vasco de Gramo'),
        (12, 'Motafogo'),
        (13, 'Violeta Parra'),
        (14, 'Malajax')
       ) as v(jornada, equipo)
  join public.teams e on e.name = v.equipo
 where not exists (select 1 from public.bye_weeks b where b.tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X'));


-- ============================================================
-- VERIFICACIÓN — esperado: 42 partidos, 14 descansos, 7 equipos
-- ============================================================
-- select
--     (select count(*) from public.matches          where tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X')) as partidos,
--     (select count(*) from public.bye_weeks        where tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X')) as descansos,
--     (select count(*) from public.tournament_teams where tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X')) as equipos;
