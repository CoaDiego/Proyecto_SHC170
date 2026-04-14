import { useEffect, useState } from "react";
import { DataGrid } from "react-data-grid";
import "react-data-grid/lib/styles.css";

// --- IMPORTS ---
import Calculator from "../components/excel/Calculator";
import ExcelContent from "../components/excel/ExcelContent";
import TablaDinamica from "../components/excel/TablaDinamica";
import { useCalculadoraExcel } from "../hooks/useCalculadoraExcel";

import TablasBivariantes from "../components/resultados/TablasBivariantes";
import TablasUnidimensionales from "../components/resultados/TablasUnidimensionales";
import PanelGraficos from "../components/resultados/PanelGraficos";

import TablaRegresion from "../components/resultados/TablaRegresion";
import TablaSeriesTiempo from "../components/resultados/TablaSeriesTiempo";

import { api } from "../services/api";

import "../styles/pages/Calculadora.css";

function textEditor({ row, column, onRowChange, onClose }) {
  return (
    <input
      className="editor_text"
      autoFocus
      value={row[column.key]}
      onChange={(e) => onRowChange({ ...row, [column.key]: e.target.value })}
      onBlur={() => onClose(true)}
      onKeyDown={(e) => {
        if (
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight" ||
          e.key === "ArrowUp" ||
          e.key === "ArrowDown"
        ) {
          e.stopPropagation();
        }
      }}
    />
  );
}

