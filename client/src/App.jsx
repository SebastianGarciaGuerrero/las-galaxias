import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom'; // 1. Agregué Navigate, useLocation, Outlet
import { useState, useEffect } from 'react'; // 2. Agregué useState, useEffect
import { supabase } from './config/supabaseClient';

import Home from './pages/Home';
import Liga from './pages/Liga';
import Partidos from './pages/Partidos';
import SobreNosotros from './pages/SobreNosotros';
import Noticias from './pages/Noticias';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';

// --- COMPONENTE DE PROTECCIÓN ---
const ProtectedRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="p-10 text-center">Cargando...</div>;
  if (!session) return <Navigate to="/admin" replace />;

  return children;
};

// --- LAYOUT PÚBLICO (Para que Navbar y Footer solo salgan en la web pública) ---
const PublicLayout = () => {
  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center flex-1 w-full">
        <Outlet /> {/* Aquí se renderizarán las páginas hijas (Home, Liga, etc) */}
      </main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-300 font-display">

      <Routes>
        {/* GRUPO 1: Rutas Públicas (Tienen Navbar y Footer) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/liga" element={<Liga />} />
          <Route path="/partidos" element={<Partidos />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/sobre-nosotros" element={<SobreNosotros />} />
        </Route>

        {/* GRUPO 2: Rutas Admin (NO tienen Navbar ni Footer públicos) */}
        <Route path="/admin" element={<Login />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

    </div>
  );
}

export default App;