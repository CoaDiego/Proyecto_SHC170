// src/utils/estadisticaUnidimensional.js

// ==========================================
// --- FUNCIONES BÁSICAS DE APOYO ---
// ==========================================
export const basicMath = {
  sum: (arr) => arr.reduce((a, b) => a + b, 0),
  sort: (arr) => [...arr].sort((a, b) => a - b),
  mean: (arr) => arr.reduce((a, b) => a + b, 0) / arr.length,
};

export const calcularMediana = (datosOrdenados) => {
  const mid = Math.floor(datosOrdenados.length / 2);
  return datosOrdenados.length % 2 !== 0
    ? datosOrdenados[mid]
    : (datosOrdenados[mid - 1] + datosOrdenados[mid]) / 2;
};

export const calcularModa = (datos) => {
  const counts = {};
  datos.forEach((n) => (counts[n] = (counts[n] || 0) + 1));
  const maxFreq = Math.max(...Object.values(counts));
  if (maxFreq === 1) return "Amodal";
  const modas = Object.keys(counts).filter((k) => counts[k] === maxFreq);
  return modas.join(", ");
};

export const calcularCuartiles = (datosOrdenados) => {
  const q = (p) => {
    const pos = (datosOrdenados.length - 1) * p;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (datosOrdenados[base + 1] !== undefined) {
      return (
        datosOrdenados[base] +
        rest * (datosOrdenados[base + 1] - datosOrdenados[base])
      );
    } else {
      return datosOrdenados[base];
    }
  };
  return { Q1: q(0.25), Q2: q(0.5), Q3: q(0.75) };
};

// ==========================================
// --- TEMA 2: FRECUENCIAS E INTERVALOS ---
// ==========================================
export const calcularFrecuencias = (datos) => {
  const N = datos.length;
  const conteo = {};
  datos.forEach((x) => (conteo[x] = (conteo[x] || 0) + 1));
  const valoresOrdenados = Object.keys(conteo)
    .map(Number)
    .sort((a, b) => a - b);

  const tabla = valoresOrdenados.map((x) => ({ x_i: x, f_i: conteo[x] }));
  let F_i_acum = 0;
  let P_i_acum = 0;
  for (let i = 0; i < tabla.length; i++) {
    F_i_acum += tabla[i].f_i;
    tabla[i].F_i = F_i_acum;
    const p_i_val = (tabla[i].f_i / N) * 100;
    tabla[i].p_i = +p_i_val.toFixed(2);
    P_i_acum += p_i_val;
    tabla[i].P_i = +P_i_acum.toFixed(2);
  }
  for (let i = 0; i < tabla.length; i++) {
    const resto = tabla.slice(i);
    const F_inv = resto.reduce((acc, curr) => acc + curr.f_i, 0);
    tabla[i].F_i_inv = F_inv;
    tabla[i].P_i_inv = +((F_inv / N) * 100).toFixed(2);
  }
  return tabla.map((fila) => ({
    x_i: fila.x_i,
    f_i: fila.f_i,
    F_i: fila.F_i,
    F_i_inv: fila.F_i_inv,
    p_i: fila.p_i,
    P_i: fila.P_i,
    P_i_inv: fila.P_i_inv,
  }));
};

