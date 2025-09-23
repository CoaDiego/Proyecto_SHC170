/* import { useState, useEffect } from "react";

export default function ExcelContent({ filename }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!filename) return;

    fetch(`http://127.0.0.1:8000/view/${filename}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener el Excel:", err);
        setLoading(false);
      });
  }, [filename]);

  if (loading) return <p>Cargando datos...</p>;
  if (!data.length) return <p>No hay datos en este archivo.</p>;

  return (
    <table border="1">
      <thead>
        <tr>
          {Object.keys(data[0]).map((col) => (
            <th key={col}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {Object.values(row).map((val, j) => (
              <td key={j}>{val}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
 */



import { useState, useEffect } from "react";

export default function ExcelContent({ filename, onDelete }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(0);

  // Obtener lista de hojas
  useEffect(() => {
    if (!filename) return;

    fetch(`http://127.0.0.1:8000/sheets/${filename}`)
      .then(res => res.json())
      .then(json => {
        if (json.sheets) {
          setSheets(json.sheets);
          setSelectedSheet(0);
        }
      });
  }, [filename]);

  // Obtener datos de la hoja seleccionada
  useEffect(() => {
    if (!filename) return;

    setLoading(true);
    fetch(`http://127.0.0.1:8000/view/${filename}?hoja=${selectedSheet}`)
      .then(res => res.json())
      .then(json => {
        if (!json.error) setData(json);
        else setData([]);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setData([]);
        setLoading(false);
      });
  }, [filename, selectedSheet]);

  const handleDelete = () => {
    fetch(`http://127.0.0.1:8000/files/${filename}`, { method: "DELETE" })
      .then(res => res.json())
      .then(data => {
        if (data.message) onDelete();
      });
  };

  if (loading) return <p>Cargando datos...</p>;
  if (!data.length) return <p>No hay datos en esta hoja.</p>;

  return (
    <div>
      <h2>Contenido de: {filename}</h2>

      {sheets.length > 1 && (
        <div>
          <label>Seleccionar hoja: </label>
          <select value={selectedSheet} onChange={e => setSelectedSheet(e.target.value)}>
            {sheets.map((sheet, i) => (
              <option key={i} value={i}>{sheet}</option>
            ))}
          </select>
        </div>
      )}

      <table border="1" style={{ marginTop: "10px" }}>
        <thead>
          <tr>
            {Object.keys(data[0]).map((col, i) => <th key={i}>{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {Object.values(row).map((val, j) => <td key={j}>{val}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
