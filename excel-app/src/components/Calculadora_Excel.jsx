import { useEffect, useState } from "react";

export default function Calculadora_Excel({ filename, sheet, onResultadoChange }) {
  const [excelData, setExcelData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [calculo, setCalculo] = useState("frecuencia_absoluta");

  // Cargar datos de la hoja
  useEffect(() => {
    if (!filename || sheet === "") return;
    const hojaIndex = Number(sheet);

    fetch(`http://127.0.0.1:8000/view/${filename}?hoja=${hojaIndex}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const headerRow = Object.values(data[0]);
          setColumns(headerRow);
          const realData = data.slice(1).map(row =>
            Object.fromEntries(Object.keys(row).map((key, idx) => [headerRow[idx], row[key]]))
          );
          setExcelData(realData);
          setSelectedColumn(headerRow[0]);
        }
      })
      .catch(console.error);
  }, [filename, sheet]);

  const datos = excelData
    .map((row) => row[selectedColumn])
    .filter((v) => typeof v === "number");

  const calcularFrecuencias = (datos) => {
    const N = datos.length;
    const conteo = {};
    datos.forEach((x) => (conteo[x] = (conteo[x] || 0) + 1));
    const valoresOrdenados = Object.keys(conteo).map(Number).sort((a, b) => a - b);

    let F_i = 0;
    const tabla = valoresOrdenados.map((x) => {
      const f_i = conteo[x];
      F_i += f_i;
      return { x_i: x, f_i, F_i };
    });

    let F_i_inv = 0;
    for (let i = tabla.length - 1; i >= 0; i--) {
      F_i_inv += tabla[i].f_i;
      tabla[i].F_i_inv = F_i_inv;
    }

    let P_i = 0;
    for (let i = 0; i < tabla.length; i++) {
      const p_i = (tabla[i].f_i / N) * 100;
      P_i += p_i;
      tabla[i].p_i = p_i.toFixed(2);
      tabla[i].P_i = P_i.toFixed(2);
    }

    let P_i_inv = 0;
    for (let i = tabla.length - 1; i >= 0; i--) {
      P_i_inv += parseFloat(tabla[i].p_i);
      tabla[i].P_i_inv = P_i_inv.toFixed(2);
    }

    return tabla;
  };

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
      case "frecuencias_completas":
        res = calcularFrecuencias(datos);
        break;
      default:
        res = "Cálculo no implementado";
    }

    if (onResultadoChange) onResultadoChange(res, calculo);
  };

  return (
    <div className="p-4 border rounded mt-6">
      <h2 className="text-xl font-bold mb-2"> - Calculadora -</h2>

      {columns.length > 0 && (
        <>
          <label className="block mb-1">Selecciona una columna:</label>
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="border p-1 rounded mb-2"
          >
            {columns.map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>

          {datos.length > 0 && (
            <p className="mb-2">
              <strong>Datos extraídos:</strong> {datos.join(", ")}
            </p>
          )}
        </>
      )}

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
        <option value="frecuencias_completas">Tabla de frecuencias</option>
      </select>

      <button
        onClick={handleCalcular}
        className="bg-blue-500 text-white p-1 rounded mb-2"
      >
        Calcular
      </button>
    </div>
  );
}
