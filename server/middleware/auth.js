import { supabase } from '../config/supabase.js';

// Lista blanca de administradores, por correo. En Vercel:
//   ADMIN_EMAILS=uno@ejemplo.cl,otro@ejemplo.cl
//
// Hace falta porque el registro público de Supabase Auth está abierto:
// cualquiera puede crearse una cuenta, confirmarla con su propio correo y
// quedar con una sesión válida. Sin esta lista, "tener sesión" alcanzaba
// para escribir resultados.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

// Exige una sesión válida de Supabase para entrar a las rutas de admin.
//
// El panel manda el access_token de la sesión en la cabecera:
//   Authorization: Bearer <token>
// (lo pone solo el helper apiFetch de client/src/config/api.js).
//
// Acá lo validamos contra Supabase Auth. Como el cliente de este server
// usa la service_role, hay que pasarle el token explícito a getUser();
// si no, nos devolvería el usuario de la service_role y no el que entró.
export async function requireAdmin(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

    if (!token) {
        return res.status(401).json({ error: 'Falta el token de sesión' });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
        console.log('🚫 Token rechazado:', error?.message || 'sin usuario');
        return res.status(401).json({ error: 'Sesión inválida o expirada' });
    }

    // Sin ADMIN_EMAILS configurada se deja pasar a cualquier usuario con
    // sesión, que es como venía funcionando: así desplegar esto no deja a
    // nadie afuera del panel de golpe. Pero es un agujero mientras el
    // registro público siga abierto, por eso el aviso en cada request.
    if (ADMIN_EMAILS.length === 0) {
        console.warn('⚠️  ADMIN_EMAILS sin configurar: pasa cualquier usuario con sesión');
    } else {
        const email = (data.user.email || '').toLowerCase();
        if (!ADMIN_EMAILS.includes(email)) {
            console.log('🚫 Usuario fuera de la lista de admins:', email);
            return res.status(403).json({ error: 'Tu cuenta no tiene permisos de administrador' });
        }
    }

    req.user = data.user;
    next();
}
