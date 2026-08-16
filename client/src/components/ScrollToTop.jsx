import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    // También mira la query, no solo la ruta: en /liga entrar a una liga y
    // volver al listado solo cambia el ?id, y sin esto la página se quedaba
    // a mitad de scroll al cambiar de vista.
    const { pathname, search } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname, search]);

    return null;
};

export default ScrollToTop;