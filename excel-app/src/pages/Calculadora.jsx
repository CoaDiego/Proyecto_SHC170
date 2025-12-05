import { useEffect, useState } from "react";
import Calculator from "../components/Calculator";
import ExcelContent from "../components/ExcelContent";
import GraficoEstadistico from "../components/GraficoEstadistico";
import GraficoIntervalos from "../components/graficos/GraficoIntervalos";
import TablaDinamica from "../components/TablaDinamica";
import Latex from "../components/Latex";
import GraficoBivariado from "../components/graficos/GraficoBivariado";
import { useCalculadoraExcel } from "../hooks/useCalculadoraExcel";

export default function Calculadora() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [mostrarTabla, setMostrarTabla] = useState(true);
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false); 

  const {
    excelData, columns, selectedColumn, setSelectedColumn, selectedColumnY, setSelectedColumnY,
    resultado, calculo, tipoIntervalo, metodoK, kPersonalizado,
    setCalculo, setTipoIntervalo, setMetodoK, setKPersonalizado,
    handleChangeDato, ejecutarCalculo
  } = useCalculadoraExcel(selectedFile, selectedSheet);

  const formatearCelda = (valor) => {
    if (typeof valor === "number") return Number.isInteger(valor) ? valor : Number(valor).toFixed(2);
    if (!isNaN(parseFloat(valor)) && isFinite(valor)) {
         const num = Number(valor);
         return Number.isInteger(num) ? num : num.toFixed(2);
    }
    return valor;
  };

  useEffect(() => {
    fetch("http://127.0.0.1:8000/files").then((res) => res.json())
      .then((data) => { if (data.files) { setFiles(data.files); if (data.files.length > 0) setSelectedFile(data.files[0].filename); } });
  }, []);

  const esIntervalo = calculo === "distribucion_intervalos";

  return (
    <div className="calculadora-layout">
      {/* === IZQUIERDA: CONTROLES === */}
      <div className="calculadora-datos">
        <h2>Archivos Subidos</h2>
        <select value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)} style={{ width: '100%', marginBottom: '15px' }}>
          {files.map((file) => <option key={file.filename} value={file.filename}>{file.filename} ({file.author})</option>)}
        </select>

        <ExcelContent filename={selectedFile} mostrarTabla={false} onSheetChange={(index) => setSelectedSheet(index)} />

        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <h3>Configuración Cálculo</h3>
            {columns.length > 0 ? (
                <>
                    <label>Operación:</label>
                    <select value={calculo} onChange={(e) => setCalculo(e.target.value)} style={{ width: '100%', marginBottom: '10px' }}>
                        <option value="frecuencia_absoluta">Frecuencia Absoluta</option>
                        <option value="frecuencia_relativa">Frecuencia Relativa</option>
                        <option value="frecuencias_completas">Tabla de Frecuencias</option>
                        <option value="distribucion_intervalos">Distribución por Intervalos</option>
                        <option value="distribucion_bivariada">Distribución Bivariante</option>
                        <option value="minimo">Mínimo</option>
                        <option value="maximo">Máximo</option>
                    </select>

                    <label>Variable X:</label>
                    <select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)} style={{ width: '100%', marginBottom: '10px' }}>
                        {columns.map((col) => <option key={col} value={col}>{col}</option>)}
                    </select>

                    {calculo === "distribucion_bivariada" && (
                        <>
                            <label style={{ color: 'var(--accent-color)' }}>Variable Y:</label>
                            <select value={selectedColumnY} onChange={(e) => setSelectedColumnY(e.target.value)} style={{ width: '100%', marginBottom: '15px', borderColor: 'var(--accent-color)' }}>
                                {columns.map((col) => <option key={col} value={col}>{col}</option>)}
                            </select>
                        </>
                    )}

                    {mostrarTabla && excelData.length > 0 && (
                        <div style={{ marginBottom: '15px', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)' }}>
                            <table className="tabla-academica">
                                <thead>
                                    <tr><th>{selectedColumn}</th>{calculo === "distribucion_bivariada" && <th>{selectedColumnY}</th>}</tr>
                                </thead>
                                <tbody>
                                    {excelData.map((row, i) => (
                                        <tr key={i}>
                                            <td><input type="text" value={row[selectedColumn] ?? ""} onChange={(e) => handleChangeDato(i, selectedColumn, e.target.value)} style={{ border: 'none', background: 'transparent', textAlign: 'center', color: 'var(--text-main)' }} /></td>
                                            {calculo === "distribucion_bivariada" && (
                                                <td><input type="text" value={row[selectedColumnY] ?? ""} onChange={(e) => handleChangeDato(i, selectedColumnY, e.target.value)} style={{ border: 'none', background: 'transparent', textAlign: 'center', color: 'var(--accent-color)' }} /></td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {calculo === "distribucion_intervalos" && (
                        <div style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px', marginBottom: '15px' }}>
                            <select value={tipoIntervalo} onChange={(e) => setTipoIntervalo(e.target.value)} style={{ width: '100%', marginBottom: '5px' }}>
                                <option value="semiabierto">Semiabierto [a, b)</option>
                                <option value="cerrado">Cerrado [a, b]</option>
                                <option value="abierto">Abierto (a, b)</option>
                            </select>
                            <select value={metodoK} onChange={(e) => setMetodoK(e.target.value)} style={{ width: '100%' }}>
                                <option value="sturges">Sturges</option>
                                <option value="cuadratica">Cuadrática</option>
                                <option value="logaritmica">Logarítmica</option>
                                <option value="personalizada">Manual</option>
                            </select>
                        </div>
                    )}
                    <button onClick={ejecutarCalculo} style={{ width: '100%' }}>CALCULAR</button>
                </>
            ) : <p>Cargando columnas...</p>}
        </div>

        <div style={{ marginTop: '20px' }}>
             <TablaDinamica onTablaCreada={() => { fetch("http://127.0.0.1:8000/files").then(res => res.json()).then(data => { if (data.files) setFiles(data.files); }); }} />
        </div>
        <button onClick={() => setMostrarCalculadora(!mostrarCalculadora)} style={{ width: '100%', marginTop: '10px', background: '#6b7280' }}>
            {mostrarCalculadora ? "Ocultar Calculadora Manual" : "Mostrar Calculadora Manual"}
        </button>
        {mostrarCalculadora && <Calculator />}
      </div>

      {/* === DERECHA: RESULTADOS === */}
      <div className="calculadora-resultados">
        <div className="frecuencias" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
          <h3>Resultados: {calculo.replace(/_/g, " ").toUpperCase()}</h3>
          {resultado ? (
            !Array.isArray(resultado) && resultado.tipo === "bivariada" ? (
                // TABLA BIVARIADA USANDO CLASES CSS
                <div style={{ overflowX: 'auto' }}>
                    <table className="tabla-academica">
                        <thead>
                            <tr>
                                <th style={{ background: 'transparent', border: 'none' }}></th>
                                <th colSpan={resultado.columnas.length}>VARIABLE Y: {selectedColumnY}</th>
                                <th>Total</th>
                            </tr>
                            <tr>
                                <th>VARIABLE X:<br/> {selectedColumn}</th>
                                {resultado.columnas.map(col => <th key={col}>{col}</th>)}
                                <th><Latex formula="f_{i \cdot}" /> / %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resultado.filas.map(fila => (
                                <tr key={fila}>
                                    <td className="celda-x">{fila}</td>
                                    {resultado.columnas.map(col => {
                                        const f_ij = resultado.datos[fila][col];
                                        const p_ij = ((f_ij / resultado.granTotal) * 100).toFixed(1); 
                                        return (
                                            <td key={col}>
                                                <strong>{f_ij}</strong><br/>
                                                <small style={{ color: 'var(--text-muted)' }}><Latex formula={`p_{ij}=${p_ij}\\%`} /></small>
                                            </td>
                                        );
                                    })}
                                    <td className="celda-total">
                                        <strong>{resultado.totalFilas[fila]}</strong><br/>
                                        <small>{((resultado.totalFilas[fila] / resultado.granTotal) * 100).toFixed(1)}%</small>
                                    </td>
                                </tr>
                            ))}
                            <tr>
                                <td className="celda-total">Total</td>
                                {resultado.columnas.map(col => (
                                    <td key={col} className="celda-total">
                                        <strong>{resultado.totalColumnas[col]}</strong><br/>
                                        <small>{((resultado.totalColumnas[col] / resultado.granTotal) * 100).toFixed(1)}%</small>
                                    </td>
                                ))}
                                <td className="celda-total">n = {resultado.granTotal}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ) : Array.isArray(resultado) ? (
                <div style={{ overflowX: 'auto' }}>
                    {/* TABLAS SIMPLES USANDO CLASES CSS */}
                    <table className="tabla-academica">
                         <thead>
                           <tr>
                             {/* Detectamos columnas dinámicamente para simplificar el código */}
                             {Object.keys(resultado[0]).map((key) => (
                                 <th key={key}>
                                     {key === "f_i" ? <Latex formula="f_i" /> : 
                                      key === "p_i" ? <Latex formula="p_i \%" /> : key}
                                 </th>
                             ))}
                           </tr>
                         </thead>
                         <tbody>
                           {resultado.map((row, i) => (
                             <tr key={i}>
                                {Object.values(row).map((val, j) => (
                                    <td key={j}>{formatearCelda(val)}</td>
                                ))}
                             </tr>
                           ))}
                         </tbody>
                       </table>
                </div>
            ) : <pre>{JSON.stringify(resultado, null, 2)}</pre>
          ) : <p>No hay resultados aún.</p>}
        </div>

        {/* GRÁFICOS CON CLASES CSS */}
        <div className="graficos-grid">
          {resultado && (
             !Array.isArray(resultado) && resultado.tipo === "bivariada" ? (
                <>
                    <div className="grafico-card"><GraficoBivariado datos={resultado} tipo="agrupadas" /></div>
                    <div className="grafico-card"><GraficoBivariado datos={resultado} tipo="apiladas_100" /></div>
                </>
             ) : Array.isArray(resultado) && esIntervalo ? (
                <div className="grafico-card" style={{ width: '100%' }}>
                    <h3>Gráficos de Intervalos</h3>
                    <GraficoIntervalos datos={resultado} />
                </div>
             ) : Array.isArray(resultado) ? (
                <>
                    <div className="grafico-card"><h4>Gráfico de Barras</h4><GraficoEstadistico datos={resultado} tipo="barras" /></div>
                    <div className="grafico-card"><h4>Gráfico Circular</h4><GraficoEstadistico datos={resultado} tipo="pastel" /></div>
                </>
             ) : null
          )}
        </div>
      </div>
    </div>
  );
}