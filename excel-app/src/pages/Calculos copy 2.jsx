import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import "react-data-grid/lib/styles.css";
import "../styles/pages/Calculos.css";

// --- IMPORTS DE SERVICIOS Y CONTEXTO ---
import { useCalculadoraExcel } from "../hooks/useCalculadoraExcel";
import { useModuleData } from "../components/excel/DataContext";
import { api } from "../services/api";
import { alerta } from "../utils/Notificaciones";

// --- IMPORTS DE LOS 3 NUEVOS PANELES MODULARES ---
import ReportePDF from "../components/Resultados/ReportePDF";
import PanelResultados from "../components/Resultados/PanelResultados";
import PanelConfiguracion from "../components/Resultados/PanelConfiguracion";

export default function Calculos() {
  const { variables, usuario } = useModuleData();
  const location = useLocation(); // 👈 Capturamos la ruta primero

  const [files, setFiles] = useState([]);
  const [ordenGraficos, setOrdenGraficos] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [mostrarTabla, _setMostrarTabla] = useState(true);
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false);
  const [filtroFractil, setFiltroFractil] = useState("Cuartil");
  const [panelAbierto, setPanelAbierto] = useState(true);
  const [modoCreacion, setModoCreacion] = useState(false);

  // 🚀 1. EXTRAEMOS EL SNAPSHOT SI VENIMOS DEL HISTORIAL
  const snapshotRecibido = location.state?.snapshot || null;

  // 🚀 2. LE PASAMOS EL SNAPSHOT AL HOOK DIRECTAMENTE AQUÍ
  const {
    excelData, columns, selectedColumn, setSelectedColumn, selectedColumnY, setSelectedColumnY,
    resultado, calculo, setCalculo, tipoIntervalo, setTipoIntervalo, metodoK, setMetodoK,
    kPersonalizado, setKPersonalizado, percentilK, setPercentilK, handleChangeDato, ejecutarCalculo, errorNumerico,
    metodoSeries, setMetodoSeries, periodosK, setPeriodosK, pesos, setPesos, alfa, setAlfa,
    subTemaIndices, setSubTemaIndices, colPrecioBase, setColPrecioBase, colCantidadBase, setColCantidadBase,
    colPrecioActual, setColPrecioActual, colCantidadActual, setColCantidadActual, nuevoIndiceBase, setNuevoIndiceBase,
  } = useCalculadoraExcel(selectedFile, selectedSheet, snapshotRecibido); // 👈 ¡Tercer parámetro añadido!

  const calculoPendiente = useRef(false);

  // 🚀 3. NUEVO EFECTO DE REAPERTURA (Limpio y directo)
  useEffect(() => {
    if (location.state && location.state.snapshot) {
      const { archivoReabrir, calculoReabrir, snapshot } = location.state;
      
      console.log("REABRIENDO DESDE HISTORIAL:", { archivoReabrir, calculoReabrir, snapshot });

      if (archivoReabrir) setSelectedFile(archivoReabrir);
      if (calculoReabrir) setCalculo(calculoReabrir);

      // Restauramos las columnas que se usaron en ese cálculo
      if (snapshot.configuracion && snapshot.configuracion.columnasSeleccionadas) {
        setSelectedColumn(snapshot.configuracion.columnasSeleccionadas.x);
        setSelectedColumnY(snapshot.configuracion.columnasSeleccionadas.y);
      }

      calculoPendiente.current = true;
      // Limpiamos la URL para no reabrir si recarga la página
      window.history.replaceState({}, document.title);
    }
  }, [location.state, setCalculo, setSelectedColumn, setSelectedColumnY]);

  // Se encarga de forzar el cálculo una vez que los datos del snapshot cargaron
  useEffect(() => {
    if (calculoPendiente.current && excelData && excelData.length > 0) {
      const timer = setTimeout(() => {
        ejecutarCalculo();
        alerta.exito("Historial Cargado", "Se restauró el cálculo guardado.");
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

  // 🚀 4. FUNCIÓN DE GUARDAR (CON EL CONSOLE.LOG INCLUIDO)
  const handleGuardarResultado = async () => {
    if (!usuario) return;
    try {
      const snapshotCompleto = {
        datosSnapshot: excelData,
        configuracion: {
          calculo, tipoIntervalo, metodoK, kPersonalizado, percentilK,
          metodoSeries, periodosK, pesos, alfa, subTemaIndices,
          colPrecioBase, colCantidadBase, colPrecioActual, colCantidadActual, nuevoIndiceBase,
          columnasSeleccionadas: { x: selectedColumn, y: selectedColumnY } 
        },
        resultadoFinal: resultado,
      };

      // 👀 AQUÍ VERÁS QUÉ SE ESTÁ GUARDANDO EXACTAMENTE
      console.log("GUARDANDO ESTE SNAPSHOT:", snapshotCompleto);

      await api.guardarEnHistorial(
        usuario.nombre,
        calculo,
        selectedFile,
        snapshotCompleto
      );
      
      alerta.exito("¡Guardado Permanentemente!", "El cálculo completo está en el historial.");
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
        parametros={{ tipoIntervalo, metodoK, kPersonalizado, percentilK, metodoSeries, periodosK, pesos, alfa, subTemaIndices, colPrecioBase, colCantidadBase, nuevoIndiceBase }}
      />
    </div>
  );
}