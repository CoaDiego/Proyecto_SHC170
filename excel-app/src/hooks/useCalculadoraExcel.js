import { useState, useEffect } from "react";
import { useData } from "../components/excel/DataContext";

import * as UniMath from "../utils/estadisticaUnidimensional";
import * as MultiMath from "../utils/estadisticaMultivariante";

import { api } from "../services/api";

export function useCalculadoraExcel(filename, sheet) {
  // --- Estados de Datos ---
  const { variables } = useData();
  const [exceldataoriginal, setExcelDataOriginal] = useState([]);
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
        if (Array.isArray(data) && data.length > 0) {
          const headerRow = Object.keys(data[0]);
          setColumns(headerRow);
          setExcelData(data);
          setExcelDataOriginal(data);

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
    if (columns.length === 0 && variables.length > 0 && selectedColumn === "") {
        setSelectedColumn(variables[0].nombre);
    }
  }, [columns, selectedColumnY, variables]);

  // 3. Función para editar datos (Soporta TEXTO y NÚMEROS)
  // Dentro de useCalculadoraExcel.js

  const handleChangeDato = (index, colName, value) => {
    const esNumero = !isNaN(Number(value)) && value.trim() !== "";
    const nuevoValor = esNumero ? Number(value) : value;

    // --- NUEVA LÓGICA DE EDICIÓN ---
    //const vCapturada = variables.find(v => v.nombre === colName);

    //if (vCapturada) {
    // Si es una variable capturada, editamos su array de datos global
    //const nuevosDatos = [...vCapturada.datos];
    //nuevosDatos[index] = nuevoValor;

    // Actualizamos el cerebro global (DataContext)
    //actualizarVariable(vCapturada.id, { datos: nuevosDatos });
    const newData = [...excelData];
    if (newData[index]) {
      // Si no es variable, seguimos editando el excelData local como antes
      newData[index][colName] = nuevoValor;
      setExcelData(newData);
    }
  };

  // 4. Obtener datos de una columna
  const obtenerColumna = (colName) => {
    if (!colName) return [];
    // Leemos siempre de la tabla local que se muestra en pantalla
    return excelData.map((row) => row[colName]);
  };

  // 5. Obtener solo números
  const obtenerDatosNumericos = () => {
    if (!selectedColumn) return [];

    // IMPORTANTE: Siempre leemos de excelData, porque ahí es donde
    // están los datos que el usuario está editando en la pantalla.
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
      filas: nivelesX,      // El gráfico espera 'filas'
      columnas: nivelesY,   // El gráfico espera 'columnas'
      datos: estructuraDatos,
      totalFilas: totalFilas
    };
  };

  // --- Agrégalo al final del archivo useCalculadoraExcel.js, fuera del export function ---
/*
  const calcularBivariadaAvanzadaLocal = (X, Y) => {
    const n = X.length;
    if (n === 0) return null;

    // Convertir a números por seguridad
    const dX = X.map(v => parseFloat(v)).filter(v => !isNaN(v));
    const dY = Y.map(v => parseFloat(v)).filter(v => !isNaN(v));

    if (dX.length !== dY.length || dX.length < 2) {
      return { interpretacion: "Datos insuficientes o no numéricos" };
    }

    // 1. Cálculos de Medias
    const meanX = dX.reduce((a, b) => a + b, 0) / n;
    const meanY = dY.reduce((a, b) => a + b, 0) / n;

    // 2. Covarianza y Correlación
    let sumCross = 0, sumSqX = 0, sumSqY = 0;
    for (let i = 0; i < n; i++) {
      const dx = dX[i] - meanX;
      const dy = dY[i] - meanY;
      sumCross += dx * dy;
      sumSqX += dx * dx;
      sumSqY += dy * dy;
    }

    const covarianza = sumCross / (n - 1);
    const stdX = Math.sqrt(sumSqX / (n - 1));
    const stdY = Math.sqrt(sumSqY / (n - 1));
    const correlacion = stdX > 0 && stdY > 0 ? covarianza / (stdX * stdY) : 0;

    // 3. Interpretación
    let interp = "";
    const absR = Math.abs(correlacion);
    if (absR >= 0.8) interp = "Relación Muy Fuerte";
    else if (absR >= 0.5) interp = "Relación Moderada";
    else interp = "Relación Débil o Nula";

    // 4. Retornar estructura que espera tu componente Calculos.jsx
    return {
      tipo: "bivariada_avanzada",
      esNumerico: true,
      covarianza: covarianza,
      correlacion: correlacion,
      interpretacion: interp,
      // Datos para la tabla de doble entrada básica en Tema 5
      ...calcularBivariadaLocal(X, Y)
    };
  };
*/
  
  // --- Ejecutar Cálculo ---
