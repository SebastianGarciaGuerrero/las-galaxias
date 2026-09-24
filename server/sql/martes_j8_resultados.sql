-- ============================================================
-- LIGA DE LOS MARTES — J8, PRIMERA FECHA DE LA SEGUNDA FASE
-- Martes 22-09-2026
-- ------------------------------------------------------------
-- Carga los cuatro resultados de la fecha y sus 140 goles, crea a
-- los jugadores que no estaban en la base e inscribe las nóminas
-- que jugaron esa noche.
--
--   19:00  Atlético Canario  14 - 17  Liberty U.        Grupo A
--   20:00  Cinzanociti       15 - 19  Morada FC         Grupo A
--   21:00  Real Proa         25 - 11  Isla Fantasía FC  Grupo B
--   22:00  Unión Roma        13 - 26  D. El Huevo       Grupo B
--
-- La planilla ponía a Liberty a la izquierda en el primero; en la
-- base el local es Canario y se deja así, que en esta liga juegan
-- todos en la misma cancha.
--
-- EL GOL DEL ARQUERO
-- Los goleadores de campo de D. El Huevo sumaban 25 y el partido
-- terminó 26: el que faltaba lo hizo Peludo, el arquero, y por eso
-- no estaba entre las rayas de los demás. Confirmado por Sebastián.
--
-- CÓMO SE CONTÓ
-- Los cuadritos de la planilla: cada trazo vale 1 y el cuadrado
-- cerrado con diagonal vale 5. Los siete equipos que quedaron
-- completos cuadran exacto con su marcador.
--
-- NOMBRES
-- La planilla trae apodos escritos a mano y algunos no son los de
-- la base: Jordanobi es Jordano, Edo es Edu, Vapi es Vari, Yemich
-- es Yerich, Henres es Hermes, Isaaa es Isrra, Mizael es Miza y
-- Huar es Alvar. Confirmados uno por uno con Sebastián.
--
-- Nuevos: Matias, Goku, Manuel, Ponce, Peludo, J.P y David. Ojo que
-- se buscan por nombre en toda la tabla players, igual que hace el
-- panel: si ya existe un "David" de otra liga, se reutiliza ese y no
-- se crea un segundo. Para nombres así de comunes conviene mirar la
-- verificación 3 antes de darlo por bueno.
--
-- LAS NÓMINAS ROTAN
-- En esta liga los planteles cambian fecha a fecha. Esa noche Rolo
-- (Canario) jugó en Liberty, Dharma y Gato (El Huevo) en Canario,
-- Humberto (Cinzanociti) en Fantasía y Gonzalo (Cinzanociti) en
-- Roma. Los goles quedan a nombre del equipo con el que jugaron,
-- que es lo que mira la tabla de goleadores.
--
-- Es idempotente: los goles no se cargan si la jornada ya tiene
-- alguno, así no se duplican al correrlo dos veces.
--
-- ANTES O DESPUÉS, DA LO MISMO
-- martes_j8_segunda_fase.sql le pone a estos cuatro partidos la
-- etapa que les corresponde. Son independientes, pero los dos
-- tienen que correr.
--
-- CÓMO CORRER:
--   1) Supabase > SQL Editor (proyecto las-galaxias)
--   2) Pegar este archivo y ejecutar
--   3) Correr las verificaciones del final
--   4) Abrir /liga > Locales de la Bohemia Porteña: los dos grupos
--      con su tabla y la J8 con los cuatro resultados
-- ============================================================


-- ---------- 1. Jugadores nuevos ----------
insert into public.players (name)
select v.name
  from (values
        ('Matias'),
        ('Goku'),
        ('Manuel'),
        ('Ponce'),
        ('Peludo'),
        ('J.P'),
        ('David')
       ) as v(name)
 where not exists (select 1 from public.players p where lower(p.name) = lower(v.name));


