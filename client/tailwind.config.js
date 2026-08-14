/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Importante para el toggle manual
    theme: {
        extend: {
            colors: {
                primary: "#E13C64",
                "background-light": "#ffffff",
                "background-dark": "#0a0a0a",
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            keyframes: {
                scroll: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(6px)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeOut: {
                    '0%': { opacity: '1' },
                    '100%': { opacity: '0' },
                },
                slideDown: {
                    '0%': { opacity: '1', transform: 'translateY(0)' },
                    '100%': { opacity: '0', transform: 'translateY(20px)' },
                },
                // Tiro que se va por arriba del travesaño, para la página de error.
                // Va en left/top en porcentaje para que la trayectoria escale con
                // el contenedor en vez de quedar clavada a unos píxeles.
                // El translate va dentro del keyframe porque transform es una sola
                // propiedad: si la animación solo pusiera el rotate, pisaría las
                // clases -translate-x-1/2 -translate-y-1/2 y la pelota quedaría
                // colgada de su esquina en vez de centrada en la trayectoria.
                tiroFallado: {
                    '0%':   { left: '4%',   top: '80%', transform: 'translate(-50%, -50%) rotate(0deg)',    opacity: '0' },
                    '6%':   { left: '4%',   top: '80%', transform: 'translate(-50%, -50%) rotate(0deg)',    opacity: '1' },
                    '40%':  { left: '38%',  top: '22%', transform: 'translate(-50%, -50%) rotate(420deg)',  opacity: '1' },
                    '62%':  { left: '70%',  top: '6%',  transform: 'translate(-50%, -50%) rotate(760deg)',  opacity: '1' },
                    '85%':  { left: '96%',  top: '14%', transform: 'translate(-50%, -50%) rotate(1080deg)', opacity: '1' },
                    '100%': { left: '112%', top: '34%', transform: 'translate(-50%, -50%) rotate(1300deg)', opacity: '0' },
                },
            },
            animation: {
                scroll: 'scroll 1.5s ease-in-out infinite',
                fadeIn: 'fadeIn 0.3s ease-out',
                fadeOut: 'fadeOut 0.4s ease-in forwards',
                slideUp: 'slideUp 0.4s ease-out forwards',
                slideDown: 'slideDown 0.25s ease-in forwards',
                tiroFallado: 'tiroFallado 3.4s cubic-bezier(0.18, 0.72, 0.42, 1) infinite',
            },
        },
    },
    plugins: [],
}