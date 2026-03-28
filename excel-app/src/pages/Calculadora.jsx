import { useEffect, useState } from "react";
import { DataGrid } from "react-data-grid";
import "react-data-grid/lib/styles.css";

// --- IMPORTS ---
import Calculator from "../components/excel/Calculator";
import ExcelContent from "../components/excel/ExcelContent";
import GraficoEstadistico from "../components/graficos/GraficoEstadistico";
import GraficoIntervalos from "../components/graficos/GraficoIntervalos";
import TablaDinamica from "../components/excel/TablaDinamica";
import Latex from "../components/excel/Latex";
import GraficoBivariado from "../components/graficos/GraficoBivariado";
import { useCalculadoraExcel } from "../hooks/useCalculadoraExcel";


import TablasBivariantes from "../components/resultados/TablasBivariantes";
import TablasUnidimensionales from "../components/resultados/TablasUnidimensionales";
import PanelGraficos from "../components/resultados/PanelGraficos";

import { api } from "../services/api";

import "../styles/pages/Calculadora.css";

// --- EDITOR MANUAL PARA RDG ---
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
  // --- ESTADOS ---
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedSheet, setSelectedSheet] = useState(0);

  // ESTADO PARA CONTROLAR QUÉ SE MUESTRA A LA DERECHA
  const [modoCreacion, setModoCreacion] = useState(false);

  const [mostrarTabla, _setMostrarTabla] = useState(true);
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false);
  const [filtroFractil, setFiltroFractil] = useState("Cuartil");

  //minimizar y maximizar
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
    setCalculo,
    setTipoIntervalo,
    setMetodoK,
    setKPersonalizado,
    handleChangeDato,
    ejecutarCalculo,
    errorNumerico,
  } = useCalculadoraExcel(selectedFile, selectedSheet);

  // Helper formateo
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
        if (data.files.length > 0 && !selectedFile) {
          setSelectedFile(data.files[0].filename);
        }
      }
    } catch (error) {
      console.error("Error al cargar archivos:", error);
    }
  };

  useEffect(() => {
    cargarArchivos();
  }, []);

  const esIntervalo = calculo === "distribucion_intervalos";

  // Configuración Columnas RDG
  const rdgColumns = [];
  if (selectedColumn) {
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
  if (
    (calculo === "distribucion_bivariada" ||
      calculo === "distribucion_bivariada_avanzada") &&
    selectedColumnY
  ) {
    if (selectedColumn !== selectedColumnY) {
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

  const handleGridChange = (newRows, { indexes, column }) => {
    indexes.forEach((index) => {
      const row = newRows[index];
      const colKey = column.key;
      const newValue = row[colKey];
      handleChangeDato(index, colKey, newValue);
    });
  };

  // ==========================================================
  // RENDERIZADO
  // ==========================================================

  return (
    <div
      className={`calculadora-layout ${panelAbierto ? "" : "colapsado"}`}
      style={{ position: "relative" }}
    >
      <button
        onClick={() => setPanelAbierto(!panelAbierto)}
        // Mantenemos tu clase original, pero le sumamos el estado
        className={`boton-toggle-medio ${panelAbierto ? "abierto" : "cerrado"}`}
        title={panelAbierto ? "Ocultar panel" : "Mostrar panel"}
      >
        {/* Este span será nuestro icono dibujado con CSS */}
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
              /* 👇 ESTA LÍNEA SE SIMPLIFICA PARA EVITAR EL BUCLE */
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
                    {/* TEMA 2: DISTRIBUCIÓN DE FRECUENCIAS */}
                    <optgroup label="Tema 2: Distribución de Frecuencias">
                      <option value="frecuencias_completas">
                        Tabla de Frecuencias
                      </option>
                      <option value="distribucion_intervalos">
                        Distribución por Intervalos
                      </option>
                    </optgroup>

                    {/* TEMA 3: TENDENCIA CENTRAL Y POSICIÓN */}
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

                    {/* TEMA 4: DISPERSIÓN Y FORMA */}
                    <optgroup label="Tema 4: Medidas de Dispersión y Forma">
                      <option value="variabilidad_y_forma">
                        Análisis de Variabilidad y Forma de la Distribución
                      </option>
                    </optgroup>

                    {/* TEMA 5: DISTRIBUCIONES BIVARIANTES */}
                    <optgroup label="Tema 5: Distribuciones Bivariantes">
                      <option value="distribucion_bivariada">
                        Distribución Bivariante
                      </option>
                      <option value="distribucion_bivariada_avanzada">
                        Análisis Bivariante Avanzado (Prueba Tema 5)
                      </option>
                    </optgroup>
                  </select>

                  <label>
                    {calculo === "distribucion_bivariada"
                      ? "Variable X (Filas):"
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

                  {(calculo === "distribucion_bivariada" ||
                    calculo === "distribucion_bivariada_avanzada") && (
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
                        Variable Y (Columnas):
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

                  {errorNumerico && (
                    <div
                      style={{
                        marginBottom: "15px",
                        color: "#d9534f",
                        fontSize: "0.9rem",
                        fontWeight: "bold",
                      }}
                    >
                      * La columna seleccionada no contiene datos numéricos.
                    </div>
                  )}

                  {mostrarTabla && excelData.length > 0 && (
                    <div className=".container_dataset">
                      <p className="info_vista">
                        {" "}
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

                  {calculo === "medidas_posicion" && (
                    <div className="container_cal_percentil">
                      <label>Calcular Percentil Específico (1 - 99):</label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={percentilK}
                        onChange={(e) => setPercentilK(e.target.value)}
                      />
                      <small>
                        Se calcularán automáticamente todos los Cuartiles y
                        Deciles.
                      </small>
                    </div>
                  )}

                  {calculo === "tendencia_y_posicion" && (
                    <div className="container_tendencia_posicion">
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
              style={{ width: "100%", padding: "8px", background: "#6b7280" }}
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
    <TablaDinamica onTablaCreada={() => { cargarArchivos(); setModoCreacion(false); }} />
  ) : (
    <>
      <div className="frecuencias">
        <h3>Resultados: {calculo.replace(/_/g, " ").toUpperCase()}</h3>
        {resultado ? (
          <>
            {/* Si es objeto especial (Bivariada), usa este: */}
            <TablasBivariantes resultado={resultado} formatearCelda={formatearCelda} />
            
            {/* Si es array normal (Frecuencias, etc.), usa este: */}
            <TablasUnidimensionales 
              resultado={resultado} 
              calculo={calculo} 
              formatearCelda={formatearCelda}
              /* 👇 AQUÍ ESTÁN LAS DOS LÍNEAS QUE FALTABAN 👇 */
              filtroFractil={filtroFractil} 
              setFiltroFractil={setFiltroFractil} 
            />
          </>
        ) : (
          <p style={{ color: "var(--text-muted)" }}>No hay resultados aún.</p>
        )}
      </div>

      <PanelGraficos resultado={resultado} esIntervalo={esIntervalo} />
    </>
  )}
</div>
    </div>
  );
}
