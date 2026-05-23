import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import "react-data-grid/lib/styles.css";
import "../styles/pages/Calculos.css";

// --- IMPORTS DE SERVICIOS Y CONTEXTO ---
import { useCalculadoraExcel } from "../hooks/useCalculadoraExcel";
import { useModuleData } from "../components/excel/DataContext";
import { api } from "../services/api";
import { alerta } from "../utils/Notificaciones";

// --- IMPORTS DE LOS PANELES MODULARES ---
import ReportePDF from "../components/Resultados/ReportePDF";
import PanelResultados from "../components/Resultados/PanelResultados";
import PanelConfiguracion from "../components/Resultados/PanelConfiguracion";

export default function Calculos() {
  const { variables, usuario } = useModuleData();
  const location = useLocation();

  const [files, setFiles] = useState([]);
  const [ordenGraficos, setOrdenGraficos] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [mostrarTabla, _setMostrarTabla] = useState(true);
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false);
  const [filtroFractil, setFiltroFractil] = useState("Cuartil");
  const [panelAbierto, setPanelAbierto] = useState(true);
  const [modoCreacion, setModoCreacion] = useState(false);

  // 1. ESTADO DEL HISTORIAL
  const snapshotInicial = location.state?.snapshot?.datosSnapshot || null;
  const [datosHistorial, setDatosHistorial] = useState(snapshotInicial);

  const {
    excelData, columns, selectedColumn, setSelectedColumn, selectedColumnY, setSelectedColumnY,
    resultado, calculo, setCalculo, tipoIntervalo, setTipoIntervalo, metodoK, setMetodoK,
    kPersonalizado, setKPersonalizado, percentilK, setPercentilK, handleChangeDato, ejecutarCalculo, errorNumerico,
    metodoSeries, setMetodoSeries, periodosK, setPeriodosK, pesos, setPesos, alfa, setAlfa,
    subTemaIndices, setSubTemaIndices, colPrecioBase, setColPrecioBase, colCantidadBase, setColCantidadBase,
    colPrecioActual, setColPrecioActual, colCantidadActual, setColCantidadActual, nuevoIndiceBase, setNuevoIndiceBase,
  } = useCalculadoraExcel(selectedFile, selectedSheet, datosHistorial);


  // 🚀 2. EL BLINDAJE: Memoria interna para detectar cambios REALES
  const estadosActuales = useRef({
    archivo: selectedFile,
    hoja: selectedSheet,
    colX: selectedColumn,
    colY: selectedColumnY
  });

  // Mantenemos la memoria actualizada de forma silenciosa
  useEffect(() => {
    estadosActuales.current = { archivo: selectedFile, hoja: selectedSheet, colX: selectedColumn, colY: selectedColumnY };
  }, [selectedFile, selectedSheet, selectedColumn, selectedColumnY]);

  // Funciones protegidas: Solo rompen el historial si el usuario ELIGE algo diferente
  const handleCambioArchivo = useCallback((e) => {
    const valor = e?.target?.value !== undefined ? e.target.value : e;
    if (valor !== estadosActuales.current.archivo) {
      setSelectedFile(valor);
      setDatosHistorial(null); 
    }
  }, []);

  const handleCambioHoja = useCallback((e) => {
    const valor = e?.target?.value !== undefined ? e.target.value : e;
    if (valor !== "" && valor !== undefined) {
      const numValor = Number(valor);
      if (numValor !== estadosActuales.current.hoja) {
        setSelectedSheet(numValor);
        setDatosHistorial(null);
      }
    }
  }, []);

  const handleCambioColX = useCallback((e) => {
    const valor = e?.target?.value !== undefined ? e.target.value : e;
    if (valor !== estadosActuales.current.colX) {
      setSelectedColumn(valor);
      setDatosHistorial(null);
    }
  }, [setSelectedColumn]);

  const handleCambioColY = useCallback((e) => {
    const valor = e?.target?.value !== undefined ? e.target.value : e;
    if (valor !== estadosActuales.current.colY) {
      setSelectedColumnY(valor);
      setDatosHistorial(null);
    }
  }, [setSelectedColumnY]);

  const salirModoHistorialManual = () => setDatosHistorial(null);
  
  // --- RESTO DEL CÓDIGO INTACTO ---
  const calculoPendiente = useRef(false);

  useEffect(() => {
    if (location.state && location.state.snapshot && !calculoPendiente.current) {
      const { archivoReabrir, calculoReabrir, snapshot } = location.state;
      if (archivoReabrir) setSelectedFile(archivoReabrir);
      if (calculoReabrir) setCalculo(calculoReabrir);

      if (snapshot.configuracion) {
        const conf = snapshot.configuracion;
        
        // Restaurar Columnas
        if (conf.columnasSeleccionadas && conf.columnasSeleccionadas.x) {
          setSelectedColumn(conf.columnasSeleccionadas.x);
          setSelectedColumnY(conf.columnasSeleccionadas.y || "");
        }
        
        // Restaurar Parámetros Tema 2, 3 y 4
        if (conf.tipoIntervalo) setTipoIntervalo(conf.tipoIntervalo);
        if (conf.metodoK) setMetodoK(conf.metodoK);
        if (conf.kPersonalizado) setKPersonalizado(conf.kPersonalizado);
        if (conf.percentilK) setPercentilK(conf.percentilK); // 👈 TEMA 3: PERCENTILES
        
        // Restaurar Parámetros Series de Tiempo
        if (conf.metodoSeries) setMetodoSeries(conf.metodoSeries);
        if (conf.periodosK) setPeriodosK(conf.periodosK);
        if (conf.pesos) setPesos(conf.pesos);
        if (conf.alfa) setAlfa(conf.alfa);

        // 👈 TEMA 8: NÚMEROS ÍNDICES COMPLETO
        if (conf.subTemaIndices) setSubTemaIndices(conf.subTemaIndices);
        if (conf.colPrecioBase) setColPrecioBase(conf.colPrecioBase);
        if (conf.colCantidadBase) setColCantidadBase(conf.colCantidadBase);
        if (conf.colPrecioActual) setColPrecioActual(conf.colPrecioActual);
        if (conf.colCantidadActual) setColCantidadActual(conf.colCantidadActual);
        if (conf.nuevoIndiceBase) setNuevoIndiceBase(conf.nuevoIndiceBase);
      }
      calculoPendiente.current = true;
      window.history.replaceState({}, document.title);
    }
  }, [
    location.state, setCalculo, setSelectedColumn, setSelectedColumnY, 
    setTipoIntervalo, setMetodoK, setKPersonalizado, setPercentilK, 
    setMetodoSeries, setPeriodosK, setPesos, setAlfa, 
    setSubTemaIndices, setColPrecioBase, setColCantidadBase, setColPrecioActual, setColCantidadActual, setNuevoIndiceBase
  ]);

  useEffect(() => {
    if (calculoPendiente.current && excelData && excelData.length > 0) {
      const timer = setTimeout(() => {
        ejecutarCalculo();
        alerta.exito("Historial Cargado", "Se restauró el cálculo guardado.");
      }, 400);
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
      const snapshotCompleto = {
        datosSnapshot: excelData,
        configuracion: {
          calculo, tipoIntervalo, metodoK, kPersonalizado, percentilK,
          metodoSeries, periodosK, pesos, alfa, subTemaIndices,
          colPrecioBase, colCantidadBase, colPrecioActual, colCantidadActual, nuevoIndiceBase,
          columnasSeleccionadas: { x: selectedColumn, y: selectedColumnY },
        },
        resultadoFinal: resultado,
      };
      await api.guardarEnHistorial(usuario.nombre, calculo, selectedFile, snapshotCompleto);
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
     {datosHistorial && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 50, background: "#f59e0b", color: "#fff", 
          padding: "8px 15px", display: "flex", justifyContent: "space-between", alignItems: "center",
          fontWeight: "bold", fontSize: "0.9rem", boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
        }}>
          <span>⏱️ Viendo cálculo del historial (Modo Congelado).</span>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button 
              onClick={salirModoHistorialManual} 
              style={{ background: "#b45309", border: "none", color: "white", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
              title="Volver a conectarse con el servidor para usar otros datos"
            >
              Volver a Calculadora Normal
            </button>
            <button 
              onClick={salirModoHistorialManual} 
              style={{ background: "transparent", border: "none", color: "white", fontSize: "1.2rem", cursor: "pointer", padding: "0 5px" }}
              title="Cerrar vista de historial"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      <PanelConfiguracion
        panelAbierto={panelAbierto} setPanelAbierto={setPanelAbierto}
        files={files} 
        selectedFile={selectedFile} setSelectedFile={handleCambioArchivo}
        selectedSheet={selectedSheet} setSelectedSheet={handleCambioHoja}
        selectedColumn={selectedColumn} setSelectedColumn={handleCambioColX}
        selectedColumnY={selectedColumnY} setSelectedColumnY={handleCambioColY}
        usuario={usuario} columns={columns} variables={variables}
        calculo={calculo} setCalculo={setCalculo}
        subTemaIndices={subTemaIndices} setSubTemaIndices={setSubTemaIndices}
        colPrecioBase={colPrecioBase} setColPrecioBase={setColPrecioBase}
        colCantidadBase={colCantidadBase} setColCantidadBase={setColCantidadBase}
        colPrecioActual={colPrecioActual} setColPrecioActual={setColPrecioActual}
        colCantidadActual={colCantidadActual} setColCantidadActual={setColCantidadActual}
        nuevoIndiceBase={nuevoIndiceBase} setNuevoIndiceBase={setNuevoIndiceBase}
        esBivariada={esBivariada} esUnidimensional={esUnidimensional}
        metodoSeries={metodoSeries} setMetodoSeries={setMetodoSeries}
        periodosK={periodosK} setPeriodosK={setPeriodosK} pesos={pesos} setPesos={setPesos} alfa={alfa} setAlfa={setAlfa}
        tipoIntervalo={tipoIntervalo} setTipoIntervalo={setTipoIntervalo}
        metodoK={metodoK} setMetodoK={setMetodoK} kPersonalizado={kPersonalizado} setKPersonalizado={setKPersonalizado} percentilK={percentilK} setPercentilK={setPercentilK}
        mostrarTabla={mostrarTabla} excelData={excelData} handleGridChange={handleGridChange}
        ejecutarCalculo={ejecutarCalculo} modoCreacion={modoCreacion} setModoCreacion={setModoCreacion}
        mostrarCalculadora={mostrarCalculadora} setMostrarCalculadora={setMostrarCalculadora}
      />

      <PanelResultados
        modoCreacion={modoCreacion} setModoCreacion={setModoCreacion} cargarArchivos={cargarArchivos}
        resultado={resultado} errorNumerico={errorNumerico} calculo={calculo}
        esBivariada={esBivariada} esUnidimensional={esUnidimensional} esIntervalo={esIntervalo}
        formatearCelda={formatearCelda} filtroFractil={filtroFractil} setFiltroFractil={setFiltroFractil}
        ordenGraficos={ordenGraficos} setOrdenGraficos={setOrdenGraficos}
        handleGuardarResultado={handleGuardarResultado}
      />

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