-- ---------- 2. Las nóminas de la fecha ----------
-- Los seis de cada equipo, arqueros incluidos. Se agregan a los que
-- falten sin tocar a los que ya estaban: un jugador puede estar en
-- más de un equipo del torneo y eso acá es normal.
with torneo as (
        select id from public.tournaments where name = 'Locales de la Bohemia Porteña'
     ),
     nomina as (
        select e.id as team_id,
               (select p.id
                  from public.players p
                 where lower(p.name) = lower(v.jugador)
                 order by p.id
                 limit 1) as player_id
          from (values
                ('Liberty U.',       'David'),
                ('Liberty U.',       'Satan'),
                ('Liberty U.',       'Alexis'),
                ('Liberty U.',       'Emilio'),
                ('Liberty U.',       'Nhio'),
                ('Liberty U.',       'Rolo'),
                ('Atlético Canario', 'Gato'),
                ('Atlético Canario', 'Chavez'),
                ('Atlético Canario', 'Dr'),
                ('Atlético Canario', 'Vari'),
                ('Atlético Canario', 'Rod'),
                ('Atlético Canario', 'Dharma'),
                ('Cinzanociti',      'Jordano'),
                ('Cinzanociti',      'Juanin'),
                ('Cinzanociti',      'Juan'),
                ('Cinzanociti',      'Pipe'),
                ('Cinzanociti',      'Paxuco'),
                ('Cinzanociti',      'Matias'),
                ('Morada FC',        'Pascal'),
                ('Morada FC',        'Cuelli'),
                ('Morada FC',        'Manuel'),
                ('Morada FC',        'Ernesto'),
                ('Morada FC',        'Antonio'),
                ('Real Proa',        'Loco P'),
                ('Real Proa',        'Edu'),
                ('Real Proa',        'Duplox'),
                ('Real Proa',        'Ignacio'),
                ('Real Proa',        'Goku'),
                ('Real Proa',        'SebaG'),
                ('Isla Fantasía FC', 'Marco'),
                ('Isla Fantasía FC', 'Nachito'),
                ('Isla Fantasía FC', 'Peluca'),
                ('Isla Fantasía FC', 'DaDa'),
                ('Isla Fantasía FC', 'Humberto'),
                ('Isla Fantasía FC', 'Ponce'),
                ('Unión Roma',       'J.P'),
                ('Unión Roma',       'Franco'),
                ('Unión Roma',       'Fabi'),
                ('Unión Roma',       'Tomate'),
                ('Unión Roma',       'Alonzo'),
                ('Unión Roma',       'Gonzalo'),
                ('D. El Huevo',      'Peludo'),
                ('D. El Huevo',      'Yerich'),
                ('D. El Huevo',      'Hermes'),
                ('D. El Huevo',      'Isrra'),
                ('D. El Huevo',      'Miza'),
                ('D. El Huevo',      'Alvar')
               ) as v(equipo, jugador)
          join public.teams e on lower(e.name) = lower(v.equipo)
     )
insert into public.tournament_players (tournament_id, team_id, player_id)
select t.id, n.team_id, n.player_id
  from nomina n
 cross join torneo t
 where n.player_id is not null
   and not exists (select 1
                     from public.tournament_players tp
                    where tp.tournament_id = t.id
                      and tp.team_id = n.team_id
                      and tp.player_id = n.player_id);


-- ---------- 3. Los cuatro resultados ----------
-- El "round = 8" no sobra: Atlético Canario - Liberty U. se jugó
-- igual en la J2 y Cinzanociti - Morada FC en la J7. Sin él, esta
-- consulta les cambiaría el marcador a los partidos de la primera
-- fase.
update public.matches m
   set home_score = v.goles_local,
       away_score = v.goles_visita,
       status     = 'finished'
  from (values
        ('Atlético Canario', 'Liberty U.',       14, 17),
        ('Cinzanociti',      'Morada FC',        15, 19),
        ('Real Proa',        'Isla Fantasía FC', 25, 11),
        ('Unión Roma',       'D. El Huevo',      13, 26)
       ) as v(local, visita, goles_local, goles_visita),
       public.teams h,
       public.teams a
 where lower(h.name) = lower(v.local)
   and lower(a.name) = lower(v.visita)
   and m.home_team_id = h.id
   and m.away_team_id = a.id
   and m.round = 8
   and m.tournament_id = (select id from public.tournaments where name = 'Locales de la Bohemia Porteña');


