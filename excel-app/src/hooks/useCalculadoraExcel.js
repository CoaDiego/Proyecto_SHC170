import { useState, useEffect } from "react";
import { useData } from "../components/excel/DataContext";

import * as UniMath from "../utils/estadisticaUnidimensional";
import * as MultiMath from "../utils/estadisticaMultivariante";
import * as RegMath from "../utils/estadisticaRegresion";
import * as SeriesMath from "../utils/estadisticaSeriesTiempo";
import * as IndicesMath from "../utils/estadisticaIndices";

import { api } from "../services/api";

export function useCalculadoraExcel(filename, sheet) {
  const { variables } = useData();
  const [exceldataoriginal, setExcelDataOriginal] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [columns, setColumns] = useState([]);

  const [selectedColumn, setSelectedColumn] = useState("");
  const [selectedColumnY, setSelectedColumnY] = useState("");

  const [calculo, setCalculo] = useState("frecuencias_completas");
  const [tipoIntervalo, setTipoIntervalo] = useState("semiabierto");
  const [metodoK, setMetodoK] = useState("sturges");
  const [kPersonalizado, setKPersonalizado] = useState("");
  const [percentilK, setPercentilK] = useState(50);

  const [metodoSeries, setMetodoSeries] = useState("movil_simple");
  const [periodosK, setPeriodosK] = useState(3);
  const [pesos, setPesos] = useState("0.5, 0.3, 0.2");
  const [alfa, setAlfa] = useState(0.2);

  const [subTemaIndices, setSubTemaIndices] = useState("compuestos");
  const [colPrecioBase, setColPrecioBase] = useState("");
  const [colCantidadBase, setColCantidadBase] = useState("");
  const [colPrecioActual, setColPrecioActual] = useState("");
  const [colCantidadActual, setColCantidadActual] = useState("");
  const [nuevoIndiceBase, setNuevoIndiceBase] = useState(100);

  const [errorNumerico, setErrorNumerico] = useState(false);
  const [resultado, setResultado] = useState(null);

  // 1. CARGA DESDE EL BACKEND
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

          if (headerRow.length > 0) {
            setSelectedColumn(headerRow[0]);
            setSelectedColumnY(headerRow.length > 1 ? headerRow[1] : headerRow[0]);
            setColPrecioBase(headerRow[0]);
            setColCantidadBase(headerRow.length > 1 ? headerRow[1] : headerRow[0]);
            setColPrecioActual(headerRow.length > 2 ? headerRow[2] : headerRow[0]);
            setColCantidadActual(headerRow.length > 3 ? headerRow[3] : headerRow[0]);
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

  useEffect(() => {
    if (columns.length > 0 && selectedColumnY === "") {
      setSelectedColumnY(columns.length > 1 ? columns[1] : columns[0]);
    }
    if (columns.length === 0 && variables.length > 0 && selectedColumn === "") {
      setSelectedColumn(variables[0].nombre);
    }
  }, [columns, selectedColumnY, variables]);

  // =========================================================================
  // 2. EL SÚPER CEREBRO DE VARIABLES (Arregla la tabla visual)
  // =========================================================================
  useEffect(() => {
    const selecciones = [
      selectedColumn, selectedColumnY,
      colPrecioBase, colCantidadBase, colPrecioActual, colCantidadActual
    ].filter(Boolean);

    const varsActivas = variables.filter(v => selecciones.includes(v.nombre));
    const colsOriginalesActivas = columns.filter(c => selecciones.includes(c));

    if (selecciones.length > 0) {
      // Calculamos hasta dónde llega la columna más larga para no cortar datos
      const maxLength = Math.max(
        ...varsActivas.map(v => v.datos ? v.datos.length : 0),
        colsOriginalesActivas.length > 0 ? exceldataoriginal.length : 0
      );

      const rowsParaGrid = [];
      for (let i = 0; i < maxLength; i++) {
        const row = {};
        varsActivas.forEach(v => {
          row[v.nombre] = (v.datos && v.datos[i] !== undefined) ? v.datos[i] : "";
        });
        colsOriginalesActivas.forEach(c => {
          row[c] = (exceldataoriginal[i] && exceldataoriginal[i][c] !== undefined) ? exceldataoriginal[i][c] : "";
        });
        rowsParaGrid.push(row);
      }
      setExcelData(rowsParaGrid);
    } else {
      setExcelData(exceldataoriginal);
    }
  }, [
    selectedColumn, selectedColumnY, colPrecioBase, colCantidadBase,
    colPrecioActual, colCantidadActual, exceldataoriginal, variables, columns
  ]);

  const handleChangeDato = (index, colName, value) => {
    const esNumero = !isNaN(Number(value)) && value.trim() !== "";
    const nuevoValor = esNumero ? Number(value) : value;

    const newData = [...excelData];
    if (newData[index]) {
      newData[index][colName] = nuevoValor;
      setExcelData(newData);
    }
  };

  // =========================================================================
  // 3. EXTRACCIÓN A PRUEBA DE BALAS (Arregla el error de cálculo nulo)
  // =========================================================================
  const obtenerColumna = (colName) => {
    if (!colName) return [];

    // Prioridad 1: Leer de la tabla en pantalla (si el usuario editó a mano)
    if (excelData.length > 0 && excelData[0][colName] !== undefined) {
      return excelData.map(row => row[colName]);
    }

    // Prioridad 2: Si la tabla tiene lag, sacar los datos directo de la Variable Capturada
    const vCapturada = variables.find(v => v.nombre === colName);
    if (vCapturada && vCapturada.datos) {
      return vCapturada.datos;
    }

    // Prioridad 3: Sacarlo del Excel crudo de la API
    if (exceldataoriginal.length > 0 && exceldataoriginal[0][colName] !== undefined) {
      return exceldataoriginal.map(row => row[colName]);
    }

    return [];
  };

  const ejecutarCalculo = () => {
    // === MULTIVARIANTE ===
    if (calculo === "distribucion_bivariada" || calculo === "distribucion_bivariada_avanzada") {
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

    // === REGRESIÓN ===
    if (calculo === "regresion_simple") {
      if (!selectedColumn || !selectedColumnY) return;
      const dataX = []; const dataY = [];
      const rawX = obtenerColumna(selectedColumn); const rawY = obtenerColumna(selectedColumnY);

      for (let i = 0; i < rawX.length; i++) {
        const nx = Number(rawX[i]); const ny = Number(rawY[i]);
        if (!isNaN(nx) && !isNaN(ny) && rawX[i] !== "" && rawY[i] !== "") {
          dataX.push(nx); dataY.push(ny);
        }
      }

      const tipos = ["lineal", "exponencial", "logaritmica", "potencial", "reciproco", "cuadratica", "cubica"];
      const comparativa = [];

      tipos.forEach(tipo => {
        const res = RegMath.calcularRegresionSimple(dataX, dataY, tipo);
        if (res) comparativa.push(res);
      });

      if (comparativa.length === 0) {
        setErrorNumerico(true); setResultado(null);
      } else {
        setErrorNumerico(false);
        comparativa.sort((a, b) => b.indicadores.r2 - a.indicadores.r2);
        setResultado({ tipo: "regresion", comparativa: comparativa });
      }
      return;
    }

    // === SERIES DE TIEMPO ===
    if (calculo === "series_tiempo") {
      if (!selectedColumn || !selectedColumnY) return;

      const rawX = obtenerColumna(selectedColumn);
      const rawY = obtenerColumna(selectedColumnY);
      const dataX = []; const dataY = [];

      for (let i = 0; i < rawX.length; i++) {
        const ny = Number(rawY[i]);
        if (!isNaN(ny) && rawY[i] !== "" && rawX[i] !== undefined && rawX[i] !== null) {
          dataX.push(String(rawX[i]));
          dataY.push(ny);
        }
      }

      if (dataY.length === 0) {
        setErrorNumerico(true); setResultado(null); return;
      }

      const configSeries = { k: periodosK, pesos: pesos, alfa: alfa };
      const resSeries = SeriesMath.calcularSeriesTiempo(dataX, dataY, metodoSeries, configSeries);

      setErrorNumerico(false);
      setResultado(resSeries);
      return;
    }

    // === NÚMEROS ÍNDICES ===
    if (calculo === "numeros_indices") {
      let resIndices = null;

      if (subTemaIndices === "compuestos") {
        if (!colPrecioBase || !colCantidadBase || !colPrecioActual || !colCantidadActual) return;

        const p0 = obtenerColumna(colPrecioBase).map(Number);
        const q0 = obtenerColumna(colCantidadBase).map(Number);
        const pt = obtenerColumna(colPrecioActual).map(Number);
        const qt = obtenerColumna(colCantidadActual).map(Number);

        if (p0.some(isNaN) || q0.some(isNaN) || pt.some(isNaN) || qt.some(isNaN)) {
          setErrorNumerico(true); setResultado(null); return;
        }
        resIndices = IndicesMath.calcularIndicesCompuestos(p0, q0, pt, qt);

      } else if (subTemaIndices === "empalme") {
        if (!selectedColumn || !selectedColumnY) return;

        const arrT = obtenerColumna(selectedColumn).map(String);
        const arrI = obtenerColumna(selectedColumnY).map(Number);

        if (arrI.some(isNaN) || arrI.length === 0) {
          setErrorNumerico(true); setResultado(null); return;
        }
        resIndices = IndicesMath.calcularOperacionesSerieIndices(arrT, arrI, Number(nuevoIndiceBase));

      } else if (subTemaIndices === "deflacion") {
        if (!selectedColumn || !selectedColumnY || !colPrecioBase) return;

        const arrT = obtenerColumna(selectedColumn).map(String);
        const arrNominal = obtenerColumna(selectedColumnY).map(Number);
        const arrIPC = obtenerColumna(colPrecioBase).map(Number);

        if (arrNominal.some(isNaN) || arrIPC.some(isNaN) || arrNominal.length === 0) {
          setErrorNumerico(true); setResultado(null); return;
        }
        resIndices = IndicesMath.calcularDeflacionSalarial(arrT, arrNominal, arrIPC);
      }

      if (!resIndices) {
        setErrorNumerico(true); setResultado(null);
      } else {
        setErrorNumerico(false); setResultado(resIndices);
      }
      return;
    }

    // === UNIDIMENSIONALES ===
    const datos = obtenerColumna(selectedColumn).map(Number).filter(v => !isNaN(v));

    if (datos.length === 0) {
      setErrorNumerico(true); setResultado(null); return;
    }
    setErrorNumerico(false);

    let res;
    const configData = { metodoK, kPersonalizado, tipoIntervalo };

    switch (calculo) {
      case "frecuencias_completas": res = UniMath.calcularFrecuencias(datos); break;
      case "distribucion_intervalos": res = UniMath.calcularDistribucionIntervalos(datos, configData); break;
      case "estadistica_descriptiva": res = UniMath.calcularDescriptivaTotal(datos); break;
      case "tendencia_central": {
        const tend = UniMath.calcularTendenciaCentral(datos, configData);
        if (Array.isArray(tend) && tend.length > 0) tend.pop();
        res = tend; break;
      }
      case "medidas_posicion": res = UniMath.calcularFractiles(datos, percentilK, configData); break;
      case "tendencia_y_posicion": {
        const tendenciaData = UniMath.calcularTendenciaCentral(datos, configData);
        const graficosData = Array.isArray(tendenciaData) ? tendenciaData.pop() : null;
        res = {
          tipo: "tendencia_y_posicion",
          tendencia: tendenciaData,
          posicion: UniMath.calcularFractiles(datos, percentilK, configData),
          datosPuros: [...datos].sort((a, b) => a - b),
          graficosTema3: graficosData,
        }; break;
      }
      case "variabilidad_y_forma": res = UniMath.calcularVariabilidadYForma(datos, configData); break;
      default: res = [];
    }
    setResultado(res);
  };

  useEffect(() => {
    if (selectedColumn) {
      ejecutarCalculo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    calculo, selectedColumn, selectedColumnY, tipoIntervalo, metodoK, kPersonalizado, percentilK,
    metodoSeries, periodosK, pesos, alfa,
    subTemaIndices, colPrecioBase, colCantidadBase, colPrecioActual, colCantidadActual, nuevoIndiceBase,
    excelData // 👈 CLAVE: Agregado para que escuche las ediciones manuales y la sincronización
  ]);

  return {
    excelData, columns, selectedColumn, setSelectedColumn, selectedColumnY, setSelectedColumnY,
    resultado, calculo, setCalculo, tipoIntervalo, setTipoIntervalo, metodoK, setMetodoK,
    kPersonalizado, setKPersonalizado, percentilK, setPercentilK, handleChangeDato, ejecutarCalculo, errorNumerico,
    metodoSeries, setMetodoSeries, periodosK, setPeriodosK, pesos, setPesos, alfa, setAlfa,
    subTemaIndices, setSubTemaIndices, colPrecioBase, setColPrecioBase, colCantidadBase, setColCantidadBase,
    colPrecioActual, setColPrecioActual, colCantidadActual, setColCantidadActual, nuevoIndiceBase, setNuevoIndiceBase
  };
}