const factorial = (n) => {
    if (n < 0) return 0;
    if (n === 0 || n === 1) return 1;
    let resultado = 1;
    for (let i = 2; i <= n; i++) resultado *= i;
    return resultado;
};

export const calcularTecnicasConteo = (n, r, importaOrden) => {
    const numN = parseInt(n);
    const numR = parseInt(r);

    if (isNaN(numN) || isNaN(numR)) return null;
    if (numR > numN) return { error: "r no puede ser mayor que n" };
    if (numN < 0 || numR < 0) return { error: "Los valores deben ser positivos" };

    const factN = factorial(numN);
    const factR = factorial(numR);
    const factNmenosR = factorial(numN - numR);

    if (importaOrden) {
        const resultado = factN / factNmenosR;
        return {
            tipo: "Permutación",
            simbolo: "nPr",
            formula: `${numN}! / (${numN} - ${numR})!`,
            resultado: resultado,
            explicacion: `Existen ${resultado} formas de ordenar ${numR} elementos de un total de ${numN}.`
        };
    } else {
        const resultado = factN / (factR * factNmenosR);
        return {
            tipo: "Combinación",
            simbolo: "nCr",
            formula: `${numN}! / [${numR}! * (${numN} - ${numR})!]`,
            resultado: resultado,
            explicacion: `Existen ${resultado} grupos posibles de ${numR} elementos de un total de ${numN}.`
        };
    }
};

export const calcularProbabilidadClasica = (datos, eventoFavorable) => {
    if (!datos || datos.length === 0) return null;
    const datosLimpios = datos.map(item => String(item).trim());
    const opcionesUnicas = [...new Set(datosLimpios)];
    
    let casosFavorables = 0;
    
    if (eventoFavorable) {
        const eventosBuscados = String(eventoFavorable)
            .split(',')
            .map(e => e.trim())
            .filter(e => e !== "");
        casosFavorables = datosLimpios.filter(item => eventosBuscados.includes(item)).length;
    }
    const total = datosLimpios.length;
    const decimal = total > 0 ? (casosFavorables / total) : 0;
    
    return {
        casosTotales: total,
        opcionesUnicas,
        casosFavorables,
        probabilidadDecimal: decimal.toFixed(4),
        probabilidadPorcentaje: (decimal * 100).toFixed(2)
    };
};