export const calcularDistribucionIntervalos = (datos, config) => {
  const { metodoK, kPersonalizado, tipoIntervalo } = config;
  if (datos.length === 0) return [];
  const n = datos.length;
  const min = Math.min(...datos);
  const max = Math.max(...datos);

  let k;
  switch (metodoK) {
    case "cuadratica":
      k = Math.sqrt(n);
      break;
    case "logaritmica":
      k = Math.log(n) / Math.log(2);
      break;
    case "personalizada":
      k = Number(kPersonalizado) || 1;
      break;
    default:
      k = 1 + 3.322 * Math.log10(n);
  }
  k = Math.round(k);
  if (k < 1) k = 1;

  const rango = max - min;
  const amplitud = Math.round(rango / k + 1);
  const intervalos = [];
  let inicio = Math.floor(min);
  for (let i = 0; i < k; i++) {
    const fin = inicio + amplitud;
    intervalos.push({ desde: inicio, hasta: fin });
    inicio = fin;
  }

  const frecuencias = intervalos.map(({ desde, hasta }, i) => {
    let f = 0;
    const esUltimo = i === intervalos.length - 1;
    datos.forEach((v) => {
      if (tipoIntervalo === "cerrado") {
        if (v >= desde && v <= hasta) f++;
      } else if (tipoIntervalo === "abierto") {
        if (v > desde && v < hasta) f++;
      } else {
        if (esUltimo) {
          if (v >= desde && v <= hasta) f++;
        } else {
          if (v >= desde && v < hasta) f++;
        }
      }
    });
    return f;
  });

  const total = frecuencias.reduce((a, b) => a + b, 0);
  const pi = frecuencias.map((f) => +((f / total) * 100).toFixed(2));
  const Fi = frecuencias.map((_, i) =>
    frecuencias.slice(0, i + 1).reduce((a, b) => a + b, 0),
  );
  const Pi = pi.map(
    (_, i) =>
      +pi
        .slice(0, i + 1)
        .reduce((a, b) => a + b, 0)
        .toFixed(2),
  );
  const Fi_inv = frecuencias.map((_, i) =>
    frecuencias.slice(i).reduce((a, b) => a + b, 0),
  );
  const Pi_inv = pi.map(
    (_, i) =>
      +pi
        .slice(i)
        .reduce((a, b) => a + b, 0)
        .toFixed(2),
  );

  return intervalos.map((intv, i) => {
    const etiquetaIntervalo = `${intv.desde} - ${intv.hasta}`;
    return {
      "Haber básico": etiquetaIntervalo,
      f_i: frecuencias[i],
      p_i: pi[i],
      F_i: Fi[i],
      P_i: Pi[i],
      "F'i": Fi_inv[i],
      "P'i": Pi_inv[i],
    };
  });
};

// ==========================================
// --- TEMA 3 Y 4: DESCRIPTIVA, TENDENCIA, FORMA ---
// ==========================================
export const calcularDescriptivaTotal = (datos) => {
  const n = datos.length;
  if (n === 0) return null;

  const sorted = basicMath.sort(datos);
  const media = basicMath.mean(datos);
  const mediana = calcularMediana(sorted);
  const moda = calcularModa(datos);
  const min = sorted[0];
  const max = sorted[n - 1];
  const rango = max - min;

  const mediaGeo = Math.exp(
    datos.reduce((a, b) => a + Math.log(b > 0 ? b : 1), 0) / n,
  );
  const mediaArm = n / datos.reduce((a, b) => a + 1 / (b !== 0 ? b : 1), 0);

  const sumSqDiff = datos.reduce((a, b) => a + Math.pow(b - media, 2), 0);
  const varianzaPoblacional = sumSqDiff / n;
  const varianzaMuestral = sumSqDiff / (n - 1);
  const desvStdPoblacional = Math.sqrt(varianzaPoblacional);
  const desvStdMuestral = Math.sqrt(varianzaMuestral);

  const cv = (desvStdMuestral / media) * 100;
  const { Q1, Q2, Q3 } = calcularCuartiles(sorted);
  const rangoIntercuartil = Q3 - Q1;

  const m3 = datos.reduce((a, b) => a + Math.pow(b - media, 3), 0) / n;
  const m4 = datos.reduce((a, b) => a + Math.pow(b - media, 4), 0) / n;
  const asimetria = m3 / Math.pow(desvStdPoblacional, 3);
  const curtosis = m4 / Math.pow(desvStdPoblacional, 4) - 3;

  return [
    {
      Categoria: "Tendencia Central",
      Estadistico: "Media Aritmética",
      Valor: media,
    },
    { Categoria: "Tendencia Central", Estadistico: "Mediana", Valor: mediana },
    { Categoria: "Tendencia Central", Estadistico: "Moda", Valor: moda },
    {
      Categoria: "Promedios",
      Estadistico: "Media Geométrica",
      Valor: mediaGeo,
    },
    { Categoria: "Promedios", Estadistico: "Media Armónica", Valor: mediaArm },
    { Categoria: "Dispersión", Estadistico: "Rango", Valor: rango },
    {
      Categoria: "Dispersión",
      Estadistico: "Varianza Poblacional",
      Valor: varianzaPoblacional,
    },
    {
      Categoria: "Dispersión",
      Estadistico: "Varianza Muestral",
      Valor: varianzaMuestral,
    },
    {
      Categoria: "Dispersión",
      Estadistico: "Desviación Estándar (Pob)",
      Valor: desvStdPoblacional,
    },
    {
      Categoria: "Dispersión",
      Estadistico: "Desviación Estándar (Mues)",
      Valor: desvStdMuestral,
    },
    {
      Categoria: "Dispersión relativa",
      Estadistico: "Coeficiente de Variación",
      Valor: `${cv.toFixed(2)} %`,
    },
    { Categoria: "Posición", Estadistico: "Cuartil 1 (Q1)", Valor: Q1 },
    { Categoria: "Posición", Estadistico: "Cuartil 3 (Q3)", Valor: Q3 },
    {
      Categoria: "Posición",
      Estadistico: "Rango Intercuartílico (IQR)",
      Valor: rangoIntercuartil,
    },
    { Categoria: "Forma", Estadistico: "Asimetría (Fisher)", Valor: asimetria },
    { Categoria: "Forma", Estadistico: "Curtosis", Valor: curtosis },
    { Categoria: "Extremos", Estadistico: "Mínimo", Valor: min },
    { Categoria: "Extremos", Estadistico: "Máximo", Valor: max },
  ];
};

