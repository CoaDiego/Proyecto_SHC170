import { useState, useEffect } from "react";

import * as UniMath from "../utils/estadisticaUnidimensional";
import * as MultiMath from "../utils/estadisticaMultivariante";
import * as RegMath from "../utils/estadisticaRegresion";

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

    return { tipo: "bivariada", filas: nivelesX, columnas: nivelesY, datos: estructuraDatos, totalFilas: totalFilas };
  };

  const ejecutarCalculo = () => {
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

    // 👇 NUEVO PASE VIP: ANÁLISIS DE REGRESIÓN (Comparativa de 4 Modelos)
    if (calculo === "regresion_simple") {
      if (!selectedColumn || !selectedColumnY) return;
      
      const dataX = [];
      const dataY = [];
      const rawX = obtenerColumna(selectedColumn);
      const rawY = obtenerColumna(selectedColumnY);
      
      for(let i = 0; i < rawX.length; i++){
        const nx = Number(rawX[i]);
        const ny = Number(rawY[i]);
        if(!isNaN(nx) && !isNaN(ny) && rawX[i] !== "" && rawY[i] !== ""){
          dataX.push(nx);
          dataY.push(ny);
        }
      }
      
      // Calculamos todos los modelos a la vez
      const tipos = ["lineal", "exponencial", "logaritmica", "potencial"];
      const comparativa = [];

      tipos.forEach(tipo => {
        const res = RegMath.calcularRegresionSimple(dataX, dataY, tipo);
        if (res) comparativa.push(res); // Solo añadimos si el modelo fue exitoso
      });
      
      if (comparativa.length === 0) {
        setErrorNumerico(true); 
        setResultado(null);
      } else {
        setErrorNumerico(false);
        // Ordenamos del mejor al peor (Mayor R2 arriba)
        comparativa.sort((a, b) => b.indicadores.r2 - a.indicadores.r2);
        setResultado({ tipo: "regresion", comparativa: comparativa });
      }
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
      case "frecuencias_completas": res = UniMath.calcularFrecuencias(datos); break;
      case "distribucion_intervalos": res = UniMath.calcularDistribucionIntervalos(datos, configData); break;
      case "estadistica_descriptiva": res = UniMath.calcularDescriptivaTotal(datos); break;
      case "tendencia_central":
        const tendenciaSimple = UniMath.calcularTendenciaCentral(datos, configData);
        if (tendenciaSimple.length > 0) tendenciaSimple.pop();
        res = tendenciaSimple;
        break;
      case "medidas_posicion": res = UniMath.calcularFractiles(datos, percentilK, configData); break;
      case "tendencia_y_posicion":
        const tendenciaData = UniMath.calcularTendenciaCentral(datos, configData);
        const graficosData = tendenciaData.length > 0 ? tendenciaData.pop() : null;
        res = {
          tipo: "tendencia_y_posicion", tendencia: tendenciaData,
          posicion: UniMath.calcularFractiles(datos, percentilK, configData),
          datosPuros: [...datos].sort((a, b) => a - b), graficosTema3: graficosData,
        };
        break;
      case "variabilidad_y_forma": res = UniMath.calcularVariabilidadYForma(datos, configData); break;
      case "distribucion_bivariada":
        const datosX = excelData.map((f) => f[selectedColumn]); const datosY = excelData.map((f) => f[selectedColumnY]);
        if (datosX.length > 0 && datosY.length > 0) res = calcularBivariadaLocal(datosX, datosY);
        break;
      case "distribucion_bivariada_avanzada":
        const dX = excelData.map((f) => f[selectedColumn]); const dY = excelData.map((f) => f[selectedColumnY]);
        if (dX.length > 0 && dY.length > 0) res = calcularBivariadaAvanzadaLocal(dX, dY);
        break;
      default: res = [];
    }
    setResultado(res);
  };

  useEffect(() => {
    if (excelData && excelData.length > 0 && selectedColumn) ejecutarCalculo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculo, selectedColumn, selectedColumnY, tipoIntervalo, metodoK, kPersonalizado, percentilK]);

  return {
    excelData, columns, selectedColumn, resultado, calculo,
    tipoIntervalo, metodoK, kPersonalizado, selectedColumnY,
    setSelectedColumnY, percentilK, setPercentilK, setSelectedColumn,
    setCalculo, setTipoIntervalo, setMetodoK, setKPersonalizado,
    handleChangeDato, ejecutarCalculo, errorNumerico,
  };
}