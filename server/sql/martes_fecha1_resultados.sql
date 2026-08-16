-- ============================================================
-- LIGA DE LOS MARTES — RESULTADOS Y GOLES DE LA FECHA 1
-- Martes 04-08-2026
-- ------------------------------------------------------------
-- Marcadores:
--   Unión Roma        12 - 26  Atlético Canario
--   Liberty U.        19 - 25  D. El Huevo
--   Isla Fantasía FC  20 - 21  Morada FC
--   Real Proa         19 - 18  Cinzanociti
--
-- DE DÓNDE SALEN LOS GOLES
-- De la planilla de cancha. Cada jugador tiene marcas al lado del
-- nombre y se cuentan así: | vale 1, L o Γ valen 2, Π o E valen 3,
-- el cuadrado cerrado vale 4 y el cuadrado con la raya cruzada
-- vale 5. Los ocho equipos suman exactamente el número que está
-- en el círculo de la planilla, así que la lectura está cerrada.
--
-- LA PLANILLA MANDA
-- Cuando el afiche de la fecha y la planilla no coinciden, vale la
-- planilla: se llena en la cancha, en el momento, y el afiche es lo
-- que estaba anunciado antes. En esta fecha hubo tres cambios:
--   · Atlético Canario: Hacha no jugó, entró Álvaro
--   · Morada FC:  Cris no jugó, entró Julio
--   · Isla:       "seba B" del afiche es Mágico, el mismo jugador
-- Y en la fecha 2, Felipe se bajó y entró Peluca (son dos personas
-- distintas). Esa parte se carga cuando estén los goles de la 2.
--
-- Es idempotente: borra los goles de la jornada antes de escribir,
-- así que se puede volver a correr para corregir.
--
-- CÓMO CORRER:
--   1) Supabase > SQL Editor (proyecto las-galaxias)
--   2) Pegar este archivo y ejecutar
--   3) Correr las verificaciones del final
--   4) Abrir /liga: la tabla de la primera fase tiene que mostrar
--      los 8 equipos con 1 partido jugado
-- ============================================================


-- ---------- 0. Que los nombres existan ----------
-- Todo este archivo cruza por nombre contra teams y players. Si un nombre no
-- coincide, el join no encuentra nada y la fila se saltea sin avisar: así se
-- cargó media fecha 1 la primera vez, con tres equipos escritos como en el
-- afiche ("U. Roma") en vez de como están en la base ("Unión Roma").
-- Esto revienta antes de tocar nada si falta alguno.
do $$
declare
    faltan text;
begin
    select string_agg(v.name, ', ') into faltan
      from (values
            ('Unión Roma'), ('Atlético Canario'), ('Liberty U.'), ('D. El Huevo'),
            ('Isla Fantasía FC'), ('Morada FC'), ('Real Proa'), ('Cinzanociti')
           ) as v(name)
     where not exists (select 1 from public.teams t where lower(t.name) = lower(v.name));
    if faltan is not null then
        raise exception 'Estos equipos no existen en la base: %', faltan;
    end if;

    select string_agg(v.name, ', ') into faltan
      from (values
            ('Waldo'), ('Yimba'), ('Franco'), ('Toño'),
            ('Edison'), ('Esteban'), ('José Carlos'), ('Dr'), ('Alvaro'),
            ('Satan'), ('Alexis'), ('Pancho'), ('Nhio'), ('Emilio'),
            ('Yerich'), ('Isrra'), ('Jorgiño'), ('Kevinem'), ('Hermes'),
            ('Nachito'), ('Magico'), ('Pato'), ('Ariel'), ('Lucas'),
            ('Pascal'), ('Ernesto'), ('Antonio'), ('Conejo'), ('Julio'),
            ('Duplox'), ('Edu'), ('Ignacio'), ('Daniel'), ('SebaG'),
            ('Juanin'), ('Choro Navia'), ('Pipe'), ('Paxuco')
           ) as v(name)
     where not exists (select 1 from public.players p where lower(p.name) = lower(v.name));
    if faltan is not null then
        raise exception 'Estos jugadores no existen en la base: %', faltan;
    end if;
end $$;


