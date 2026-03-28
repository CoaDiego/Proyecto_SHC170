import { useState, useEffect } from "react";

import * as UniMath from "../utils/estadisticaUnidimensional";
import * as MultiMath from "../utils/estadisticaMultivariante";

import { api } from "../services/api";

export function useCalculadoraExcel(filename, sheet) {
  // --- Estados de Datos ---
  const [excelData, setExcelData] = useState([]);
  const [columns, setColumns] = useState([]);

  // --- AQUI ESTABA EL FALTANTE: Agregamos la segunda columna ---
  const [selectedColumn, setSelectedColumn] = useState(""); // Variable X
  const [selectedColumnY, setSelectedColumnY] = useState(""); // Variable Y (Para Bivariada)

  const [calculo, setCalculo] = useState("frecuencias_completas");
  const [tipoIntervalo, setTipoIntervalo] = useState("semiabierto");
  const [metodoK, setMetodoK] = useState("sturges");
  const [kPersonalizado, setKPersonalizado] = useState("");
  const [percentilK, setPercentilK] = useState(50);

  const [errorNumerico, setErrorNumerico] = useState(false);

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
            setSelectedColumnY(
              headerRow.length > 1 ? headerRow[1] : headerRow[0],
            );
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
      .filter((v) => v !== null && v !== undefined && v !== "") // Quitar vacíos
      .map((v) => Number(v)) // Convertir todo a número (si es texto "123" -> 123)
      .filter((v) => !isNaN(v)); // Quedarnos solo con los que sí eran números
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

    categoriasX.forEach((catX) => {
      matriz[catX] = {};
      totalFilas[catX] = 0;
      categoriasY.forEach((catY) => {
        matriz[catX][catY] = 0;
        totalColumnas[catY] = 0;
      });
    });
    // Reasegurar totales columna
    categoriasY.forEach((catY) => (totalColumnas[catY] = 0));

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
      granTotal: n,
    };
  };

  // ==========================================
  // --- TEMA 5: BIVARIANTE AVANZADA (INTELIGENTE) ---
  // ==========================================
  const calcularTema5_Bivariante = () => {
    if (!selectedColumn || !selectedColumnY) return null;

    const dataX = obtenerColumna(selectedColumn);
    const dataY = obtenerColumna(selectedColumnY);
    const n = dataX.length;
    if (n === 0) return null;

    // 1. Escáner: ¿Son números continuos o texto categórico?
    const esNumerico =
      dataX.every((v) => typeof v === "number" && !isNaN(v)) &&
      dataY.every((v) => typeof v === "number" && !isNaN(v));

    let categoriasX = [];
    let categoriasY = [];
    let matriz = {};
    let totalFilas = {};
    let totalColumnas = {};

    // 2. CONSTRUCCIÓN DE LA TABLA
    if (esNumerico && n > 1) {
      // --- MODO INTERVALOS (Para domar los decimales) ---

      // Regla de Sturges para calcular cuántos intervalos (k) necesitamos
      const k = Math.round(1 + 3.322 * Math.log10(n));

      // Min, Max y Amplitud para X
      const minX = Math.min(...dataX);
      const maxX = Math.max(...dataX);
      const ampX = (maxX - minX) / k || 1;

      // Min, Max y Amplitud para Y
      const minY = Math.min(...dataY);
      const maxY = Math.max(...dataY);
      const ampY = (maxY - minY) / k || 1;

      // Crear las "Cajas" (Intervalos)
      const limitesX = [];
      const limitesY = [];

      for (let i = 0; i < k; i++) {
        const lInfX = minX + i * ampX;
        const lSupX = i === k - 1 ? maxX : minX + (i + 1) * ampX; // El último intervalo cierra exacto
        const labelX = `[${lInfX.toFixed(2)} - ${lSupX.toFixed(2)}${i === k - 1 ? "]" : ")"}`;
        categoriasX.push(labelX);
        limitesX.push({
          min: lInfX,
          max: lSupX,
          label: labelX,
          isLast: i === k - 1,
        });

        const lInfY = minY + i * ampY;
        const lSupY = i === k - 1 ? maxY : minY + (i + 1) * ampY;
        const labelY = `[${lInfY.toFixed(2)} - ${lSupY.toFixed(2)}${i === k - 1 ? "]" : ")"}`;
        categoriasY.push(labelY);
        limitesY.push({
          min: lInfY,
          max: lSupY,
          label: labelY,
          isLast: i === k - 1,
        });
      }

      // Inicializar la matriz limpia con los nuevos intervalos
      categoriasX.forEach((catX) => {
        matriz[catX] = {};
        totalFilas[catX] = 0;
        categoriasY.forEach((catY) => {
          matriz[catX][catY] = 0;
          totalColumnas[catY] = 0;
        });
      });

      // Clasificar cada dato en su caja correspondiente
      for (let i = 0; i < n; i++) {
        const valX = dataX[i];
        const valY = dataY[i];

        // Buscar el intervalo correcto
        let binX = limitesX.find((b) =>
          b.isLast
            ? valX >= b.min && valX <= b.max
            : valX >= b.min && valX < b.max,
        );
        let binY = limitesY.find((b) =>
          b.isLast
            ? valY >= b.min && valY <= b.max
            : valY >= b.min && valY < b.max,
        );

        // Salvavidas por redondeo de decimales en JS
        if (!binX) binX = limitesX[limitesX.length - 1];
        if (!binY) binY = limitesY[limitesY.length - 1];

        matriz[binX.label][binY.label]++;
        totalFilas[binX.label]++;
        totalColumnas[binY.label]++;
      }
    } else {
      // --- MODO TEXTO (Cruza tal cual como en el libro) ---
      categoriasX = [...new Set(dataX)].sort();
      categoriasY = [...new Set(dataY)].sort();

      categoriasX.forEach((catX) => {
        matriz[catX] = {};
        totalFilas[catX] = 0;
        categoriasY.forEach((catY) => {
          matriz[catX][catY] = 0;
          totalColumnas[catY] = 0;
        });
      });
      categoriasY.forEach((catY) => (totalColumnas[catY] = 0));

      for (let i = 0; i < n; i++) {
        const valX = dataX[i];
        const valY = dataY[i];
        if (matriz[valX] && matriz[valX][valY] !== undefined) {
          matriz[valX][valY]++;
          totalFilas[valX]++;
          totalColumnas[valY]++;
        }
      }
    }

    // 3. CÁLCULO DE COVARIANZA Y CORRELACIÓN (Siempre se usan los datos exactos)
    let covarianza = null;
    let correlacion = null;
    let interpretacion = "No aplicable (Variables Categóricas)";

    if (esNumerico && n > 1) {
      const meanX = dataX.reduce((a, b) => a + b, 0) / n;
      const meanY = dataY.reduce((a, b) => a + b, 0) / n;

      let sumCross = 0,
        sumSqX = 0,
        sumSqY = 0;

      for (let i = 0; i < n; i++) {
        const dx = dataX[i] - meanX;
        const dy = dataY[i] - meanY;
        sumCross += dx * dy;
        sumSqX += dx * dx;
        sumSqY += dy * dy;
      }

      covarianza = sumCross / (n - 1);
      const stdX = Math.sqrt(sumSqX / (n - 1));
      const stdY = Math.sqrt(sumSqY / (n - 1));

      if (stdX > 0 && stdY > 0) {
        correlacion = covarianza / (stdX * stdY);

        const absR = Math.abs(correlacion);
        if (absR >= 0.9)
          interpretacion =
            correlacion > 0
              ? "Correlación Positiva Muy Fuerte"
              : "Correlación Negativa Muy Fuerte";
        else if (absR >= 0.7)
          interpretacion =
            correlacion > 0
              ? "Correlación Positiva Fuerte"
              : "Correlación Negativa Fuerte";
        else if (absR >= 0.4)
          interpretacion =
            correlacion > 0
              ? "Correlación Positiva Moderada"
              : "Correlación Negativa Moderada";
        else if (absR >= 0.2)
          interpretacion =
            correlacion > 0
              ? "Correlación Positiva Débil"
              : "Correlación Negativa Débil";
        else interpretacion = "Correlación Nula o Inexistente";
      } else {
        correlacion = 0;
        interpretacion = "Sin variación en los datos";
      }
    }

    // 4. Se envía el paquete completo a la interfaz
    return {
      tipo: "bivariada_avanzada",
      filas: categoriasX,
      columnas: categoriasY,
      datos: matriz,
      totalFilas,
      totalColumnas,
      granTotal: n,
      esNumerico,
      covarianza,
      correlacion,
      interpretacion,
    };
  };

  // --- Otros Cálculos (Frecuencias, Intervalos) ---
  const calcularFrecuencias = (datos) => {
    const N = datos.length;
    const conteo = {};
    datos.forEach((x) => (conteo[x] = (conteo[x] || 0) + 1));
    const valoresOrdenados = Object.keys(conteo)
      .map(Number)
      .sort((a, b) => a - b);

    // ... (Lógica estándar de frecuencias) ...
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
    // Inversas
    for (let i = 0; i < tabla.length; i++) {
      const resto = tabla.slice(i);
      const F_inv = resto.reduce((acc, curr) => acc + curr.f_i, 0);
      tabla[i].F_i_inv = F_inv;

      // 2. CAMBIO: Usamos la 'N' que YA existía en tu código
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

  const calcularDistribucionIntervalos = (datos) => {
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

    // Lógica Libro: +1
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

  // --- Ejecutar Cálculo ---
  const ejecutarCalculo = () => {
    // ==========================================================
    // 1. EL "PASE VIP": ANÁLISIS MULTIVARIANTE (Soportan Texto)
    // ==========================================================
    if (
      calculo === "distribucion_bivariada" ||
      calculo === "distribucion_bivariada_avanzada"
    ) {
      if (!selectedColumn || !selectedColumnY) return;

      const rawDataX = obtenerColumna(selectedColumn);
      const rawDataY = obtenerColumna(selectedColumnY);

      let resMultivariable = null;
      if (calculo === "distribucion_bivariada") {
        resMultivariable = MultiMath.calcularDistribucionBivariada(
          rawDataX,
          rawDataY,
        );
      } else {
        resMultivariable = MultiMath.calcularBivarianteAvanzada(
          rawDataX,
          rawDataY,
        );
      }

      setResultado(resMultivariable);
      setErrorNumerico(false);
      return;
    }

    // 2. LA PUERTA: Todo lo que pase de aquí para abajo exige estrictamente NÚMEROS
    const datos = obtenerDatosNumericos();
    if (datos.length === 0) {
      setErrorNumerico(true);
      setResultado(null);
      return;
    }
    setErrorNumerico(false);

    // 3. LOS CÁLCULOS MATEMÁTICOS UNIDIMENSIONALES
    let res;

    // 👇 AQUÍ ESTÁ LA SOLUCIÓN AL ERROR: Declaramos configData antes de usarlo
    const configData = { metodoK, kPersonalizado, tipoIntervalo };

    switch (calculo) {
      case "frecuencias_completas":
        res = UniMath.calcularFrecuencias(datos);
        break;
      case "distribucion_intervalos":
        res = UniMath.calcularDistribucionIntervalos(datos, configData);
        break;
      case "estadistica_descriptiva":
        res = UniMath.calcularDescriptivaTotal(datos);
        break;
      case "tendencia_central":
        // 👇 SOLUCIÓN 2: Nos aseguramos de usar UniMath.
        res = UniMath.calcularTendenciaCentral(datos, configData);
        break;
      case "medidas_posicion":
        res = UniMath.calcularFractiles(datos, percentilK, configData);
        break;
      case "tendencia_y_posicion":
        const tendenciaData = UniMath.calcularTendenciaCentral(
          datos,
          configData,
        );
        // Extraemos los datos del gráfico que pusimos al final de calcularTendenciaCentral
        const graficosData = tendenciaData.pop();

        res = {
          tipo: "tendencia_y_posicion",
          tendencia: tendenciaData,
          posicion: UniMath.calcularFractiles(datos, percentilK, configData),
          // Pasamos los datos en bruto para que el Boxplot se dibuje
          datosPuros: [...datos].sort((a, b) => a - b),
          graficosTema3: graficosData,
        };
        break;

      // --- CASOS BIVARIADOS (Se mantienen igual por ahora) ---
      case "distribucion_bivariada":
        const datosX = excelData.map((fila) => fila[selectedColumn]);
        const datosY = excelData.map((fila) => fila[selectedColumnY]);
        if (datosX.length > 0 && datosY.length > 0) {
          res = calcularBivariadaLocal(datosX, datosY);
        }
        break;

      case "distribucion_bivariada_avanzada":
        const dX = excelData.map((f) => f[selectedColumn]);
        const dY = excelData.map((f) => f[selectedColumnY]);
        if (dX.length > 0 && dY.length > 0) {
          res = calcularBivariadaAvanzadaLocal(dX, dY);
        }
        break;

      default:
        res = [];
    }

    setResultado(res);
  };

  // --- FUNCIONES DE APOYO BIVARIANTE (Al final del archivo, fuera del hook) ---
  const calcularBivariadaLocal = (X, Y) => {
    const nivelesX = [...new Set(X)].sort();
    const nivelesY = [...new Set(Y)].sort();

    const estructuraDatos = {};
    const totalFilas = {};

    nivelesX.forEach((x) => {
      estructuraDatos[x] = {};
      let sumaFila = 0;
      nivelesY.forEach((y) => {
        const freq = X.filter((val, i) => val === x && Y[i] === y).length;
        estructuraDatos[x][y] = freq;
        sumaFila += freq;
      });
      totalFilas[x] = sumaFila;
    });

    return {
      tipo: "bivariada",
      filas: nivelesX, // El gráfico espera 'filas'
      columnas: nivelesY, // El gráfico espera 'columnas'
      datos: estructuraDatos,
      totalFilas: totalFilas,
    };
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
  }, [
    calculo,
    selectedColumn,
    selectedColumnY,
    tipoIntervalo,
    metodoK,
    kPersonalizado,
    percentilK,
  ]);

  return {
    excelData,
    columns,
    selectedColumn,
    resultado,
    calculo,
    tipoIntervalo,
    metodoK,
    kPersonalizado,
    selectedColumnY,
    setSelectedColumnY, // <--- ¡AQUÍ EXPORTAMOS LA VARIABLE Y!
    percentilK,
    setPercentilK,
    setSelectedColumn,
    setCalculo,
    setTipoIntervalo,
    setMetodoK,
    setKPersonalizado,
    handleChangeDato,
    ejecutarCalculo,

    errorNumerico,
  };
}