export const calcularTendenciaCentral = (datos, config) => {
  const { metodoK, kPersonalizado, tipoIntervalo } = config;
  const n = datos.length;
  if (n === 0) return [];

  const sorted = [...datos].sort((a, b) => a - b);
  const mediaExacta = sorted.reduce((a, b) => a + b, 0) / n;
  const medianaExacta = calcularMediana(sorted);
  const modaExactaStr = calcularModa(datos);

  const datosPositivos = datos.filter((x) => x > 0);
  const nPos = datosPositivos.length;
  const mediaGeoExacta =
    nPos > 0
      ? Math.exp(datosPositivos.reduce((a, b) => a + Math.log(b), 0) / nPos)
      : 0;
  const mediaArmExacta =
    nPos > 0 ? nPos / datosPositivos.reduce((a, b) => a + 1 / b, 0) : 0;

  const min = sorted[0];
  const max = sorted[n - 1];
  let k;
  switch (metodoK) {
    case "cuadratica":
      k = Math.sqrt(n);
      break;
    case "logaritmica":
      k = Math.log(n) / Math.log(2);
      break;
    case "personalizada":
      k = Number(kPersonalizado) || 1;
      break;
    default:
      k = 1 + 3.322 * Math.log10(n);
  }
  k = Math.round(k);
  if (k < 1) k = 1;

  const rango = max - min;
  const amplitud = Math.round(rango / k + 1);

  const intervalos = [];
  let inicio = Math.floor(min);
  for (let i = 0; i < k; i++) {
    const fin = inicio + amplitud;
    intervalos.push({ desde: inicio, hasta: fin, xm: (inicio + fin) / 2 });
    inicio = fin;
  }

  const f = new Array(k).fill(0);
  datos.forEach((v) => {
    for (let i = 0; i < k; i++) {
      let intv = intervalos[i];
      let match = false;
      let esUltimo = i === k - 1;
      if (tipoIntervalo === "cerrado") {
        if (v >= intv.desde && v <= intv.hasta) match = true;
      } else if (tipoIntervalo === "abierto") {
        if (v > intv.desde && v < intv.hasta) match = true;
      } else {
        if (esUltimo) {
          if (v >= intv.desde && v <= intv.hasta) match = true;
        } else {
          if (v >= intv.desde && v < intv.hasta) match = true;
        }
      }
      if (match) {
        f[i]++;
        break;
      }
    }
  });

  let sumFXm = 0,
    maxF = -1,
    claseModalIdx = -1;
  let sumFLogXm = 0,
    sumFDivXm = 0,
    nAgrupadoValido = 0;

  for (let i = 0; i < k; i++) {
    const fi = f[i];
    const xm = intervalos[i].xm;
    sumFXm += fi * xm;
    if (fi > maxF) {
      maxF = fi;
      claseModalIdx = i;
    }
    if (xm > 0) {
      sumFLogXm += fi * Math.log(xm);
      sumFDivXm += fi / xm;
      nAgrupadoValido += fi;
    }
  }

  const mediaAgrupada = sumFXm / n;

  const posMe = n / 2;
  let F_acum = 0,
    claseMedianaIdx = -1,
    F_ant = 0;
  for (let i = 0; i < k; i++) {
    F_acum += f[i];
    if (F_acum >= posMe && claseMedianaIdx === -1) {
      claseMedianaIdx = i;
      break;
    }
    F_ant = F_acum;
  }

  let medianaAgrupada = 0;
  if (claseMedianaIdx !== -1) {
    const Li = intervalos[claseMedianaIdx].desde;
    const fi = f[claseMedianaIdx];
    medianaAgrupada = fi !== 0 ? Li + ((posMe - F_ant) / fi) * amplitud : Li;
  }

  let modaAgrupada = 0;
  if (claseModalIdx !== -1) {
    const Li = intervalos[claseModalIdx].desde;
    const fi = f[claseModalIdx];
    const f_ant_val = claseModalIdx > 0 ? f[claseModalIdx - 1] : 0;
    const f_sig_val = claseModalIdx < k - 1 ? f[claseModalIdx + 1] : 0;
    const d1 = fi - f_ant_val;
    const d2 = fi - f_sig_val;
    modaAgrupada = d1 + d2 !== 0 ? Li + (d1 / (d1 + d2)) * amplitud : Li;
  }

  const mediaGeoAgrupada =
    nAgrupadoValido > 0 ? Math.exp(sumFLogXm / nAgrupadoValido) : 0;
  const mediaArmAgrupada = sumFDivXm !== 0 ? nAgrupadoValido / sumFDivXm : 0;

  const calcError = (exacto, agrupado) =>
    exacto === 0 ? 0 : Math.abs((exacto - agrupado) / exacto) * 100;
  const modaExactaNum = Number(modaExactaStr);
  const errorModa = !isNaN(modaExactaNum)
    ? `${calcError(modaExactaNum, modaAgrupada).toFixed(2)} %`
    : "-";
  const formatModaEx = !isNaN(modaExactaNum) ? modaExactaNum : modaExactaStr;

  return [
    {
      Medida: "Media Aritmética (x̄)",
      "D. Individuales": mediaExacta,
      "D. Agrupados": mediaAgrupada,
      "Error %": `${calcError(mediaExacta, mediaAgrupada).toFixed(2)} %`,
    },
    {
      Medida: "Mediana (Me)",
      "D. Individuales": medianaExacta,
      "D. Agrupados": medianaAgrupada,
      "Error %": `${calcError(medianaExacta, medianaAgrupada).toFixed(2)} %`,
    },
    {
      Medida: "Moda (Mo)",
      "D. Individuales": formatModaEx,
      "D. Agrupados": modaAgrupada,
      "Error %": errorModa,
    },
    {
      Medida: "Media Geométrica (G)",
      "D. Individuales": mediaGeoExacta,
      "D. Agrupados": mediaGeoAgrupada,
      "Error %": `${calcError(mediaGeoExacta, mediaGeoAgrupada).toFixed(2)} %`,
    },
    {
      Medida: "Media Armónica (H)",
      "D. Individuales": mediaArmExacta,
      "D. Agrupados": mediaArmAgrupada,
      "Error %": `${calcError(mediaArmExacta, mediaArmAgrupada).toFixed(2)} %`,
    },
  ];
};

