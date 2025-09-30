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
          // Usamos la primera fila para los nombres de columna
          const headerRow = Object.values(data[0]);
          setColumns(headerRow);

          // Los datos reales empiezan desde la segunda fila
          const realData = data.slice(1).map(row =>
            Object.fromEntries(Object.keys(row).map((key, idx) => [headerRow[idx], row[key]]))
          );
          
          setExcelData(realData);
          setSelectedColumn(headerRow[0]);
        }
      })
      .catch((err) => console.error("Error al cargar datos Excel:", err));
  }, [filename, sheet]);

  const datos = excelData
    .map((row) => row[selectedColumn])
    .filter((v) => typeof v === "number");

  // ==========================
  // FUNCIONES DE CÁLCULO EXTRA
  // ==========================
  const calcularFrecuencias = (datos) => {
    const N = datos.length;

    // Frecuencia absoluta (f_i)
    const conteo = {};
    datos.forEach((x) => {
      conteo[x] = (conteo[x] || 0) + 1;
    });

    // Ordenamos por valor (x_i)
    const valoresOrdenados = Object.keys(conteo)
      .map((x) => Number(x))
      .sort((a, b) => a - b);

    let F_i = 0;
    const tabla = valoresOrdenados.map((x) => {
      const f_i = conteo[x];
      F_i += f_i;
      return { x_i: x, f_i, F_i };
    });

    // Frecuencia acumulada inversa (F_i_inv)
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
      tabla[i].p_i = p_i.toFixed(2);
      tabla[i].P_i = P_i.toFixed(2);
    }

    // Porcentaje acumulado inverso (P_i_inv)
    let P_i_inv = 0;
    for (let i = tabla.length - 1; i >= 0; i--) {
      P_i_inv += parseFloat(tabla[i].p_i);
      tabla[i].P_i_inv = P_i_inv.toFixed(2);
    }

    return tabla;
  };

  // ==========================
  // FUNCIÓN PRINCIPAL DE CÁLCULO
  // ==========================
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

    setResultado(res);
  };

  // ==========================
  // RENDERIZADO DE RESULTADOS
  // ==========================
  const resultadoTabla =
    resultado && typeof resultado === "object" && !Array.isArray(resultado)
      ? Object.entries(resultado).map(([valor, fi]) => ({ valor, fi }))
      : [];

  return (
    <div className="p-4 border rounded mt-6">
      <h2 className="text-xl font-bold mb-2"> - Calculadora -</h2>

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

          {/* Mostrar datos de la columna seleccionada */}
          {datos.length > 0 && (
            <p className="mb-2">
              <strong>Datos extraídos:</strong> {datos.join(", ")}
            </p>
          )}
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
        <option value="frecuencias_completas">Tabla de frecuencias</option>
      </select>

      <button
        onClick={handleCalcular}
        className="bg-blue-500 text-white p-1 rounded mb-2"
      >
        Calcular
      </button>

      {/* Mostrar tabla simple (frecuencia absoluta/relativa) */}
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

      {/* Mostrar tabla de frecuencias completas */}
      {resultado && Array.isArray(resultado) && calculo === "frecuencias_completas" && (
        <table
          border="1"
          cellPadding="5"
          style={{ borderCollapse: "collapse", marginTop: "10px" }}
        >
          <thead>
            <tr>
              <th>x_i</th>
              <th> Frecuencia absoluta (f_i) </th>
              <th> Frecuencia acumulada (F_i) </th>
              <th> Frecuencia acumulada inversa (F_i_inv) </th>
              <th> Frecuencia relativa porcentual p_i (%)</th>
              <th> Frecuencia relativa acumulada porcentual P_i (%)</th>
              <th> Frecuencia relativa acumulada inversa porcentual P_i_inv (%)</th>
               {/* 
               f_i → cuántas veces ocurre.
               F_i → cuántas veces ha ocurrido hasta ahí.
               F_i_inv → cuántas veces ocurrirá de ahí en adelante.
               p_i (%) → qué porcentaje representa.
               P_i (%) → porcentaje acumulado hacia abajo.
               P_i_inv (%) → porcentaje acumulado hacia arriba. */}
            </tr>
          </thead>
          <tbody>
            {resultado.map((row, idx) => (
              <tr key={idx}>
                <td>{row.x_i}</td>
                <td>{row.f_i}</td>
                <td>{row.F_i}</td>
                <td>{row.F_i_inv}</td>
                <td>{row.p_i}</td>
                <td>{row.P_i}</td>
                <td>{row.P_i_inv}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
