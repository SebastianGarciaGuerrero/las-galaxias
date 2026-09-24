-- ============================================================
-- LIGA DE LOS MARTES — LA J8 ES LA PRIMERA DE LA SEGUNDA FASE
-- ------------------------------------------------------------
-- Los cuatro partidos de la jornada 8 de "Locales de la Bohemia
-- Porteña" se cargaron con stage = 'fase1', que es la etapa que el
-- panel propone por defecto. Pero la primera fase ya había cerrado
-- en la J7: la J8 es la primera fecha de la segunda fase.
--
-- QUÉ ROMPÍA
-- El sitio decide que la primera fase terminó cuando están jugados
-- sus 28 partidos. Con estos 4 adentro y sin jugar, la fase volvía
-- a figurar en curso y los dos grupos se quedaban sin integrantes:
-- mostraban "Por definir" en vez de los cuatro clasificados.
--
-- Cuando además se carguen los resultados, esos 4 partidos le
-- sumarían puntos a la tabla de la primera fase, que ya está
-- cerrada y define la división.
--
-- CÓMO QUEDARON LOS GRUPOS
-- Salen de la tabla de la primera fase, 1° a 4° al A y 5° a 8° al B:
--
--   1. Cinzanociti       10 pts   +28  -> Grupo A
--   2. Atlético Canario  10 pts   +14  -> Grupo A
--   3. Liberty U.         8 pts   +26  -> Grupo A
--   4. Morada FC          8 pts   +19  -> Grupo A
--   5. Real Proa          7 pts   -16  -> Grupo B
--   6. Unión Roma         5 pts   -33  -> Grupo B
--   7. D. El Huevo        4 pts    -1  -> Grupo B
--   8. Isla Fantasía FC   4 pts   -37  -> Grupo B
--
-- Los cuatro partidos de la J8 ya estaban bien armados: cada uno
-- cruza equipos del mismo grupo. Lo único que estaba mal era la
-- etiqueta.
--
-- EL FILTRO POR JORNADA NO SOBRA
-- Dos de estos cruces se jugaron antes con el mismo local y la
-- misma visita: Atlético Canario - Liberty U. en la J2 y
-- Cinzanociti - Morada FC en la J7. Sin el "round = 8" esta
-- consulta les cambiaría la etapa a los partidos de la primera
-- fase y el problema quedaría peor que antes.
--
-- Es idempotente: escribe valores fijos, correrlo dos veces da lo
-- mismo.
--
-- CÓMO CORRER:
--   1) Supabase > SQL Editor (proyecto las-galaxias)
--   2) Pegar este archivo y ejecutar
--   3) Correr las verificaciones del final
--   4) Abrir /liga > Locales de la Bohemia Porteña: los dos grupos
--      tienen que mostrar sus cuatro equipos y la J8 tiene que
--      aparecer con la etiqueta de cada grupo
-- ============================================================

update public.matches m
   set stage = v.etapa
  from (values
        ('Atlético Canario', 'Liberty U.',       'grupo_a'),
        ('Cinzanociti',      'Morada FC',        'grupo_a'),
        ('Real Proa',        'Isla Fantasía FC', 'grupo_b'),
        ('Unión Roma',       'D. El Huevo',      'grupo_b')
       ) as v(local, visita, etapa),
       public.teams h,
       public.teams a
 where lower(h.name) = lower(v.local)
   and lower(a.name) = lower(v.visita)
   and m.home_team_id = h.id
   and m.away_team_id = a.id
   and m.round = 8
   and m.tournament_id = (select id from public.tournaments where name = 'Locales de la Bohemia Porteña');


-- ============================================================
-- VERIFICACIÓN 1 — la J8 quedó repartida en los dos grupos
-- Dos partidos en grupo_a y dos en grupo_b. Ninguno en fase1.
-- ============================================================
-- select m.round as jornada, m.stage as etapa, h.name as local, a.name as visita
--   from public.matches m
--   join public.teams h on h.id = m.home_team_id
--   join public.teams a on a.id = m.away_team_id
--  where m.tournament_id = (select id from public.tournaments where name = 'Locales de la Bohemia Porteña')
--    and m.round >= 8
--  order by m.match_date;


-- ============================================================
-- VERIFICACIÓN 2 — la primera fase sigue teniendo sus 28 partidos
-- partidos y jugados tienen que decir 28 los dos.
-- ============================================================
-- select count(*) as partidos,
--        count(*) filter (where status = 'finished') as jugados
--   from public.matches
--  where tournament_id = (select id from public.tournaments where name = 'Locales de la Bohemia Porteña')
--    and stage = 'fase1';