export const calcularVariabilidadYForma = (datos, config) => {
  const n = datos.length;
  if (n < 2) return { tipo: "variabilidad_y_forma", dispersion: [], forma: [] };

  // ==========================================
  // 1. DATOS INDIVIDUALES (Exactos)
  // ==========================================
  const sorted = [...datos].sort((a, b) => a - b);
  const media = sorted.reduce((a, b) => a + b, 0) / n;

  let sumAbs = 0,
    sumSq = 0,
    sumCub = 0,
    sumQuart = 0;
  for (let i = 0; i < n; i++) {
    const diff = datos[i] - media;
    sumAbs += Math.abs(diff);
    sumSq += diff * diff;
    sumCub += Math.pow(diff, 3);
    sumQuart += Math.pow(diff, 4);
  }

  const desvMediaInd = sumAbs / n;
  const varianzaInd = sumSq / (n - 1);
  const desvStdInd = Math.sqrt(varianzaInd);
  const cvInd = media !== 0 ? (desvStdInd / media) * 100 : 0;

  // Medidas de Forma
  const m3 = sumCub / n;
  const m4 = sumQuart / n;
  const desvPob = Math.sqrt(sumSq / n); // Se usa la poblacional para la asimetría teórica
  const asimetria = desvPob !== 0 ? m3 / Math.pow(desvPob, 3) : 0;
  const curtosis = desvPob !== 0 ? m4 / Math.pow(desvPob, 4) - 3 : 0;

  // ==========================================
  // 2. DATOS AGRUPADOS
  // ==========================================
  const { metodoK, kPersonalizado, tipoIntervalo } = config;
  const min = sorted[0];
  const max = sorted[n - 1];

  let k;
  switch (metodoK) {
    case "cuadratica":
      k = Math.sqrt(n);
      break;
    case "logaritmica":
      k = Math.log(n) / Math.log(2);
      break;
    case "personalizada":
      k = Number(kPersonalizado) || 1;
      break;
    default:
      k = 1 + 3.322 * Math.log10(n);
  }
  k = Math.round(k);
  if (k < 1) k = 1;

  const rango = max - min;
  const amplitud = Math.round(rango / k + 1);

  const intervalos = [];
  let inicio = Math.floor(min);
  for (let i = 0; i < k; i++) {
    const fin = inicio + amplitud;
    intervalos.push({ desde: inicio, hasta: fin, xm: (inicio + fin) / 2 });
    inicio = fin;
  }

  const f = new Array(k).fill(0);
  datos.forEach((v) => {
    for (let i = 0; i < k; i++) {
      let match = false;
      let intv = intervalos[i];
      let esUltimo = i === k - 1;
      if (tipoIntervalo === "cerrado") {
        if (v >= intv.desde && v <= intv.hasta) match = true;
      } else if (tipoIntervalo === "abierto") {
        if (v > intv.desde && v < intv.hasta) match = true;
      } else {
        if (esUltimo) {
          if (v >= intv.desde && v <= intv.hasta) match = true;
        } else {
          if (v >= intv.desde && v < intv.hasta) match = true;
        }
      }
      if (match) {
        f[i]++;
        break;
      }
    }
  });

  let sumFXm = 0;
  for (let i = 0; i < k; i++) sumFXm += f[i] * intervalos[i].xm;
  const mediaAgr = sumFXm / n;

  let sumFAbs = 0,
    sumFSq = 0;
  for (let i = 0; i < k; i++) {
    const diffAgr = intervalos[i].xm - mediaAgr;
    sumFAbs += f[i] * Math.abs(diffAgr);
    sumFSq += f[i] * diffAgr * diffAgr;
  }

  const desvMediaAgr = sumFAbs / n;
  const varianzaAgr = sumFSq / (n - 1);
  const desvStdAgr = Math.sqrt(varianzaAgr);
  const cvAgr = mediaAgr !== 0 ? (desvStdAgr / mediaAgr) * 100 : 0;

  // ==========================================
  // 3. CONSTRUCCIÓN DE TABLAS
  // ==========================================
  const calcError = (ex, ag) => (ex === 0 ? 0 : Math.abs((ex - ag) / ex) * 100);

  const tablaDispersion = [
    {
      Estadígrafo: "Desviación Media",
      Sigla: "DM",
      "D. Individuales": desvMediaInd,
      "D. Agrupados": desvMediaAgr,
      "Error %": `${calcError(desvMediaInd, desvMediaAgr).toFixed(2)} %`,
    },
    {
      Estadígrafo: "Varianza",
      Sigla: "S²",
      "D. Individuales": varianzaInd,
      "D. Agrupados": varianzaAgr,
      "Error %": `${calcError(varianzaInd, varianzaAgr).toFixed(2)} %`,
    },
    {
      Estadígrafo: "Desviación Estándar",
      Sigla: "S",
      "D. Individuales": desvStdInd,
      "D. Agrupados": desvStdAgr,
      "Error %": `${calcError(desvStdInd, desvStdAgr).toFixed(2)} %`,
    },
    {
      Estadígrafo: "Coeficiente de Variación",
      Sigla: "CV",
      "D. Individuales": cvInd,
      "D. Agrupados": cvAgr,
      "Error %": `${calcError(cvInd, cvAgr).toFixed(2)} %`,
    },
  ];

  let interpAsimetria = "Simétrica";
  if (asimetria > 0.1)
    interpAsimetria = "Asimétrica Positiva (Sesgada a la derecha)";
  if (asimetria < -0.1)
    interpAsimetria = "Asimétrica Negativa (Sesgada a la izquierda)";

  let interpCurtosis = "Mesocúrtica (Normal)";
  if (curtosis > 0.1) interpCurtosis = "Leptocúrtica (Apuntada)";
  if (curtosis < -0.1) interpCurtosis = "Platicúrtica (Achatada)";

  const tablaForma = [
    {
      Estadígrafo: "Coeficiente de Asimetría (Fisher)",
      "Valor Calculado": asimetria,
      Interpretación: interpAsimetria,
    },
    {
      Estadígrafo: "Curtosis",
      "Valor Calculado": curtosis,
      Interpretación: interpCurtosis,
    },
  ];

  // Helper para el Boxplot
  const getP = (p) => {
    const pos = (n - 1) * p;
    const base = Math.floor(pos);
    const rest = pos - base;
    return sorted[base + 1] !== undefined
      ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
      : sorted[base];
  };

  return {
    tipo: "variabilidad_y_forma",
    dispersion: tablaDispersion,
    forma: tablaForma,
    estadisticas: {
      min: sorted[0],
      max: sorted[n - 1],
      q1: getP(0.25),
      mediana: getP(0.5),
      q3: getP(0.75),
      media: media,
      desviacionEstandar: desvStdInd,
    },
  };
};

