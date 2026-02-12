import { useState, useEffect } from "react";

export function useCalculadoraExcel(filename, sheet) {
  // --- Estados de Datos ---
  const [excelData, setExcelData] = useState([]);
  const [columns, setColumns] = useState([]);
  
  // --- AQUI ESTABA EL FALTANTE: Agregamos la segunda columna ---
  const [selectedColumn, setSelectedColumn] = useState("");   // Variable X
  const [selectedColumnY, setSelectedColumnY] = useState(""); // Variable Y (Para Bivariada)
  
  const [calculo, setCalculo] = useState("frecuencia_absoluta");
  const [tipoIntervalo, setTipoIntervalo] = useState("semiabierto");
  const [metodoK, setMetodoK] = useState("sturges");
  const [kPersonalizado, setKPersonalizado] = useState("");
  
  const [resultado, setResultado] = useState(null);

  // 1. Cargar datos desde el backend
  useEffect(() => {
    if (!filename || sheet === "" || sheet === undefined) return;
    const hojaIndex = Number(sheet);

    fetch(`http://127.0.0.1:8000/view/${filename}?hoja=${hojaIndex}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const headerRow = Object.values(data[0]);
          setColumns(headerRow);
          
          const realData = data.slice(1).map((row) =>
            Object.fromEntries(Object.keys(row).map((key, idx) => [headerRow[idx], row[key]]))
          );
          setExcelData(realData);
          
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
      })
      .catch((err) => console.error("Error cargando excel:", err));
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
    ];
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
    if (datos.length === 0 && calculo !== "frecuencia_absoluta" && calculo !== "frecuencia_relativa") {
       // Si no hay números y pide intervalos, error.
       alert("Este cálculo requiere datos numéricos.");
       return;
    }

    let res;
    switch (calculo) {
      case "frecuencia_absoluta":
        const colData = obtenerColumna(selectedColumn);
        res = {};
        colData.forEach((val) => (res[val] = (res[val] || 0) + 1));
        res = Object.entries(res).map(([k, v]) => ({ Valor: k, Frecuencia: v }));
        break;
      case "frecuencia_relativa":
        res = [];
        const colDataRel = obtenerDatosNumericos(); 
        // Si queremos relativa de texto, usamos colDataRel = obtenerColumna(selectedColumn) y n = colDataRel.length
        // Por ahora lo dejo numérico como tenías, o podemos cambiarlo a genérico:
        const dataGen = obtenerColumna(selectedColumn);
        const total = dataGen.length;
        const conteo = {};
        dataGen.forEach((val) => (conteo[val] = (conteo[val] || 0) + 1));
        res = Object.entries(conteo).map(([k, v]) => ({ Valor: k, Relativa: (v/total).toFixed(4) }));
        break;
      case "minimo": res = [{ Resultado: "Mínimo", Valor: Math.min(...datos) }]; break;
      case "maximo": res = [{ Resultado: "Máximo", Valor: Math.max(...datos) }]; break;
      case "frecuencias_completas": res = calcularFrecuencias(datos); break;
      case "distribucion_intervalos": res = calcularDistribucionIntervalos(datos); break;
      case "estadistica_descriptiva": res = calcularDescriptivaTotal(datos);break;
      default: res = [];
    }
    setResultado(res);
  };

  return {
    excelData, columns, selectedColumn, resultado,
    calculo, tipoIntervalo, metodoK, kPersonalizado,
    selectedColumnY, setSelectedColumnY, // <--- ¡AQUÍ EXPORTAMOS LA VARIABLE Y!
    setSelectedColumn, setCalculo, setTipoIntervalo, 
    setMetodoK, setKPersonalizado, handleChangeDato, ejecutarCalculo
  };
}