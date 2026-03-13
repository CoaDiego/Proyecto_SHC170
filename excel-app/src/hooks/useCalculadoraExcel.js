import { useState, useEffect } from "react";

import { api } from "../services/api";

export function useCalculadoraExcel(filename, sheet) {
  // --- Estados de Datos ---
  const [excelData, setExcelData] = useState([]);
  const [columns, setColumns] = useState([]);

  // --- AQUI ESTABA EL FALTANTE: Agregamos la segunda columna ---
  const [selectedColumn, setSelectedColumn] = useState("");   // Variable X
  const [selectedColumnY, setSelectedColumnY] = useState(""); // Variable Y (Para Bivariada)

  const [calculo, setCalculo] = useState("frecuencias_completas");
  const [tipoIntervalo, setTipoIntervalo] = useState("semiabierto");
  const [metodoK, setMetodoK] = useState("sturges");
  const [kPersonalizado, setKPersonalizado] = useState("");
  const [percentilK, setPercentilK] = useState(50);

  const [resultado, setResultado] = useState(null);

  // 1. Cargar datos desde el backend
  useEffect(() => {
    if (!filename || sheet === "" || sheet === undefined) return;
    const hojaIndex = Number(sheet);

    const caragarDatos = async () => {
      try {
        const data = await api.obtenerDatosHoja(filename, hojaIndex);

        /*fetch(`http://127.0.0.1:8000/view/${filename}?hoja=${hojaIndex}`)
          .then((res) => res.json())
          .then((data) => {*/
        if (Array.isArray(data) && data.length > 0) {

          const headerRow = Object.keys(data[0]);
          setColumns(headerRow);

          //const realData = data.slice(1).map((row) =>
          // Object.fromEntries(Object.keys(row).map((key, idx) => [headerRow[idx], row[key]]))
          //);
          setExcelData(data);

          // --- AUTO-SELECCIÓN INTELIGENTE ---
          if (headerRow.length > 0) {
            setSelectedColumn(headerRow[0]); // X = Primera columna
            // Y = Segunda columna (si existe), si no, la primera
            setSelectedColumnY(headerRow.length > 1 ? headerRow[1] : headerRow[0]);
          }
        } else {
          setExcelData([]);
          setColumns([]);
        }
      } catch (err) {
        console.error("Error cargando excel:", err);
      }
    };
    caragarDatos();
  }, [filename, sheet]);

  // 2. EFECTO DE SEGURIDAD: Evita que Y se quede vacío al cambiar de archivo
  useEffect(() => {
    if (columns.length > 0 && selectedColumnY === "") {
      const defaultY = columns.length > 1 ? columns[1] : columns[0];
      setSelectedColumnY(defaultY);
    }
  }, [columns, selectedColumnY]);

  // 3. Función para editar datos (Soporta TEXTO y NÚMEROS)
  const handleChangeDato = (index, colName, value) => {
    const newData = [...excelData];
    // Si es número válido, guárdalo como número. Si no, como texto.
    const esNumero = !isNaN(Number(value)) && value.trim() !== "";
    newData[index][colName] = esNumero ? Number(value) : value;
    setExcelData(newData);
  };

  // 4. Obtener datos de una columna (sea texto o número)
  const obtenerColumna = (colName) => {
    if (!colName) return [];
    return excelData.map((row) => row[colName]);
  };

  // 5. Obtener solo números (para cálculos matemáticos estrictos)
  const obtenerDatosNumericos = () => {
    return excelData
      .map((row) => row[selectedColumn])
      .filter((v) => typeof v === "number" && !isNaN(v));
  };

  // --- CÁLCULO BIVARIANTE (TABLA CRUZADA) ---
  const calcularBivariada = () => {
    if (!selectedColumn || !selectedColumnY) return null;

    const dataX = obtenerColumna(selectedColumn);
    const dataY = obtenerColumna(selectedColumnY);
    const n = dataX.length;

    const categoriasX = [...new Set(dataX)].sort();
    const categoriasY = [...new Set(dataY)].sort();

    // Inicializar Matriz
    const matriz = {};
    const totalFilas = {};
    const totalColumnas = {};

    categoriasX.forEach(catX => {
      matriz[catX] = {};
      totalFilas[catX] = 0;
      categoriasY.forEach(catY => {
        matriz[catX][catY] = 0;
        totalColumnas[catY] = 0;
      });
    });
    // Reasegurar totales columna
    categoriasY.forEach(catY => totalColumnas[catY] = 0);

    // Conteo
    for (let i = 0; i < n; i++) {
      const valX = dataX[i];
      const valY = dataY[i];

      if (matriz[valX] && matriz[valX][valY] !== undefined) {
        matriz[valX][valY]++;
        totalFilas[valX]++;
        totalColumnas[valY]++;
      }
    }

    return {
      tipo: "bivariada",
      filas: categoriasX,
      columnas: categoriasY,
      datos: matriz,
      totalFilas: totalFilas,
      totalColumnas: totalColumnas,
      granTotal: n
    };
  };

  // --- Otros Cálculos (Frecuencias, Intervalos) ---
  const calcularFrecuencias = (datos) => {
    const N = datos.length;
    const conteo = {};
    datos.forEach((x) => (conteo[x] = (conteo[x] || 0) + 1));
    const valoresOrdenados = Object.keys(conteo).map(Number).sort((a, b) => a - b);

    // ... (Lógica estándar de frecuencias) ...
    const tabla = valoresOrdenados.map((x) => ({ x_i: x, f_i: conteo[x] }));
    let F_i_acum = 0; let P_i_acum = 0;
    for (let i = 0; i < tabla.length; i++) {
      F_i_acum += tabla[i].f_i; tabla[i].F_i = F_i_acum;
      const p_i_val = (tabla[i].f_i / N) * 100; tabla[i].p_i = +p_i_val.toFixed(2);
      P_i_acum += p_i_val; tabla[i].P_i = +P_i_acum.toFixed(2);
    }
    // Inversas
    for (let i = 0; i < tabla.length; i++) {
      const resto = tabla.slice(i);
      const F_inv = resto.reduce((acc, curr) => acc + curr.f_i, 0); tabla[i].F_i_inv = F_inv;
      const P_inv = resto.reduce((acc, curr) => acc + curr.p_i, 0); tabla[i].P_i_inv = +P_inv.toFixed(2);
    }
    return tabla.map(fila => ({ "x_i": fila.x_i, "f_i": fila.f_i, "F_i": fila.F_i, "F_i_inv": fila.F_i_inv, "p_i": fila.p_i, "P_i": fila.P_i, "P_i_inv": fila.P_i_inv }));
  };

  const calcularDistribucionIntervalos = (datos) => {
    if (datos.length === 0) return [];
    const n = datos.length; const min = Math.min(...datos); const max = Math.max(...datos);
    let k; switch (metodoK) { case "cuadratica": k = Math.sqrt(n); break; case "logaritmica": k = Math.log(n) / Math.log(2); break; case "personalizada": k = Number(kPersonalizado) || 1; break; default: k = 1 + 3.322 * Math.log10(n); } k = Math.round(k); if (k < 1) k = 1;

    // Lógica Libro: +1
    const rango = max - min;
    const amplitud = Math.round((rango / k) + 1);
    const intervalos = []; let inicio = Math.floor(min);
    for (let i = 0; i < k; i++) { const fin = inicio + amplitud; intervalos.push({ desde: inicio, hasta: fin }); inicio = fin; }

    const frecuencias = intervalos.map(({ desde, hasta }, i) => {
      let f = 0; const esUltimo = i === intervalos.length - 1;
      datos.forEach((v) => {
        if (tipoIntervalo === "cerrado") { if (v >= desde && v <= hasta) f++; } else if (tipoIntervalo === "abierto") { if (v > desde && v < hasta) f++; } else { if (esUltimo) { if (v >= desde && v <= hasta) f++; } else { if (v >= desde && v < hasta) f++; } }
      }); return f;
    });
    const total = frecuencias.reduce((a, b) => a + b, 0);
    const pi = frecuencias.map((f) => +(f / total * 100).toFixed(2));
    const Fi = frecuencias.map((_, i) => frecuencias.slice(0, i + 1).reduce((a, b) => a + b, 0));
    const Pi = pi.map((_, i) => +pi.slice(0, i + 1).reduce((a, b) => a + b, 0).toFixed(2));
    const Fi_inv = frecuencias.map((_, i) => frecuencias.slice(i).reduce((a, b) => a + b, 0));
    const Pi_inv = pi.map((_, i) => +pi.slice(i).reduce((a, b) => a + b, 0).toFixed(2));

    return intervalos.map((intv, i) => {
      const etiquetaIntervalo = `${intv.desde} - ${intv.hasta}`;
      return { "Haber básico": etiquetaIntervalo, "f_i": frecuencias[i], "p_i": pi[i], "F_i": Fi[i], "P_i": Pi[i], "F'i": Fi_inv[i], "P'i": Pi_inv[i] };
    });
  };

  // ==========================================
  // --- FÓRMULAS MATEMÁTICAS (CAPÍTULO 3) ---
  // ==========================================

  const basicMath = {
    sum: (arr) => arr.reduce((a, b) => a + b, 0),
    sort: (arr) => [...arr].sort((a, b) => a - b),
    mean: (arr) => arr.reduce((a, b) => a + b, 0) / arr.length,
  };

  const calcularMediana = (datosOrdenados) => {
    const mid = Math.floor(datosOrdenados.length / 2);
    return datosOrdenados.length % 2 !== 0
      ? datosOrdenados[mid]
      : (datosOrdenados[mid - 1] + datosOrdenados[mid]) / 2;
  };

  const calcularModa = (datos) => {
    const counts = {};
    datos.forEach((n) => (counts[n] = (counts[n] || 0) + 1));
    const maxFreq = Math.max(...Object.values(counts));
    if (maxFreq === 1) return "Amodal"; // Si todos se repiten 1 vez
    const modas = Object.keys(counts).filter((k) => counts[k] === maxFreq);
    return modas.join(", ");
  };

  const calcularCuartiles = (datosOrdenados) => {
    const q = (p) => {
      const pos = (datosOrdenados.length - 1) * p;
      const base = Math.floor(pos);
      const rest = pos - base;
      if (datosOrdenados[base + 1] !== undefined) {
        return datosOrdenados[base] + rest * (datosOrdenados[base + 1] - datosOrdenados[base]);
      } else {
        return datosOrdenados[base];
      }
    };
    return { Q1: q(0.25), Q2: q(0.5), Q3: q(0.75) };
  };

  const calcularDescriptivaTotal = (datos) => {
    const n = datos.length;
    if (n === 0) return null;

    const sorted = basicMath.sort(datos);
    const media = basicMath.mean(datos);
    const mediana = calcularMediana(sorted);
    const moda = calcularModa(datos);
    const min = sorted[0];
    const max = sorted[n - 1];
    const rango = max - min;

    // 3.1 Medias Especiales
    // Geométrica: Raíz n-ésima del producto (usamos logaritmos para evitar overflow)
    const mediaGeo = Math.exp(datos.reduce((a, b) => a + Math.log(b > 0 ? b : 1), 0) / n);
    // Armónica: n / suma(1/x)
    const mediaArm = n / datos.reduce((a, b) => a + (1 / (b !== 0 ? b : 1)), 0);

    // 3.6 Varianza y 3.8 Desviación
    const sumSqDiff = datos.reduce((a, b) => a + Math.pow(b - media, 2), 0);
    const varianzaPoblacional = sumSqDiff / n;
    const varianzaMuestral = sumSqDiff / (n - 1);
    const desvStdPoblacional = Math.sqrt(varianzaPoblacional);
    const desvStdMuestral = Math.sqrt(varianzaMuestral);

    // 3.9 Coeficiente de Variación (CV)
    const cv = (desvStdMuestral / media) * 100;

    // 3.5 Cuartiles
    const { Q1, Q2, Q3 } = calcularCuartiles(sorted);
    const rangoIntercuartil = Q3 - Q1;

    // 3.12 Asimetría (Fisher) y 3.13 Curtosis
    const m3 = datos.reduce((a, b) => a + Math.pow(b - media, 3), 0) / n;
    const m4 = datos.reduce((a, b) => a + Math.pow(b - media, 4), 0) / n;
    const asimetria = m3 / Math.pow(desvStdPoblacional, 3);
    const curtosis = (m4 / Math.pow(desvStdPoblacional, 4)) - 3; // Exceso de curtosis

    return [
      { Categoria: "Tendencia Central", Estadistico: "Media Aritmética", Valor: media },
      { Categoria: "Tendencia Central", Estadistico: "Mediana", Valor: mediana },
      { Categoria: "Tendencia Central", Estadistico: "Moda", Valor: moda },
      { Categoria: "Promedios", Estadistico: "Media Geométrica", Valor: mediaGeo },
      { Categoria: "Promedios", Estadistico: "Media Armónica", Valor: mediaArm },
      { Categoria: "Dispersión", Estadistico: "Rango", Valor: rango },
      { Categoria: "Dispersión", Estadistico: "Varianza Poblacional", Valor: varianzaPoblacional },
      { Categoria: "Dispersión", Estadistico: "Varianza Muestral", Valor: varianzaMuestral },
      { Categoria: "Dispersión", Estadistico: "Desviación Estándar (Pob)", Valor: desvStdPoblacional },
      { Categoria: "Dispersión", Estadistico: "Desviación Estándar (Mues)", Valor: desvStdMuestral },
      { Categoria: "Dispersión relativa", Estadistico: "Coeficiente de Variación", Valor: `${cv.toFixed(2)} %` },
      { Categoria: "Posición", Estadistico: "Cuartil 1 (Q1)", Valor: Q1 },
      { Categoria: "Posición", Estadistico: "Cuartil 3 (Q3)", Valor: Q3 },
      { Categoria: "Posición", Estadistico: "Rango Intercuartílico (IQR)", Valor: rangoIntercuartil },
      { Categoria: "Forma", Estadistico: "Asimetría (Fisher)", Valor: asimetria },
      { Categoria: "Forma", Estadistico: "Curtosis", Valor: curtosis },
      { Categoria: "Extremos", Estadistico: "Mínimo", Valor: min },
      { Categoria: "Extremos", Estadistico: "Máximo", Valor: max },
      { Categoria: "Extremos", Estadistico: "Máximo", Valor: max },
    ];
  };

  const calcularTendenciaCentral = (datos) => {
    const n = datos.length;
    if (n === 0) return [];

    // ==========================================
    // 1. D. INDIVIDUALES (Exactos)
    // ==========================================
    const sorted = [...datos].sort((a, b) => a - b);
    const mediaExacta = sorted.reduce((a, b) => a + b, 0) / n;
    const medianaExacta = calcularMediana(sorted);
    const modaExactaStr = calcularModa(datos);

    // Evitar logaritmos de 0 o negativos para Geo y Armónica
    const datosPositivos = datos.filter(x => x > 0);
    const nPos = datosPositivos.length;
    const mediaGeoExacta = nPos > 0 ? Math.exp(datosPositivos.reduce((a, b) => a + Math.log(b), 0) / nPos) : 0;
    const mediaArmExacta = nPos > 0 ? nPos / datosPositivos.reduce((a, b) => a + (1 / b), 0) : 0;

    // ==========================================
    // 2. D. AGRUPADOS (Por Intervalos)
    // ==========================================
    const min = sorted[0];
    const max = sorted[n - 1];

    let k;
    switch (metodoK) {
      case "cuadratica": k = Math.sqrt(n); break;
      case "logaritmica": k = Math.log(n) / Math.log(2); break;
      case "personalizada": k = Number(kPersonalizado) || 1; break;
      default: k = 1 + 3.322 * Math.log10(n);
    }
    k = Math.round(k); if (k < 1) k = 1;

    const rango = max - min;
    const amplitud = Math.round((rango / k) + 1);

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

        if (tipoIntervalo === "cerrado") { if (v >= intv.desde && v <= intv.hasta) match = true; }
        else if (tipoIntervalo === "abierto") { if (v > intv.desde && v < intv.hasta) match = true; }
        else { if (esUltimo) { if (v >= intv.desde && v <= intv.hasta) match = true; } else { if (v >= intv.desde && v < intv.hasta) match = true; } }

        if (match) { f[i]++; break; }
      }
    });

    let sumFXm = 0, maxF = -1, claseModalIdx = -1;
    let sumFLogXm = 0, sumFDivXm = 0, nAgrupadoValido = 0;

    for (let i = 0; i < k; i++) {
      const fi = f[i];
      const xm = intervalos[i].xm;
      sumFXm += fi * xm;
      if (fi > maxF) { maxF = fi; claseModalIdx = i; }

      if (xm > 0) {
        sumFLogXm += fi * Math.log(xm);
        sumFDivXm += fi / xm;
        nAgrupadoValido += fi;
      }
    }

    const mediaAgrupada = sumFXm / n;

    const posMe = n / 2;
    let F_acum = 0, claseMedianaIdx = -1, F_ant = 0;
    for (let i = 0; i < k; i++) {
      F_acum += f[i];
      if (F_acum >= posMe && claseMedianaIdx === -1) { claseMedianaIdx = i; break; }
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
      modaAgrupada = (d1 + d2) !== 0 ? Li + (d1 / (d1 + d2)) * amplitud : Li;
    }

    const mediaGeoAgrupada = nAgrupadoValido > 0 ? Math.exp(sumFLogXm / nAgrupadoValido) : 0;
    const mediaArmAgrupada = sumFDivXm !== 0 ? nAgrupadoValido / sumFDivXm : 0;

    // ==========================================
    // 3. COMPARACIÓN Y RESULTADO (Error Porcentual)
    // ==========================================
    const calcError = (exacto, agrupado) => exacto === 0 ? 0 : Math.abs((exacto - agrupado) / exacto) * 100;
    
    const modaExactaNum = Number(modaExactaStr);
    const errorModa = !isNaN(modaExactaNum) ? `${calcError(modaExactaNum, modaAgrupada).toFixed(2)} %` : "-";
    const formatModaEx = !isNaN(modaExactaNum) ? modaExactaNum : modaExactaStr;

    return [
      { Medida: "Media Aritmética (x̄)", "D. Individuales": mediaExacta, "D. Agrupados": mediaAgrupada, "Error %": `${calcError(mediaExacta, mediaAgrupada).toFixed(2)} %` },
      { Medida: "Mediana (Me)", "D. Individuales": medianaExacta, "D. Agrupados": medianaAgrupada, "Error %": `${calcError(medianaExacta, medianaAgrupada).toFixed(2)} %` },
      { Medida: "Moda (Mo)", "D. Individuales": formatModaEx, "D. Agrupados": modaAgrupada, "Error %": errorModa },
      { Medida: "Media Geométrica (G)", "D. Individuales": mediaGeoExacta, "D. Agrupados": mediaGeoAgrupada, "Error %": `${calcError(mediaGeoExacta, mediaGeoAgrupada).toFixed(2)} %` },
      { Medida: "Media Armónica (H)", "D. Individuales": mediaArmExacta, "D. Agrupados": mediaArmAgrupada, "Error %": `${calcError(mediaArmExacta, mediaArmAgrupada).toFixed(2)} %` }
    ];
  };


  // ==========================================
  // --- TEMA 4: VARIABILIDAD Y FORMA ---
  // ==========================================
  const calcularVariabilidadYForma = (datos) => {
    const n = datos.length;
    // Devolvemos la estructura vacía segura en lugar de null
    if (n < 2) return { tipo: "variabilidad_y_forma", dispersion: [], forma: [] };

    const sorted = [...datos].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[n - 1];

    // --- 1. BASES EXACTAS ---
    const mediaEx = sorted.reduce((a, b) => a + b, 0) / n;
    
    const calcFractilExacto = (p) => {
      const pos = (n - 1) * p;
      const base = Math.floor(pos);
      const rest = pos - base;
      return sorted[base + 1] !== undefined ? sorted[base] + rest * (sorted[base + 1] - sorted[base]) : sorted[base];
    };
    const Q1_ex = calcFractilExacto(0.25);
    const Q3_ex = calcFractilExacto(0.75);

    // --- 2. CONFIGURACIÓN DE AGRUPADOS (Intervalos y Frecuencias) ---
    let k_int;
    switch (metodoK) {
      case "cuadratica": k_int = Math.sqrt(n); break;
      case "logaritmica": k_int = Math.log(n) / Math.log(2); break;
      case "personalizada": k_int = Number(kPersonalizado) || 1; break;
      default: k_int = 1 + 3.322 * Math.log10(n);
    }
    k_int = Math.round(k_int); if (k_int < 1) k_int = 1;

    const rangoExacto = max - min;
    const amplitud = Math.round((rangoExacto / k_int) + 1);

    const intervalos = [];
    let inicio = Math.floor(min);
    for (let i = 0; i < k_int; i++) {
      const fin = inicio + amplitud;
      intervalos.push({ desde: inicio, hasta: fin, xm: (inicio + fin) / 2 });
      inicio = fin;
    }

    const f = new Array(k_int).fill(0);
    datos.forEach((v) => {
      for (let i = 0; i < k_int; i++) {
        let match = false;
        let esUltimo = i === k_int - 1;
        if (tipoIntervalo === "cerrado") { if (v >= intervalos[i].desde && v <= intervalos[i].hasta) match = true; }
        else if (tipoIntervalo === "abierto") { if (v > intervalos[i].desde && v < intervalos[i].hasta) match = true; }
        else { if (esUltimo) { if (v >= intervalos[i].desde && v <= intervalos[i].hasta) match = true; } else { if (v >= intervalos[i].desde && v < intervalos[i].hasta) match = true; } }
        if (match) { f[i]++; break; }
      }
    });

    const F = [];
    let acum = 0;
    for (let i = 0; i < k_int; i++) { acum += f[i]; F.push(acum); }

    // --- 3. BASES AGRUPADAS ---
    let sumFXm = 0;
    for (let i = 0; i < k_int; i++) sumFXm += f[i] * intervalos[i].xm;
    const mediaAgrup = sumFXm / n;

    const calcFractilAgrupado = (posicion) => {
      let claseIdx = -1;
      for (let i = 0; i < k_int; i++) { if (F[i] >= posicion) { claseIdx = i; break; } }
      if (claseIdx === -1) return max;
      const Li = intervalos[claseIdx].desde;
      const fi = f[claseIdx];
      const Fant = claseIdx > 0 ? F[claseIdx - 1] : 0;
      return fi !== 0 ? Li + ((posicion - Fant) / fi) * amplitud : Li;
    };
    const Q1_agrup = calcFractilAgrupado(n * 0.25);
    const Q3_agrup = calcFractilAgrupado(n * 0.75);

    // --- 4. CÁLCULO DE DISPERSIÓN (Tabla 3) ---
    const rangoAgrup = k_int * amplitud;
    const RIC_ex = Q3_ex - Q1_ex;
    const RIC_agrup = Q3_agrup - Q1_agrup;
    
    // Calculamos la Mediana exacta y agrupada (que es el Cuartil 2 o el 50%)
    const medianaEx = calcFractilExacto(0.50);
    const medianaAgrup = calcFractilAgrupado(n * 0.50);

    // Cálculos Exactos
    const DM_ex = datos.reduce((acc, val) => acc + Math.abs(val - mediaEx), 0) / n;
    const DMe_ex = datos.reduce((acc, val) => acc + Math.abs(val - medianaEx), 0) / n; // <-- NUEVO: Desviación Mediana
    const Var_ex = datos.reduce((acc, val) => acc + Math.pow(val - mediaEx, 2), 0) / (n - 1);
    const S_ex = Math.sqrt(Var_ex);
    const CV_ex = mediaEx !== 0 ? (S_ex / Math.abs(mediaEx)) * 100 : 0;

    // Cálculos Agrupados
    let sumDM = 0, sumDMe = 0, sumVar = 0;
    for (let i = 0; i < k_int; i++) {
      const distMedia = Math.abs(intervalos[i].xm - mediaAgrup);
      const distMediana = Math.abs(intervalos[i].xm - medianaAgrup); // <-- NUEVO
      
      sumDM += f[i] * distMedia;
      sumDMe += f[i] * distMediana; // <-- NUEVO
      sumVar += f[i] * Math.pow(intervalos[i].xm - mediaAgrup, 2);
    }
    
    const DM_agrup = sumDM / n;
    const DMe_agrup = sumDMe / n; // <-- NUEVO: Desviación Mediana Agrupada
    const Var_agrup = sumVar / (n - 1);
    const S_agrup = Math.sqrt(Var_agrup);
    const CV_agrup = mediaAgrup !== 0 ? (S_agrup / Math.abs(mediaAgrup)) * 100 : 0;

    const calcError = (ex, ag) => ex === 0 ? 0 : Math.abs((ex - ag) / ex) * 100;

    const tablaDispersion = [
      { Estadígrafo: "Rango o Recorrido", Sigla: "R", "D. Individuales": rangoExacto, "D. Agrupados": rangoAgrup, "Error %": `${calcError(rangoExacto, rangoAgrup).toFixed(2)} %` },
      { Estadígrafo: "Desviación Intercuartílica", Sigla: "RIC", "D. Individuales": RIC_ex, "D. Agrupados": RIC_agrup, "Error %": `${calcError(RIC_ex, RIC_agrup).toFixed(2)} %` },
      { Estadígrafo: "Desviación Media", Sigla: "DM", "D. Individuales": DM_ex, "D. Agrupados": DM_agrup, "Error %": `${calcError(DM_ex, DM_agrup).toFixed(2)} %` },
      { Estadígrafo: "Desviación Mediana", Sigla: "DMe", "D. Individuales": DMe_ex, "D. Agrupados": DMe_agrup, "Error %": `${calcError(DMe_ex, DMe_agrup).toFixed(2)} %` }, // <-- NUEVA FILA
      { Estadígrafo: "Varianza Muestral", Sigla: "S²", "D. Individuales": Var_ex, "D. Agrupados": Var_agrup, "Error %": `${calcError(Var_ex, Var_agrup).toFixed(2)} %` },
      { Estadígrafo: "Desviación Estándar", Sigla: "S", "D. Individuales": S_ex, "D. Agrupados": S_agrup, "Error %": `${calcError(S_ex, S_agrup).toFixed(2)} %` },
      { Estadígrafo: "Coeficiente de Variación", Sigla: "CV", "D. Individuales": CV_ex, "D. Agrupados": CV_agrup, "Error %": `${calcError(CV_ex, CV_agrup).toFixed(2)} %` }
    ];

    // --- 5. CÁLCULO DE FORMA (Tabla 4 - Método de Momentos) ---
    // Usamos momentos poblacionales (m2, m3, m4) para la geometría pura de Fisher
    const m2 = datos.reduce((acc, val) => acc + Math.pow(val - mediaEx, 2), 0) / n;
    const m3 = datos.reduce((acc, val) => acc + Math.pow(val - mediaEx, 3), 0) / n;
    const m4 = datos.reduce((acc, val) => acc + Math.pow(val - mediaEx, 4), 0) / n;

    const asimetria = m2 > 0 ? m3 / Math.pow(Math.sqrt(m2), 3) : 0;
    const curtosis = m2 > 0 ? (m4 / Math.pow(m2, 2)) - 3 : 0; // -3 para el exceso de curtosis

    // Lógica condicional con un pequeño margen de tolerancia (0.05) para considerar el 0 absoluto en JS
    let interpretacionAsimetria = "Distribución Simétrica";
    if (asimetria > 0.05) interpretacionAsimetria = "Asimetría Positiva (Cola a la derecha)";
    else if (asimetria < -0.05) interpretacionAsimetria = "Asimetría Negativa (Cola a la izquierda)";

    let interpretacionCurtosis = "Mesocúrtica (Normal)";
    if (curtosis > 0.05) interpretacionCurtosis = "Leptocúrtica (Muy puntiaguda)";
    else if (curtosis < -0.05) interpretacionCurtosis = "Platicúrtica (Aplastada)";

    const tablaForma = [
      { Estadígrafo: "Coeficiente de Asimetría", "Valor Calculado": asimetria, Interpretación: interpretacionAsimetria },
      { Estadígrafo: "Curtosis (Apuntamiento)", "Valor Calculado": curtosis, Interpretación: interpretacionCurtosis }
    ];

    return { tipo: "variabilidad_y_forma", dispersion: tablaDispersion, forma: tablaForma };
  };

 const calcularFractiles = (datos, kPerc) => {
    const n = datos.length;
    if (n === 0) return [];
    const sorted = [...datos].sort((a, b) => a - b);

    // ==========================================
    // 1. CONFIGURACIÓN DE INTERVALOS (Motor Agrupado)
    // ==========================================
    const min = sorted[0];
    const max = sorted[n - 1];

    let k_int;
    switch (metodoK) {
      case "cuadratica": k_int = Math.sqrt(n); break;
      case "logaritmica": k_int = Math.log(n) / Math.log(2); break;
      case "personalizada": k_int = Number(kPersonalizado) || 1; break;
      default: k_int = 1 + 3.322 * Math.log10(n);
    }
    k_int = Math.round(k_int); if (k_int < 1) k_int = 1;

    const rango = max - min;
    const amplitud = Math.round((rango / k_int) + 1);

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
        if (tipoIntervalo === "cerrado") { if (v >= intv.desde && v <= intv.hasta) match = true; }
        else if (tipoIntervalo === "abierto") { if (v > intv.desde && v < intv.hasta) match = true; }
        else { if (esUltimo) { if (v >= intv.desde && v <= intv.hasta) match = true; } else { if (v >= intv.desde && v < intv.hasta) match = true; } }
        if (match) { f[i]++; break; }
      }
    });

    // Frecuencias Acumuladas (Necesarias para Cuartiles/Deciles/Percentiles)
    const F = [];
    let acum = 0;
    for (let i = 0; i < k_int; i++) {
      acum += f[i];
      F.push(acum);
    }

    // ==========================================
    // 2. FÓRMULAS DE CÁLCULO
    // ==========================================
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
        if (F[i] >= posicion) { claseIdx = i; break; }
      }
      if (claseIdx === -1) return max; // Fallback de seguridad
      
      const Li = intervalos[claseIdx].desde;
      const fi = f[claseIdx];
      const Fant = claseIdx > 0 ? F[claseIdx - 1] : 0;
      return fi !== 0 ? Li + ((posicion - Fant) / fi) * amplitud : Li;
    };

    const calcError = (exacto, agrupado) => exacto === 0 ? 0 : Math.abs((exacto - agrupado) / exacto) * 100;

    // ==========================================
    // 3. GENERAR RESULTADOS
    // ==========================================
    const resultados = [];
    
    const agregarResultado = (tipo, simbolo, proporcion) => {
      const exacto = calcFractilExacto(proporcion);
      const posAgrupada = n * proporcion; // Fórmula de posición para datos agrupados
      const agrupado = calcFractilAgrupado(posAgrupada);
      
      resultados.push({
        Tipo: tipo,
        Símbolo: simbolo,
        "D. Individuales": exacto,
        "D. Agrupados": agrupado,
        "Error %": `${calcError(exacto, agrupado).toFixed(2)} %`
      });
    };

    // Calcular todo iterativamente
    for(let i=1; i<=3; i++) agregarResultado("Cuartil", `Q${i}`, i/4);
    for(let i=1; i<=9; i++) agregarResultado("Decil", `D${i}`, i/10);
    
    const k = Number(kPerc);
    if(k > 0 && k < 100) agregarResultado("Percentil", `P${k}`, k/100);

    return resultados;
  };



  // --- Ejecutar Cálculo ---
  const ejecutarCalculo = () => {
    if (calculo === "distribucion_bivariada") {
      const res = calcularBivariada();
      setResultado(res);
      return;
    }

    

    const datos = obtenerDatosNumericos();
    // Validación suave para permitir conteos simples
    if (datos.length === 0) {
         alert("Este cálculo requiere datos numéricos.");
         return;
    }

    let res;
    switch (calculo) {

      case "frecuencias_completas": res = calcularFrecuencias(datos); break;
      case "distribucion_intervalos": res = calcularDistribucionIntervalos(datos); break;
      case "estadistica_descriptiva": res = calcularDescriptivaTotal(datos); break;
      case "tendencia_central": res = calcularTendenciaCentral(datos); break;
      case "medidas_posicion": res = calcularFractiles(datos, percentilK); break;
      case "tendencia_y_posicion": 
        res = {
          tipo: "tendencia_y_posicion",
          tendencia: calcularTendenciaCentral(datos),
          posicion: calcularFractiles(datos, percentilK)
        };
        break;

        // ... los casos anteriores ...
      case "tendencia_y_posicion": 
        res = {
          tipo: "tendencia_y_posicion",
          tendencia: calcularTendenciaCentral(datos),
          posicion: calcularFractiles(datos, percentilK)
        };
        break;

      // 👇 INSERTA ESTO AQUÍ 👇
      case "variabilidad_y_forma":
        res = calcularVariabilidadYForma(datos);
        break;
      // 👆 HASTA AQUÍ 👆

      default: res = [];
    }
    setResultado(res);
  };


  // ==========================================
  // --- EFECTO DE AUTO-CÁLCULO INTELIGENTE ---
  // ==========================================
  useEffect(() => {
    // Si hay datos y una columna seleccionada, ejecutamos el cálculo automáticamente
    if (excelData && excelData.length > 0 && selectedColumn) {
      ejecutarCalculo();
    }
    
    // 👇 NOTA: Excluimos 'excelData' de este arreglo a propósito.
    // De esta manera, si escribes datos a mano en la tabla, NO se recalcula solo 
    // (para eso usarás tu botón CALCULAR).
    // Pero si cambias los selectores (la operación, la variable X o Y), sí se actualiza de inmediato.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculo, selectedColumn, selectedColumnY, tipoIntervalo, metodoK, kPersonalizado, percentilK]);

  return {
    excelData, columns, selectedColumn, resultado,
    calculo, tipoIntervalo, metodoK, kPersonalizado,
    selectedColumnY, setSelectedColumnY, // <--- ¡AQUÍ EXPORTAMOS LA VARIABLE Y!
    percentilK, setPercentilK,
    setSelectedColumn, setCalculo, setTipoIntervalo,
    setMetodoK, setKPersonalizado, handleChangeDato, ejecutarCalculo
  };
}