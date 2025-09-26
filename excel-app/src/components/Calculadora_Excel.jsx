import { useEffect, useState } from "react";

export default function Calculadora_Excel({ filename, sheet }) {
  const [excelData, setExcelData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [calculo, setCalculo] = useState("frecuencia_absoluta");
  const [resultado, setResultado] = useState(null);

  // Cargar datos de la hoja seleccionada
  useEffect(() => {
    if (!filename || sheet === "") return;
    console.log("Cargando hoja:", sheet);
    const hojaIndex = Number(sheet);

    fetch(`http://127.0.0.1:8000/view/${filename}?hoja=${hojaIndex}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setExcelData(data);
          const cols = Object.keys(data[0]);
          setColumns(cols);
          setSelectedColumn(cols[0]);
        } else {
          setExcelData([]);
          setColumns([]);
          setSelectedColumn("");
        }
      })
      .catch((err) => console.error("Error al cargar datos Excel:", err));
  }, [filename, sheet]);

  const datos = excelData
    .map((row) => row[selectedColumn])
    .filter((v) => typeof v === "number");

  // Función de cálculo
  const handleCalcular = () => {
    if (!selectedColumn || datos.length === 0) return;

    let res;
    switch (calculo) {
      case "frecuencia_absoluta":
        res = {};
        datos.forEach((val) => (res[val] = (res[val] || 0) + 1));
        break;
      case "frecuencia_relativa":
        res = {};
        const total = datos.length;
        datos.forEach((val) => (res[val] = ((res[val] || 0) + 1) / total));
        break;
      case "minimo":
        res = Math.min(...datos);
        break;
      case "maximo":
        res = Math.max(...datos);
        break;
      default:
        res = "Cálculo no implementado";
    }

    setResultado(res);
  };

  const resultadoTabla =
    resultado && typeof resultado === "object" && !Array.isArray(resultado)
      ? Object.entries(resultado).map(([valor, fi]) => ({ valor, fi }))
      : [];

  return (
    <div className="p-4 border rounded mt-6">
      <h3 className="text-xl font-bold mb-2">📊 Calculadora desde Excel</h3>

      {/* Selector de columna */}
      {columns.length > 0 && (
        <>
          <label className="block mb-1">Selecciona una columna:</label>
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="border p-1 rounded mb-2"
          >
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </>
      )}
<br />
      <label className="block mb-1">Selecciona un cálculo:</label>
      <select
        value={calculo}
        onChange={(e) => setCalculo(e.target.value)}
        className="border p-1 rounded mb-2"
      >
        <option value="frecuencia_absoluta">Frecuencia absoluta</option>
        <option value="frecuencia_relativa">Frecuencia relativa</option>
        <option value="minimo">Mínimo</option>
        <option value="maximo">Máximo</option>
      </select>

      <button
        onClick={handleCalcular}
        className="bg-blue-500 text-white p-1 rounded mb-2"
      >
        Calcular
      </button>

      {resultado && resultadoTabla.length > 0 && (
        <table
          border="1"
          cellPadding="5"
          style={{ borderCollapse: "collapse", marginTop: "10px" }}
        >
          <thead>
            <tr>
              <th>Valor</th>
              <th>Frecuencia</th>
            </tr>
          </thead>
          <tbody>
            {resultadoTabla.map((row, idx) => (
              <tr key={idx}>
                <td>{row.valor}</td>
                <td>{row.fi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
