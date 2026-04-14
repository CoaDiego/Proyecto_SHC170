import { useState, useEffect } from "react";

import * as UniMath from "../utils/estadisticaUnidimensional";
import * as MultiMath from "../utils/estadisticaMultivariante";
import * as RegMath from "../utils/estadisticaRegresion";

import * as SeriesMath from "../utils/estadisticaSeriesTiempo";

import { api } from "../services/api";

export function useCalculadoraExcel(filename, sheet) {
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

  const [errorNumerico, setErrorNumerico] = useState(false);
  const [resultado, setResultado] = useState(null);

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

          if (headerRow.length > 0) {
            setSelectedColumn(headerRow[0]);
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

  useEffect(() => {
    if (columns.length > 0 && selectedColumnY === "") {
      const defaultY = columns.length > 1 ? columns[1] : columns[0];
      setSelectedColumnY(defaultY);
    }
  }, [columns, selectedColumnY]);

  const handleChangeDato = (index, colName, value) => {
    const newData = [...excelData];
    const esNumero = !isNaN(Number(value)) && value.trim() !== "";
    newData[index][colName] = esNumero ? Number(value) : value;
    setExcelData(newData);
  };

  const obtenerColumna = (colName) => {
    if (!colName) return [];
    return excelData.map((row) => row[colName]);
  };

  const obtenerDatosNumericos = () => {
    return excelData
      .map((row) => row[selectedColumn])
      .filter((v) => v !== null && v !== undefined && v !== "")
      .map((v) => Number(v))
      .filter((v) => !isNaN(v));
  };

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
      filas: nivelesX,
      columnas: nivelesY,
      datos: estructuraDatos,
      totalFilas: totalFilas,
    };
  };

  const ejecutarCalculo = () => {
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

    /// 👇 C) PASE VIP 3: SERIES DE TIEMPO (Tema 7) - VERSIÓN ESTABLE
    if (calculo === "series_tiempo") {
      if (!selectedColumn || !selectedColumnY) return;
      
      const rawX = obtenerColumna(selectedColumn); 
      const rawY = obtenerColumna(selectedColumnY); 
      
      const dataX = [];
      const dataY = [];
      
      for(let i = 0; i < rawX.length; i++){
        const ny = Number(rawY[i]);
        if(!isNaN(ny) && rawY[i] !== "" && rawX[i] !== undefined && rawX[i] !== null){
          dataX.push(String(rawX[i])); 
          dataY.push(ny);
        }
      }
      
      if (dataY.length === 0) {
        setErrorNumerico(true);
        setResultado(null);
        return;
      }
      
      const configSeries = { k: periodosK, pesos: pesos, alfa: alfa };
      const resSeries = SeriesMath.calcularSeriesTiempo(dataX, dataY, metodoSeries, configSeries);
      
      setErrorNumerico(false);
      setResultado(resSeries);
      return;
    }

    const datos = obtenerDatosNumericos();
    if (datos.length === 0) {
      setErrorNumerico(true);
      setResultado(null);
      return;
    }
    setErrorNumerico(false);

    let res;
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
        const tendenciaSimple = UniMath.calcularTendenciaCentral(
          datos,
          configData,
        );
        if (tendenciaSimple.length > 0) tendenciaSimple.pop();
        res = tendenciaSimple;
        break;
      case "medidas_posicion":
        res = UniMath.calcularFractiles(datos, percentilK, configData);
        break;
      case "tendencia_y_posicion":
        const tendenciaData = UniMath.calcularTendenciaCentral(
          datos,
          configData,
        );
        const graficosData =
          tendenciaData.length > 0 ? tendenciaData.pop() : null;
        res = {
          tipo: "tendencia_y_posicion",
          tendencia: tendenciaData,
          posicion: UniMath.calcularFractiles(datos, percentilK, configData),
          datosPuros: [...datos].sort((a, b) => a - b),
          graficosTema3: graficosData,
        };
        break;
      case "variabilidad_y_forma":
        res = UniMath.calcularVariabilidadYForma(datos, configData);
        break;
      case "distribucion_bivariada":
        const datosX = excelData.map((f) => f[selectedColumn]);
        const datosY = excelData.map((f) => f[selectedColumnY]);
        if (datosX.length > 0 && datosY.length > 0)
          res = calcularBivariadaLocal(datosX, datosY);
        break;
      case "distribucion_bivariada_avanzada":
        const dX = excelData.map((f) => f[selectedColumn]);
        const dY = excelData.map((f) => f[selectedColumnY]);
        if (dX.length > 0 && dY.length > 0)
          res = calcularBivariadaAvanzadaLocal(dX, dY);
        break;
      default:
        res = [];
    }
    setResultado(res);
  };

  useEffect(() => {
    if (excelData && excelData.length > 0 && selectedColumn) ejecutarCalculo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    calculo,
    selectedColumn,
    selectedColumnY,
    tipoIntervalo,
    metodoK,
    kPersonalizado,
    percentilK,
    metodoSeries,
    periodosK,
    pesos,
    alfa,
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
    setSelectedColumnY,
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
    metodoSeries,
    setMetodoSeries,
    periodosK,
    setPeriodosK,
    pesos,
    setPesos,
    alfa,
    setAlfa,
  };
}
