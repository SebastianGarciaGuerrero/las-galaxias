import { supabase } from './supabaseClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// fetch con el token de la sesión de Supabase pegado en la cabecera.
//
// Las rutas de admin del backend lo exigen (server/middleware/auth.js);
// las públicas simplemente lo ignoran, así que se puede usar para todo
// dentro del panel sin pensarlo.
//
// Acepta rutas relativas ('/api/news'), URLs completas y objetos URL,
// que es como quedaron escritas las llamadas que ya existían.
export async function apiFetch(input, options = {}) {
    const url = String(input);

    const { data: { session } } = await supabase.auth.getSession();

    const headers = new Headers(options.headers || {});
    if (session?.access_token) {
        headers.set('Authorization', `Bearer ${session.access_token}`);
    }

    return fetch(url.startsWith('http') ? url : `${API_URL}${url}`, { ...options, headers });
}
