-- ============================================================
-- SUPER LIGA DE LOS VIERNES X — TEMPORADA 2026
-- ------------------------------------------------------------
-- Crea el torneo, los dos equipos nuevos (Charchalax y Lord
-- Cochrane), inscribe a los siete participantes, programa las 14
-- jornadas (42 partidos y 14 descansos) y carga las nóminas
-- (69 inscripciones).
--
-- FIXTURE
-- Los cruces y las fechas libres son los que definió Sebastián.
-- La vuelta (J8-J14) es el espejo exacto de la ida y cada equipo
-- repite descanso en la jornada +7.
--
-- HORARIOS
-- Reasignados: en el fixture original algunos equipos jugaban tres
-- veces a las 19:00 y otros una sola. Acá cada equipo juega 2 a las
-- 19:00, 2 a las 20:00 y 2 a las 22:00, en la ida y en la vuelta.
-- La jornada 1 quedó igual al original.
--
-- Viernes corridos desde el 14-08-2026 salteando el 18-09 (Fiestas
-- Patrias). Las horas van en UTC como el resto de la tabla; el
-- 06-09 entra el horario de verano en Chile y el offset pasa de -4
-- a -3, por eso las primeras fechas terminan en 23:00Z y las
-- siguientes en 22:00Z. Las tres son las 19:00 en cancha.
--
-- JUGADORES
-- De los 69 de las nóminas, 42 ya estaban en la base y se reutilizan
-- con su historial, y 27 son nuevos. El cruce es por nombre sin
-- distinguir mayúsculas, así que no se duplica a nadie.
--
-- Dos nombres se repetían entre equipos siendo personas distintas:
--   · Pato (Vasco de Gramo) es el que ya existe, con sus goles de la IX
--   · Patricio (Lord Cochrane) es jugador nuevo
--   · Emilio (Violeta Parra) es el antiguo, el "Emilio D Dios"
--   · Emilio No Comai es jugador nuevo
--
-- Los arqueros venían marcados con un guante y Peluo con una (A).
-- Esas marcas no se guardan: la tabla players no tiene columna de
-- posición.
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
        ('Charchalax'),
        ('Lord Cochrane')
       ) as v(name)
 where not exists (select 1 from public.teams t where lower(t.name) = lower(v.name));