-- ---------- 1. Los marcadores ----------
update public.matches m
   set home_score = v.goles_local,
       away_score = v.goles_visita,
       status     = 'finished'
  from (values
        ('Unión Roma',       'Atlético Canario',   12, 26),
        ('Liberty U.',    'D. El Huevo',  19, 25),
        ('Isla Fantasía FC', 'Morada FC',    20, 21),
        ('Real Proa',     'Cinzanociti',  19, 18)
       ) as v(local, visita, goles_local, goles_visita)
  join public.teams h on lower(h.name) = lower(v.local)
  join public.teams a on lower(a.name) = lower(v.visita)
 where m.tournament_id = (select id from public.tournaments where name = 'Locales de la Bohemia Porteña')
   and m.round = 1
   and m.home_team_id = h.id
   and m.away_team_id = a.id;


-- ---------- 2. Borrar los goles que hubiera ----------
-- Para poder re-correr el archivo sin duplicar. Es el mismo criterio
-- que usa el panel al corregir un resultado.
delete from public.goals g
 using public.matches m
 where g.match_id = m.id
   and m.tournament_id = (select id from public.tournaments where name = 'Locales de la Bohemia Porteña')
   and m.round = 1;


-- ---------- 3. Los goles ----------
-- Una fila por gol: la columna "goles" se expande con generate_series.
-- El partido se encuentra por jornada y por el equipo que hizo el gol,
-- que juega una sola vez por fecha.
insert into public.goals (match_id, player_id, team_id)
select m.id, p.id, e.id
  from (values
        -- Unión Roma 12
        ('Unión Roma',       'Waldo',        5),
        ('Unión Roma',       'Yimba',        4),
        ('Unión Roma',       'Franco',       2),
        ('Unión Roma',       'Toño',         1),
        -- Atlético Canario 26
        ('Atlético Canario',    'Edison',      11),
        ('Atlético Canario',    'Esteban',      5),
        ('Atlético Canario',    'José Carlos',  5),
        ('Atlético Canario',    'Dr',           3),
        ('Atlético Canario',    'Alvaro',       2),
        -- Liberty U. 19
        ('Liberty U.',    'Satan',        9),
        ('Liberty U.',    'Alexis',       3),
        ('Liberty U.',    'Pancho',       3),
        ('Liberty U.',    'Nhio',         2),
        ('Liberty U.',    'Emilio',       2),
        -- D. El Huevo 25
        ('D. El Huevo',   'Yerich',       7),
        ('D. El Huevo',   'Isrra',        6),
        ('D. El Huevo',   'Jorgiño',      5),
        ('D. El Huevo',   'Kevinem',      4),
        ('D. El Huevo',   'Hermes',       3),
        -- Isla Fantasía FC 20
        ('Isla Fantasía FC', 'Nachito',      7),
        ('Isla Fantasía FC', 'Magico',       6),
        ('Isla Fantasía FC', 'Pato',         4),
        ('Isla Fantasía FC', 'Ariel',        2),
        ('Isla Fantasía FC', 'Lucas',        1),
        -- Morada FC 21
        ('Morada FC',     'Pascal',       8),
        ('Morada FC',     'Ernesto',      8),
        ('Morada FC',     'Antonio',      2),
        ('Morada FC',     'Conejo',       2),
        ('Morada FC',     'Julio',        1),
        -- Real Proa 19
        ('Real Proa',     'Duplox',       7),
        ('Real Proa',     'Edu',          6),
        ('Real Proa',     'Ignacio',      3),
        ('Real Proa',     'Daniel',       2),
        ('Real Proa',     'SebaG',        1),
        -- Cinzanociti 18
        ('Cinzanociti',   'Juanin',       9),
        ('Cinzanociti',   'Choro Navia',  4),
        ('Cinzanociti',   'Pipe',         3),
        ('Cinzanociti',   'Paxuco',       2)
       ) as v(equipo, jugador, goles)
  join public.teams   e on lower(e.name) = lower(v.equipo)
  join public.players p on lower(p.name) = lower(v.jugador)
  join public.matches m
    on m.tournament_id = (select id from public.tournaments where name = 'Locales de la Bohemia Porteña')
   and m.round = 1
   and (m.home_team_id = e.id or m.away_team_id = e.id)
  cross join lateral generate_series(1, v.goles);


