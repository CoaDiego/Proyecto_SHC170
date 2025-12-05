

import { useEffect, useState } from "react";

// --- IMPORTACIÓN DE COMPONENTES ---
import Calculator from "../components/Calculator";
import ExcelContent from "../components/ExcelContent";
import GraficoEstadistico from "../components/GraficoEstadistico";
import GraficoIntervalos from "../components/graficos/GraficoIntervalos";
import TablaDinamica from "../components/TablaDinamica";
import Latex from "../components/Latex";
import GraficoBivariado from "../components/graficos/GraficoBivariado";

// --- IMPORTACIÓN DE LÓGICA (HOOK) ---
import { useCalculadoraExcel } from "../hooks/useCalculadoraExcel";

export default function Calculadora() {
  // --- ESTADOS ---
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  // Eliminamos el estado 'sheets' aquí, no lo necesitamos, ExcelContent lo maneja.
  const [selectedSheet, setSelectedSheet] = useState(0); // Este índice se enviará al Hook
  
  const [mostrarTabla, setMostrarTabla] = useState(true);
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false); 

  // --- CONEXIÓN CON EL HOOK ---
  // Ahora selectedSheet se actualizará correctamente gracias a ExcelContent
  const {
    excelData, columns, 
    selectedColumn, setSelectedColumn,    
    selectedColumnY, setSelectedColumnY,  
    resultado, calculo,
    tipoIntervalo, metodoK, kPersonalizado,
    setCalculo, setTipoIntervalo, setMetodoK, setKPersonalizado,
    handleChangeDato, ejecutarCalculo
  } = useCalculadoraExcel(selectedFile, selectedSheet);

  // --- HELPERS DE FORMATO ---
  const formatearCelda = (valor) => {
    if (typeof valor === "number") {
      return Number.isInteger(valor) ? valor : Number(valor).toFixed(2);
    }
    if (!isNaN(parseFloat(valor)) && isFinite(valor)) {
         const num = Number(valor);
         return Number.isInteger(num) ? num : num.toFixed(2);
    }
    return valor;
  };

  const cellStyle = {
    padding: '8px', border: '1px solid #999', textAlign: 'center',
    fontFamily: '"Times New Roman", Times, serif', fontSize: '1.1em',
    color: '#000', fontVariantNumeric: 'tabular-nums', verticalAlign: 'middle'
  };

  const headerStyle = { ...cellStyle, background: '#f0f0f0', fontWeight: 'bold' };

  // Carga inicial de archivos
  useEffect(() => {
    fetch("http://127.0.0.1:8000/files")
        .then((res) => res.json())
        .then((data) => { 
            if (data.files) { 
                setFiles(data.files); 
                if (data.files.length > 0) setSelectedFile(data.files[0].filename); 
            } 
        })
        .catch(console.error);
  }, []);

  // NOTA: Eliminamos el useEffect que hacía fetch a /sheets.
  // ExcelContent se encarga de eso.

  const esIntervalo = calculo === "distribucion_intervalos";

  return (
    <div className="calculadora-layout">
      
      {/* ================= CONTROLES ================= */}
      <div className="calculadora-datos">
        <h2>- Archivos Subidos -</h2>
        <label className="etiqueta">Selecciona un archivo:</label>
        <select 
            value={selectedFile} 
            onChange={(e) => setSelectedFile(e.target.value)} 
            className="selector-archivo"
            style={{ marginBottom: '15px' }}
        >
          {files.map((file) => (
            <option key={file.filename} value={file.filename}>
                {file.filename} ({file.author || "Desconocido"})
            </option>
          ))}
        </select>

        {/* AQUÍ ESTÁ EL CAMBIO CLAVE DE COMUNICACIÓN */}
        <ExcelContent 
            filename={selectedFile} 
            mostrarTabla={false} // Ahora ExcelContent respetará esto
            onSheetChange={(index) => setSelectedSheet(index)} // Recibimos el índice real desde el hijo
        />

        <div className="panel-controles-excel" style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h3 style={{ fontSize: '1.1em', color: '#333', marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Calculadora de Excel</h3>

            {/* Verificamos columns.length para saber si el Hook ya cargó la hoja seleccionada */}
            {columns.length > 0 ? (
                <>
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.9em', marginBottom: '5px' }}>
                        Operación:
                    </label>
                    <select value={calculo} onChange={(e) => setCalculo(e.target.value)} style={{ width: '100%', padding: '6px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        <option value="frecuencia_absoluta">Frecuencia Absoluta</option>
                        <option value="frecuencia_relativa">Frecuencia Relativa</option>
                        <option value="frecuencias_completas">Tabla de Frecuencias</option>
                        <option value="distribucion_intervalos">Distribución por Intervalos</option>
                        <option value="distribucion_bivariada">Distribución Bivariante (Doble Entrada)</option>
                        <option value="minimo">Mínimo</option>
                        <option value="maximo">Máximo</option>
                    </select>

                    {/* --- SELECTORES DE COLUMNAS --- */}
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.9em', marginBottom: '5px' }}>
                      {calculo === "distribucion_bivariada" ? "Variable X (Filas):" : "Columna Seleccionada:"}
                    </label>
                    <select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)} style={{ width: '100%', padding: '6px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        {columns.map((col) => <option key={col} value={col}>{col}</option>)}
                    </select>

                    {/* SOLO PARA BIVARIADA: SEGUNDA COLUMNA */}
                    {calculo === "distribucion_bivariada" && (
                        <>
                            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.9em', marginBottom: '5px', color: '#d97706' }}>
                              Variable Y (Columnas):
                            </label>
                            <select value={selectedColumnY} onChange={(e) => setSelectedColumnY(e.target.value)} style={{ width: '100%', padding: '6px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc', borderColor: '#d97706' }}>
                                {columns.map((col) => <option key={col} value={col}>{col}</option>)}
                            </select>
                        </>
                    )}

                    {/* --- MINI TABLA EDITABLE --- */}
                    {/* Al tener mostrarTabla en true localmente, ESTA es la tabla que verá el usuario para editar datos */}
                    {mostrarTabla && excelData.length > 0 && (
                        <div style={{ marginBottom: '15px' }}>
                            <p style={{ fontSize: '0.8em', fontWeight: 'bold', marginBottom: '5px' }}>Vista Previa Datos (Editables):</p>
                            <div style={{ maxHeight: '150px', overflowY: 'auto', background: 'white', border: '1px solid #eee', padding: '5px', borderRadius: '4px' }}>
                                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                    <thead>
                                        <tr style={{fontSize: '0.8em', background: '#eee'}}>
                                            <th>{selectedColumn}</th>
                                            {calculo === "distribucion_bivariada" && <th>{selectedColumnY}</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {excelData.map((row, i) => (
                                            <tr key={i} style={{borderBottom: '1px solid #f0f0f0'}}>
                                                <td>
                                                    <input 
                                                        type="text" 
                                                        value={row[selectedColumn] ?? ""} 
                                                        onChange={(e) => handleChangeDato(i, selectedColumn, e.target.value)} 
                                                        style={{ width: '100%', border: 'none', textAlign: 'center', fontSize: '0.9em' }} 
                                                    />
                                                </td>
                                                {calculo === "distribucion_bivariada" && (
                                                    <td>
                                                        <input 
                                                            type="text" 
                                                            value={row[selectedColumnY] ?? ""} 
                                                            onChange={(e) => handleChangeDato(i, selectedColumnY, e.target.value)} 
                                                            style={{ width: '100%', border: 'none', textAlign: 'center', fontSize: '0.9em', color: '#d97706' }} 
                                                        />
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* OPCIONES DE INTERVALOS (Igual que antes) */}
                    {calculo === "distribucion_intervalos" && (
                        <div style={{ padding: '10px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '0.85em', marginBottom: '3px' }}>Tipo Intervalo:</label>
                            <select value={tipoIntervalo} onChange={(e) => setTipoIntervalo(e.target.value)} style={{ width: '100%', marginBottom: '8px', padding: '4px' }}>
                                <option value="semiabierto">Semiabierto [a, b)</option>
                                <option value="cerrado">Cerrado [a, b]</option>
                                <option value="abierto">Abierto (a, b)</option>
                            </select>
                            <label style={{ display: 'block', fontSize: '0.85em', marginBottom: '3px' }}>Método K:</label>
                            <select value={metodoK} onChange={(e) => setMetodoK(e.target.value)} style={{ width: '100%', marginBottom: '5px', padding: '4px' }}>
                                <option value="sturges">Sturges</option>
                                <option value="cuadratica">Cuadrática</option>
                                <option value="logaritmica">Logarítmica</option>
                                <option value="personalizada">Manual</option>
                            </select>
                            {metodoK === "personalizada" && <input type="number" value={kPersonalizado} onChange={(e) => setKPersonalizado(e.target.value)} placeholder="Valor k" style={{ width: '100%', padding: '4px', marginTop: '5px' }} />}
                        </div>
                    )}

                    <button onClick={ejecutarCalculo} className="boton-calcular" style={{ width: '100%', padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>CALCULAR</button>
                </>
            ) : <p style={{ fontSize: '0.9em', color: '#666', textAlign: 'center' }}>Cargando columnas o selecciona un archivo...</p>}
        </div>

        {/* RESTO DE COMPONENTES (TABLAS Y GRÁFICOS) SIN CAMBIOS MAYORES */}
        <div style={{ marginTop: '20px' }}>
             <TablaDinamica onTablaCreada={() => { fetch("http://127.0.0.1:8000/files").then(res => res.json()).then(data => { if (data.files) setFiles(data.files); }); }} />
        </div>
        <br />
        <button onClick={() => setMostrarCalculadora(!mostrarCalculadora)} style={{ width: '100%', padding: '8px', marginTop: '10px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{mostrarCalculadora ? "Ocultar Calculadora Manual" : "Mostrar Calculadora Manual"}</button>
        {mostrarCalculadora && <Calculator />}
      </div>

{/* ================= RESULTADOS ================= */}
      <div className="calculadora-resultados">
        <div className="frecuencias">
          <h3>Resultados: {calculo.replace(/_/g, " ").toUpperCase()}</h3>
          {resultado ? (
            // VERIFICAMOS SI ES BIVARIADA (OBJETO) O LISTA (ARRAY)
            !Array.isArray(resultado) && resultado.tipo === "bivariada" ? (
                
                /* --- ESCENARIO D: TABLA DE DOBLE ENTRADA (BIVARIADA) --- */
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ borderCollapse: "collapse", width: "100%", fontSize: '0.9em' }}>
                        <thead>
                            {/* Primera Fila de Encabezados */}
                            <tr>
                                <th style={{...headerStyle, background: '#fff', border: 'none'}}></th>
                                <th colSpan={resultado.columnas.length} style={headerStyle}>
                                    VARIABLE Y: {selectedColumnY}
                                </th>
                                <th style={headerStyle}>Total Fila</th>
                            </tr>
                            {/* Segunda Fila (Nombres de Columnas Y) */}
                            <tr>
                                <th style={{...headerStyle, width: '150px'}}>
                                    VARIABLE X: <br/> {selectedColumn}
                                </th>
                                {resultado.columnas.map(col => (
                                    <th key={col} style={headerStyle}>{col}</th>
                                ))}
                                <th style={headerStyle}><Latex formula="f_{i \cdot}" /> / %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resultado.filas.map(fila => (
                                <tr key={fila}>
                                    {/* Nombre de la Fila (X) */}
                                    <td style={{...cellStyle, fontWeight: 'bold', background: '#f9f9f9'}}>{fila}</td>
                                    
                                    {/* Celdas de Cruce (Datos) */}
                                    {resultado.columnas.map(col => {
                                        const f_ij = resultado.datos[fila][col];
                                        const p_ij = ((f_ij / resultado.granTotal) * 100).toFixed(1); // 1 decimal como el libro
                                        return (
                                            <td key={col} style={cellStyle}>
                                                <div style={{fontWeight: 'bold'}}>{f_ij}</div>
                                                <div style={{fontSize: '0.8em', color: '#555'}}>
                                                    <Latex formula={`p_{ij}=${p_ij}\\%`} />
                                                </div>
                                            </td>
                                        );
                                    })}

                                    {/* Total Marginal Fila */}
                                    <td style={{...cellStyle, background: '#fffcf0'}}>
                                        <div style={{fontWeight: 'bold'}}>{resultado.totalFilas[fila]}</div>
                                        <div style={{fontSize: '0.8em', color: '#555'}}>
                                            {((resultado.totalFilas[fila] / resultado.granTotal) * 100).toFixed(1)}%
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {/* Fila de Totales Columna */}
                            <tr style={{borderTop: '2px solid #333'}}>
                                <td style={{...headerStyle, background: '#fffcf0'}}>Total Columna</td>
                                {resultado.columnas.map(col => (
                                    <td key={col} style={{...cellStyle, background: '#fffcf0'}}>
                                        <div style={{fontWeight: 'bold'}}>{resultado.totalColumnas[col]}</div>
                                        <div style={{fontSize: '0.8em', color: '#555'}}>
                                            {((resultado.totalColumnas[col] / resultado.granTotal) * 100).toFixed(1)}%
                                        </div>
                                    </td>
                                ))}
                                {/* Gran Total */}
                                <td style={{...cellStyle, background: '#e6fffa', fontWeight: 'bold'}}>
                                    n = {resultado.granTotal} <br/>
                                    100%
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            ) : Array.isArray(resultado) ? (
                <div style={{ overflowX: 'auto' }}>
                    {calculo === "distribucion_intervalos" ? (
                       <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", marginTop: "10px", width: "100%", fontSize: '0.9em', textAlign: 'center' }}>
                         <thead>
                          <tr style={{ background: '#f8f9fa' }}>
                            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Intervalos</th>
                            <th style={{ padding: '8px', border: '1px solid #ddd' }}><Latex formula="f_i" /></th>
                            <th style={{ padding: '8px', border: '1px solid #ddd' }}><Latex formula="p_i \%" /></th>
                            <th style={{ padding: '8px', border: '1px solid #ddd' }}><Latex formula="F_i" /></th>
                            <th style={{ padding: '8px', border: '1px solid #ddd' }}><Latex formula="P_i \%" /></th>
                            <th style={{ padding: '8px', border: '1px solid #ddd' }}><Latex formula="F'_i" /></th>
                            <th style={{ padding: '8px', border: '1px solid #ddd' }}><Latex formula="P'_i \%" /></th>
                          </tr>
                        </thead>
                        <tbody>
                           {resultado.map((row, i) => (
                             <tr key={i} className="hover:bg-gray-50">
                                <td style={cellStyle}>{row["Haber básico"] || row["Intervalos"] || row["Intervalo"]}</td>
                                <td style={cellStyle}>{formatearCelda(row["f_i"] || row["fi"])}</td>
                                <td style={cellStyle}>{formatearCelda(row["p_i"] || row["pi%"] || row["pi"])}</td>
                                <td style={cellStyle}>{formatearCelda(row["F_i"] || row["Fi"])}</td>
                                <td style={cellStyle}>{formatearCelda(row["P_i"] || row["Pi%"] || row["Pi"])}</td>
                                <td style={cellStyle}>{formatearCelda(row["F'i"] || row["F_i_inv"])}</td>
                                <td style={cellStyle}>{formatearCelda(row["P'i"] || row["P'i%"] || row["P_i_inv"])}</td>
                             </tr>
                           ))}
                        </tbody>
                       </table>
                    ) : calculo === "frecuencias_completas" ? (
                       <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", marginTop: "10px", width: "100%", fontSize: '0.9em', textAlign: 'center' }}>
                         <thead>
                           <tr style={{ background: '#f8f9fa', color: '#333' }}>
                             <th style={{ padding: '8px', border: '1px solid #999' }}><Latex formula="x_i" /></th>
                             <th style={{ padding: '8px', border: '1px solid #999' }}><Latex formula="f_i" /></th>
                             <th style={{ padding: '8px', border: '1px solid #999' }}><Latex formula="F_i" /></th>
                             <th style={{ padding: '8px', border: '1px solid #999' }}><Latex formula="F^{\uparrow}_i" /></th>
                             <th style={{ padding: '8px', border: '1px solid #999' }}><Latex formula="p_i \%" /></th>
                             <th style={{ padding: '8px', border: '1px solid #999' }}><Latex formula="P_i \%" /></th>
                             <th style={{ padding: '8px', border: '1px solid #999' }}><Latex formula="P^{\uparrow}_i \%" /></th>
                           </tr>
                         </thead>
                         <tbody>
                           {resultado.map((row, i) => (
                             <tr key={i} className="hover:bg-gray-50">
                                <td style={{ ...cellStyle, fontWeight: 'bold' }}>{row["x_i"] || row["Valor"]}</td>
                                <td style={cellStyle}>{formatearCelda(row["f_i"] || row["fi"] || row["Frecuencia"])}</td>
                                <td style={cellStyle}>{formatearCelda(row["F_i"] || row["Fi"])}</td>
                                <td style={cellStyle}>{formatearCelda(row["F_i_inv"] || row["F'i"])}</td>
                                <td style={{ ...cellStyle, color: '#2563eb', fontWeight: '500' }}>{formatearCelda(row["p_i"] || row["pi%"] || row["Relativa"])}</td>
                                <td style={cellStyle}>{formatearCelda(row["P_i"] || row["Pi%"])}</td>
                                <td style={cellStyle}>{formatearCelda(row["P_i_inv"] || row["P'i%"])}</td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                    ) : (
                      <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", marginTop: "10px", width: "100%", fontSize: '0.9em' }}>
                        <thead>
                          <tr style={{ background: '#f3f4f6' }}>
                            {Object.keys(resultado[0]).map((key) => (
                                 <th key={key} style={{ padding: '8px', border: '1px solid #ddd' }}>{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {resultado.map((row, i) => (
                            <tr key={i}>
                              {Object.values(row).map((val, j) => (
                                <td key={j} style={cellStyle}>{formatearCelda(val)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                </div>
            ) : <pre>{JSON.stringify(resultado, null, 2)}</pre>
          ) : <p>No hay resultados aún.</p>}
        </div>
        
        {/* Zona de Gráficos (Copiar tal cual estaba en tu original) */}
        <div className="graficos" style={{ width: '100%', marginTop: '30px' }}>
          {resultado && (
             
             // --- CASO 1: BIVARIADA (NUEVO) ---
             // Solo entra aquí si el resultado es un objeto y tiene el tipo "bivariada"
             !Array.isArray(resultado) && resultado.tipo === "bivariada" ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <GraficoBivariado datos={resultado} tipo="agrupadas" />
                    <GraficoBivariado datos={resultado} tipo="apiladas_100" />
                </div>
             ) : 
             
             // --- CASO 2: INTERVALOS (EXISTENTE) ---
             // Solo entra aquí si es un array y el cálculo fue "distribucion_intervalos"
             Array.isArray(resultado) && esIntervalo ? (
                <div className="graficos-extra" style={{ width: "100%", display: 'block' }}>
                    <h3>Gráficos de Intervalos</h3>
                    <GraficoIntervalos datos={resultado} />
                </div>
             ) : 
             
             // --- CASO 3: SIMPLE / ESTÁNDAR (EXISTENTE) ---
             // Entra aquí para Frecuencia Absoluta, Relativa, etc.
             Array.isArray(resultado) ? (
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div className="grafico" style={{ flex: 1, minWidth: '300px' }}>
                        <h4>Gráfico de Barras</h4>
                        <GraficoEstadistico datos={resultado} tipo="barras" />
                    </div>
                    <div className="grafico" style={{ flex: 1, minWidth: '300px' }}>
                        <h4>Gráfico Circular</h4>
                        <GraficoEstadistico datos={resultado} tipo="pastel" />
                    </div>
                </div>
             ) : null
          )}
        </div>

      </div>
    </div>
  );
}