// --- Ejecutar Cálculo (Versión Unificada Ibarra + Diego) ---
const ejecutarCalculo = () => {
  // 1. LOGS DE DEPURACIÓN
  console.log("Intentando calcular con columna:", selectedColumn);
  console.log("Variables disponibles en el Hook:", variables);

  // ==========================================================
  // 2. EL "PASE VIP": ANÁLISIS MULTIVARIANTE (Soportan Texto)
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
      resMultivariable = MultiMath.calcularDistribucionBivariada(rawDataX, rawDataY);
    } else {
      resMultivariable = MultiMath.calcularBivarianteAvanzada(rawDataX, rawDataY);
    }

    setResultado(resMultivariable);
    setErrorNumerico(false);
    return;
  }

  // ==========================================================
  // 3. OBTENCIÓN DE DATOS (LÓGICA IBARRA: SOPORTE PARA EDICIÓN)
  // ==========================================================
  let datos = [];
  const nombreBuscado = selectedColumn ? selectedColumn.trim() : "";
  const vEncontrada = variables.find(v => v.nombre === nombreBuscado);

  // PRIORIDAD 1: Revisar si hay datos editados en la tabla de Cálculos (excelData)
  if (excelData && excelData.length > 0) {
    const datosDeTabla = excelData
      .map(row => parseFloat(row[selectedColumn]))
      .filter(v => !isNaN(v));

    if (datosDeTabla.length > 0) {
      console.log("✏️ Usando datos editados de la tabla:", datosDeTabla);
      datos = datosDeTabla;
    }
  }

  // PRIORIDAD 2: Si la tabla está vacía, usar datos de la Variable Capturada
  if (datos.length === 0 && vEncontrada && vEncontrada.datos) {
    console.log("✅ Usando datos originales de la variable:", vEncontrada.datos);
    datos = vEncontrada.datos;
  }

  // PRIORIDAD 3: Respaldo (obtener del Excel original)
  if (datos.length === 0) {
    console.log("⚠️ Buscando en datos de Excel originales...");
    datos = obtenerDatosNumericos();
  }

  // VALIDACIÓN DE NÚMEROS
  if (datos.length === 0) {
    setErrorNumerico(true);
    setResultado(null);
    return;
  }
  setErrorNumerico(false);

  // ==========================================================
  // 4. CÁLCULOS UNIDIMENSIONALES (ESTRUCTURA DE DIEGO + GRÁFICOS)
  // ==========================================================
  let res;
  // Configuración de intervalos (Sturges, personalizado, etc.)
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
      res = UniMath.calcularTendenciaCentral(datos, configData);
      break;
    case "medidas_posicion":
      res = UniMath.calcularFractiles(datos, percentilK, configData);
      break;
    case "tendencia_y_posicion":{
      const tendenciaData = UniMath.calcularTendenciaCentral(datos, configData);
      
      // Extraemos los datos de gráficos que Diego puso al final del array
      const graficosData = Array.isArray(tendenciaData) ? tendenciaData.pop() : null;

      res = {
        tipo: "tendencia_y_posicion",
        tendencia: tendenciaData,
        posicion: UniMath.calcularFractiles(datos, percentilK, configData),
        // Datos ordenados para el Boxplot
        datosPuros: [...datos].sort((a, b) => a - b),
        graficosTema3: graficosData,
      };
      break;
    }
    case "variabilidad_y_forma":
      res = UniMath.calcularVariabilidadYForma(datos);
      break;
    default:
      res = [];
  }

  setResultado(res);
};



  useEffect(() => {
    if (!selectedColumn) return;

    // Buscamos si es una variable capturada
    const vCapturada = variables.find(v => v.nombre === selectedColumn);

    if (vCapturada) {
      // ES VARIABLE: Cargamos su copia editable
      const rowsParaGrid = vCapturada.datos.map(num => ({
        [vCapturada.nombre]: num
      }));
      setExcelData(rowsParaGrid);
      setErrorNumerico(false)
    } else if (exceldataoriginal.length > 0) {

      setExcelData(exceldataoriginal);
    }
  }, [selectedColumn, exceldataoriginal, variables]); // 👈 Asegúrate de añadir estas dependencias


  useEffect(() => {
    // Agregamos la condición de variables.length > 0
    if ((excelData.length > 0 || variables.length > 0) && selectedColumn) {
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
    excelData,
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