-- ---------- 4. Los goles ----------
-- Una fila por gol, que es como los guarda el panel. El partido sale
-- del equipo: en la J8 cada uno juega una sola vez.
--
-- Peludo es el arquero de El Huevo y entra con el gol 26.
with torneo as (
        select id from public.tournaments where name = 'Locales de la Bohemia Porteña'
     ),
     partidos as (
        select m.id, m.home_team_id, m.away_team_id
          from public.matches m
         cross join torneo t
         where m.tournament_id = t.id
           and m.round = 8
     ),
     anotadores as (
        select e.id as team_id,
               (select p.id
                  from public.players p
                 where lower(p.name) = lower(v.jugador)
                 order by p.id
                 limit 1) as player_id,
               v.goles
          from (values
                -- Canario 14 - 17 Liberty
                ('Liberty U.',       'Satan',    2),
                ('Liberty U.',       'Alexis',   9),
                ('Liberty U.',       'Emilio',   2),
                ('Liberty U.',       'Nhio',     2),
                ('Liberty U.',       'Rolo',     2),
                ('Atlético Canario', 'Chavez',   4),
                ('Atlético Canario', 'Dr',       1),
                ('Atlético Canario', 'Vari',     1),
                ('Atlético Canario', 'Rod',      3),
                ('Atlético Canario', 'Dharma',   5),
                -- Cinzanociti 15 - 19 Morada
                ('Cinzanociti',      'Juanin',   7),
                ('Cinzanociti',      'Pipe',     2),
                ('Cinzanociti',      'Paxuco',   3),
                ('Cinzanociti',      'Matias',   3),
                ('Morada FC',        'Pascal',   6),
                ('Morada FC',        'Cuelli',   1),
                ('Morada FC',        'Manuel',   3),
                ('Morada FC',        'Ernesto',  6),
                ('Morada FC',        'Antonio',  3),
                -- Proa 25 - 11 Fantasía
                ('Real Proa',        'Edu',      5),
                ('Real Proa',        'Duplox',  12),
                ('Real Proa',        'Ignacio',  1),
                ('Real Proa',        'Goku',     2),
                ('Real Proa',        'SebaG',    5),
                ('Isla Fantasía FC', 'Nachito',  6),
                ('Isla Fantasía FC', 'Peluca',   1),
                ('Isla Fantasía FC', 'DaDa',     3),
                ('Isla Fantasía FC', 'Humberto', 1),
                -- Roma 13 - 26 El Huevo
                ('Unión Roma',       'Franco',   1),
                ('Unión Roma',       'Fabi',     3),
                ('Unión Roma',       'Tomate',   5),
                ('Unión Roma',       'Gonzalo',  4),
                ('D. El Huevo',      'Yerich',   3),
                ('D. El Huevo',      'Hermes',   4),
                ('D. El Huevo',      'Isrra',    1),
                ('D. El Huevo',      'Miza',     7),
                ('D. El Huevo',      'Alvar',   10),
                ('D. El Huevo',      'Peludo',   1)
               ) as v(equipo, jugador, goles)
          join public.teams e on lower(e.name) = lower(v.equipo)
     )
insert into public.goals (match_id, player_id, team_id)
select pa.id, an.player_id, an.team_id
  from anotadores an
  join partidos pa on an.team_id in (pa.home_team_id, pa.away_team_id)
 cross join lateral generate_series(1, an.goles)
 where an.player_id is not null
   -- El candado que lo hace idempotente: si la jornada ya tiene
   -- goles cargados, no entra nada. Para agregar el que falta, hay
   -- que sacarlo.
   and not exists (select 1 from public.goals g join partidos p2 on p2.id = g.match_id);


-- ============================================================
-- VERIFICACIÓN 1 — los cuatro partidos, y los goles contra el marcador
-- "cuadra" tiene que decir sí en las ocho filas.
-- ============================================================
-- with partidos as (
--     select m.id, m.round, m.stage, m.home_team_id, m.away_team_id, m.home_score, m.away_score
--       from public.matches m
--      where m.tournament_id = (select id from public.tournaments where name = 'Locales de la Bohemia Porteña')
--        and m.round = 8
-- )
-- select t.name as equipo,
--        case when p.home_team_id = t.id then p.home_score else p.away_score end as marcador,
--        (select count(*) from public.goals g where g.match_id = p.id and g.team_id = t.id) as goles_cargados,
--        case when case when p.home_team_id = t.id then p.home_score else p.away_score end
--                 = (select count(*) from public.goals g where g.match_id = p.id and g.team_id = t.id)
--             then 'sí' else 'NO' end as cuadra
--   from partidos p
--   join public.teams t on t.id in (p.home_team_id, p.away_team_id)
--  order by t.name;


-- ============================================================
-- VERIFICACIÓN 2 — las tablas de los dos grupos
-- Con una sola fecha jugada: 2 puntos el que ganó y 0 el que perdió.
-- ============================================================
-- select m.stage as grupo, t.name as equipo,
--        sum(case when (m.home_team_id = t.id and m.home_score > m.away_score)
--                   or (m.away_team_id = t.id and m.away_score > m.home_score)
--                 then 2 else 0 end) as puntos
--   from public.matches m
--   join public.teams t on t.id in (m.home_team_id, m.away_team_id)
--  where m.tournament_id = (select id from public.tournaments where name = 'Locales de la Bohemia Porteña')
--    and m.stage in ('grupo_a', 'grupo_b')
--    and m.status = 'finished'
--  group by m.stage, t.name
--  order by m.stage, puntos desc, t.name;


-- ============================================================
-- VERIFICACIÓN 3 — nombres repetidos en players
-- Si alguno de los jugadores nuevos aparece dos veces, es que ya
-- existía escrito igual y hay que decidir si son la misma persona.
-- Lo ideal es que devuelva 0 filas.
-- ============================================================
-- select lower(name) as nombre, count(*) as veces, string_agg(id::text, ', ' order by id) as ids
--   from public.players
--  group by lower(name)
-- having count(*) > 1
--  order by lower(name);