-- ---------- 2. El torneo ----------
insert into public.tournaments (name, season, status, day_label, image_url, start_date, is_active, category)
select 'Super Liga de los Viernes X', 'Temporada 2026', 'active', 'Liga Viernes',
       'https://res.cloudinary.com/du4oddnjl/image/upload/v1773720648/nochedefutbol_l4lytv.jpg',   -- la misma portada de la IX
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
        ('Charchalax'),
        ('Lord Cochrane')
       ) as v(name)
  join public.teams e on lower(e.name) = lower(v.name)
 where not exists (select 1 from public.tournament_teams tt where tt.tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X'));


-- ---------- 4. Fixture: 42 partidos ----------
insert into public.matches
       (tournament_id, home_team_id, away_team_id, match_date, location, status, round, competition, is_local)
select (select id from public.tournaments where name = 'Super Liga de los Viernes X'), h.id, a.id, v.cuando::timestamptz,
       'Bellavista Stadium', 'scheduled', v.jornada, 'Amistoso', true
  from (values
        (1, 'Charchalax', 'Malajax', '2026-08-14 23:00:00+00'),
        (1, 'Violeta Parra', 'Lord Cochrane', '2026-08-15 00:00:00+00'),
        (1, 'Motafogo', 'Vasco de Gramo', '2026-08-15 02:00:00+00'),
        (2, 'Violeta Parra', 'No Comai', '2026-08-21 23:00:00+00'),
        (2, 'Motafogo', 'Malajax', '2026-08-22 00:00:00+00'),
        (2, 'Vasco de Gramo', 'Lord Cochrane', '2026-08-22 02:00:00+00'),
        (3, 'Malajax', 'Vasco de Gramo', '2026-08-28 23:00:00+00'),
        (3, 'No Comai', 'Motafogo', '2026-08-29 00:00:00+00'),
        (3, 'Charchalax', 'Violeta Parra', '2026-08-29 02:00:00+00'),
        (4, 'Motafogo', 'Lord Cochrane', '2026-09-04 23:00:00+00'),
        (4, 'Charchalax', 'No Comai', '2026-09-05 00:00:00+00'),
        (4, 'Malajax', 'Violeta Parra', '2026-09-05 02:00:00+00'),
        (5, 'Charchalax', 'Lord Cochrane', '2026-09-11 22:00:00+00'),
        (5, 'Vasco de Gramo', 'Violeta Parra', '2026-09-11 23:00:00+00'),
        (5, 'Malajax', 'No Comai', '2026-09-12 01:00:00+00'),
        (6, 'Vasco de Gramo', 'No Comai', '2026-09-25 22:00:00+00'),
        (6, 'Malajax', 'Lord Cochrane', '2026-09-25 23:00:00+00'),
        (6, 'Charchalax', 'Motafogo', '2026-09-26 01:00:00+00'),
        (7, 'Motafogo', 'Violeta Parra', '2026-10-02 22:00:00+00'),
        (7, 'Vasco de Gramo', 'Charchalax', '2026-10-02 23:00:00+00'),
        (7, 'Lord Cochrane', 'No Comai', '2026-10-03 01:00:00+00'),
        (8, 'Malajax', 'Charchalax', '2026-10-09 22:00:00+00'),
        (8, 'Lord Cochrane', 'Violeta Parra', '2026-10-09 23:00:00+00'),
        (8, 'Vasco de Gramo', 'Motafogo', '2026-10-10 01:00:00+00'),
        (9, 'No Comai', 'Violeta Parra', '2026-10-16 22:00:00+00'),
        (9, 'Malajax', 'Motafogo', '2026-10-16 23:00:00+00'),
        (9, 'Lord Cochrane', 'Vasco de Gramo', '2026-10-17 01:00:00+00'),
        (10, 'Vasco de Gramo', 'Malajax', '2026-10-23 22:00:00+00'),
        (10, 'Motafogo', 'No Comai', '2026-10-23 23:00:00+00'),
        (10, 'Violeta Parra', 'Charchalax', '2026-10-24 01:00:00+00'),
        (11, 'Lord Cochrane', 'Motafogo', '2026-10-30 22:00:00+00'),
        (11, 'No Comai', 'Charchalax', '2026-10-30 23:00:00+00'),
        (11, 'Violeta Parra', 'Malajax', '2026-10-31 01:00:00+00'),
        (12, 'Lord Cochrane', 'Charchalax', '2026-11-06 22:00:00+00'),
        (12, 'Violeta Parra', 'Vasco de Gramo', '2026-11-06 23:00:00+00'),
        (12, 'No Comai', 'Malajax', '2026-11-07 01:00:00+00'),
        (13, 'No Comai', 'Vasco de Gramo', '2026-11-13 22:00:00+00'),
        (13, 'Lord Cochrane', 'Malajax', '2026-11-13 23:00:00+00'),
        (13, 'Motafogo', 'Charchalax', '2026-11-14 01:00:00+00'),
        (14, 'Violeta Parra', 'Motafogo', '2026-11-20 22:00:00+00'),
        (14, 'Charchalax', 'Vasco de Gramo', '2026-11-20 23:00:00+00'),
        (14, 'No Comai', 'Lord Cochrane', '2026-11-21 01:00:00+00')
       ) as v(jornada, local, visita, cuando)
  join public.teams h on lower(h.name) = lower(v.local)
  join public.teams a on lower(a.name) = lower(v.visita)
 where not exists (select 1 from public.matches m where m.tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X'));


-- ---------- 5. Descansos ----------
insert into public.bye_weeks (tournament_id, team_id, round)
select (select id from public.tournaments where name = 'Super Liga de los Viernes X'), e.id, v.jornada
  from (values
        (1, 'No Comai'),
        (2, 'Charchalax'),
        (3, 'Lord Cochrane'),
        (4, 'Vasco de Gramo'),
        (5, 'Motafogo'),
        (6, 'Violeta Parra'),
        (7, 'Malajax'),
        (8, 'No Comai'),
        (9, 'Charchalax'),
        (10, 'Lord Cochrane'),
        (11, 'Vasco de Gramo'),
        (12, 'Motafogo'),
        (13, 'Violeta Parra'),
        (14, 'Malajax')
       ) as v(jornada, equipo)
  join public.teams e on lower(e.name) = lower(v.equipo)
 where not exists (select 1 from public.bye_weeks b where b.tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X'));


-- ---------- 6. Jugadores nuevos ----------
insert into public.players (name)
select v.name
  from (values
        ('JoaquinD'),
        ('Joaquin80'),
        ('KinKon'),
        ('Nico arco'),
        ('Felipe'),
        ('Diegolince'),
        ('Peluo'),
        ('Jorgiño'),
        ('Juanito'),
        ('oriel'),
        ('chiky'),
        ('kiyoshi'),
        ('Emilio No Comai'),
        ('Dani chinelli'),
        ('Seba bob'),
        ('Chavez'),
        ('Edgar'),
        ('Choro Navia'),
        ('Bruno'),
        ('Jorge Palma'),
        ('Maurice Carrere'),
        ('Seba Cantillana'),
        ('Marco Cantillana'),
        ('Ruben'),
        ('Yuyo'),
        ('Pipa'),
        ('Patricio')
       ) as v(name)
 where not exists (select 1 from public.players p where lower(p.name) = lower(v.name));


-- ---------- 7. Nóminas ----------
insert into public.tournament_players (tournament_id, team_id, player_id)
select (select id from public.tournaments where name = 'Super Liga de los Viernes X'), e.id, p.id
  from (values
        ('Malajax', 'Alvaro'),
        ('Malajax', 'Luisiño'),
        ('Malajax', 'Perba'),
        ('Malajax', 'Pulga'),
        ('Malajax', 'Satan'),
        ('Malajax', 'Fabi'),
        ('Malajax', 'JoaquinD'),
        ('Malajax', 'Joaquin80'),
        ('Malajax', 'Waldo'),
        ('Malajax', 'KinKon'),
        ('Vasco de Gramo', 'Nico arco'),
        ('Vasco de Gramo', 'Jordano'),
        ('Vasco de Gramo', 'Alexis'),
        ('Vasco de Gramo', 'Nhio'),
        ('Vasco de Gramo', 'Pascal'),
        ('Vasco de Gramo', 'Yerich'),
        ('Vasco de Gramo', 'Felipe'),
        ('Vasco de Gramo', 'Pato'),
        ('Vasco de Gramo', 'Caly'),
        ('Violeta Parra', 'Guga'),
        ('Violeta Parra', 'Kevinem'),
        ('Violeta Parra', 'Kevin10'),
        ('Violeta Parra', 'Cristian'),
        ('Violeta Parra', 'Bryan'),
        ('Violeta Parra', 'Danilo'),
        ('Violeta Parra', 'Emilio'),
        ('Violeta Parra', 'Toño'),
        ('Violeta Parra', 'Diegolince'),
        ('Violeta Parra', 'Miza'),
        ('Motafogo', 'Peluo'),
        ('Motafogo', 'Guti'),
        ('Motafogo', 'Edu'),
        ('Motafogo', 'Jaime'),
        ('Motafogo', 'Jorgiño'),
        ('Motafogo', 'Juanito'),
        ('Motafogo', 'Javi'),
        ('Motafogo', 'Rod'),
        ('Motafogo', 'Braulio'),
        ('Motafogo', 'ZevaG'),
        ('No Comai', 'oriel'),
        ('No Comai', 'joceban'),
        ('No Comai', 'José Carlos'),
        ('No Comai', 'chiky'),
        ('No Comai', 'yinyo'),
        ('No Comai', 'kiyoshi'),
        ('No Comai', 'Edison'),
        ('No Comai', 'Emilio No Comai'),
        ('No Comai', 'Dani chinelli'),
        ('No Comai', 'maikel'),
        ('Charchalax', 'Seba bob'),
        ('Charchalax', 'Chavez'),
        ('Charchalax', 'Edgar'),
        ('Charchalax', 'Nico'),
        ('Charchalax', 'Choro Navia'),
        ('Charchalax', 'Nachito'),
        ('Charchalax', 'Diego'),
        ('Charchalax', 'Bruno'),
        ('Charchalax', 'Diegollo'),
        ('Charchalax', 'Gabriel'),
        ('Lord Cochrane', 'Jorge Palma'),
        ('Lord Cochrane', 'Maurice Carrere'),
        ('Lord Cochrane', 'Seba Cantillana'),
        ('Lord Cochrane', 'Marco Cantillana'),
        ('Lord Cochrane', 'Ruben'),
        ('Lord Cochrane', 'Yuyo'),
        ('Lord Cochrane', 'Javier'),
        ('Lord Cochrane', 'Cris'),
        ('Lord Cochrane', 'Pipa'),
        ('Lord Cochrane', 'Patricio')
       ) as v(equipo, jugador)
  join public.teams   e on lower(e.name) = lower(v.equipo)
  join public.players p on lower(p.name) = lower(v.jugador)
 where not exists (select 1 from public.tournament_players tp where tp.tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X'));


-- ============================================================
-- VERIFICACIÓN
-- esperado: 42 partidos, 14 descansos, 7 equipos, 69 inscritos
-- ============================================================
-- select
--     (select count(*) from public.matches            where tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X')) as partidos,
--     (select count(*) from public.bye_weeks          where tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X')) as descansos,
--     (select count(*) from public.tournament_teams   where tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X')) as equipos,
--     (select count(*) from public.tournament_players where tournament_id = (select id from public.tournaments where name = 'Super Liga de los Viernes X')) as inscritos;


-- ------------------------------------------------------------
-- OPCIONAL: si querés que el veterano aparezca con su nombre
-- completo en la lista de goleadores, descomentá esta línea.
-- Le cambia el nombre también en el historial de la IX.
-- ------------------------------------------------------------
-- update public.players set name = 'Emilio D Dios' where lower(name) = 'emilio';
