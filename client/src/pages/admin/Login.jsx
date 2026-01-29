import { useState } from 'react';
import { supabase } from '../../config/supabaseClient'; // Asegúrate de tener este archivo configurado o impórtalo directo
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Autenticación con Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert("Error: " + error.message);
        } else {
            // Si todo sale bien, llévame al Dashboard
            navigate('/admin/dashboard');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 px-4">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black uppercase text-slate-900 dark:text-white">Acceso Admin</h1>
                    <p className="text-slate-500 text-sm mt-2">Área restringida para el cuerpo técnico.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            placeholder="admin@lasgalaxias.cl"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        disabled={loading}
                        className="w-full py-3 bg-primary text-white font-black uppercase rounded-lg hover:bg-red-700 transition-colors"
                    >
                        {loading ? 'Entrando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;