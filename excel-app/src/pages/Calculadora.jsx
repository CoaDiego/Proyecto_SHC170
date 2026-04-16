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
import TablaIndices from "../components/resultados/TablaIndices"; // 👇 NUEVO IMPORT

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
    setCalculo,
    tipoIntervalo,
    setTipoIntervalo,
    metodoK,
    setMetodoK,
    kPersonalizado,
    setKPersonalizado,
    percentilK,
    setPercentilK,
    metodoSeries,
    setMetodoSeries,
    periodosK,
    setPeriodosK,
    pesos,
    setPesos,
    alfa,
    setAlfa,

    // 👇 ESTADOS TEMA 8: ÍNDICES
    subTemaIndices,
    setSubTemaIndices,
    colPrecioBase,
    setColPrecioBase,
    colCantidadBase,
    setColCantidadBase,
    colPrecioActual,
    setColPrecioActual,
    colCantidadActual,
    setColCantidadActual,
    nuevoIndiceBase,
    setNuevoIndiceBase,

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

  // CONFIGURACIÓN DE COLUMNAS VISTA PREVIA (Dinámica)
  const rdgColumns = [];
  const addCol = (colKey, name, cssClass) => {
    if (
      colKey &&
      columns.includes(colKey) &&
      !rdgColumns.some((c) => c.key === colKey)
    ) {
      rdgColumns.push({
        key: colKey,
        name,
        renderEditCell: textEditor,
        editable: true,
        resizable: true,
        width: "auto",
        cellClass: cssClass,
      });
    }
  };

  if (calculo === "numeros_indices" && subTemaIndices === "compuestos") {
    addCol(colPrecioBase, `${colPrecioBase} (P₀)`, "celda-editable");
    addCol(colCantidadBase, `${colCantidadBase} (Q₀)`, "celda-editable-y");
    addCol(colPrecioActual, `${colPrecioActual} (Pt)`, "celda-editable");
    addCol(colCantidadActual, `${colCantidadActual} (Qt)`, "celda-editable-y");
  } else if (calculo === "numeros_indices" && subTemaIndices === "deflacion") {
    addCol(selectedColumn, `${selectedColumn} (Tiempo)`, "celda-editable");
    addCol(selectedColumnY, `${selectedColumnY} (Nominal)`, "celda-editable-y");
    addCol(colPrecioBase, `${colPrecioBase} (IPC)`, "celda-editable");
  } else {
    addCol(selectedColumn, `${selectedColumn} (Var X)`, "celda-editable");
    if (
      (esBivariada ||
        calculo === "regresion_simple" ||
        calculo === "series_tiempo" ||
        calculo === "numeros_indices") &&
      selectedColumnY
    ) {
      addCol(selectedColumnY, `${selectedColumnY} (Var Y)`, "celda-editable-y");
    }
  }

  const handleGridChange = (newRows, { indexes, column }) => {
    indexes.forEach((index) => {
      handleChangeDato(index, column.key, newRows[index][column.key]);
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
                  {file.filename}
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
                    className="container_operaciones"
                  >
                    <optgroup label="Tema 2: Distribución de Frecuencias">
                      <option value="frecuencias_completas">
                        Tabla de Frecuencias
                      </option>
                      <option value="distribucion_intervalos">
                        Distribución por Intervalos
                      </option>
                    </optgroup>
                    <optgroup label="Tema 3: Tendencia y Posición">
                      <option value="tendencia_central">
                        Medidas de Tendencia Central
                      </option>
                      <option value="medidas_posicion">
                        Medidas de Posición
                      </option>
                      <option value="tendencia_y_posicion">
                        Tendencia y Posición (Conjunto)
                      </option>
                    </optgroup>
                    <optgroup label="Tema 4: Dispersión y Forma">
                      <option value="variabilidad_y_forma">
                        Análisis de Variabilidad
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
                    <optgroup label="Tema 6: Regresión">
                      <option value="regresion_simple">
                        Análisis de Regresión
                      </option>
                    </optgroup>
                    <optgroup label="Tema 7: Series de Tiempo">
                      <option value="series_tiempo">
                        Pronósticos (Series de Tiempo)
                      </option>
                    </optgroup>
                    {/* 👇 NUEVO TEMA 8 👇 */}
                    <optgroup label="Tema 8: Números Índices">
                      <option value="numeros_indices">
                        Análisis de Índices y Deflación
                      </option>
                    </optgroup>
                  </select>

                  {/* ==============================================
                      CONTROLES ESPECÍFICOS TEMA 8: ÍNDICES 
                      ============================================== */}
                  {calculo === "numeros_indices" ? (
                    <div
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
                        Módulo de Análisis:
                      </label>
                      <select
                        value={subTemaIndices}
                        onChange={(e) => setSubTemaIndices(e.target.value)}
                        style={{
                          width: "100%",
                          marginBottom: "15px",
                          padding: "5px",
                        }}
                      >
                        <option value="compuestos">
                          1. Índices Compuestos (Laspeyres/Paasche/Fisher)
                        </option>
                        <option value="empalme">
                          2. Empalme y Cambio de Base
                        </option>
                        <option value="deflacion">
                          3. Análisis Financiero (Sueldo Real e Inflación)
                        </option>
                      </select>

                      {subTemaIndices === "compuestos" && (
                        <>
                          <label>Precio Base (P₀):</label>
                          <select
                            value={colPrecioBase}
                            onChange={(e) => setColPrecioBase(e.target.value)}
                            style={{ width: "100%", marginBottom: "5px" }}
                          >
                            {columns.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <label>Cantidad Base (Q₀):</label>
                          <select
                            value={colCantidadBase}
                            onChange={(e) => setColCantidadBase(e.target.value)}
                            style={{ width: "100%", marginBottom: "5px" }}
                          >
                            {columns.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <label>Precio Actual (Pt):</label>
                          <select
                            value={colPrecioActual}
                            onChange={(e) => setColPrecioActual(e.target.value)}
                            style={{ width: "100%", marginBottom: "5px" }}
                          >
                            {columns.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <label>Cantidad Actual (Qt):</label>
                          <select
                            value={colCantidadActual}
                            onChange={(e) =>
                              setColCantidadActual(e.target.value)
                            }
                            style={{ width: "100%", marginBottom: "10px" }}
                          >
                            {columns.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </>
                      )}

                      {subTemaIndices === "empalme" && (
                        <>
                          <label>Eje de Tiempo (Años/Meses):</label>
                          <select
                            value={selectedColumn}
                            onChange={(e) => setSelectedColumn(e.target.value)}
                            style={{ width: "100%", marginBottom: "5px" }}
                          >
                            {columns.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <label>Serie de Índices (Original):</label>
                          <select
                            value={selectedColumnY}
                            onChange={(e) => setSelectedColumnY(e.target.value)}
                            style={{ width: "100%", marginBottom: "15px" }}
                          >
                            {columns.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <label>Valor para la Nueva Base:</label>
                          <input
                            type="number"
                            step="0.1"
                            value={nuevoIndiceBase}
                            onChange={(e) => setNuevoIndiceBase(e.target.value)}
                            className="container_cal_input"
                            placeholder="Ej: 105.4"
                          />
                          <small
                            style={{
                              display: "block",
                              color: "var(--text-muted)",
                            }}
                          >
                            Ingresa el índice del año que será la nueva base.
                          </small>
                        </>
                      )}

                      {subTemaIndices === "deflacion" && (
                        <>
                          <label>Eje de Tiempo (Años/Meses):</label>
                          <select
                            value={selectedColumn}
                            onChange={(e) => setSelectedColumn(e.target.value)}
                            style={{ width: "100%", marginBottom: "5px" }}
                          >
                            {columns.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <label>Valor Nominal (Sueldos/Ventas):</label>
                          <select
                            value={selectedColumnY}
                            onChange={(e) => setSelectedColumnY(e.target.value)}
                            style={{ width: "100%", marginBottom: "5px" }}
                          >
                            {columns.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <label>Índice de Precios (IPC):</label>
                          <select
                            value={colPrecioBase}
                            onChange={(e) => setColPrecioBase(e.target.value)}
                            style={{ width: "100%", marginBottom: "5px" }}
                          >
                            {columns.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </>
                      )}
                    </div>
                  ) : (
                    /* ==============================================
                       CONTROLES TEMAS ANTERIORES (Regresión, Series, etc)
                       ============================================== */
                    <>
                      <label>
                        {calculo === "series_tiempo"
                          ? "Eje de Tiempo X:"
                          : esBivariada || calculo === "regresion_simple"
                            ? "Variable X:"
                            : "Columna Seleccionada:"}
                      </label>
                      <select
                        value={selectedColumn}
                        onChange={(e) => setSelectedColumn(e.target.value)}
                        style={{ width: "100%", marginBottom: "10px" }}
                      >
                        {columns.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>

                      {(esBivariada ||
                        calculo === "regresion_simple" ||
                        calculo === "series_tiempo") && (
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
                            {columns.map((col) => (
                              <option key={col} value={col}>
                                {col}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </>
                  )}

                  {/* CONTROLES EXTRA TEMA 7 */}
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
                        <>
                          <label>Periodos (k):</label>
                          <input
                            type="number"
                            min="2"
                            value={periodosK}
                            onChange={(e) => setPeriodosK(e.target.value)}
                            className="container_cal_input"
                          />
                        </>
                      )}
                      {metodoSeries === "movil_ponderado" && (
                        <>
                          <label>Pesos:</label>
                          <input
                            type="text"
                            value={pesos}
                            onChange={(e) => setPesos(e.target.value)}
                            className="container_cal_input"
                          />
                        </>
                      )}
                      {metodoSeries === "suavizamiento_exponencial" && (
                        <>
                          <label>Alfa (α):</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            value={alfa}
                            onChange={(e) => setAlfa(e.target.value)}
                            className="container_cal_input"
                          />
                        </>
                      )}
                    </div>
                  )}

                  {/* CONTROLES EXTRA TEMAS 2, 3, 4 */}
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
                        <option value="semiabierto">[a, b)</option>
                        <option value="cerrado">[a, b]</option>
                        <option value="abierto">(a, b)</option>
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
                      <label>Percentil (1 - 99):</label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={percentilK}
                        onChange={(e) => setPercentilK(e.target.value)}
                      />
                    </div>
                  )}

                  {/* TABLA DE VISTA PREVIA Y BOTÓN CALCULAR */}
                  {mostrarTabla && excelData.length > 0 && (
                    <div
                      className=".container_dataset"
                      style={{ marginTop: "10px" }}
                    >
                      <p className="info_vista">
                        Vista Previa (Edita las celdas aquí si lo necesitas):
                      </p>
                      <DataGrid
                        columns={rdgColumns}
                        rows={excelData}
                        onRowsChange={handleGridChange}
                        className="rdg-light"
                        style={{
                          blockSize: "100%",
                          border: "1px solid var(--border-color)",
                          minHeight: "150px",
                        }}
                      />
                    </div>
                  )}

                  <button
                    onClick={ejecutarCalculo}
                    className="button_calcular"
                    style={{ marginTop: "15px" }}
                  >
                    CALCULAR RESULTADOS
                  </button>
                </>
              ) : (
                <p className="info_cargando">
                  Cargando datos o selecciona un archivo...
                </p>
              )}
            </div>

            <button
              onClick={() => setModoCreacion(!modoCreacion)}
              className="button_resultados"
              style={{
                backgroundColor: modoCreacion
                  ? "var(--text-muted)"
                  : "var(--accent-color)",
                marginTop: "15px",
              }}
            >
              {modoCreacion ? "Volver a Resultados" : "Crear Tabla de Datos"}
            </button>
          </>
        )}
      </div>

      {/* ================= DERECHA: RESULTADOS ================= */}
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

              {errorNumerico && (
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#d9534f",
                    backgroundColor: "rgba(217, 83, 79, 0.1)",
                    borderRadius: "8px",
                    border: "1px solid #d9534f",
                    marginBottom: "15px",
                  }}
                >
                  <p style={{ margin: "0" }}>
                    ⚠️ Error: Faltan datos, hay celdas vacías o texto en las
                    columnas seleccionadas.
                  </p>
                </div>
              )}

              {resultado ? (
                <>
                  {/* Tema 6: Regresión */}
                  {calculo === "regresion_simple" &&
                    resultado.tipo === "regresion" && (
                      <TablaRegresion resultado={resultado} />
                    )}

                  {/* Tema 7: Series de Tiempo */}
                  {calculo === "series_tiempo" &&
                    resultado.tipo === "series_tiempo" && (
                      <TablaSeriesTiempo resultado={resultado} />
                    )}

                  {/* Tema 8: Números Índices */}
                  {calculo === "numeros_indices" &&
                    [
                      "indices_compuestos",
                      "operaciones_indices",
                      "deflacion_financiera",
                    ].includes(resultado.tipo) && (
                      <TablaIndices resultado={resultado} />
                    )}

                  {/* 👇 AQUÍ ESTÁ LA CORRECCIÓN DEL TEMA 5 👇 */}
                  {esBivariada && ["bivariada", "bivariada_avanzada"].includes(resultado.tipo) && (
                    <TablasBivariantes
                      resultado={resultado}
                      formatearCelda={formatearCelda}
                    />
                  )}

                  {/* 👇 AQUÍ ESTÁ LA CORRECCIÓN DE LOS TEMAS 2, 3 Y 4 👇 */}
                  {esUnidimensional &&
                    (!resultado.tipo ||
                      ["tendencia_y_posicion", "variabilidad_y_forma", "estadistica_descriptiva"].includes(resultado.tipo)) && (
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
                !errorNumerico && (
                  <p style={{ color: "var(--text-muted)" }}>
                    Configura los parámetros a la izquierda y presiona Calcular.
                  </p>
                )
              )}
            </div>

            <PanelGraficos resultado={resultado} esIntervalo={esIntervalo} />
          </>
        )}
      </div>
    </div>
  );
}
