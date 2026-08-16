-- ============================================================
-- LIGA DE LOS MARTES — LOCALES DE LA BOHEMIA PORTEÑA
-- Edición 2026 · formato de tres etapas
-- ------------------------------------------------------------
-- Agrega la columna matches.stage (etapa), crea los ocho equipos
-- con nombre de bar, el torneo, las nóminas y las fechas 1, 2 y 3.
--
-- EL FORMATO
--   Etapa 1 — Primera fase: los 8 equipos, todos contra todos,
--             solo ida. 7 fechas de 4 partidos (19, 20, 21 y 22).
--             Jornadas 1 a 7. Ganar paga 2 puntos y empatar 1: en
--             esta liga la victoria vale 2, no 3 como en el resto.
--   Etapa 2 — Segunda fase: la tabla se parte al medio. Los del
--             1° al 4° forman el Grupo A y los del 5° al 8° el
--             Grupo B. Cada grupo juega todos contra todos
--             partiendo de cero: 3 fechas, 2 partidos por grupo
--             por noche. Jornadas 8 a 10. Sale un campeón de cada
--             grupo.
--   Etapa 3 — Final: campeón del Grupo A contra campeón del
--             Grupo B. Jornada 11. Sale el Súper Campeón.
--
-- LA COLUMNA stage
-- matches.stage guarda a qué etapa pertenece cada partido:
-- 'fase1', 'grupo_a', 'grupo_b' o 'final'. Es nullable y nace en
-- null, así que los torneos que ya existen (Viernes X, ligas
-- pasadas) no se enteran: el sitio les sigue mostrando una sola
-- tabla general. La tabla por etapa la calcula el front a partir
-- de esta columna.
--
-- LOS NOMBRES DE LOS EQUIPOS
-- En los afiches aparecen abreviados y no siempre igual ("U. Roma"
-- en la fecha 1, "Unión Roma" en la 3). Acá se guarda el nombre
-- largo, que es el que se ve en la tabla del sitio, y la sigla
-- corta va en short_name.
--
-- LAS NÓMINAS Y LA ROTACIÓN
-- Así funcionan los martes: los seis nombres del afiche son los que
-- jugaron ESA noche, no un plantel fijo. Si alguien se baja o no
-- puede, entra otro, y esa persona puede jugar una fecha con un
-- equipo y las siguientes con otro. Es la lógica de la liga, no un
-- error de carga.
--
-- Por eso tournament_players guarda la UNIÓN de todos los que ya
-- jugaron en cada equipo, y un mismo jugador puede estar inscrito en
-- más de uno. Es la lista de la que salen los goleadores en el panel
-- y en la app de marcador, así que conviene que esté completa. Cada
-- fecha nueva suma a los que aparezcan, acá o desde /admin.
--
-- A quién le pertenece cada gol no depende de esta lista: goals
-- guarda el team_id del partido, así que un jugador que rota queda
-- con sus goles bien repartidos entre los equipos en los que jugó.
--
-- Hoy el único repetido es Lucho: arquero de Cinzanociti en la fecha
-- 1 y de Morada FC en la fecha 2.
--
-- JUGADORES QUE YA ESTABAN EN LA BASE
-- Varios juegan también la Liga de los Viernes. A esos se los
-- reutiliza para que no se les parta el historial de goles; el
-- cruce es por nombre sin distinguir mayúsculas.
--
-- Nombres que en el afiche vienen escritos distinto a como están
-- guardados (columna "nombre_en_base"):
--   · Jose.C          -> José Carlos
--   · Sebabob         -> Seba bob
--   · Navia           -> Choro Navia
--   · Pelud / Peludo  -> Peluo
--   · Juani / Juanin  -> Juanin
--   · Loco.P          -> Loco P
--   · Duplox.         -> Duplox
--   · Seba.G          -> SebaG
--   · Dr.             -> Dr
--   · seba B          -> Magico   (es el mismo; en la fecha 1 lo
--                                  escribieron así)
-- Si alguno NO es la misma persona, cambiá el segundo valor por el
-- del afiche y queda como jugador nuevo. El caso más dudoso es
-- Peluo: el afiche dice "Peludo" y en la base está "Peluo".
--
-- Dos quedaron como jugador nuevo aunque se parezcan a alguien que
-- ya está. Si me equivoqué, cambiá el segundo valor:
--   · SebaG — se parece a ZevaG (Motafogo, Viernes X)
--   · Marco — se parece a Marco Cantillana (Lord Cochrane)
-- Y estos SÍ se reutilizan del plantel de los viernes: Waldo, Toño,
-- Edison, Guga, Satan, Alexis, Nhio, Emilio, Yerich, Jorgiño,
-- Kevinem, Nachito, Pato, Pascal, Cris, Edu, Felipe, Jordano,
-- Alvaro, Chavez y Joaquin80.
--
-- Los arqueros venían con un guante en el afiche. Esa marca no se
-- guarda: la tabla players no tiene columna de posición.
--
-- LO QUE FALTA
-- Están cargadas las fechas 1, 2 y 3. Las demás se agregan semana a
-- semana en el bloque marcado "FECHAS SIGUIENTES", o desde
-- /admin > Liga, que ahora tiene selector de etapa. El archivo se
-- puede volver a correr todas las veces que haga falta: no duplica
-- nada.
--
-- CÓMO CORRER:
--   1) Supabase > SQL Editor (proyecto las-galaxias)
--   2) Pegar este archivo y ejecutar
--   3) Correr las verificaciones del final
--   4) Abrir /liga: tiene que aparecer en "En Juego" con las tres
--      etapas dibujadas
-- ============================================================


