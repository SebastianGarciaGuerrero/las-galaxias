import { supabase } from '../config/supabase.js';

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

    req.user = data.user;
    next();
}
