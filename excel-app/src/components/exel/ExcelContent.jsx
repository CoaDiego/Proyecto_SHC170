import { useState, useEffect } from "react";
import { DataGrid } from "react-data-grid";
import "react-data-grid/lib/styles.css";

import { api } from "../../services/api";
import {alerta} from "../../utils/Notificaciones"

import "../../styles/components/excel/ExcelContent.css";

// --- FUNCIÓN PARA LETRAS DE COLUMNAS (A, B, C...) ---
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

// --- EDITOR MANUAL ---
function textEditor({ row, column, onRowChange, onClose }) {
  return (
    <input
      className="text_editor"
      autoFocus
      value={row[column.key]}
      onChange={(e) => onRowChange({ ...row, [column.key]: e.target.value })}
      onBlur={() => onClose(true)}
    />
  );
}

export default function ExcelContent({ filename, onSheetChange, mostrarTabla = true, permitirEdicion = true }) {
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [huboCambios, setHuboCambios] = useState(false);
  const [cargandoGuardado, setCargandoGuardado] = useState(false);

  // 1. CARGAR HOJAS
  useEffect(() => {
    if (!filename) return;
    setSheets([]); setRows([]); setColumns([]); setSelectedSheet(0); setError("");
    if (onSheetChange) onSheetChange(0);

    const fetchHojas = async () => {
      try {
        const json = await api.obtenerHojas(filename);
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

    // ESTA ES LA LÍNEA QUE ARREGLA EL ERROR (se borró onSheetChange)
  }, [filename, onSheetChange]);

  // 2. CARGAR DATOS DE LA HOJA
  useEffect(() => {
    if (!filename || sheets.length === 0 || !mostrarTabla) return;
    setLoading(true);

    const fetchDatos = async () => {
      try {
        const json = await api.obtenerDatosHoja(filename, selectedSheet);

        if (Array.isArray(json) && json.length > 0) {
          const rawKeys = Object.keys(json[0]);

          const cols = rawKeys.map((key, index) => ({
            key: key,
            name: getExcelColumnName(index),
            resizable: true,
            sortable: true,
            width: 150,
            minWidth: 80,
            renderEditCell: textEditor,
          }));

          const headerRow = {};
          rawKeys.forEach(key => {
            headerRow[key] = key.startsWith("Unnamed:") ? "" : key;
          });

          setColumns(cols);
          setRows([headerRow, ...json]);
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
  }, [filename, selectedSheet, sheets, mostrarTabla]);

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

  //Funciones para Poder editar el excel
  const handleRowsChange = (newRows) => {
    setRows(newRows);
    setHuboCambios(true);
  }
  const guardarExcel = async () => {
    setCargandoGuardado(true);
    try {
      await api.actualizarExcel(filename, selectedSheet, rows);
      setHuboCambios(false);
      alerta.success("cambios guardados");
    } catch (err) {
      alerta.error("error", err.message);
    } finally {
      setCargandoGuardado(false);
    }
  };

  return (
    <div className="container_content" style={{
      height: mostrarTabla ? '550px' : 'auto',
    }}>

      {/* CABECERA DEL CONTENIDO (AHORA SÍ ES RESPONSIVA) */}
      <div className="container_cabecera">

        <div className="container_cabecera_info">
          <h5 >Archivo en uso</h5>
          <span>
            {filename}
          </span>
          { permitirEdicion && huboCambios && <small>tiene cambios pendientes</small>}
        </div>

        {permitirEdicion && huboCambios && (

          <div className="container_cabecera_botones">
            <button
              onClick={guardarExcel}
              disabled={cargandoGuardado}
            >
              {cargandoGuardado ? "Guardando..." : "Actualizar"}
            </button>
          </div>

        )}

        {sheets.length > 0 && (
          <div className="container_edicion">
              <span>
                Edición Activa
              </span>
            <div className="container_edicion_datos">
              <label>Hoja:</label>
              <select
                value={selectedSheet}
                onChange={handleSheetChange}
              >
                {sheets.map((sheetName, index) => (
                  <option key={index} value={index}>{sheetName}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* TABLA O ESTADO DE CARGA */}
      {mostrarTabla && (
        loading ? (
          <div className="container_tablas">
            <h3>Cargando datos desde el servidor...</h3>
            <p>Esto puede tardar dependiendo del tamaño del archivo.</p>
          </div>
        ) : rows.length > 0 ? (
          <div className="container_tablas_datos">
            <DataGrid
              columns={columns}
              rows={rows}
              onRowsChange={handleRowsChange}
              className="rdg-light personalizado"
            />
          </div>
        ) : (
          <div className="container_vacio">
            <p>Hoja vacía.</p>
          </div>
        )
      )}
    </div>
  );
}