-- ---------- 0. La columna de etapa ----------
alter table public.matches
    add column if not exists stage text;

do $$
begin
    if not exists (select 1 from pg_constraint where conname = 'matches_stage_check') then
        alter table public.matches
            add constraint matches_stage_check
            check (stage is null or stage in ('fase1', 'grupo_a', 'grupo_b', 'final'));
    end if;
end $$;

comment on column public.matches.stage is
    'Etapa del torneo: fase1 | grupo_a | grupo_b | final. Null en los torneos de tabla única.';

create index if not exists idx_matches_tournament_stage
    on public.matches(tournament_id, stage);


-- ---------- 0 bis. Cuánto vale ganar ----------
-- En la Liga de los Martes una victoria son 2 puntos y no 3. Las ligas de los
-- viernes pagan 3. El valor va por torneo, en tournaments.points_per_win.
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

-- Solo esta liga: acá no se toca ningún otro torneo. La normalización del
-- resto —viernes 3, el resto 2— es de una sola vez y va en
-- standings_points_per_win.sql, que además saca los puntos de la vista.
update public.tournaments
   set points_per_win = 2
 where name = 'Locales de la Bohemia Porteña'
   and points_per_win <> 2;


-- ---------- 1. Los ocho equipos ----------
-- bio_title es el local que representa cada equipo y alimenta la
-- sección "Conoce tu Liga" del sitio. Las descripciones son un texto
-- de arranque: reemplazalas por la historia real de cada local.
insert into public.teams (name, short_name, bio_title, bio_description)
select v.name, v.short_name, v.bio_title, v.bio_description
  from (values
        ('Unión Roma',        'ROM', 'Bar Roma',
         'El rojo es la marca de la casa. Unión Roma sale a la cancha con el nombre y el color del Bar Roma, uno de los locales que le pone noche a la bohemia porteña.'),
        ('Atlético Canario',  'CAN', 'Bar Canario',
         'De amarillo, como el pájaro que le da nombre al local. Atlético Canario representa al Bar Canario en la Liga de los Martes.'),
        ('Liberty U.',        'LIB', 'Liberty Bar',
         'Negro y dorado, el sello del Liberty Bar. Liberty U. es uno de los equipos que nace del circuito de bares que sostiene la noche de Valparaíso.'),
        ('D. El Huevo',       'HUE', 'Bar El Huevo',
         'Blanco y negro por El Huevo, parada obligada de la noche porteña. D. El Huevo lleva ese nombre a la cancha todos los martes.'),
        ('Isla Fantasía FC',  'ISL', 'La Isla de la Fantasía',
         'Azul profundo, como el nombre promete. Isla Fantasía FC representa a La Isla de la Fantasía, uno de los locales de la ruta bohemia del puerto.'),
        ('Morada FC',         'MOR', 'La Morada Restobar',
         'Magenta oscuro, el color de La Morada. Morada FC es el equipo que representa al restobar en la Liga de los Martes.'),
        ('Real Proa',         'PRO', 'Bar El Proa',
         'Azul marino y ancla, como corresponde a un bar que se llama El Proa. Real Proa trae el aire de puerto a la liga.'),
        ('Cinzanociti',       'CIN', 'Bar Cinzano',
         'Rojo y dorado, los colores del Cinzano. Cinzanociti representa a uno de los locales más reconocibles de la bohemia de Valparaíso.')
       ) as v(name, short_name, bio_title, bio_description)
 where not exists (select 1 from public.teams t where lower(t.name) = lower(v.name));


