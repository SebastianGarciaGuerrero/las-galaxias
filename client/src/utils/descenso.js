// En las ligas de los viernes el último de la tabla desciende directo.
//
// La regla sale de tournaments.category, que ya venía en la base y llega al
// cliente con el torneo. Así queda marcado en las viernes —las de ahora y las
// que ya terminaron— y en ninguna otra, sin ids escritos a mano acá adentro.
// Si mañana desciende también el penúltimo, o si empieza a haber descenso en
// los martes, se cambia en este archivo y vale para la página y para el
// pantallazo, que leen los dos de acá.
//
// No lleva texto: el puesto se marca solo con el rojo de la fila, sin cartel
// ni leyenda. Es una decisión de Sebastián, en la liga ya saben lo que
// significa.

const hayDescenso = (league) => league?.category === 'viernes';

// El último de la tabla. Con un solo equipo no se marca nada: no hay de dónde
// descender.
export const esPuestoDeDescenso = (league, index, total) =>
    hayDescenso(league) && total > 1 && index === total - 1;
