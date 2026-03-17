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
                primary: "#ec1313", // Rojo del club
                "background-light": "#f8f6f6",
                "background-dark": "#1a0a0a", // Un negro con un tinte muy leve de rojo para elegancia
            },
            fontFamily: {
                // Juntamos todo en un solo bloque. 
                // Outfit será la reina de la página ahora.
                sans: ['Outfit', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
                body: ['Outfit', 'sans-serif'],
            },
        },
    },
    plugins: [],
}