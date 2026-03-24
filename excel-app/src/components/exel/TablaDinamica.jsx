import { useState, _useEffect } from "react";
import { DataGrid } from "react-data-grid";
import "react-data-grid/lib/styles.css";

import { alerta } from '../../utils/Notificaciones';

import { api } from '../../services/api';

import "../../styles/components/excel/TablaDinamica.css";


// Editor manual (Mismo que usamos en Calculadora)
function textEditor({ row, column, onRowChange, onClose }) {
  return (
    <input
      className="editor_text"
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
      await api.guardarTabla(nombre, datosLimpios);
      alerta.success(`Cambios guardados: ${nombre}.xlsx`, "Tu tabla se ha guardado correctamente.");
      // Avisar al padre (Calculadora) que recargue la lista
      if (onTablaCreada) onTablaCreada();
    } catch (err) {
      console.error("Error al guardar la tabla", err);
      alerta.error("Algo salió mal", "Inténtalo de nuevo más tarde.");
    }finally {
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
      className="columnas_editor"
      placeholder="Nombre Columna"
    /> 
  )
}));


return (
  <div className="container_tablas_Dinamica">
    <h3 className="titulo">Tablas Manuales</h3>

    {/* Inputs Nombre */}
    <div className="container_input">
      <label>Nombre del Archivo:</label>
      <div className="container_input_datos">
        <input
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Ej: Datos_Encuesta"
        />
        <span>.xlsx</span>
      </div>
    </div>

    {/* Barra de Herramientas */}
    <div className="container_herramientas">
      <button onClick={agregarFila} className="button_fila_columna">
        Agregar Fila
      </button>
      <button onClick={eliminarUltimaFila} className="button_eliminar_fila ">
        Eliminar Fila
      </button>
      <button onClick={agregarColumna} className="button_fila_columna">
        Agregar Columna
      </button>

      <div style={{ flex: 1 }}></div> {/* Espaciador */}

      <button onClick={guardarTabla} disabled={loading} className="button_guardar">
        {loading ? "Guardando..." : "Guardar Tabla"}
      </button>
    </div>

    {mensaje && <p className="mensaje" style={{color: mensaje.startsWith("✅") ? "green" : "red" }}>{mensaje}</p>}

    {/* GRILLA EDITABLE */}
    <div className="container_grilla">
      <DataGrid
        key={columns.length}
        columns={columnasEditables}
        rows={rows}
        onRowsChange={setRows}
        className="rdg-light"
        style={{ blockSize: "100%" }}
      />
    </div>

    <p className="informacion_grilla">
      * Doble clic en una celda para editar. Usa Tab para moverte.
    </p>
  </div>
);
}