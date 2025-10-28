import { useState } from "react";

export default function TablaDinamica({ onTablaActualizada }) {
  const [nombre, setNombre] = useState("");
  const [numColumnas, setNumColumnas] = useState(1);
  const [numFilas, setNumFilas] = useState(1);
  const [tabla, setTabla] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  // Crear tabla inicial
  const crearTabla = () => {
    const columnas = Array.from({ length: numColumnas }, (_, i) => `Col ${i+1}`);
    const filas = Array.from({ length: numFilas }, () => columnas.map(() => ""));
    setTabla(filas);
    setMensaje(`Tabla '${nombre || "Ejemplo"}' creada`);
  };

  // Manejar cambios en celdas
  const handleChange = (filaIdx, colIdx, value) => {
    const nuevaTabla = [...tabla];
    nuevaTabla[filaIdx][colIdx] = value;
    setTabla(nuevaTabla);
    onTablaActualizada?.(nuevaTabla);
  };

  // Agregar fila
  const agregarFila = () => {
    if (tabla.length === 0) return;
    const nuevaFila = tabla[0].map(() => "");
    setTabla([...tabla, nuevaFila]);
  };

  // Agregar columna
  const agregarColumna = () => {
    if (tabla.length === 0) return;
    setTabla(tabla.map(fila => [...fila, ""]));
  };

  // Guardar tabla al backend
  const guardarTabla = async () => {
    if (tabla.length === 0) return;
    setLoading(true);
    setMensaje("");

    try {
      const res = await fetch("http://127.0.0.1:8000/save_table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre || "Ejemplo", tabla }),
      });

      const data = await res.json();
      if (data.filename) {
        setMensaje(`Tabla '${data.filename}' guardada con éxito`);
      } else {
        setMensaje("Error al guardar la tabla");
      }
    } catch (err) {
      console.error(err);
      setMensaje("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded mt-4 bg-gray-50">
      <h3 className="font-bold mb-2 text-blue-700">Tabla Dinámica</h3>

      {/* Inputs iniciales */}
      <div className="mb-2">
        <label>Nombre de la tabla:</label>
        <input value={nombre} onChange={e => setNombre(e.target.value)} className="border p-1 rounded w-full"/>
      </div>

      <div className="mb-2 flex gap-2">
        <div>
          <label>Número de columnas:</label> <br />
          <input type="number" min="1" value={numColumnas} onChange={e => setNumColumnas(Number(e.target.value))} className="border p-1 rounded"/>
        </div>
        <div>
          <label>Número de filas:</label> <br />
          <input type="number" min="1" value={numFilas} onChange={e => setNumFilas(Number(e.target.value))} className="border p-1 rounded"/>
        </div>
      </div>

      <button onClick={crearTabla} className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded mt-2">Crear Tabla</button>

      {mensaje && <p className="mt-2 text-sm text-gray-700">{mensaje}</p>}

      {/* Tabla editable */}
      {tabla.length > 0 && (
        <div className="mt-4 overflow-auto">
          <table className="border-collapse border border-gray-400">
            <thead>
              <tr>
                {tabla[0].map((_, i) => <th key={i} className="border p-1">Col {i+1}</th>)}
              </tr>
            </thead>
            <tbody>
              {tabla.map((fila, i) => (
                <tr key={i}>
                  {fila.map((celda, j) => (
                    <td key={j} className="border p-1">
                      <input
                        type="text"
                        value={celda}
                        onChange={e => handleChange(i, j, e.target.value)}
                        className="border p-1 w-16"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-2 flex gap-2">
            <button onClick={agregarFila} className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded">Agregar fila</button>
            <button onClick={agregarColumna} className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded">Agregar columna</button>
            <button onClick={guardarTabla} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white py-1 px-3 rounded">
              {loading ? "Guardando..." : "Guardar tabla"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