-- ---------- 2. El torneo ----------
-- image_url va en null a propósito: la portada se sube después
-- desde /admin > Liga (botón de portada). Mientras tanto la
-- tarjeta usa la foto de reserva del sitio.
insert into public.tournaments (name, season, status, day_label, start_date, is_active, category, points_per_win)
select 'Locales de la Bohemia Porteña', 'Edición 2026', 'active', 'Liga Martes',
       '2026-08-04', true, 'martes', 2
 where not exists (select 1 from public.tournaments where name = 'Locales de la Bohemia Porteña');

-- Va aparte del insert porque el torneo puede haberse creado antes de que
-- existiera la columna: el insert de arriba no corre si la fila ya está.
update public.tournaments
   set points_per_win = 2
 where name = 'Locales de la Bohemia Porteña'
   and points_per_win <> 2;


-- ---------- 3. Equipos participantes ----------
insert into public.tournament_teams (tournament_id, team_id)
select (select id from public.tournaments where name = 'Locales de la Bohemia Porteña'), e.id
  from (values
        ('Unión Roma'),
        ('Atlético Canario'),
        ('Liberty U.'),
        ('D. El Huevo'),
        ('Isla Fantasía FC'),
        ('Morada FC'),
        ('Real Proa'),
        ('Cinzanociti')
       ) as v(name)
  join public.teams e on lower(e.name) = lower(v.name)
 where not exists (
        select 1 from public.tournament_teams tt
         where tt.tournament_id = (select id from public.tournaments where name = 'Locales de la Bohemia Porteña')
           and tt.team_id = e.id);


-- ---------- 4. Fixture ----------
-- Las horas van en UTC como el resto de la tabla. En agosto Chile
-- está en UTC-4, así que las 19:00 de cancha son las 23:00Z del
-- mismo día y las 22:00 son las 02:00Z del día siguiente. Ojo: el
-- 06-09 entra el horario de verano y el offset pasa a UTC-3; de
-- ahí en adelante las 19:00 son las 22:00Z.
--
-- El local es el que va de rojo en el afiche.
--
-- Jornadas 1 a 7   -> fase1
-- Jornadas 8 a 10  -> grupo_a / grupo_b
-- Jornada 11       -> final
insert into public.matches
       (tournament_id, home_team_id, away_team_id, match_date, location, status, round, stage, competition, is_local)
