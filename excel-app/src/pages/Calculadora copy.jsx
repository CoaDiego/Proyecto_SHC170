import { useEffect, useState } from "react";
// Importamos tus componentes visuales existentes
import Calculator from "../components/Calculator";
import ExcelContent from "../components/ExcelContent";
import GraficoEstadistico from "../components/GraficoEstadistico";
import GraficoIntervalos from "../components/graficos/GraficoIntervalos";
import TablaDinamica from "../components/TablaDinamica";
import Latex from "../components/Latex";

// Importamos el Hook con la lógica matemática
import { useCalculadoraExcel } from "../hooks/useCalculadoraExcel";

export default function Calculadora() {
  // --- Estados de la interfaz ---
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  
  const [mostrarTabla, setMostrarTabla] = useState(true);
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false); 

  // --- CONEXIÓN CON EL HOOK ---
  const {
    excelData, columns, selectedColumn, resultado, calculo,
    tipoIntervalo, metodoK, kPersonalizado,
    setSelectedColumn, setCalculo, setTipoIntervalo, setMetodoK, setKPersonalizado,
    handleChangeDato, ejecutarCalculo
  } = useCalculadoraExcel(selectedFile, selectedSheet);

  // --- DICCIONARIO DE TOOLTIPS ---
  const definiciones = {
    "Haber básico": "Intervalo de clase calculado",
    "fi": "Frecuencia Absoluta",
    "p_i": "Frecuencia Relativa Porcentual",
    "Fi": "Frecuencia Acumulada",
    "Pi": "Frecuencia Relativa Acumulada %"
  };

  // 1. Cargar archivos al inicio
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

  // 2. Cargar hojas al cambiar archivo
  useEffect(() => {
    if (!selectedFile) return;
    fetch(`http://127.0.0.1:8000/sheets/${encodeURIComponent(selectedFile)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.sheets) {
          setSheets(data.sheets);
          setSelectedSheet(0);
        } else {
          setSheets([]);
          setSelectedSheet("");
        }
      })
      .catch(console.error);
  }, [selectedFile]);

  // Helper: Detectar si es intervalo para gráficos
  const esIntervalo = calculo === "distribucion_intervalos";
  

  return (
    <div className="calculadora-layout">
      
      {/* ================= SECCIÓN IZQUIERDA: CONTROLES ================= */}
      <div className="calculadora-datos">
        <h2>- Archivos Subidos -</h2>

        <label className="etiqueta">Selecciona un archivo:</label>
        <select
          value={selectedFile}
          onChange={(e) => setSelectedFile(e.target.value)}
          className="selector-archivo"
        >
          {files.map((file) => (
            <option key={file.filename} value={file.filename}>
              {file.filename} ({file.author || "Desconocido"})
            </option>
          ))}
        </select>

        <ExcelContent
          onSheetChange={(index) => setSelectedSheet(index)}
          filename={selectedFile}
          mostrarTabla={false}
        />

        {/* PANEL DE CONTROL */}
        <div className="panel-controles-excel" style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h3 style={{ fontSize: '1.1em', color: '#333', marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
              Calculadora de Excel
            </h3>

            {columns.length > 0 ? (
                <>
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.9em', marginBottom: '5px' }}>
                      Columna Seleccionada:
                    </label>
                    <select 
                        value={selectedColumn} 
                        onChange={(e) => setSelectedColumn(e.target.value)}
                        style={{ width: '100%', padding: '6px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        {columns.map((col) => <option key={col} value={col}>{col}</option>)}
                    </select>

                    {/* Tabla Miniatura Editable */}
                    {mostrarTabla && excelData.length > 0 && (
                        <div style={{ marginBottom: '15px' }}>
                           
                            <div style={{ maxHeight: '150px', overflowY: 'auto', background: 'white', border: '1px solid #eee', padding: '5px', borderRadius: '4px' }}>
                                {excelData.map((row, i) => (
                                    <input
                                        key={i}
                                        type="number"
                                        value={row[selectedColumn] ?? ""}
                                        onChange={(e) => handleChangeDato(i, e.target.value)}
                                        style={{ width: '100%', marginBottom: '2px', textAlign: 'center', fontSize: '0.9em' }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.9em', marginBottom: '5px' }}>
                        Seleccionar calculo
                    </label>
                    <select 
                        value={calculo} 
                        onChange={(e) => setCalculo(e.target.value)}
                        style={{ width: '100%', padding: '6px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        <option value="frecuencia_absoluta">Frecuencia Absoluta</option>
                        <option value="frecuencia_relativa">Frecuencia Relativa</option>
                        <option value="minimo">Mínimo</option>
                        <option value="maximo">Máximo</option>
                        <option value="frecuencias_completas">Tabla de Frecuencias </option>
                        <option value="distribucion_intervalos">Distribución por Intervalos</option>
                    </select>

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
                            
                            {metodoK === "personalizada" && (
                                <input 
                                    type="number" 
                                    value={kPersonalizado} 
                                    onChange={(e) => setKPersonalizado(e.target.value)} 
                                    placeholder="Valor k" 
                                    style={{ width: '100%', padding: '4px', marginTop: '5px' }}
                                />
                            )}
                        </div>
                    )}

                    <button onClick={ejecutarCalculo} className="boton-calcular" style={{ width: '100%', padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>CALCULAR</button>
                </>
            ) : (
                <p style={{ fontSize: '0.9em', color: '#666', textAlign: 'center' }}>Carga un archivo para ver opciones.</p>
            )}
        </div>

        <div style={{ marginTop: '20px' }}>
            <TablaDinamica onTablaCreada={() => { fetch("http://127.0.0.1:8000/files").then(res => res.json()).then(data => { if (data.files) setFiles(data.files); }); }} />
        </div>
        <br />
        <button onClick={() => setMostrarCalculadora(!mostrarCalculadora)} style={{ width: '100%', padding: '8px', marginTop: '10px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {mostrarCalculadora ? "Ocultar Calculadora Manual" : "Mostrar Calculadora Manual"}
        </button>
        {mostrarCalculadora && <Calculator />}
      </div>

      {/* ================= SECCIÓN DERECHA: RESULTADOS ================= */}
      <div className="calculadora-resultados">
        
        {/* 1. TABLA DE RESULTADOS */}
        <div className="frecuencias">
          <h3>Tabla de Resultados: <br /> {calculo.replace(/_/g, " ").toUpperCase()}</h3>
          {resultado ? (
            Array.isArray(resultado) ? (
              <div style={{ overflowX: 'auto' }}>
                
                {/* --- ESCENARIO A: INTERVALOS (A PRUEBA DE FALLOS) --- */}
                {calculo === "distribucion_intervalos" ? (
                   <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", marginTop: "10px", width: "100%", fontSize: '0.9em', textAlign: 'center' }}>
                     <thead>
                      <tr style={{ background: '#f3f4f6' }}>
                        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Intervalos</th>
                        {/* Usamos LaTeX para la notación matemática perfecta */}
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
                            {/* AQUÍ ESTÁ EL TRUCO: Buscamos el nombre NUEVO (Haber básico) O el VIEJO (Intervalos/Intervalo) */}
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row["Haber básico"] || row["Intervalos"] || row["Intervalo"]}</td>
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row["f_i"] || row["fi"]}</td>
                            {/* Buscamos p_i (nuevo) O pi% (viejo) */}
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row["p_i"] || row["pi%"] || row["pi"]}</td>
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row["F_i"] || row["Fi"]}</td>
                            {/* Buscamos P_i (nuevo) O Pi% (viejo) */}
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row["P_i"] || row["Pi%"] || row["Pi"]}</td>
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row["F'i"] || row["F_i_inv"]}</td>
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row["P'i"] || row["P'i%"] || row["P_i_inv"]}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>

                /* --- ESCENARIO B: DISCRETA (A PRUEBA DE FALLOS) --- */
                ) : calculo === "frecuencias_completas" ? (
                   <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", marginTop: "10px", width: "100%", fontSize: '0.9em', textAlign: 'center' }}>
                     <thead>
                       <tr style={{ background: '#e2e8f0', color: '#333' }}>
                         <th style={{ padding: '8px', border: '1px solid #999' }}><Latex formula="x_i" /></th>
                         <th style={{ padding: '8px', border: '1px solid #999' }}><Latex formula="f_i" /></th>
                         <th style={{ padding: '8px', border: '1px solid #999' }}><Latex formula="F_i" /></th>
                         {/* Flecha arriba en LaTeX se escribe \uparrow */}
                         <th style={{ padding: '8px', border: '1px solid #999' }}><Latex formula="F^{\uparrow}_i" /></th>
                         <th style={{ padding: '8px', border: '1px solid #999' }}><Latex formula="p_i \%" /></th>
                         <th style={{ padding: '8px', border: '1px solid #999' }}><Latex formula="P_i \%" /></th>
                         <th style={{ padding: '8px', border: '1px solid #999' }}><Latex formula="P^{\uparrow}_i \%" /></th>
                       </tr>
                     </thead>
                     <tbody>
                       {resultado.map((row, i) => (
                         <tr key={i} className="hover:bg-gray-50">
                            <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>{row["x_i"] || row["Valor"]}</td>
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row["f_i"] || row["fi"] || row["Frecuencia"]}</td>
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row["F_i"] || row["Fi"]}</td>
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row["F_i_inv"] || row["F'i"]}</td>
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row["p_i"] || row["pi%"] || row["Relativa"]}</td>
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row["P_i"] || row["Pi%"]}</td>
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row["P_i_inv"] || row["P'i%"]}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>

                /* --- ESCENARIO C: GENÉRICO --- */
                ) : (
                  <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", marginTop: "10px", width: "100%", fontSize: '0.9em' }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6' }}>
                        {Object.keys(resultado[0]).map((key) => (
                             <th 
                                key={key} 
                                style={{ padding: '8px', border: '1px solid #ddd', cursor: 'help' }}
                                title={definiciones[key] || key} 
                             >
                                {key}
                             </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((val, j) => (
                            <td key={j} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <pre style={{ background: '#f3f4f6', padding: '10px', borderRadius: '5px' }}>{JSON.stringify(resultado, null, 2)}</pre>
            )
          ) : (
            <p>No hay resultados aún.</p>
          )}
        </div>

        {/* 2. ZONA DE GRÁFICOS */}
        <div className="graficos" style={{ width: '100%' }}>
          {resultado && Array.isArray(resultado) && resultado.length > 0 ? (
             esIntervalo ? (
                <div className="graficos-extra" style={{ marginTop: "30px", width: "100%", display: 'block' }}>
                    <h3>Gráficos de Intervalos</h3>
                    <GraficoIntervalos datos={resultado} />
                </div>
             ) : (
                <>
                    <div className="grafico">
                        <h4>Gráfico de Barras</h4>
                        <GraficoEstadistico datos={resultado} tipo="barras" />
                    </div>
                    <div className="grafico">
                        <h4>Gráfico Circular</h4>
                        <GraficoEstadistico datos={resultado} tipo="pastel" />
                    </div>
                </>
             )
          ) : (
             resultado && <p>No hay datos gráficos disponibles.</p>
          )}
        </div>
      </div>
    </div>
  );
}