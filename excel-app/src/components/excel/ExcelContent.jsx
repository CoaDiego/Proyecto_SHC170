import React, { useState, useEffect, useRef } from "react";
import { DataGrid } from "react-data-grid";
import "react-data-grid/lib/styles.css";

import { api } from "../../services/api";
import { useData } from "./DataContext";
import { alerta } from "../../utils/Notificaciones"

import "../../styles/components/excel/ExcelContent.css";

const getExcelColumnName = (colIndex) => {
  let dividend = colIndex + 1;
  let colName = '';
  let modulo;
  while (dividend > 0) {
    modulo = (dividend - 1) % 26;
    colName = String.fromCharCode(65 + modulo) + colName;
    dividend = Math.floor((dividend - modulo) / 26);
  }
  return colName;
};

function textEditor({ row, column, onRowChange, onClose }) {
  return (
    <input
      className="text_editor"
      autoFocus
      value={row[column.key] ?? ''}
      onChange={(e) => onRowChange({ ...row, [column.key]: e.target.value })}
      onBlur={() => onClose(true)}
      onKeyDown={(e) => {
        if (['Enter', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
          const teclaDestino = e.key === 'Enter' ? 'ArrowDown' : e.key;
          onClose(true);
          
          setTimeout(() => {
            const celdaViva = document.activeElement;
            if (celdaViva && celdaViva.classList.contains('rdg-cell')) {
              celdaViva.dispatchEvent(
                new KeyboardEvent('keydown', { key: teclaDestino, bubbles: true })
              );
            }
          }, 10);
        } else if (e.key === 'Escape') {
          onClose(false);
        }
      }}
      style={{
        width: '100%', height: '100%', border: 'none',
        padding: '0 8px', outline: '2px solid #217346', boxSizing: 'border-box',
        textAlign: 'center'
      }}
    />
  );
}

// 🆕 1. Agregamos `curso = ""` en las props
export default function ExcelContent({ filename, autor, curso = "", onSheetChange, mostrarTabla = true, permitirEdicion = true }) {
  const { usuario } = useData();
  const nombreAutor = autor || (usuario ? usuario.nombre : null);
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [huboCambios, setHuboCambios] = useState(false);
  const [cargandoGuardado, setCargandoGuardado] = useState(false);

  const rowsRef = React.useRef(rows);
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  // 1. CARGAR HOJAS
  useEffect(() => {
    if (!filename || !nombreAutor) return;
    setSheets([]); setRows([]); setColumns([]); setSelectedSheet(0); setError("");
    setHuboCambios(false); 
    if (onSheetChange) onSheetChange(0);

    const fetchHojas = async () => {
      try {
        // 🆕 2. Enviamos el curso a la API
        const json = await api.obtenerHojas(filename, nombreAutor, curso);
        if (json.sheets && json.sheets.length > 0) {
          setSheets(json.sheets);
        } else {
          setError("El archivo no tiene hojas visibles.");
        }
      } catch (err) {
        console.error(err);
        setError("Error al conectar con el servidor.");
      }
    };

    fetchHojas();
  }, [filename, onSheetChange, nombreAutor, curso]); // 🆕 Agregamos curso a las dependencias

  // 2. CARGAR DATOS DE LA HOJA
  useEffect(() => {
    if (!filename || !nombreAutor || sheets.length === 0 || !mostrarTabla) return;
    setLoading(true);
    setHuboCambios(false); 

    const fetchDatos = async () => {
      try {
        // 🆕 3. Enviamos el curso a la API
        const json = await api.obtenerDatosHoja(filename, selectedSheet, nombreAutor, curso);

        if (Array.isArray(json) && json.length > 0) {
          const rawKeys = Object.keys(json[0]);
          const extraKeys = Array.from({ length: 10 }).map((_, i) => `__extra_col_${i}`);
          const allKeys = [...rawKeys, ...extraKeys];

          const cols = allKeys.map((key, index) => ({
            key: key,
            name: getExcelColumnName(index),
            resizable: true,
            sortable: true,
            width: 150,
            minWidth: 80,
            renderEditCell: textEditor,
            renderHeaderCell: () => (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                {getExcelColumnName(index)}
              </div>
            )
          }));

          const headerRow = {};
          allKeys.forEach(key => {
            if (rawKeys.includes(key)) {
              headerRow[key] = key.startsWith("Unnamed:") ? "" : key;
            } else {
              headerRow[key] = ""; 
            }
          });

          setColumns(cols);
          
          const emptyRows = Array.from({ length: 50 }).map(() => {
            const emptyRow = {};
            allKeys.forEach(key => { emptyRow[key] = ""; });
            return emptyRow;
          });

          const jsonConExtraCols = json.map(row => {
            const newRow = { ...row };
            extraKeys.forEach(k => { newRow[k] = ""; });
            return newRow;
          });

          const dataWithIds = [headerRow, ...jsonConExtraCols, ...emptyRows].map((r, i) => ({ ...r, _id: i }));
          setRows(dataWithIds);
        } else {
          setRows([]);
          setColumns([]);
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar los datos de la hoja.");
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [filename, selectedSheet, sheets, mostrarTabla, nombreAutor, curso]); // 🆕 Agregamos curso a las dependencias

  const handleSheetChange = (e) => {
    const newIndex = Number(e.target.value);
    setSelectedSheet(newIndex);
    if (onSheetChange) onSheetChange(newIndex);
  };

  if (error) return (
    <div className="text_error">
      <strong>Error:</strong> {error}
    </div>
  );

  const handleRowsChange = (newRows) => {
    setRows(newRows);
    setHuboCambios(true);
  }

  const guardarExcel = async () => {
    setCargandoGuardado(true);
    try {
      if (rowsRef.current.length === 0) return;

      const editedHeader = rowsRef.current[0];
      const extraKeys = Object.keys(editedHeader).filter(k => k.startsWith('__extra_col_'));
      const columnasExtraUsadas = new Set();

      rowsRef.current.forEach(r => {
        extraKeys.forEach(k => {
          if (r[k] !== "" && r[k] !== null && r[k] !== undefined && r[k].trim?.() !== "") {
            columnasExtraUsadas.add(k);
          }
        });
      });

      const datosParaGuardar = rowsRef.current.slice(1).reduce((acc, r) => {
        const isRowEmpty = Object.keys(r).every(key => 
          key === '_id' || r[key] === "" || r[key] === null || r[key] === undefined || (typeof r[key] === 'string' && r[key].trim() === "")
        );

        if (!isRowEmpty) {
          const newRecord = {};
          Object.keys(r).forEach(key => {
            if (key !== '_id') {
              if (key.startsWith('__extra_col_') && !columnasExtraUsadas.has(key)) {
                return; 
              }

              let newColName = editedHeader[key] !== undefined ? editedHeader[key] : key;
              
              if (key.startsWith('__extra_col_') && newColName === "") {
                newColName = `Nueva_Columna_${key.split('_').pop()}`; 
              }

              newRecord[newColName] = r[key];
            }
          });
          acc.push(newRecord);
        }
        return acc;
      }, []);

      // 🆕 4. Enviamos el curso al momento de guardar
      await api.actualizarExcel(filename, selectedSheet, datosParaGuardar, nombreAutor, curso);
      setHuboCambios(false);
      alerta.success("Cambios guardados");
    } catch (err) {
      alerta.error("Error", err.message);
    } finally {
      setCargandoGuardado(false);
    }
  }; 

  return (
    // 1. EL CONTENEDOR MAESTRO: Inicia la cadena Flex
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%' }}>

      {/* Si no estamos mostrando la tabla, SOLO dibujamos el selector limpio */}
      {!mostrarTabla && sheets.length > 0 && (
        <div style={{ marginBottom: "15px" }}> 
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Hoja de Trabajo:
          </label>
          <select
            value={selectedSheet}
            onChange={handleSheetChange}
            style={{ width: "100%", padding: "5px", borderRadius: "4px", border: "1px solid var(--border-color)" }}
          >
            {sheets.map((sheetName, index) => (
              <option key={index} value={index}>{sheetName}</option>
            ))}
          </select>
        </div>
      )}

      {/* CABECERA PARA CUANDO LA TABLA ESTÁ VISIBLE */}
      {mostrarTabla && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          {sheets.length > 0 && (
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <label>Hoja:</label>
               <select value={selectedSheet} onChange={handleSheetChange}>
                 {sheets.map((sheetName, index) => (
                   <option key={index} value={index}>{sheetName}</option>
                 ))}
               </select>
             </div>
          )}
          
          {permitirEdicion && huboCambios && (
            <button onClick={guardarExcel} disabled={cargandoGuardado} style={{ background: '#217346', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>
              {cargandoGuardado ? "Guardando..." : "Actualizar"}
            </button>
          )}
        </div>
      )}

      {/* TABLA O ESTADO DE CARGA */}
      {mostrarTabla && (
        loading ? (
          <div className="container_tablas" style={{ textAlign: 'center', padding: '20px' }}>
            <h3>Cargando datos...</h3>
          </div>
        ) : rows.length > 0 ? (
          
          /* 2. EL CONTENEDOR DE LA TABLA: Continúa la cadena Flex */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%' }}>
            <DataGrid
              columns={columns}
              rows={rows}
              onRowsChange={handleRowsChange}
              rowKeyGetter={(row) => row._id}
              className="rdg-light personalizado"
              style={{ flex: 1, minHeight: 0 }} /* 👈 3. EL TOQUE FINAL: La tabla recibe la instrucción exacta */
            />
          </div>

        ) : (
          <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa' }}>Hoja vacía.</div>
        )
      )}
    </div>
  );
}