select (select id from public.tournaments where name = 'Locales de la Bohemia Porteña'),
       h.id, a.id, v.cuando::timestamptz,
       'Bellavista Stadium', 'scheduled', v.jornada, v.etapa, 'Amistoso', true
  from (values
        -- FECHA 1 — martes 04-08-2026 (jugada, faltan los resultados)
        (1, 'fase1', 'Unión Roma',       'Atlético Canario', '2026-08-04 23:00:00+00'),
        (1, 'fase1', 'Liberty U.',       'D. El Huevo',      '2026-08-05 00:00:00+00'),
        (1, 'fase1', 'Isla Fantasía FC', 'Morada FC',        '2026-08-05 01:00:00+00'),
        (1, 'fase1', 'Real Proa',        'Cinzanociti',      '2026-08-05 02:00:00+00'),

        -- FECHA 2 — martes 11-08-2026 (jugada, faltan los resultados)
        (2, 'fase1', 'Isla Fantasía FC', 'Real Proa',        '2026-08-11 23:00:00+00'),
        (2, 'fase1', 'Cinzanociti',      'D. El Huevo',      '2026-08-12 00:00:00+00'),
        (2, 'fase1', 'Morada FC',        'Unión Roma',       '2026-08-12 01:00:00+00'),
        (2, 'fase1', 'Atlético Canario', 'Liberty U.',       '2026-08-12 02:00:00+00'),

        -- FECHA 3 — martes 18-08-2026
        (3, 'fase1', 'Liberty U.',       'Cinzanociti',      '2026-08-18 23:00:00+00'),
        (3, 'fase1', 'Atlético Canario', 'Morada FC',        '2026-08-19 00:00:00+00'),
        (3, 'fase1', 'Real Proa',        'Unión Roma',       '2026-08-19 01:00:00+00'),
        (3, 'fase1', 'D. El Huevo',      'Isla Fantasía FC', '2026-08-19 02:00:00+00')

        -- ===== FECHAS SIGUIENTES =====
        -- Agregá acá abajo las que vayan saliendo, con una coma
        -- después del último partido de la fecha 3.
        --
        -- Los martes que quedan de la primera fase:
        --   Fecha 4: 25-08-2026   Fecha 6: 08-09-2026  (ya con UTC-3)
        --   Fecha 5: 01-09-2026   Fecha 7: 15-09-2026  (ya con UTC-3)
        --
        -- Con UTC-4 (hasta el 01-09) una fecha completa se ve así:
        -- ,(4, 'fase1', 'LOCAL', 'VISITA', '2026-08-25 23:00:00+00')   -- 19 hrs
        -- ,(4, 'fase1', 'LOCAL', 'VISITA', '2026-08-26 00:00:00+00')   -- 20 hrs
        -- ,(4, 'fase1', 'LOCAL', 'VISITA', '2026-08-26 01:00:00+00')   -- 21 hrs
        -- ,(4, 'fase1', 'LOCAL', 'VISITA', '2026-08-26 02:00:00+00')   -- 22 hrs
        --
        -- Con UTC-3 (desde el 08-09) la misma noche corre una hora:
        -- 22:00Z, 23:00Z, 00:00Z y 01:00Z.
        --
        -- La segunda fase (jornadas 8 a 10, 'grupo_a' y 'grupo_b') y
        -- la final (jornada 11, 'final') se cargan cuando termine la
        -- primera fase y se sepa quién entra a cada grupo.
       ) as v(jornada, etapa, local, visita, cuando)
  join public.teams h on lower(h.name) = lower(v.local)
  join public.teams a on lower(a.name) = lower(v.visita)
 where not exists (
        select 1 from public.matches m
         where m.tournament_id = (select id from public.tournaments where name = 'Locales de la Bohemia Porteña')
           and m.round = v.jornada
           and m.home_team_id = h.id
           and m.away_team_id = a.id);

-- Sin descansos: con 8 equipos juegan todos todas las fechas, así
-- que este torneo no usa bye_weeks.


-- ---------- 5. Jugadores nuevos ----------
-- Se insertan solo los que no existan ya con ese nombre. La lista es
-- la misma del bloque 6, en su columna "nombre_en_base".
insert into public.players (name)
select distinct v.nombre_en_base
  from (values
        -- Unión Roma
        ('JP'), ('Waldo'), ('Yimba'), ('Franco'), ('Toño'), ('Alonzo'),
        ('Patito'), ('Manulete'), ('Roberto'),
        -- Atlético Canario
        ('Hacha'), ('Edison'), ('Esteban'), ('Dr'), ('Perrito'), ('José Carlos'),
        ('Alvaro'), ('Chavez'),
        -- Liberty U.
        ('Guga'), ('Satan'), ('Alexis'), ('Nhio'), ('Pancho'), ('Emilio'),
        ('Joaquin80'),
        -- D. El Huevo
        ('Peluo'), ('Yerich'), ('Hermes'), ('Jorgiño'), ('Isrra'), ('Kevinem'),
        -- Isla Fantasía FC
        ('Marco'), ('Nachito'), ('Ariel'), ('Lucas'), ('Magico'), ('Pato'),
        ('Felipe'),
        -- Morada FC
        ('Seba bob'), ('Pascal'), ('Ernesto'), ('Cris'), ('Antonio'), ('Conejo'),
        ('Lucho'), ('Julio'), ('Tomi'),
        -- Real Proa
        ('Loco P'), ('Edu'), ('Daniel'), ('SebaG'), ('Ignacio'), ('Duplox'),
        -- Cinzanociti
        ('Choro Navia'), ('Pipe'), ('Juan'), ('Juanin'), ('Paxuco'), ('Jordano')
       ) as v(nombre_en_base)
 where not exists (select 1 from public.players p where lower(p.name) = lower(v.nombre_en_base));