export const calcularFractiles = (datos, kPerc, config) => {
  const { metodoK, kPersonalizado, tipoIntervalo } = config;
  const n = datos.length;
  if (n === 0) return [];
  const sorted = [...datos].sort((a, b) => a - b);

  const min = sorted[0];
  const max = sorted[n - 1];
  let k_int;
  switch (metodoK) {
    case "cuadratica":
      k_int = Math.sqrt(n);
      break;
    case "logaritmica":
      k_int = Math.log(n) / Math.log(2);
      break;
    case "personalizada":
      k_int = Number(kPersonalizado) || 1;
      break;
    default:
      k_int = 1 + 3.322 * Math.log10(n);
  }
  k_int = Math.round(k_int);
  if (k_int < 1) k_int = 1;

  const rango = max - min;
  const amplitud = Math.round(rango / k_int + 1);
  const intervalos = [];
  let inicio = Math.floor(min);
  for (let i = 0; i < k_int; i++) {
    const fin = inicio + amplitud;
    intervalos.push({ desde: inicio, hasta: fin });
    inicio = fin;
  }

  const f = new Array(k_int).fill(0);
  datos.forEach((v) => {
    for (let i = 0; i < k_int; i++) {
      let match = false;
      let intv = intervalos[i];
      let esUltimo = i === k_int - 1;
      if (tipoIntervalo === "cerrado") {
        if (v >= intv.desde && v <= intv.hasta) match = true;
      } else if (tipoIntervalo === "abierto") {
        if (v > intv.desde && v < intv.hasta) match = true;
      } else {
        if (esUltimo) {
          if (v >= intv.desde && v <= intv.hasta) match = true;
        } else {
          if (v >= intv.desde && v < intv.hasta) match = true;
        }
      }
      if (match) {
        f[i]++;
        break;
      }
    }
  });

  const F = [];
  let acum = 0;
  for (let i = 0; i < k_int; i++) {
    acum += f[i];
    F.push(acum);
  }

  const calcFractilExacto = (p) => {
    const pos = (n - 1) * p;
    const base = Math.floor(pos);
    const rest = pos - base;
    return sorted[base + 1] !== undefined
      ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
      : sorted[base];
  };

  const calcFractilAgrupado = (posicion) => {
    let claseIdx = -1;
    for (let i = 0; i < k_int; i++) {
      if (F[i] >= posicion) {
        claseIdx = i;
        break;
      }
    }
    if (claseIdx === -1) return max;
    const Li = intervalos[claseIdx].desde;
    const fi = f[claseIdx];
    const Fant = claseIdx > 0 ? F[claseIdx - 1] : 0;
    return fi !== 0 ? Li + ((posicion - Fant) / fi) * amplitud : Li;
  };

  const calcError = (exacto, agrupado) =>
    exacto === 0 ? 0 : Math.abs((exacto - agrupado) / exacto) * 100;

  const resultados = [];
  const agregarResultado = (tipo, simbolo, proporcion) => {
    const exacto = calcFractilExacto(proporcion);
    const posAgrupada = n * proporcion;
    const agrupado = calcFractilAgrupado(posAgrupada);
    resultados.push({
      Tipo: tipo,
      Símbolo: simbolo,
      "D. Individuales": exacto,
      "D. Agrupados": agrupado,
      "Error %": `${calcError(exacto, agrupado).toFixed(2)} %`,
    });
  };

  for (let i = 1; i <= 3; i++) agregarResultado("Cuartil", `Q${i}`, i / 4);
  for (let i = 1; i <= 9; i++) agregarResultado("Decil", `D${i}`, i / 10);

  const k = Number(kPerc);
  if (k > 0 && k < 100) agregarResultado("Percentil", `P${k}`, k / 100);

  return resultados;
};