export default function Calculadora() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [mostrarTablasCalculo, setMostrarTablasCalculo] = useState(false);

  const [modoCreacion, setModoCreacion] = useState(false);
  const [mostrarTabla, _setMostrarTabla] = useState(true);
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false);
  const [filtroFractil, setFiltroFractil] = useState("Cuartil");
  const [panelAbierto, setPanelAbierto] = useState(true);

  const {
    excelData,
    columns,
    selectedColumn,
    setSelectedColumn,
    selectedColumnY,
    setSelectedColumnY,
    resultado,
    calculo,
    tipoIntervalo,
    metodoK,
    kPersonalizado,
    percentilK,
    setPercentilK,

    // 👇 IMPORTAMOS ESTADOS TEMA 7
    metodoSeries,
    setMetodoSeries,
    periodosK,
    setPeriodosK,
    pesos,
    setPesos,
    alfa,
    setAlfa,

    setCalculo,
    setTipoIntervalo,
    setMetodoK,
    setKPersonalizado,
    handleChangeDato,
    ejecutarCalculo,
    errorNumerico,
  } = useCalculadoraExcel(selectedFile, selectedSheet);

  const formatearCelda = (valor) => {
    if (typeof valor === "number")
      return Number.isInteger(valor) ? valor : Number(valor).toFixed(2);
    if (!isNaN(parseFloat(valor)) && isFinite(valor)) {
      const num = Number(valor);
      return Number.isInteger(num) ? num : num.toFixed(2);
    }
    return valor;
  };

  const cargarArchivos = async () => {
    try {
      const data = await api.obtenerArchivos();
      if (data && data.files) {
        setFiles(data.files);
        if (data.files.length > 0 && !selectedFile)
          setSelectedFile(data.files[0].filename);
      }
    } catch (error) {
      console.error("Error al cargar archivos:", error);
    }
  };

  useEffect(() => {
    cargarArchivos();
  }, []);

  const esIntervalo = calculo === "distribucion_intervalos";

  const esUnidimensional = [
    "frecuencias_completas",
    "distribucion_intervalos",
    "estadistica_descriptiva",
    "tendencia_central",
    "medidas_posicion",
    "tendencia_y_posicion",
    "variabilidad_y_forma",
  ].includes(calculo);
  const esBivariada = [
    "distribucion_bivariada",
    "distribucion_bivariada_avanzada",
  ].includes(calculo);

  const rdgColumns = [];

  // 1. Configuramos la columna X (Si existe y no es AUTO_INDEX)
  if (selectedColumn && selectedColumn !== "AUTO_INDEX") {
    // Verificamos que la columna realmente exista en los datos del Excel
    if (columns.includes(selectedColumn)) {
      rdgColumns.push({
        key: selectedColumn,
        name: `${selectedColumn} (Var X)`,
        renderEditCell: textEditor,
        editable: true,
        resizable: true,
        width: "50%",
        cellClass: "celda-editable",
      });
    }
  }

  // 2. Configuramos la columna Y (Para temas bivariantes/regresión/series)
  const usaDosVariables = [
    "distribucion_bivariada",
    "distribucion_bivariada_avanzada",
    "regresion_simple",
    "series_tiempo",
  ].includes(calculo);

  if (usaDosVariables && selectedColumnY) {
    // Si X es distinto de Y (o si X es AUTO_INDEX, solo dibujamos Y)
    if (selectedColumn !== selectedColumnY || selectedColumn === "AUTO_INDEX") {
      if (columns.includes(selectedColumnY)) {
        rdgColumns.push({
          key: selectedColumnY,
          name: `${selectedColumnY} (Var Y)`,
          renderEditCell: textEditor,
          editable: true,
          resizable: true,
          width: "50%",
          cellClass: "celda-editable-y",
        });
      }
    }
  }

  const handleGridChange = (newRows, { indexes, column }) => {
    indexes.forEach((index) => {
      const row = newRows[index];
      const colKey = column.key;
      const newValue = row[colKey];
      handleChangeDato(index, colKey, newValue);
    });
  };

  return (
    <div
      className={`calculadora-layout ${panelAbierto ? "" : "colapsado"}`}
      style={{ position: "relative" }}
    >
      <button
        onClick={() => setPanelAbierto(!panelAbierto)}
        className={`boton-toggle-medio ${panelAbierto ? "abierto" : "cerrado"}`}
        title={panelAbierto ? "Ocultar panel" : "Mostrar panel"}
      >
        <span className="icono-animado"></span>
      </button>

      {/* ================= IZQUIERDA: CONTROLES ================= */}
      <div className="calculadora-datos">
        <div
          style={{
            borderBottom: panelAbierto
              ? "1px solid var(--border-color)"
              : "none",
            paddingBottom: "5px",
            marginBottom: panelAbierto ? "5px" : "0",
          }}
        >
          {panelAbierto && <h3 style={{ margin: 0 }}> Datos </h3>}
        </div>

        {panelAbierto && (
          <>
            <label className="etiqueta">Selecciona un archivo:</label>
            <select
              value={selectedFile}
              onChange={(e) => {
                setSelectedFile(e.target.value);
                setModoCreacion(false);
              }}
              className="selector-archivo"
            >
              {files.map((file) => (
                <option key={file.filename} value={file.filename}>
                  {file.filename} ({file.author || "Desconocido"})
                </option>
              ))}
            </select>

            <ExcelContent
              filename={selectedFile}
              mostrarTabla={false}
              onSheetChange={setSelectedSheet}
            />
            <div className="panel-controles-excel">
              <h3 className="panel-controles-excel_h3">Calculadora de Excel</h3>

              {columns.length > 0 ? (
                <>
                  <label>Operación:</label>
                  <select
                    value={calculo}
                    onChange={(e) => setCalculo(e.target.value)}
                    className="container_operaciones "
                  >
                    <optgroup label="Tema 2: Distribución de Frecuencias">
                      <option value="frecuencias_completas">
                        Tabla de Frecuencias
                      </option>
                      <option value="distribucion_intervalos">
                        Distribución por Intervalos
                      </option>
                    </optgroup>
                    <optgroup label="Tema 3: Medidas de Tendencia y Posición">
                      <option value="tendencia_central">
                        Medidas de Tendencia Central
                      </option>
                      <option value="medidas_posicion">
                        Medidas de Posición (Fractiles)
                      </option>
                      <option value="tendencia_y_posicion">
                        Medidas de Tendencia y Posición (Conjunto)
                      </option>
                    </optgroup>
                    <optgroup label="Tema 4: Medidas de Dispersión y Forma">
                      <option value="variabilidad_y_forma">
                        Análisis de Variabilidad y Forma
                      </option>
                    </optgroup>
                    <optgroup label="Tema 5: Distribuciones Bivariantes">
                      <option value="distribucion_bivariada">
                        Distribución Bivariante
                      </option>
                      <option value="distribucion_bivariada_avanzada">
                        Análisis Bivariante Avanzado
                      </option>
                    </optgroup>
                    <optgroup label="Tema 6: Regresión y Predicción">
                      <option value="regresion_simple">
                        Análisis de Regresión (Modelos)
                      </option>
                    </optgroup>
                    {/* 👇 TEMA 7 AL MENÚ */}
                    <optgroup label="Tema 7: Series Cronológicas">
                      <option value="series_tiempo">
                        Análisis de Series de Tiempo
                      </option>
                    </optgroup>
                  </select>

                  {/* Etiquetas dinámicas para Eje X */}
                  <label>
                    {calculo === "series_tiempo"
                      ? "Eje de Tiempo X (Periodos/Meses):"
                      : calculo === "distribucion_bivariada" ||
                          calculo === "distribucion_bivariada_avanzada" ||
                          calculo === "regresion_simple"
                        ? "Variable X (Independiente):"
                        : "Columna Seleccionada:"}
                  </label>
                  <select
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                    style={{ width: "100%", marginBottom: "10px" }}
                  >
                    {calculo === "series_tiempo" && (
                      <option value="AUTO_INDEX">
                        -- Generar Automáticamente (1, 2, 3...) --
                      </option>
                    )}
                    {columns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                  {/* Etiquetas dinámicas para Eje Y */}
                  {(calculo === "distribucion_bivariada" ||
                    calculo === "distribucion_bivariada_avanzada" ||
                    calculo === "regresion_simple" ||
                    calculo === "series_tiempo") && ( // <-- Añadido series_tiempo
                    <div
                      style={{
                        padding: "10px",
                        border: "1px solid var(--border-color)",
                        borderRadius: "4px",
                        marginBottom: "15px",
                        backgroundColor: "var(--bg-card)",
                      }}
                    >
                      <label
                        style={{
                          display: "block",
                          marginBottom: "5px",
                          fontWeight: "bold",
                        }}
                      >
                        {calculo === "series_tiempo"
                          ? "Valores Históricos Y (Demanda/Ventas):"
                          : "Variable Y (Dependiente):"}
                      </label>
                      <select
                        value={selectedColumnY}
                        onChange={(e) => setSelectedColumnY(e.target.value)}
                        style={{ width: "100%", padding: "5px" }}
                      >
                        <option value="">-- Seleccionar Variable Y --</option>
                        {columns.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* 👇 CONTROLES TEMA 7 👇 */}
                  {calculo === "series_tiempo" && (
                    <div
                      className="container_intervalos"
                      style={{
                        padding: "10px",
                        backgroundColor: "var(--bg-card)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "4px",
                        marginBottom: "15px",
                      }}
                    >
                      <label
                        style={{
                          fontWeight: "bold",
                          color: "var(--primary-color)",
                        }}
                      >
                        Método de Pronóstico:
                      </label>
                      <select
                        value={metodoSeries}
                        onChange={(e) => setMetodoSeries(e.target.value)}
                        className="container_select"
                        style={{ marginBottom: "10px" }}
                      >
                        <option value="movil_simple">
                          Promedios Móviles Simples
                        </option>
                        <option value="movil_ponderado">
                          Promedios Móviles Ponderados
                        </option>
                        <option value="suavizamiento_exponencial">
                          Suavizamiento Exponencial
                        </option>
                      </select>

                      {metodoSeries === "movil_simple" && (
                        <div>
                          <label>Periodos a evaluar (k):</label>
                          <input
                            type="number"
                            min="2"
                            value={periodosK}
                            onChange={(e) => setPeriodosK(e.target.value)}
                            className="container_cal_input"
                          />
                        </div>
                      )}

                      {metodoSeries === "movil_ponderado" && (
                        <div>
                          <label>Pesos (separados por coma):</label>
                          <input
                            type="text"
                            value={pesos}
                            onChange={(e) => setPesos(e.target.value)}
                            className="container_cal_input"
                            placeholder="Ej: 0.5, 0.3, 0.2"
                          />
                          <small
                            style={{
                              display: "block",
                              color: "var(--text-muted)",
                              fontSize: "0.8em",
                              marginTop: "4px",
                            }}
                          >
                            El primer peso es para el dato más antiguo.
                          </small>
                        </div>
                      )}

                      {metodoSeries === "suavizamiento_exponencial" && (
                        <div>
                          <label>Constante de Suavización (Alfa α):</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            value={alfa}
                            onChange={(e) => setAlfa(e.target.value)}
                            className="container_cal_input"
                          />
                          <small
                            style={{
                              display: "block",
                              color: "var(--text-muted)",
                              fontSize: "0.8em",
                              marginTop: "4px",
                            }}
                          >
                            Debe ser un valor entre 0 y 1.
                          </small>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Resto de controles (Temas anteriores) */}
                  {(calculo === "distribucion_intervalos" ||
                    calculo === "tendencia_central" ||
                    calculo === "tendencia_y_posicion" ||
                    calculo === "variabilidad_y_forma") && (
                    <div className="container_intervalos">
                      <label>Tipo Intervalo:</label>
                      <select
                        value={tipoIntervalo}
                        onChange={(e) => setTipoIntervalo(e.target.value)}
                        className="container_select"
                      >
                        <option value="semiabierto">Semiabierto [a, b)</option>
                        <option value="cerrado">Cerrado [a, b]</option>
                        <option value="abierto">Abierto (a, b)</option>
                      </select>
                      <label>Método K:</label>
                      <select
                        value={metodoK}
                        onChange={(e) => setMetodoK(e.target.value)}
                        className="container_select"
                      >
                        <option value="sturges">Sturges</option>
                        <option value="cuadratica">Cuadrática</option>
                        <option value="logaritmica">Logarítmica</option>
                        <option value="personalizada">Manual</option>
                      </select>
                      {metodoK === "personalizada" && (
                        <input
                          type="number"
                          value={kPersonalizado}
                          onChange={(e) => setKPersonalizado(e.target.value)}
                          placeholder="Valor k"
                          className="container_cal_input"
                        />
                      )}
                    </div>
                  )}

                  {(calculo === "medidas_posicion" ||
                    calculo === "tendencia_y_posicion") && (
                    <div className="container_cal_percentil">
                      <label>Calcular Percentil Específico (1 - 99):</label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={percentilK}
                        onChange={(e) => setPercentilK(e.target.value)}
                      />
                    </div>
                  )}

                  {errorNumerico && (
                    <div
                      style={{
                        marginBottom: "15px",
                        color: "#d9534f",
                        fontSize: "0.9rem",
                        fontWeight: "bold",
                      }}
                    >
                      * La columna seleccionada no contiene datos numéricos o
                      válidos para este cálculo.
                    </div>
                  )}

                  {mostrarTabla && excelData.length > 0 && (
                    <div className=".container_dataset">
                      <p className="info_vista">
                        Vista Previa (Doble clic para editar):
                      </p>
                      <DataGrid
                        columns={rdgColumns}
                        rows={excelData}
                        onRowsChange={handleGridChange}
                        className="rdg-light"
                        style={{
                          blockSize: "100%",
                          border: "1px solid var(--border-color)",
                        }}
                      />
                    </div>
                  )}

                  <button onClick={ejecutarCalculo} className="button_calcular">
                    CALCULAR
                  </button>
                </>
              ) : (
                <p className="info_cargando">
                  Cargando datos o selecciona un archivo...
                </p>
              )}
            </div>
            <br />
            <button
              onClick={() => setModoCreacion(!modoCreacion)}
              className="button_resultados"
              style={{
                backgroundColor: modoCreacion
                  ? "var(--text-muted)"
                  : "var(--accent-color)",
              }}
            >
              {modoCreacion ? "Volver a Resultados" : "Crear Tabla de Datos"}
            </button>
            <br />
            <button
              onClick={() => setMostrarCalculadora(!mostrarCalculadora)}
              style={{
                width: "100%",
                padding: "8px",
                background: "#6b7280",
                marginTop: "10px",
                color: "white",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
              }}
            >
              {mostrarCalculadora
                ? "Ocultar Calculadora Manual"
                : "Mostrar Calculadora Manual"}
            </button>
            {mostrarCalculadora && <Calculator />}
          </>
        )}
      </div>

      {/* ================= DERECHA: RESULTADOS O CREADOR ================= */}
      <div className="calculadora-resultados">
        {modoCreacion ? (
          <TablaDinamica
            onTablaCreada={() => {
              cargarArchivos();
              setModoCreacion(false);
            }}
          />
        ) : (
          <>
            <div className="frecuencias">
              <h3>Resultados: {calculo.replace(/_/g, " ").toUpperCase()}</h3>

              {resultado ? (
                <>
                  {/* Tema 6: Regresión (La tabla comparativa y las manuales) */}
                  {calculo === "regresion_simple" && (
                    <TablaRegresion resultado={resultado} />
                  )}

                  {/* Tema 7: Series de Tiempo (La tabla con pronósticos y errores) */}
                  {calculo === "series_tiempo" && (
                    <TablaSeriesTiempo resultado={resultado} />
                  )}

                  {/* Tema 5: Tablas Bivariantes */}
                  {esBivariada && resultado.tipo === "bivariada" && (
                    <TablasBivariantes
                      resultado={resultado}
                      formatearCelda={formatearCelda}
                    />
                  )}

                  {/* Temas 2 al 4: Tablas Unidimensionales */}
                  {esUnidimensional && (
                    <TablasUnidimensionales
                      resultado={resultado}
                      calculo={calculo}
                      formatearCelda={formatearCelda}
                      filtroFractil={filtroFractil}
                      setFiltroFractil={setFiltroFractil}
                    />
                  )}
                </>
              ) : (
                <p style={{ color: "var(--text-muted)" }}>
                  No hay resultados aún.
                </p>
              )}
            </div>

            {/* Aquí se dibujan todos los gráficos de todos los temas */}
            <PanelGraficos resultado={resultado} esIntervalo={esIntervalo} />
          </>
        )}
      </div>
    </div>
  );
}
