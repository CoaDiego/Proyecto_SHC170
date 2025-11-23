import { useState, useEffect } from "react";

export function useCalculadoraExcel(filename, sheet) {
  const [excelData, setExcelData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  
  const [calculo, setCalculo] = useState("frecuencia_absoluta");
  const [tipoIntervalo, setTipoIntervalo] = useState("semiabierto");
  const [metodoK, setMetodoK] = useState("sturges");
  const [kPersonalizado, setKPersonalizado] = useState("");
  
  const [resultado, setResultado] = useState(null);

  // --- Carga de datos ---
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
          if (headerRow.length > 0) setSelectedColumn(headerRow[0]);
        } else {
          setExcelData([]);
          setColumns([]);
        }
      })
      .catch((err) => console.error("Error cargando excel:", err));
  }, [filename, sheet]);

  const handleChangeDato = (index, value) => {
    const newData = [...excelData];
    newData[index][selectedColumn] = Number(value);
    setExcelData(newData);
  };

  const obtenerDatosNumericos = () => {
    return excelData
      .map((row) => row[selectedColumn])
      .filter((v) => typeof v === "number" && !isNaN(v));
  };

  // --- CÁLCULO 1: Frecuencias Simples (Discretas) ---
  const calcularFrecuencias = (datos) => {
    const N = datos.length;
    const conteo = {};
    datos.forEach((x) => (conteo[x] = (conteo[x] || 0) + 1));
    const valoresOrdenados = Object.keys(conteo).map(Number).sort((a, b) => a - b);
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
        const P_inv = resto.reduce((acc, curr) => acc + curr.p_i, 0);
        tabla[i].P_i_inv = +P_inv.toFixed(2);
    }

    return tabla.map(fila => ({
        "x_i": fila.x_i,
        "f_i": fila.f_i,
        "F_i": fila.F_i,
        "F_i_inv": fila.F_i_inv,
        "p_i": fila.p_i,
        "P_i": fila.P_i,
        "P_i_inv": fila.P_i_inv
    }));
  };

  // --- CÁLCULO 2: Distribución de Intervalos (LÓGICA DEL LIBRO APLICADA) ---
  const calcularDistribucionIntervalos = (datos) => {
    if (datos.length === 0) return [];
    const n = datos.length;
    const min = Math.min(...datos);
    const max = Math.max(...datos);
    
    // 1. Calcular K
    let k;
    switch (metodoK) {
      case "cuadratica": k = Math.sqrt(n); break;
      case "logaritmica": k = Math.log(n) / Math.log(2); break;
      case "personalizada": k = Number(kPersonalizado) || 1; break;
      default: k = 1 + 3.322 * Math.log10(n); // Sturges
    }
    k = Math.round(k);
    if (k < 1) k = 1;

    // 2. Calcular Amplitud (MODIFICADO PARA COINCIDIR CON EL LIBRO)
    const rango = max - min;
    
    // Detectamos si los datos tienen decimales.
    // Si son enteros (como salarios), la unidad de variación (u) es 1.
    // El libro usa la fórmula: a = (R / k) + u
    const tieneDecimales = datos.some(d => d % 1 !== 0);
    const u = tieneDecimales ? 0.0 : 1; // Si son enteros, sumamos 1. Si son decimales, suele ser diferente.
    
    // Aplicamos la lógica: (10490 / 7) + 1 = 1499.57 -> Redondeamos a 1500
    const amplitudRaw = (rango / k) + u; 
    const amplitud = Math.round(amplitudRaw); 

    // 3. Generar Intervalos
    const intervalos = [];
    let inicio = Math.floor(min);
    
    for (let i = 0; i < k; i++) {
      const fin = inicio + amplitud;
      intervalos.push({ desde: inicio, hasta: fin });
      inicio = fin; 
    }

    // 4. Calcular frecuencias
    const frecuencias = intervalos.map(({ desde, hasta }, i) => {
      let f = 0;
      const esUltimo = i === intervalos.length - 1;
      datos.forEach((v) => {
        if (tipoIntervalo === "cerrado") { if (v >= desde && v <= hasta) f++; }
        else if (tipoIntervalo === "abierto") { if (v > desde && v < hasta) f++; }
        else { 
             // Semiabierto [a, b)
             if (esUltimo) { if (v >= desde && v <= hasta) f++; }
             else { if (v >= desde && v < hasta) f++; }
        }
      });
      return f;
    });

    // 5. Estadísticas
    const total = frecuencias.reduce((a, b) => a + b, 0);
    const pi = frecuencias.map((f) => +(f / total * 100).toFixed(2)); 
    const Fi = frecuencias.map((_, i) => frecuencias.slice(0, i + 1).reduce((a, b) => a + b, 0));
    const Pi = pi.map((_, i) => +pi.slice(0, i + 1).reduce((a, b) => a + b, 0).toFixed(2));
    const Fi_inv = frecuencias.map((_, i) => frecuencias.slice(i).reduce((a, b) => a + b, 0));
    const Pi_inv = pi.map((_, i) => +pi.slice(i).reduce((a, b) => a + b, 0).toFixed(2));

    return intervalos.map((intv, i) => {
      // Formato continuo exacto: 5000 - 6500
      const etiquetaIntervalo = `${intv.desde} - ${intv.hasta}`;

      return {
        "Haber básico": etiquetaIntervalo,
        "f_i": frecuencias[i],             
        "p_i": pi[i],                      
        "F_i": Fi[i],                      
        "P_i": Pi[i],                      
        "F'i": Fi_inv[i],                  
        "P'i": Pi_inv[i]                   
      };
    });
  };

  const ejecutarCalculo = () => {
    const datos = obtenerDatosNumericos();
    if (!selectedColumn || datos.length === 0) {
        alert("No hay datos numéricos válidos.");
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
      case "minimo": res = [{ Resultado: "Mínimo", Valor: Math.min(...datos) }]; break;
      case "maximo": res = [{ Resultado: "Máximo", Valor: Math.max(...datos) }]; break;
      case "frecuencias_completas": res = calcularFrecuencias(datos); break;
      case "distribucion_intervalos": res = calcularDistribucionIntervalos(datos); break;
      default: res = [];
    }
    setResultado(res);
  };

  return {
    excelData, columns, selectedColumn, resultado, calculo,
    tipoIntervalo, metodoK, kPersonalizado,
    setSelectedColumn, setCalculo, setTipoIntervalo, setMetodoK, setKPersonalizado,
    handleChangeDato, ejecutarCalculo
  };
}