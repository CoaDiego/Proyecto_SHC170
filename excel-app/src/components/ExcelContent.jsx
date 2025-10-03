import { useState, useEffect } from "react";

export default function ExcelContent({ filename, onSheetChange }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(0);

  useEffect(() => {
    if (!filename) return;

    fetch(`http://127.0.0.1:8000/sheets/${filename}`)
      .then(res => res.json())
      .then(json => {
        if (json.sheets) {
          setSheets(json.sheets);
          setSelectedSheet(0);
          onSheetChange?.(0); // ⚡ avisar al padre
        }
      });
  }, [filename]);

  useEffect(() => {
    if (!filename) return;

    setLoading(true);
    fetch(`http://127.0.0.1:8000/view/${filename}?hoja=${selectedSheet}`)
      .then(res => res.json())
      .then(json => {
        if (!json.error) setData(json);
        else setData([]);
        setLoading(false);
      });
  }, [filename, selectedSheet]);

  const handleSheetChange = (e) => {
    const newIndex = Number(e.target.value);
    setSelectedSheet(newIndex);
    onSheetChange?.(newIndex); // ⚡ avisar al padre
  };

  if (loading) return <p>Cargando datos...</p>;
  if (!data.length) return <p>No hay datos en esta hoja.</p>;

  return (
    <div>
      <h3>Contenido de: {filename}</h3>

      {sheets.length > 1 && (
        <div>
          <label>Seleccionar hoja: </label>
          <select value={selectedSheet} onChange={handleSheetChange}>
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
