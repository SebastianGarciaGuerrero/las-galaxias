-- ============================================================
-- RED DE SEGURIDAD: RLS EN TODA TABLA QUE NO LO TENGA
-- ------------------------------------------------------------
-- enable_rls.sql activó RLS en una lista escrita a mano, y esa lista
-- se armó adivinando nombres de tabla desde el código. Se escapó
-- public.clubs, que no la usa ninguna parte del proyecto y por eso
-- nunca aparecía en el código: quedó abierta a lectura y escritura
-- con la key publishable.
--
-- Este archivo no lleva lista: recorre el esquema public y activa RLS
-- en todo lo que le falte. Sirve igual para las tablas que se creen de
-- acá en adelante, que también nacen sin RLS.
--
-- Sin políticas, anon y authenticated no ven ni tocan nada. El backend
-- usa service_role, que se salta RLS por diseño, así que la API y el
-- panel no cambian.
--
-- CÓMO CORRER:
--   1) Supabase > SQL Editor (proyecto las-galaxias)
--   2) Pegar este archivo y ejecutar
--   3) Mirar los NOTICE: dicen en qué tablas se activó
--   4) Correr la auditoría del final y revisar que no quede nada en no
--
-- Es idempotente y se puede volver a correr cuando se quiera.
-- ============================================================

do $$
declare
    t record;
    n int := 0;
begin
    for t in
        select c.relname
          from pg_class c
          join pg_namespace nsp on nsp.oid = c.relnamespace
         where nsp.nspname = 'public'
           and c.relkind in ('r', 'p')   -- tablas normales y particionadas
           and not c.relrowsecurity
         order by c.relname
    loop
        execute format('alter table public.%I enable row level security', t.relname);
        raise notice 'RLS activado en public.%', t.relname;
        n := n + 1;
    end loop;

    if n = 0 then
        raise notice 'Nada que hacer: todas las tablas ya tenían RLS.';
    else
        raise notice 'Listo: RLS activado en % tabla(s).', n;
    end if;
end $$;


-- ============================================================
-- AUDITORÍA
-- ------------------------------------------------------------
-- Después de correr lo de arriba, rls no debería ser "no" en ninguna
-- fila. La columna politicas se espera en 0: sin políticas, nadie que
-- no sea service_role pasa.
-- ============================================================
select c.relname                                     as tabla,
       case when c.relrowsecurity then 'sí' else 'NO' end as rls,
       (select count(*) from pg_policies p
         where p.schemaname = 'public' and p.tablename = c.relname) as politicas
  from pg_class c
  join pg_namespace nsp on nsp.oid = c.relnamespace
 where nsp.nspname = 'public' and c.relkind in ('r', 'p')
 order by c.relrowsecurity, c.relname;


-- ------------------------------------------------------------
-- Las vistas no llevan RLS propio: por defecto corren con los permisos
-- de su dueño y se saltan el RLS de las tablas de abajo. Esta consulta
-- lista las que hay; las que aparezcan con invoker = false hay que
-- arreglarlas como se hizo con standings y top_scorers:
--
--   alter view public.LA_VISTA set (security_invoker = on);
--   revoke all on public.LA_VISTA from anon, authenticated;
-- ------------------------------------------------------------
select c.relname as vista,
       coalesce((select option_value
                   from pg_options_to_table(c.reloptions)
                  where option_name = 'security_invoker'), 'false') as invoker
  from pg_class c
  join pg_namespace nsp on nsp.oid = c.relnamespace
 where nsp.nspname = 'public' and c.relkind = 'v'
 order by c.relname;