-- ---------- 6. Nóminas ----------
-- La unión de todos los que ya jugaron en cada equipo. La columna
-- "fechas" dice en cuáles apareció, para poder seguirle la pista a
-- quién entra y quién sale.
-- nombre_afiche es como aparece en la gráfica; nombre_en_base es el
-- nombre con el que queda guardado.
insert into public.tournament_players (tournament_id, team_id, player_id)
select (select id from public.tournaments where name = 'Locales de la Bohemia Porteña'), e.id, p.id
  from (values
        -- Unión Roma
        ('Unión Roma',       'JP',        'JP',           'f1'),
        ('Unión Roma',       'Waldo',     'Waldo',        'f1 f2'),
        ('Unión Roma',       'Yimba',     'Yimba',        'f1'),
        ('Unión Roma',       'Franco',    'Franco',       'f1'),
        ('Unión Roma',       'Toño',      'Toño',         'f1 f2'),
        ('Unión Roma',       'Alonzo',    'Alonzo',       'f1 f2'),
        ('Unión Roma',       'Patito',    'Patito',       'f2'),
        ('Unión Roma',       'Manulete',  'Manulete',     'f2'),
        ('Unión Roma',       'Roberto',   'Roberto',      'f2'),
        -- Atlético Canario
        ('Atlético Canario', 'Hacha',     'Hacha',        'f1'),
        ('Atlético Canario', 'Edison',    'Edison',       'f1 f2'),
        ('Atlético Canario', 'Esteban',   'Esteban',      'f1'),
        ('Atlético Canario', 'Dr',        'Dr',           'f1 f2'),
        ('Atlético Canario', 'Perrito',   'Perrito',      'f1 f2'),
        ('Atlético Canario', 'Jose.C',    'José Carlos',  'f1 f2'),
        ('Atlético Canario', 'Alvaro',    'Alvaro',       'f2'),
        ('Atlético Canario', 'Chavez',    'Chavez',       'f2'),
        -- Liberty U.
        ('Liberty U.',       'Guga',      'Guga',         'f1 f2'),
        ('Liberty U.',       'Satan',     'Satan',        'f1 f2'),
        ('Liberty U.',       'Alexis',    'Alexis',       'f1'),
        ('Liberty U.',       'Nhio',      'Nhio',         'f1 f2'),
        ('Liberty U.',       'Pancho',    'Pancho',       'f1 f2'),
        ('Liberty U.',       'Emilio',    'Emilio',       'f1 f2'),
        ('Liberty U.',       'Joaquin80', 'Joaquin80',    'f2'),
        -- D. El Huevo
        ('D. El Huevo',      'Peludo',    'Peluo',        'f1 f2'),
        ('D. El Huevo',      'Yerich',    'Yerich',       'f1 f2'),
        ('D. El Huevo',      'Hermes',    'Hermes',       'f1 f2'),
        ('D. El Huevo',      'Jorgiño',   'Jorgiño',      'f1 f2'),
        ('D. El Huevo',      'isrra',     'Isrra',        'f1 f2'),
        ('D. El Huevo',      'Kevinem',   'Kevinem',      'f1 f2'),
        -- Isla Fantasía FC
        ('Isla Fantasía FC', 'Marco',     'Marco',        'f1 f2'),
        ('Isla Fantasía FC', 'Nachito',   'Nachito',      'f1 f2'),
        ('Isla Fantasía FC', 'Ariel',     'Ariel',        'f1 f2'),
        ('Isla Fantasía FC', 'Lucas',     'Lucas',        'f1 f2'),
        ('Isla Fantasía FC', 'Magico',    'Magico',       'f1 f2'),   -- en la f1 lo escribieron "seba B"
        ('Isla Fantasía FC', 'Pato',      'Pato',         'f1'),
        ('Isla Fantasía FC', 'Felipe',    'Felipe',       'f2'),
        -- Morada FC
        ('Morada FC',        'Sebabob',   'Seba bob',     'f1'),
        ('Morada FC',        'Pascal',    'Pascal',       'f1 f2'),
        ('Morada FC',        'Ernesto',   'Ernesto',      'f1 f2'),
        ('Morada FC',        'Cris',      'Cris',         'f1'),
        ('Morada FC',        'Antonio',   'Antonio',      'f1 f2'),
        ('Morada FC',        'Conejo',    'Conejo',       'f1'),
        ('Morada FC',        'Lucho',     'Lucho',        'f2'),
        ('Morada FC',        'Julio',     'Julio',        'f2'),
        ('Morada FC',        'Tomi',      'Tomi',         'f2'),
        -- Real Proa
        ('Real Proa',        'Loco.P',    'Loco P',       'f1 f2'),
        ('Real Proa',        'Edu',       'Edu',          'f1 f2'),
        ('Real Proa',        'Daniel',    'Daniel',       'f1 f2'),
        ('Real Proa',        'Seba.G',    'SebaG',        'f1 f2'),
        ('Real Proa',        'Ignacio',   'Ignacio',      'f1 f2'),
        ('Real Proa',        'Duplox',    'Duplox',       'f1 f2'),
        -- Cinzanociti
        ('Cinzanociti',      'Lucho',     'Lucho',        'f1'),
        ('Cinzanociti',      'Navia',     'Choro Navia',  'f1 f2'),
        ('Cinzanociti',      'Pipe',      'Pipe',         'f1 f2'),
        ('Cinzanociti',      'Juan',      'Juan',         'f1 f2'),
        ('Cinzanociti',      'Juanin',    'Juanin',       'f1 f2'),
        ('Cinzanociti',      'Paxuco',    'Paxuco',       'f1 f2'),
        ('Cinzanociti',      'Jordano',   'Jordano',      'f2')
       ) as v(equipo, nombre_afiche, nombre_en_base, fechas)
  join public.teams   e on lower(e.name) = lower(v.equipo)
  join public.players p on lower(p.name) = lower(v.nombre_en_base)
 where not exists (
        select 1 from public.tournament_players tp
         where tp.tournament_id = (select id from public.tournaments where name = 'Locales de la Bohemia Porteña')
           and tp.team_id = e.id
           and tp.player_id = p.id);


