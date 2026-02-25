import { useState, _useEffect } from "react";
import { DataGrid } from "react-data-grid";
import "react-data-grid/lib/styles.css";

import { alerta} from '../../utils/Notificaciones';

// Editor manual (Mismo que usamos en Calculadora)
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

export default function TablaDinamica({ onTablaCreada }) {
  // Configuración inicial
  const [nombre, setNombre] = useState("");
  const [mensaje, _setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para React Data Grid
  const [columns, setColumns] = useState([
    {
      key: "0", name: "Col 1", renderEditCell: textEditor, editable: true, resizable: true,
      width: "1.5fr", minWidth: 150
    },
    {
      key: "1", name: "Col 2", renderEditCell: textEditor, editable: true, resizable: true,
      width: "1.5fr", minWidth: 150
    },
  ]);

  const [rows, setRows] = useState([
    { "0": "", "1": "" },
    { "0": "", "1": "" },
    { "0": "", "1": "" }
  ]);

  // --- LOGICA DE GRILLA ---

  const agregarColumna = () => {
    const newIndex = columns.length.toString();
    const newCol = {
      key: newIndex,
      name: `Col ${columns.length + 1}`,
      renderEditCell: textEditor,
      editable: true,
      resizable: true,
      width: "1.5fr",
      minWidth: 150
    };
    setColumns([...columns, newCol]);

    // Actualizar filas existentes para tener la nueva propiedad vacía
    setRows(rows.map(row => ({ ...row, [newIndex]: "" })));
  };

  const agregarFila = () => {
    const newRow = {};
    columns.forEach(col => {
      newRow[col.key] = "";
    });
    setRows([...rows, newRow]);
  };

  const eliminarUltimaFila = () => {
    if (rows.length === 0) return;
    setRows(rows.slice(0, -1));
  };

  // --- GUARDADO ---

  const guardarTabla = async () => {


    //algunas correcciones al momento de guardar un exel con datos

    const filasConDatos = rows.filter(row => {
      return columns.some(col => {
        const valor = row[col.key];
        return valor !== undefined && valor !== null && String(valor).trim() !== "";
      })
    });

    if (!nombre.trim()) {
      alerta.warning("Falta el nombre", "Escribe un nombre para tu archivo Excel.");
      return;
    }

    if (filasConDatos.length === 0) {
      alerta.error("Tabla vacía", "Por favor, ingresa al menos un dato.");
      return;
    }


    setLoading(true);
    //setMensaje("");
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Convertir formato RDG (Objetos) a Matriz simple para el Backend
    // El backend espera: [ ["A", "B"], ["1", "2"] ]

    //cambios en la agregacion de filas y colunas datos//

    const datosLimpios = filasConDatos.map(row => {
      let filaObjeto = {};
      columns.forEach(col => {
        filaObjeto[col.name] = row[col.key] || "";
      });
      return filaObjeto;
    });

    // Agregar cabeceras como primera fila (opcional, depende de tu backend)
    // Si tu backend espera solo datos, comenta la siguiente linea:
    //const matrizConCabeceras = [columns.map(c => c.name), ...matriz];

    try {
      const res = await fetch("http://127.0.0.1:8000/save_table", { // Asegúrate que este endpoint exista en tu main.py
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre,
          tabla: datosLimpios // Enviamos datos
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alerta.success(`Cambios guardados: ${nombre}.xlsx`, "Tu tabla se ha guardado correctamente.");
        // Avisar al padre (Calculadora) que recargue la lista
        if (onTablaCreada) onTablaCreada();
      } else {
        alerta.error("Algo salió mal", data.detail || "Inténtalo de nuevo más tarde.");
      }
    } catch (err) {
      console.error(err);

      alert.error("Error de conexión", "No pudimos comunicarnos con el servidor.");

    } finally {
      setLoading(false);
    }
  };

  //cambio para que el usuario pueda editar las columnas y mover dentro de las celdas

  const columnasEditables = columns.map(col => ({
    ...col,
    renderHeaderCell: () => (
      <input
        value={col.name}
        onChange={(e) => {
          const nuevoNombre = e.target.value;
          setColumns(columns.map(c => c.key === col.key ? { ...c, name: nuevoNombre } : c));
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.stopPropagation();
          }
        }}
        style={{ width: '100%', border: 'none', background: 'transparent', color: 'inherit', fontWeight: 'bold', outline: 'none', textAlign: 'center' }}
        placeholder="Nombre Columna"
      />
    )
  }));


  return (
    <div style={{ padding: "20px", border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--bg-card)" }}>
      <h3 style={{ marginTop: 0, color: "var(--primary-color)" }}>Tablas Manuales</h3>

      {/* Inputs Nombre */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Nombre del Archivo:</label>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Ej: Datos_Encuesta"
            style={{ flex: 1 }}
          />
          <span style={{ alignSelf: "center", color: "var(--text-muted)" }}>.xlsx</span>
        </div>
      </div>

      {/* Barra de Herramientas */}
      <div style={{ marginBottom: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button onClick={agregarFila} style={{ backgroundColor: "var(--bg-input)", color: "var(--text-main)", border: "1px solid var(--border-color)" }}>
          Agregar Fila
        </button>
        <button onClick={eliminarUltimaFila} style={{ backgroundColor: "var(--bg-input)", color: "red", border: "1px solid var(--border-color)" }}>
          Eliminar Fila
        </button>
        <button onClick={agregarColumna} style={{ backgroundColor: "var(--bg-input)", color: "var(--text-main)", border: "1px solid var(--border-color)" }}>
          Agregar Columna
        </button>

        <div style={{ flex: 1 }}></div> {/* Espaciador */}

        <button onClick={guardarTabla} disabled={loading} style={{ backgroundColor: "var(--accent-color)" }}>
          {loading ? "Guardando..." : "Guardar Tabla"}
        </button>
      </div>

      {mensaje && <p style={{ marginBottom: "15px", fontWeight: "bold", color: mensaje.startsWith("✅") ? "green" : "red" }}>{mensaje}</p>}

      {/* GRILLA EDITABLE */}
      <div style={{ height: "400px", border: "1px solid var(--border-color)" }}>
        <DataGrid
          key={columns.length}
          columns={columnasEditables}
          rows={rows}
          onRowsChange={setRows}
          className="rdg-light"
          style={{ blockSize: "100%" }}
        />
      </div>

      <p style={{ marginTop: "10px", fontSize: "0.8em", color: "var(--text-muted)" }}>
        * Doble clic en una celda para editar. Usa Tab para moverte.
      </p>
    </div>
  );
}