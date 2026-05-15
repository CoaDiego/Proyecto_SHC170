import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import "react-data-grid/lib/styles.css";
import "../styles/pages/Calculos.css";

// --- IMPORTS DE SERVICIOS Y CONTEXTO ---
import { useCalculadoraExcel } from "../hooks/useCalculadoraExcel";
import { useData } from "../components/excel/DataContext";
import { api } from "../services/api";
import { alerta } from "../utils/Notificaciones";

// --- IMPORTS DE LOS 3 NUEVOS PANELES MODULARES ---
import ReportePDF from "../components/Resultados/ReportePDF";
import PanelResultados from "../components/Resultados/PanelResultados";
import PanelConfiguracion from "../components/Resultados/PanelConfiguracion"; // (O la ruta donde lo hayas guardado)

export default function Calculos() {
  const { variables, usuario } = useData();

  const [files, setFiles] = useState([]);
  const [ordenGraficos, setOrdenGraficos] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [mostrarTabla, _setMostrarTabla] = useState(true);
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false);
  const [filtroFractil, setFiltroFractil] = useState("Cuartil");
  const [panelAbierto, setPanelAbierto] = useState(true);
  const [modoCreacion, setModoCreacion] = useState(false);

  const {
    excelData, columns,
    selectedColumn, setSelectedColumn,
    selectedColumnY, setSelectedColumnY,
    resultado, calculo, setCalculo,
    tipoIntervalo, setTipoIntervalo,
    metodoK, setMetodoK, kPersonalizado, setKPersonalizado, percentilK, setPercentilK,
    handleChangeDato, ejecutarCalculo, errorNumerico,
    metodoSeries, setMetodoSeries, periodosK, setPeriodosK, pesos, setPesos, alfa, setAlfa,
    subTemaIndices, setSubTemaIndices,
    colPrecioBase, setColPrecioBase, colCantidadBase, setColCantidadBase,
    colPrecioActual, setColPrecioActual, colCantidadActual, setColCantidadActual,
    nuevoIndiceBase, setNuevoIndiceBase,
  } = useCalculadoraExcel(selectedFile, selectedSheet);

  const location = useLocation(); 
  const calculoPendiente = useRef(false);

  useEffect(() => {
    if (location.state) {
      const { archivoReabrir, calculoReabrir, colXReabrir, colYReabrir, hojaReabrir } = location.state;

      if (archivoReabrir) setSelectedFile(archivoReabrir);
      if (calculoReabrir) setCalculo(calculoReabrir);
      if (colXReabrir) setSelectedColumn(colXReabrir);
      if (colYReabrir) setSelectedColumnY(colYReabrir);
      if (hojaReabrir !== undefined) setSelectedSheet(hojaReabrir);

      if (archivoReabrir && calculoReabrir && colXReabrir) {
        calculoPendiente.current = true;
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state, setCalculo, setSelectedColumn, setSelectedColumnY]);

  useEffect(() => {
    if (calculoPendiente.current && excelData && excelData.length > 0) {
      const timer = setTimeout(() => {
        ejecutarCalculo();
        alerta.exito("Historial Cargado", "Se restauró el cálculo automáticamente.");
      }, 300); 

      calculoPendiente.current = false; 
      return () => clearTimeout(timer);
    }
  }, [excelData, ejecutarCalculo]); 

  const formatearCelda = (valor) => {
    if (typeof valor === "number") return Number.isInteger(valor) ? valor : Number(valor).toFixed(2);
    if (!isNaN(parseFloat(valor)) && isFinite(valor)) {
      const num = Number(valor);
      return Number.isInteger(num) ? num : num.toFixed(2);
    }
    return valor;
  };

  const cargarArchivos = async () => {
    if (!usuario) return;
    try {
      const data = await api.obtenerArchivos(usuario.nombre);
      if (data && data.files) setFiles(data.files);
    } catch (error) {
      console.error("Error al cargar archivos:", error);
    }
  };

  useEffect(() => {
    cargarArchivos();
  }, [usuario]);

  const handleGuardarResultado = async () => {
    if (!usuario) return;
    try {
      alerta.success("Guardando...", "Registrando cálculo y resultados (Snapshot).");
      const snapshotCompleto = {
        tipoIntervalo, metodoK, kPersonalizado, percentilK,
        metodoSeries, periodosK, pesos, alfa,
        subTemaIndices, colPrecioBase, colCantidadBase, colPrecioActual, colCantidadActual, nuevoIndiceBase,
        resultadoFinal: resultado 
      };

      await api.guardarEnHistorial(
        usuario.nombre, calculo, selectedFile, selectedColumn, selectedColumnY, selectedSheet, snapshotCompleto 
      );

      alerta.exito("¡Guardado Permanentemente!", "El cálculo completo está en el historial y no dependerá del Excel.");
    } catch (error) {
      console.error(error);
      alerta.error("Error", "No se pudo guardar el snapshot.");
    }
  };

  const esIntervalo = calculo === "distribucion_intervalos";
  const esUnidimensional = ["frecuencias_completas", "distribucion_intervalos", "estadistica_descriptiva", "tendencia_central", "medidas_posicion", "tendencia_y_posicion", "variabilidad_y_forma"].includes(calculo);
  const esBivariada = ["distribucion_bivariada", "distribucion_bivariada_avanzada"].includes(calculo);

  const handleGridChange = (newRows, { indexes, column }) => {
    indexes.forEach((index) => {
      handleChangeDato(index, column.key, newRows[index][column.key]);
    });
  };

  return (
    <div className={`calculadora-layout ${panelAbierto ? "" : "colapsado"}`} style={{ position: "relative" }}>
      
      {/* 1. EL PANEL IZQUIERDO (CONTROLES) */}
      <PanelConfiguracion
        panelAbierto={panelAbierto} setPanelAbierto={setPanelAbierto}
        files={files} selectedFile={selectedFile} setSelectedFile={setSelectedFile}
        usuario={usuario} setSelectedSheet={setSelectedSheet}
        columns={columns} variables={variables}
        calculo={calculo} setCalculo={setCalculo}
        subTemaIndices={subTemaIndices} setSubTemaIndices={setSubTemaIndices}
        colPrecioBase={colPrecioBase} setColPrecioBase={setColPrecioBase}
        colCantidadBase={colCantidadBase} setColCantidadBase={setColCantidadBase}
        colPrecioActual={colPrecioActual} setColPrecioActual={setColPrecioActual}
        colCantidadActual={colCantidadActual} setColCantidadActual={setColCantidadActual}
        nuevoIndiceBase={nuevoIndiceBase} setNuevoIndiceBase={setNuevoIndiceBase}
        selectedColumn={selectedColumn} setSelectedColumn={setSelectedColumn}
        selectedColumnY={selectedColumnY} setSelectedColumnY={setSelectedColumnY}
        esBivariada={esBivariada} esUnidimensional={esUnidimensional}
        metodoSeries={metodoSeries} setMetodoSeries={setMetodoSeries}
        periodosK={periodosK} setPeriodosK={setPeriodosK} pesos={pesos} setPesos={setPesos} alfa={alfa} setAlfa={setAlfa}
        tipoIntervalo={tipoIntervalo} setTipoIntervalo={setTipoIntervalo}
        metodoK={metodoK} setMetodoK={setMetodoK} kPersonalizado={kPersonalizado} setKPersonalizado={setKPersonalizado} percentilK={percentilK} setPercentilK={setPercentilK}
        mostrarTabla={mostrarTabla} excelData={excelData} handleGridChange={handleGridChange}
        ejecutarCalculo={ejecutarCalculo} modoCreacion={modoCreacion} setModoCreacion={setModoCreacion}
        mostrarCalculadora={mostrarCalculadora} setMostrarCalculadora={setMostrarCalculadora}
      />

      {/* 2. EL PANEL DERECHO (TABLAS Y GRÁFICOS) */}
      <PanelResultados 
        modoCreacion={modoCreacion} setModoCreacion={setModoCreacion} cargarArchivos={cargarArchivos}
        resultado={resultado} errorNumerico={errorNumerico} calculo={calculo}
        esBivariada={esBivariada} esUnidimensional={esUnidimensional} esIntervalo={esIntervalo}
        formatearCelda={formatearCelda} filtroFractil={filtroFractil} setFiltroFractil={setFiltroFractil}
        ordenGraficos={ordenGraficos} setOrdenGraficos={setOrdenGraficos}
        handleGuardarResultado={handleGuardarResultado}
      />

      {/* 3. EL REPORTE INVISIBLE (PDF) */}
      <ReportePDF 
        usuario={usuario} calculo={calculo} selectedFile={selectedFile} selectedSheet={selectedSheet} selectedColumn={selectedColumn}
        resultado={resultado} esBivariada={esBivariada} esUnidimensional={esUnidimensional} esIntervalo={esIntervalo}
        formatearCelda={formatearCelda} filtroFractil={filtroFractil} setFiltroFractil={setFiltroFractil}
        ordenGraficos={ordenGraficos}
        parametros={{
          tipoIntervalo, metodoK, kPersonalizado, percentilK,
          metodoSeries, periodosK, pesos, alfa,
          subTemaIndices, colPrecioBase, colCantidadBase, nuevoIndiceBase
        }}
      />
    </div>
  );
}