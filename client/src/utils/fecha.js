// Todas las fechas y horas del sitio se muestran en hora de Chile, sin
// importar dónde esté configurado el dispositivo del que mira.
//
// Sin esto, cada navegador usa su propio huso: los partidos de las 22:00
// se guardan como las 02:00 UTC del día siguiente, así que en un celular
// con otra zona horaria aparecían corridos un día.

const TZ = 'America/Santiago';

export const horaChile = (fecha) =>
    new Date(fecha).toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: TZ,
        hour12: false,
    });

export const fechaChile = (fecha, opciones = { day: 'numeric', month: 'long', year: 'numeric' }) =>
    new Date(fecha).toLocaleDateString('es-CL', { ...opciones, timeZone: TZ });

// Cuánto hay que sumarle a la hora de Chile para llegar a UTC en ese instante:
// 4 horas casi todo el año y 3 en horario de verano. Las dos conversiones se
// leen en la zona del navegador, así que su propio huso se cancela al restar.
const desfaseChile = (instante) =>
    new Date(instante.toLocaleString('en-US', { timeZone: 'UTC' })) -
    new Date(instante.toLocaleString('en-US', { timeZone: TZ }));

// Arma el ISO en UTC de un "2026-10-02" + "19:00" entendidos como hora de
// Chile. Antes esto se hacía pegando un "-04:00" fijo, así que todo lo que se
// programaba entre septiembre y abril quedaba una hora corrido.
export const isoDesdeChile = (dia, hora) => {
    const tentativo = new Date(`${dia}T${hora}:00Z`);
    return new Date(tentativo.getTime() + desfaseChile(tentativo)).toISOString();
};
