import { useRef, useEffect, useState } from 'react';

// Estado oculto de cada variante (de dónde "entra" el elemento).
const HIDDEN = {
    fade:  'opacity-0',
    up:    'opacity-0 translate-y-12',
    down:  'opacity-0 -translate-y-12',
    left:  'opacity-0 -translate-x-16',
    right: 'opacity-0 translate-x-16',
    zoom:  'opacity-0 scale-50',
};

const VISIBLE = 'opacity-100 translate-x-0 translate-y-0 scale-100';

// Revela un elemento al entrar en viewport.
// Devuelve { ref, className, style } para aplicar al elemento objetivo
// sin envolverlo en un wrapper (no rompe layouts flex/grid).
//
// Uso:
//   const r = useReveal('right', 200);
//   <div ref={r.ref} className={`${r.className} mis-clases`} style={r.style}>
export const useReveal = (variant = 'up', delay = 0, threshold = 0.15) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Respeta usuarios que prefieren menos movimiento.
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) {
            setVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.unobserve(el);
                }
            },
            { threshold }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    return {
        ref,
        className: `transition-all duration-[900ms] ease-out will-change-transform ${visible ? VISIBLE : HIDDEN[variant]}`,
        style: { transitionDelay: `${delay}ms` },
    };
};
