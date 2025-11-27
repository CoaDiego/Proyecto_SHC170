import { useState, useEffect } from "react";

/**
 * Hook personalizado: Maneja la lógica de negocio, llamadas a la API
 * y cálculos estadísticos.
 */
export function useCalculadoraExcel(filename, sheet) {
  // --- Estados de Datos ---
  const [excelData, setExcelData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  
  // --- Estados de Configuración ---
  const [calculo, setCalculo] = useState("frecuencia_absoluta");
  const [tipoIntervalo, setTipoIntervalo] = useState("semiabierto");
  const [metodoK, setMetodoK] = useState("sturges");
  const [kPersonalizado, setKPersonalizado] = useState("");
  
  // --- Estado de Resultados ---
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
          
          // Mapear datos para asegurar consistencia
          const realData = data.slice(1).map((row) =>
            Object.fromEntries(
              Object.keys(row).map((key, idx) => [headerRow[idx], row[key]])
            )
          );
          
          setExcelData(realData);
          if (headerRow.length > 0) setSelectedColumn(headerRow[0]);
        } else {
          setExcelData([]);
          setColumns([]);
        }
      })
      .catch((err) => console.error("Error cargando excel:", err));
  }, [filename, sheet]);

  // 2. Función para editar datos manualmente (two-way binding)
  const handleChangeDato = (index, value) => {
    const newData = [...excelData];
    newData[index][selectedColumn] = Number(value);
    setExcelData(newData);
  };

  // 3. Obtener datos numéricos limpios
  const obtenerDatosNumericos = () => {
    return excelData
      .map((row) => row[selectedColumn])
      .filter((v) => typeof v === "number" && !isNaN(v));
  };

  // --- Funciones Auxiliares de Cálculo ---
  const calcularFrecuencias = (datos) => {
    const N = datos.length;
    const conteo = {};
    datos.forEach((x) => (conteo[x] = (conteo[x] || 0) + 1));
    const valoresOrdenados = Object.keys(conteo).map(Number).sort((a, b) => a - b);

    let F_i = 0;
    const tabla = valoresOrdenados.map((x) => {
      const f_i = conteo[x];
      F_i += f_i;
      return { x_i: x, f_i, F_i };
    });

    let F_i_inv = 0;
    for (let i = tabla.length - 1; i >= 0; i--) {
      F_i_inv += tabla[i].f_i;
      tabla[i].F_i_inv = F_i_inv;
    }

    let P_i = 0;
    for (let i = 0; i < tabla.length; i++) {
      const p_i = (tabla[i].f_i / N) * 100;
      P_i += p_i;
      tabla[i].p_i = +p_i.toFixed(2);
      tabla[i].P_i = +P_i.toFixed(2);
    }

    let P_i_inv = 0;
    for (let i = tabla.length - 1; i >= 0; i--) {
      P_i_inv += tabla[i].p_i;
      tabla[i].P_i_inv = +P_i_inv.toFixed(2);
    }

    return tabla;
  };

  const calcularDistribucionIntervalos = (datos) => {
    if (datos.length === 0) return [];
    const n = datos.length;
    const min = Math.min(...datos);
    const max = Math.max(...datos);
    let k;

    switch (metodoK) {
      case "cuadratica": k = Math.sqrt(n); break;
      case "logaritmica": k = Math.log(n) / Math.log(2); break;
      case "personalizada": k = Number(kPersonalizado) || 1; break;
      default: k = 1 + 3.3 * Math.log10(n);
    }

    k = Math.round(k);
    if (k < 1) k = 1;

    const rango = max - min;
    const amplitud = Math.ceil(rango / k);

    const intervalos = [];
    let inicio = Math.floor(min);
    for (let i = 0; i < k; i++) {
      const fin = inicio + amplitud;
      intervalos.push({ desde: inicio, hasta: fin });
      inicio = fin;
    }

    const frecuencias = intervalos.map(({ desde, hasta }) => {
      let f = 0;
      datos.forEach((v) => {
        if (tipoIntervalo === "cerrado" && v >= desde && v <= hasta) f++;
        else if (tipoIntervalo === "abierto" && v > desde && v < hasta) f++;
        else if (tipoIntervalo === "semiabierto" && v >= desde && v < hasta) f++;
      });
      return f;
    });

    const total = frecuencias.reduce((a, b) => a + b, 0);
    const pi = frecuencias.map((f) => +(f / total * 100).toFixed(2));

    const Fi = frecuencias.map((_, i) =>
      frecuencias.slice(0, i + 1).reduce((a, b) => a + b, 0)
    );
    const Pi = pi.map((_, i) =>
      +pi.slice(0, i + 1).reduce((a, b) => a + b, 0).toFixed(2)
    );

    const Fi_inv = frecuencias.map((_, i) =>
      frecuencias.slice(i).reduce((a, b) => a + b, 0)
    );
    const Pi_inv = pi.map((_, i) =>
      +pi.slice(i).reduce((a, b) => a + b, 0).toFixed(2)
    );

    const tabla = intervalos.map((intv, i) => ({
      Intervalo: `${intv.desde} - ${intv.hasta}`,
      "Haber básico": `${intv.desde} - ${intv.hasta}`,
      f_i: frecuencias[i],
      pi: pi[i],
      F_i: Fi[i],
      P_i: Pi[i],
      P_i_inv: Pi_inv[i],
      "F'i": Fi_inv[i],
      "P'i": Pi_inv[i]
    }));

    return tabla;
  };

  // --- Función Principal de Ejecución ---
  const ejecutarCalculo = () => {
    const datos = obtenerDatosNumericos();
    if (!selectedColumn || datos.length === 0) {
        alert("No hay datos numéricos válidos en la columna seleccionada.");
        return;
    }
    
    let res;
    switch (calculo) {
      case "frecuencia_absoluta":
        res = {};
        datos.forEach((val) => (res[val] = (res[val] || 0) + 1));
        res = Object.entries(res).map(([k, v]) => ({ Valor: k, Frecuencia: v }));
        break;
      case "frecuencia_relativa":
        res = [];
        const total = datos.length;
        const conteo = {};
        datos.forEach((val) => (conteo[val] = (conteo[val] || 0) + 1));
        res = Object.entries(conteo).map(([k, v]) => ({ Valor: k, Relativa: (v/total).toFixed(4) }));
        break;
      case "minimo":
        res = [{ Resultado: "Mínimo", Valor: Math.min(...datos) }];
        break;
      case "maximo":
        res = [{ Resultado: "Máximo", Valor: Math.max(...datos) }];
        break;
      case "frecuencias_completas":
        res = calcularFrecuencias(datos);
        break;
      case "distribucion_intervalos":
        res = calcularDistribucionIntervalos(datos);
        break;
      default:
        res = [];
    }

    setResultado(res);
  };

  // Retornamos la API pública del Hook
  return {
    excelData, columns, selectedColumn, resultado,
    calculo, tipoIntervalo, metodoK, kPersonalizado,
    setSelectedColumn, setCalculo, setTipoIntervalo, 
    setMetodoK, setKPersonalizado, handleChangeDato, ejecutarCalculo
  };
}