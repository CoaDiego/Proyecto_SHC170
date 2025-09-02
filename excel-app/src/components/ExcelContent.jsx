import { useState, useEffect } from "react";

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
