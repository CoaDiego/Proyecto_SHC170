import React from "react";
import ExcelContent from "../excel/ExcelContent";
import Calculator from "../excel/Calculator";
import { DataGrid } from "react-data-grid";

// 1️⃣ Agregamos la función para que las celdas se puedan editar correctamente
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

// 2️⃣ Fíjate que aquí ya NO existe rdgColumns en esta lista
export default function PanelConfiguracion({
  panelAbierto, setPanelAbierto,
  files, selectedFile, setSelectedFile,
  usuario, setSelectedSheet,
  columns, variables,
  calculo, setCalculo,
  subTemaIndices, setSubTemaIndices,
  colPrecioBase, setColPrecioBase, colCantidadBase, setColCantidadBase,
  colPrecioActual, setColPrecioActual, colCantidadActual, setColCantidadActual,
  nuevoIndiceBase, setNuevoIndiceBase,
  selectedColumn, setSelectedColumn,
  selectedColumnY, setSelectedColumnY,
  esBivariada, esUnidimensional,
  metodoSeries, setMetodoSeries, periodosK, setPeriodosK, pesos, setPesos, alfa, setAlfa,
  tipoIntervalo, setTipoIntervalo, metodoK, setMetodoK, kPersonalizado, setKPersonalizado, percentilK, setPercentilK,
  mostrarTabla, excelData, handleGridChange,
  ejecutarCalculo, modoCreacion, setModoCreacion,
  mostrarCalculadora, setMostrarCalculadora
}) {

  // 3️⃣ Aquí es el ÚNICO lugar donde se crea rdgColumns
  const rdgColumns = [];
  
  const addCol = (colKey, name, cssClass) => {
    if (colKey && !rdgColumns.some((c) => c.key === colKey)) {
      rdgColumns.push({
        key: colKey,
        name,
        renderEditCell: textEditor, // 👈 Ahora sabe cómo editar
        editable: true,
        resizable: true,
        cellClass: cssClass,
      });
    }
  };

  // Lógica para armar las columnas según el tema
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
    if ((esBivariada || calculo === "regresion_simple" || calculo === "series_tiempo" || calculo === "numeros_indices") && selectedColumnY) {
      if (selectedColumn !== selectedColumnY) {
        addCol(selectedColumnY, `${selectedColumnY} (Var Y)`, "celda-editable-y");
      }
    }
  }

  // 4️⃣ Función para pintar los selects
  const renderOpcionesColumnas = () => (
    <>
      <optgroup label="Columnas del Excel">
        {columns.map((col) => (
          <option key={col} value={col}>{col}</option>
        ))}
      </optgroup>
      <optgroup label="Variables Capturadas">
        {variables.map((v) => (
          <option key={v.id} value={v.nombre}>{v.nombre}</option>
        ))}
      </optgroup>
    </>
  );

  return (
    <>
      <button
        onClick={() => setPanelAbierto(!panelAbierto)}
        className={`boton-toggle-medio ${panelAbierto ? "abierto" : "cerrado"}`}
        title={panelAbierto ? "Ocultar panel" : "Mostrar panel"}
      >
        <span
          className={`icono-toggle ${panelAbierto ? "abierto" : "cerrado"}`}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: "bold", fontSize: "14px", color: "#ffffff",
            transform: panelAbierto ? "scaleX(1)" : "scaleX(-1)",
            transition: "transform 0.3s ease", lineHeight: 0,
            marginTop: "-2px", marginLeft: "-1px",
          }}
        >
          ❮
        </span>
      </button>

      <div className="calculadora-datos" style={{ padding: "15px", display: "flex", flexDirection: "column", gap: "15px" }}>
        
        <div style={{ borderBottom: panelAbierto ? "1px solid var(--border-color)" : "none", paddingBottom: "5px", marginBottom: panelAbierto ? "5px" : "0" }}>
          {panelAbierto && <h3 style={{ margin: 0 }}> Configuración de Análisis </h3>}
        </div>

        {panelAbierto && (
          <>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Selecciona un archivo:</label>
              <select
                value={selectedFile}
                onChange={(e) => {
                  setSelectedFile(e.target.value);
                  setModoCreacion(false);
                }}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--border-color)" }}
              >
                <option value="">-- Selecciona un archivo para empezar --</option>
                {files.map((file) => (
                  <option key={file.filename} value={file.filename}>
                    {file.filename} ({file.author || "Desconocido"})
                  </option>
                ))}
              </select>
            </div>

            <ExcelContent
              filename={selectedFile}
              autor={usuario?.nombre}
              mostrarTabla={false}
              onSheetChange={setSelectedSheet}
            />

            {columns.length > 0 || variables.length > 0 ? (
              <div style={{ background: "var(--bg-card)", padding: "15px", borderRadius: "8px", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Operación:</label>
                  <select
                    value={calculo}
                    onChange={(e) => setCalculo(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--border-color)" }}
                  >
                    <optgroup label="Tema 2: Distribución de Frecuencias">
                      <option value="frecuencias_completas">Tabla de Frecuencias</option>
                      <option value="distribucion_intervalos">Distribución por Intervalos</option>
                    </optgroup>
                    <optgroup label="Tema 3: Tendencia y Posición">
                      <option value="tendencia_y_posicion">Tendencia y Posición (Conjunto)</option>
                    </optgroup>
                    <optgroup label="Tema 4: Dispersión y Forma">
                      <option value="variabilidad_y_forma">Análisis de Variabilidad y Forma</option>
                    </optgroup>
                    <optgroup label="Tema 5: Distribuciones Bivariantes">
                      <option value="distribucion_bivariada_avanzada">Análisis Bivariante Avanzado</option>
                    </optgroup>
                    <optgroup label="Tema 6: Regresión">
                      <option value="regresion_simple">Análisis de Regresión</option>
                    </optgroup>
                    <optgroup label="Tema 7: Series de Tiempo">
                      <option value="series_tiempo">Pronósticos (Series de Tiempo)</option>
                    </optgroup>
                    <optgroup label="Tema 8: Números Índices">
                      <option value="numeros_indices">Análisis de Índices y Deflación</option>
                    </optgroup>
                  </select>
                </div>

                {calculo === "numeros_indices" ? (
                  <div style={{ padding: "10px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "4px", marginBottom: "15px" }}>
                    <label style={{ fontWeight: "bold", color: "var(--primary-color)" }}>Módulo de Análisis:</label>
                    <select value={subTemaIndices} onChange={(e) => setSubTemaIndices(e.target.value)} style={{ width: "100%", marginBottom: "15px", padding: "5px" }}>
                      <option value="compuestos">1. Índices Compuestos (Laspeyres/Paasche/Fisher)</option>
                      <option value="empalme">2. Empalme y Cambio de Base</option>
                      <option value="deflacion">3. Análisis Financiero (Deflación)</option>
                    </select>

                    {subTemaIndices === "compuestos" && (
                      <>
                        <label>Precio Base (P₀):</label><select value={colPrecioBase} onChange={(e) => setColPrecioBase(e.target.value)} style={{ width: "100%", marginBottom: "5px" }}>{renderOpcionesColumnas()}</select>
                        <label>Cantidad Base (Q₀):</label><select value={colCantidadBase} onChange={(e) => setColCantidadBase(e.target.value)} style={{ width: "100%", marginBottom: "5px" }}>{renderOpcionesColumnas()}</select>
                        <label>Precio Actual (Pt):</label><select value={colPrecioActual} onChange={(e) => setColPrecioActual(e.target.value)} style={{ width: "100%", marginBottom: "5px" }}>{renderOpcionesColumnas()}</select>
                        <label>Cantidad Actual (Qt):</label><select value={colCantidadActual} onChange={(e) => setColCantidadActual(e.target.value)} style={{ width: "100%", marginBottom: "10px" }}>{renderOpcionesColumnas()}</select>
                      </>
                    )}
                    {subTemaIndices === "empalme" && (
                      <>
                        <label>Eje de Tiempo (Años/Meses):</label><select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)} style={{ width: "100%", marginBottom: "5px" }}>{renderOpcionesColumnas()}</select>
                        <label>Serie de Índices (Original):</label><select value={selectedColumnY} onChange={(e) => setSelectedColumnY(e.target.value)} style={{ width: "100%", marginBottom: "15px" }}>{renderOpcionesColumnas()}</select>
                        <label>Valor para la Nueva Base:</label><input type="number" step="0.1" value={nuevoIndiceBase} onChange={(e) => setNuevoIndiceBase(e.target.value)} className="container_cal_input" placeholder="Ej: 105.4" />
                      </>
                    )}
                    {subTemaIndices === "deflacion" && (
                      <>
                        <label>Eje de Tiempo (Años/Meses):</label><select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)} style={{ width: "100%", marginBottom: "5px" }}>{renderOpcionesColumnas()}</select>
                        <label>Valor Nominal (Sueldos/Ventas):</label><select value={selectedColumnY} onChange={(e) => setSelectedColumnY(e.target.value)} style={{ width: "100%", marginBottom: "5px" }}>{renderOpcionesColumnas()}</select>
                        <label>Índice de Precios (IPC):</label><select value={colPrecioBase} onChange={(e) => setColPrecioBase(e.target.value)} style={{ width: "100%", marginBottom: "5px" }}>{renderOpcionesColumnas()}</select>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <label>{calculo === "series_tiempo" ? "Eje de Tiempo X:" : esBivariada || calculo === "regresion_simple" ? "Variable X:" : "Columna Seleccionada:"}</label>
                    <select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)} style={{ width: "100%", marginBottom: "10px" }}>{renderOpcionesColumnas()}</select>

                    {(esBivariada || calculo === "regresion_simple" || calculo === "series_tiempo") && (
                      <div style={{ padding: "10px", border: "1px solid var(--border-color)", borderRadius: "4px", marginBottom: "15px", backgroundColor: "var(--bg-card)" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>{calculo === "series_tiempo" ? "Valores Históricos Y (Demanda/Ventas):" : "Variable Y (Dependiente):"}</label>
                        <select value={selectedColumnY} onChange={(e) => setSelectedColumnY(e.target.value)} style={{ width: "100%", padding: "5px" }}><option value="">-- Seleccionar Variable Y --</option>{renderOpcionesColumnas()}</select>
                      </div>
                    )}
                  </>
                )}

                {calculo === "series_tiempo" && (
                  <div className="container_intervalos" style={{ padding: "10px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "4px", marginBottom: "15px" }}>
                    <label style={{ fontWeight: "bold", color: "var(--primary-color)" }}>Método de Pronóstico:</label>
                    <select value={metodoSeries} onChange={(e) => setMetodoSeries(e.target.value)} className="container_select" style={{ marginBottom: "10px" }}>
                      <option value="movil_simple">Promedios Móviles Simples</option>
                      <option value="movil_ponderado">Promedios Móviles Ponderados</option>
                      <option value="suavizamiento_exponencial">Suavizamiento Exponencial</option>
                    </select>
                    {metodoSeries === "movil_simple" && <><label>Periodos (k):</label><input type="number" min="2" value={periodosK} onChange={(e) => setPeriodosK(e.target.value)} className="container_cal_input" /></>}
                    {metodoSeries === "movil_ponderado" && <><label>Pesos:</label><input type="text" value={pesos} onChange={(e) => setPesos(e.target.value)} className="container_cal_input" placeholder="Ej: 0.5, 0.3, 0.2" /></>}
                    {metodoSeries === "suavizamiento_exponencial" && <><label>Alfa (α):</label><input type="number" step="0.01" min="0" max="1" value={alfa} onChange={(e) => setAlfa(e.target.value)} className="container_cal_input" /></>}
                  </div>
                )}

                {esUnidimensional && calculo !== "frecuencias_completas" && calculo !== "estadistica_descriptiva" && (
                  <div className="container_intervalos">
                    {(calculo === "distribucion_intervalos" || calculo === "tendencia_central" || calculo === "tendencia_y_posicion" || calculo === "variabilidad_y_forma") && (
                      <>
                        <label>Tipo Intervalo:</label>
                        <select value={tipoIntervalo} onChange={(e) => setTipoIntervalo(e.target.value)} className="container_select">
                          <option value="semiabierto">[a, b)</option>
                          <option value="cerrado">[a, b]</option>
                          <option value="abierto">(a, b)</option>
                        </select>
                        <label>Método K:</label>
                        <select value={metodoK} onChange={(e) => setMetodoK(e.target.value)} className="container_select">
                          <option value="sturges">Sturges</option>
                          <option value="cuadratica">Cuadrática</option>
                          <option value="logaritmica">Logarítmica</option>
                          <option value="personalizada">Manual</option>
                        </select>
                        {metodoK === "personalizada" && <input type="number" value={kPersonalizado} onChange={(e) => setKPersonalizado(e.target.value)} placeholder="Valor k" className="container_cal_input" />}
                      </>
                    )}
                   {(calculo === "medidas_posicion" || calculo === "tendencia_y_posicion") && (
                      <div className="container_cal_percentil" style={{ marginTop: "2px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <label style={{ fontWeight: "bold", margin: 0 }}>
                          Percentil (1 - 99):
                        </label>
                        
                        {/* 🚀 Controles personalizados e indestructibles */}
                        <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border-color)", borderRadius: "2px", overflow: "hidden", backgroundColor: "var(--bg-card)" }}>
                          <button 
                            type="button"
                            onClick={() => setPercentilK(p => {
                              const actual = p === "" ? 50 : p;
                              return actual > 1 ? actual - 1 : 1;
                            })}
                            style={{ padding: "6px 12px", border: "none", background: "rgba(0,0,0,0.05)", color: "var(--text-main)", cursor: "pointer", fontWeight: "bold", borderRight: "1px solid var(--border-color)", fontSize: "1.1rem" }}
                          >
                            −
                          </button>
                          
                          <input 
                            type="text" // Usamos text para burlar las flechas ocultas del navegador
                            value={percentilK === "" ? "" : percentilK} 
                            onChange={(e) => {
                              const valor = e.target.value;
                              if (valor === "") { setPercentilK(""); return; }
                              const num = parseInt(valor, 10);
                              if (!isNaN(num) && num >= 1 && num <= 99) { setPercentilK(num); }
                            }} 
                            style={{
                              width: "45px", padding: "6px 0", border: "none", textAlign: "center",
                              backgroundColor: "transparent", color: "var(--text-main)", fontWeight: "bold", outline: "none"
                            }}
                          />
                          
                          <button 
                            type="button"
                            onClick={() => setPercentilK(p => {
                              const actual = p === "" ? 50 : p;
                              return actual < 99 ? actual + 1 : 99;
                            })}
                            style={{ padding: "6px 12px", border: "none", background: "rgba(0,0,0,0.05)", color: "var(--text-main)", cursor: "pointer", fontWeight: "bold", borderLeft: "1px solid var(--border-color)", fontSize: "1.1rem" }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {mostrarTabla && excelData.length > 0 && (
                  <div className=".container_dataset" style={{ marginTop: "10px", width: "100%", overflowX: "hidden" }}>
                    <p className="info_vista">Vista Previa (Doble clic para editar):</p>
                    <DataGrid
                      columns={rdgColumns}
                      rows={excelData}
                      onRowsChange={handleGridChange}
                      className="rdg-light"
                      style={{ blockSize: "100%", border: "1px solid var(--border-color)", height: "400px", textAlign: "center", width: "100%" }}
                    />
                  </div>
                )}

                <button onClick={ejecutarCalculo} className="button_calcular" style={{ marginTop: "15px" }}>CALCULAR</button>
              </div>
            ) : (
              <p className="info_cargando">Cargando datos o selecciona un archivo...</p>
            )}

            <button
              onClick={() => setModoCreacion(!modoCreacion)}
              className="button_resultados"
              style={{ backgroundColor: modoCreacion ? "var(--text-muted)" : "var(--accent-color)", marginTop: "20px" }}
            >
              {modoCreacion ? "Volver a Resultados" : "Crear Tabla de Datos"}
            </button>

            {/* <button
              onClick={() => setMostrarCalculadora(!mostrarCalculadora)}
              style={{ width: "100%", padding: "8px", background: "#6b7280", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginTop: "10px" }}
            >
              {mostrarCalculadora ? "Ocultar Calculadora Manual" : "Mostrar Calculadora Manual"}
            </button>
            {mostrarCalculadora && <Calculator />} */}
          </>
        )}
      </div>
    </>
  );
}