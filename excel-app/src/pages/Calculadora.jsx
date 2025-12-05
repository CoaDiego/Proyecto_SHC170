import { useEffect, useState } from "react";
import { DataGrid } from "react-data-grid"; 
import "react-data-grid/lib/styles.css";

// --- IMPORTS ---
import Calculator from "../components/Calculator";
import ExcelContent from "../components/ExcelContent";
import GraficoEstadistico from "../components/GraficoEstadistico";
import GraficoIntervalos from "../components/graficos/GraficoIntervalos";
import TablaDinamica from "../components/TablaDinamica"; // 👈 Tu componente creador
import Latex from "../components/Latex";
import GraficoBivariado from "../components/graficos/GraficoBivariado";
import { useCalculadoraExcel } from "../hooks/useCalculadoraExcel";

// --- EDITOR MANUAL PARA RDG ---
function textEditor({ row, column, onRowChange, onClose }) {
  return (
    <input
      style={{ width: '100%', border: 'none', padding: '0 5px', outline: 'none', background: 'transparent', color: 'inherit' }}
      autoFocus
      value={row[column.key]}
      onChange={(e) => onRowChange({ ...row, [column.key]: e.target.value })}
      onBlur={() => onClose(true)}
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

  const [mostrarTabla, setMostrarTabla] = useState(true);
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false); 

  const {
    excelData, columns, selectedColumn, setSelectedColumn,    
    selectedColumnY, setSelectedColumnY, resultado, calculo,
    tipoIntervalo, metodoK, kPersonalizado,
    setCalculo, setTipoIntervalo, setMetodoK, setKPersonalizado,
    handleChangeDato, ejecutarCalculo
  } = useCalculadoraExcel(selectedFile, selectedSheet);

  // Helper formateo
  const formatearCelda = (valor) => {
    if (typeof valor === "number") return Number.isInteger(valor) ? valor : Number(valor).toFixed(2);
    if (!isNaN(parseFloat(valor)) && isFinite(valor)) {
         const num = Number(valor);
         return Number.isInteger(num) ? num : num.toFixed(2);
    }
    return valor;
  };

  // Carga inicial
  const cargarArchivos = () => {
    fetch("http://127.0.0.1:8000/files")
      .then((res) => res.json())
      .then((data) => { 
        if (data.files) { 
          setFiles(data.files); 
          if (data.files.length > 0 && !selectedFile) setSelectedFile(data.files[0].filename); 
        } 
      })
      .catch(console.error);
  };

  useEffect(() => { cargarArchivos(); }, []);

  const esIntervalo = calculo === "distribucion_intervalos";

  // Configuración Columnas RDG
  const rdgColumns = [];
  if (selectedColumn) {
      rdgColumns.push({
          key: selectedColumn, name: `${selectedColumn} (Var X)`,
          renderEditCell: textEditor, editable: true, resizable: true, width: '50%', cellClass: 'celda-editable'
      });
  }
  if (calculo === "distribucion_bivariada" && selectedColumnY) {
      rdgColumns.push({
          key: selectedColumnY, name: `${selectedColumnY} (Var Y)`,
          renderEditCell: textEditor, editable: true, resizable: true, width: '50%', cellClass: 'celda-editable-y'
      });
  }

  const handleGridChange = (newRows, { indexes, column }) => {
      indexes.forEach(index => {
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
    <div className="calculadora-layout">
      
      {/* ================= IZQUIERDA: CONTROLES ================= */}
      <div className="calculadora-datos">

        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '5px' }}> Datos </h3>

        <label className="etiqueta">Selecciona un archivo:</label>
        <select 
            value={selectedFile} 
            onChange={(e) => {
                setSelectedFile(e.target.value);
                setModoCreacion(false); // Si selecciona archivo, salimos del modo creación
            }} 
            className="selector-archivo"
            style={{ marginBottom: '15px', width: '100%' }}
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
            onSheetChange={(index) => setSelectedSheet(index)} 
        />

        <div className="panel-controles-excel" style={{ marginTop: '20px', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-card)' }}>
            <h3 style={{ fontSize: '1.1em', marginBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>Calculadora de Excel</h3>

            {columns.length > 0 ? (
                <>
                    <label>Operación:</label>
                    <select value={calculo} onChange={(e) => setCalculo(e.target.value)} style={{ width: '100%', marginBottom: '15px' }}>
                        <option value="frecuencia_absoluta">Frecuencia Absoluta</option>
                        <option value="frecuencia_relativa">Frecuencia Relativa</option>
                        <option value="frecuencias_completas">Tabla de Frecuencias</option>
                        <option value="distribucion_intervalos">Distribución por Intervalos</option>
                        <option value="distribucion_bivariada">Distribución Bivariante</option>
                        <option value="minimo">Mínimo</option>
                        <option value="maximo">Máximo</option>
                    </select>

                    <label>{calculo === "distribucion_bivariada" ? "Variable X (Filas):" : "Columna Seleccionada:"}</label>
                    <select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)} style={{ width: '100%', marginBottom: '10px' }}>{columns.map((col) => <option key={col} value={col}>{col}</option>)}</select>

                    {calculo === "distribucion_bivariada" && (
                        <>
                            <label style={{ color: 'var(--accent-color)' }}>Variable Y (Columnas):</label>
                            <select value={selectedColumnY} onChange={(e) => setSelectedColumnY(e.target.value)} style={{ width: '100%', marginBottom: '15px', borderColor: 'var(--accent-color)' }}>{columns.map((col) => <option key={col} value={col}>{col}</option>)}</select>
                        </>
                    )}

                    {mostrarTabla && excelData.length > 0 && (
                        <div style={{ marginBottom: '15px', height: '350px', display: 'flex', flexDirection: 'column' }}>
                            <p style={{ fontSize: '0.8em', fontWeight: 'bold', marginBottom: '5px', color: 'var(--text-muted)' }}> Vista Previa (Doble clic para editar):</p>
                            <DataGrid 
                                columns={rdgColumns} 
                                rows={excelData} 
                                onRowsChange={handleGridChange} 
                                className="rdg-light" 
                                style={{ blockSize: '100%', border: '1px solid var(--border-color)' }}
                            />
                        </div>
                    )}

                    {calculo === "distribucion_intervalos" && (
                        <div style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px', marginBottom: '15px' }}>
                            <label>Tipo Intervalo:</label>
                            <select value={tipoIntervalo} onChange={(e) => setTipoIntervalo(e.target.value)} style={{ width: '100%', marginBottom: '8px' }}>
                                <option value="semiabierto">Semiabierto [a, b)</option>
                                <option value="cerrado">Cerrado [a, b]</option>
                                <option value="abierto">Abierto (a, b)</option>
                            </select>
                            <label>Método K:</label>
                            <select value={metodoK} onChange={(e) => setMetodoK(e.target.value)} style={{ width: '100%', marginBottom: '5px' }}>
                                <option value="sturges">Sturges</option>
                                <option value="cuadratica">Cuadrática</option>
                                <option value="logaritmica">Logarítmica</option>
                                <option value="personalizada">Manual</option>
                            </select>
                            {metodoK === "personalizada" && <input type="number" value={kPersonalizado} onChange={(e) => setKPersonalizado(e.target.value)} placeholder="Valor k" style={{ width: '100%', marginTop: '5px' }} />}
                        </div>
                    )}

                    <button onClick={ejecutarCalculo} className="boton-calcular" style={{ width: '100%', padding: '10px', marginTop: '10px' }}>CALCULAR</button>
                </>
            ) : <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Cargando datos o selecciona un archivo...</p>}
        </div>
         {/* BOTÓN NUEVO: ACTIVAR MODO CREACIÓN */}
        <br />
        <button 
            onClick={() => setModoCreacion(!modoCreacion)}
            style={{ 
                width: '100%',
                padding: '10px',
                marginBottom: '20px',
                backgroundColor: modoCreacion ? 'var(--text-muted)' : 'var(--accent-color)', // Cambia color si está activo
                fontWeight: 'bold',
                fontSize: '1em'
            }}
        >
            {modoCreacion ? "Volver a Resultados" : "Crear Tabla de Datos"}
        </button>
        <br />
        <button onClick={() => setMostrarCalculadora(!mostrarCalculadora)} style={{ width: '100%', padding: '8px', background: '#6b7280' }}>
            {mostrarCalculadora ? "Ocultar Calculadora Manual" : "Mostrar Calculadora Manual"}
        </button>
        {mostrarCalculadora && <Calculator />}

      </div>

      {/* ================= DERECHA: RESULTADOS O CREADOR ================= */}
      <div className="calculadora-resultados">
          
          {/* LÓGICA DE INTERRUPTOR: ¿QUÉ MOSTRAMOS AQUÍ? */}
          {modoCreacion ? (
              // 1. MODO CREACIÓN (Ocupa todo el panel derecho)
              <TablaDinamica 
                  onTablaCreada={() => { 
                      cargarArchivos(); // Recargar lista de archivos
                      setModoCreacion(false); // Volver automáticamente a ver resultados
                  }} 
              />
          ) : (
              // 2. MODO RESULTADOS (Tu vista normal)
              <>
                <div className="frecuencias" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '15px', borderRadius: '8px' }}>
                  <h3>Resultados: {calculo.replace(/_/g, " ").toUpperCase()}</h3>
                  {resultado ? (
                    !Array.isArray(resultado) && resultado.tipo === "bivariada" ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="tabla-academica">
                                {/* TABLA BIVARIADA */}
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
                            <table className="tabla-academica">
                                <thead>
                                <tr>
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
                  ) : <p style={{ color: 'var(--text-muted)' }}>No hay resultados aún.</p>}
                </div>

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
              </>
          )}
      </div>
    </div>
  );
}