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
            },
            animation: {
                scroll: 'scroll 1.5s ease-in-out infinite',
                fadeIn: 'fadeIn 0.3s ease-out',
                fadeOut: 'fadeOut 0.4s ease-in forwards',
                slideUp: 'slideUp 0.4s ease-out forwards',
                slideDown: 'slideDown 0.25s ease-in forwards',
            },
        },
    },
    plugins: [],
}