-- ---------- 3 bis. Que hayan entrado los cuatro partidos ----------
-- La otra mitad de la red de seguridad: aunque los nombres existan, si algún
-- cruce no coincide con el fixture el partido queda sin marcador. Acá se corta.
do $$
declare
    cargados int;
    goles_mal text;
begin
    select count(*) into cargados
      from public.matches
     where tournament_id = (select id from public.tournaments where name = 'Locales de la Bohemia Porteña')
       and round = 1
       and status = 'finished';
    if cargados <> 4 then
        raise exception 'Quedaron % partidos cargados de 4 en la fecha 1', cargados;
    end if;

    select string_agg(format('%s %s-%s', m.id, m.home_score, m.away_score), ', ') into goles_mal
      from public.matches m
     where m.tournament_id = (select id from public.tournaments where name = 'Locales de la Bohemia Porteña')
       and m.round = 1
       and (m.home_score <> (select count(*) from public.goals g where g.match_id = m.id and g.team_id = m.home_team_id)
         or m.away_score <> (select count(*) from public.goals g where g.match_id = m.id and g.team_id = m.away_team_id));
    if goles_mal is not null then
        raise exception 'Estos partidos tienen el marcador distinto a los goles cargados: %', goles_mal;
    end if;
end $$;


-- ---------- 4. Nóminas: sacar a los que no jugaron ----------
-- Estaban en el afiche pero la planilla dice que no entraron a la
-- cancha en ninguna de las dos fechas. Solo se van si no tienen
-- goles cargados, por si acaso.
delete from public.tournament_players tp
 using public.teams e, public.players p
 where tp.tournament_id = (select id from public.tournaments where name = 'Locales de la Bohemia Porteña')
   and tp.team_id = e.id
   and tp.player_id = p.id
   and (lower(e.name), lower(p.name)) in (
        (lower('Atlético Canario'), lower('Hacha')),
        (lower('Morada FC'),  lower('Cris'))
       )
   and not exists (
        select 1 from public.goals g
          join public.matches m on m.id = g.match_id
         where g.player_id = tp.player_id
           and m.tournament_id = tp.tournament_id);


-- ============================================================
-- VERIFICACIÓN 1 — el marcador cuadra con los goles cargados
-- La columna "cuadra" tiene que decir sí en las ocho filas.
-- ============================================================
-- select h.name as local, m.home_score, m.away_score, a.name as visita,
--        (select count(*) from public.goals g where g.match_id = m.id and g.team_id = m.home_team_id) as goles_local,
--        (select count(*) from public.goals g where g.match_id = m.id and g.team_id = m.away_team_id) as goles_visita,
--        case when m.home_score = (select count(*) from public.goals g where g.match_id = m.id and g.team_id = m.home_team_id)
--              and m.away_score = (select count(*) from public.goals g where g.match_id = m.id and g.team_id = m.away_team_id)
--             then 'sí' else 'NO' end as cuadra
--   from public.matches m
--   join public.teams h on h.id = m.home_team_id
--   join public.teams a on a.id = m.away_team_id
--  where m.tournament_id = (select id from public.tournaments where name = 'Locales de la Bohemia Porteña')
--    and m.round = 1
--  order by m.match_date;


-- ============================================================
-- VERIFICACIÓN 2 — la tabla de la primera fase
-- Los ocho con 1 partido jugado. Ganar paga 2 puntos.
-- ============================================================
-- select s.name as equipo, s.played as pj, s.won as pg, s.drawn as pe,
--        s.lost as pp, s.goals_for as gf, s.goals_against as gc, s.points as pts
--   from public.standings s
--  where s.tournament_id = (select id from public.tournaments where name = 'Locales de la Bohemia Porteña')
--  order by s.points desc, s.gd desc;


-- ============================================================
-- VERIFICACIÓN 3 — los goleadores de la fecha
-- Edison tiene que salir primero con 11.
-- ============================================================
-- select p.name as jugador, t.name as equipo, count(*) as goles
--   from public.goals g
--   join public.matches m on m.id = g.match_id
--   join public.players p on p.id = g.player_id
--   join public.teams   t on t.id = g.team_id
--  where m.tournament_id = (select id from public.tournaments where name = 'Locales de la Bohemia Porteña')
--    and m.round = 1
--  group by p.name, t.name
--  order by count(*) desc, p.name;
