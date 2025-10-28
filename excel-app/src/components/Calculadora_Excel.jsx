import { useEffect, useState } from "react";
import GraficoEstadistico from "./GraficoEstadistico";

export default function Calculadora_Excel({
  filename,
  sheet,
  onResultadoChange,
  mostrarTablaDatos = true, // controla solo la tabla editable
}) {
  const [excelData, setExcelData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [calculo, setCalculo] = useState("frecuencia_absoluta");
  const [resultadoExcel, setResultadoExcel] = useState(null);

  // Cargar datos de la hoja seleccionada
  useEffect(() => {
    if (!filename || sheet === "") return;
    const hojaIndex = Number(sheet);

    fetch(`http://127.0.0.1:8000/view/${filename}?hoja=${hojaIndex}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const headerRow = Object.values(data[0]);
          setColumns(headerRow);

          const realData = data.slice(1).map((row) =>
            Object.fromEntries(
              Object.keys(row).map((key, idx) => [headerRow[idx], row[key]])
            )
          );

          setExcelData(realData);
          setSelectedColumn(headerRow[0]);
        }
      })
      .catch(console.error);
  }, [filename, sheet]);

  // Manejar cambio de valor en la columna editable
  const handleChangeDato = (index, value) => {
    const newData = [...excelData];
    newData[index][selectedColumn] = Number(value);
    setExcelData(newData);
  };

  // Extraer datos numéricos de la columna seleccionada
  const datos = excelData
    .map((row) => row[selectedColumn])
    .filter((v) => typeof v === "number" && !isNaN(v));

  // Función para calcular tabla de frecuencias completas
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

    // Frecuencia acumulada inversa
    let F_i_inv = 0;
    for (let i = tabla.length - 1; i >= 0; i--) {
      F_i_inv += tabla[i].f_i;
      tabla[i].F_i_inv = F_i_inv;
    }

    // Porcentajes
    let P_i = 0;
    for (let i = 0; i < tabla.length; i++) {
      const p_i = (tabla[i].f_i / N) * 100;
      P_i += p_i;
      tabla[i].p_i = +(p_i.toFixed(2));
      tabla[i].P_i = +(P_i.toFixed(2));
    }

    // Porcentaje acumulado inverso
    let P_i_inv = 0;
    for (let i = tabla.length - 1; i >= 0; i--) {
      P_i_inv += tabla[i].p_i;
      tabla[i].P_i_inv = +(P_i_inv.toFixed(2));
    }

    return tabla;
  };

  // Ejecutar cálculo
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

    setResultadoExcel(res);
    if (onResultadoChange) onResultadoChange(res, calculo);
  };

  // Render
  return (
    <div className="p-4 border rounded mt-6 bg-gray-50">
      <h2 className="text-xl font-bold mb-3 text-blue-700"> Calculadora de Excel</h2>

      {/* Selector de columna */}
      {columns.length > 0 && (
        <>
          <label className="block mb-1 font-semibold">Selecciona una columna:</label>
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="border p-1 rounded mb-3 w-full"
          >
            {columns.map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>

          {/* Tabla editable de la columna, controlada por mostrarTablaDatos */}
{datos.length > 0 && mostrarTablaDatos && (
  <div className="mb-3">
    <strong>Datos de la columna "{selectedColumn}":</strong>
    <div className="mt-2 max-h-64 overflow-y-auto border rounded-lg p-2 bg-white">
      <div
        className="grid gap-2 text-xs"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(60px, 1fr))"
        }}
      >
        {excelData.map((row, i) => (
          <div key={i} className="flex flex-col items-center border p-1 rounded">
            <span className="text-gray-500 text-[10px]">#{i + 1}</span>
            <input
              type="number"
              value={row[selectedColumn]}
              onChange={(e) => handleChangeDato(i, e.target.value)}
              className="border rounded w-full text-center text-xs p-0.5"
            />
          </div>
        ))}
      </div>
    </div>
  </div>
)}





        </>
      )}

      {/* Selector de cálculo */}
      <label className="block mb-1 font-semibold">Selecciona un cálculo:</label>
      <select
        value={calculo}
        onChange={(e) => setCalculo(e.target.value)}
        className="border p-1 rounded mb-3 w-full"
      >
        <option value="frecuencia_absoluta">Frecuencia absoluta</option>
        <option value="frecuencia_relativa">Frecuencia relativa</option>
        <option value="minimo">Mínimo</option>
        <option value="maximo">Máximo</option>
        <option value="frecuencias_completas">Tabla de frecuencias</option>
      </select>

      <button
        onClick={handleCalcular}
        className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded"
      >
        Calcular
      </button>
    </div>
  );
}