-- ============================================================
-- VERIFICACIÓN 1 — los números
-- esperado: 8 equipos, 59 inscripciones (58 personas, Lucho en dos
-- equipos), 12 partidos
-- ============================================================
-- select
--     (select count(*) from public.tournament_teams   where tournament_id = (select id from public.tournaments where name = 'Locales de la Bohemia Porteña')) as equipos,
--     (select count(*) from public.tournament_players where tournament_id = (select id from public.tournaments where name = 'Locales de la Bohemia Porteña')) as inscripciones,
--     (select count(*) from public.matches            where tournament_id = (select id from public.tournaments where name = 'Locales de la Bohemia Porteña')) as partidos;


-- ============================================================
-- VERIFICACIÓN 2 — a quién se reutilizó
-- ------------------------------------------------------------
-- Lista la nómina completa y cuántos goles trae cada uno de antes.
-- Si aparece con goles previos es porque se enganchó con alguien
-- que ya estaba en la base: revisá que sea la misma persona.
-- ============================================================
-- select t.name as equipo,
--        p.name as jugador,
--        (select count(*) from public.goals g where g.player_id = p.id) as goles_de_antes
--   from public.tournament_players tp
--   join public.players p on p.id = tp.player_id
--   join public.teams   t on t.id = tp.team_id
--  where tp.tournament_id = (select id from public.tournaments where name = 'Locales de la Bohemia Porteña')
--  order by t.name, p.name;


-- ============================================================
-- VERIFICACIÓN 3 — el fixture
-- Que nadie juegue dos veces la misma noche ni repita rival.
-- ============================================================
-- select m.round as jornada,
--        (m.match_date at time zone 'America/Santiago')::time as hora,
--        h.name as local, a.name as visita, m.stage as etapa
--   from public.matches m
--   join public.teams h on h.id = m.home_team_id
--   join public.teams a on a.id = m.away_team_id
--  where m.tournament_id = (select id from public.tournaments where name = 'Locales de la Bohemia Porteña')
--  order by m.round, m.match_date;


-- ------------------------------------------------------------
-- OPCIONAL: cerrar la liga anterior de los martes. Mientras las dos
-- estén en 'active', /liga?category=martes puede abrir cualquiera.
-- ------------------------------------------------------------
-- update public.tournaments set status = 'past', is_active = false
--  where category = 'martes'
--    and name <> 'Locales de la Bohemia Porteña'
--    and status = 'active';
