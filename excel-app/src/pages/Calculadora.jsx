import { useEffect, useState } from "react";
import Calculator from "../components/Calculator";
import ExcelContent from "../components/ExcelContent";
import Calculadora_Excel from "../components/Calculadora_Excel";
import GraficoEstadistico from "../components/GraficoEstadistico";
// 🔹 Import del nuevo componente de gráficos de intervalos
import GraficoIntervalos from "../components/graficos/GraficoIntervalos";
import TablaDinamica from "../components/TablaDinamica";

export default function Calculadora() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [resultadoExcel, setResultadoExcel] = useState(null);
  const [mostrarTabla, setMostrarTabla] = useState(true); // Solo controla la tabla
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false); 

  // Cargar archivos al inicio
  useEffect(() => {
    fetch("http://127.0.0.1:8000/files")
      .then((res) => res.json())
      .then((data) => {
        if (data.files) {
          setFiles(data.files);
          if (data.files.length > 0) setSelectedFile(data.files[0].filename);
        }
      })
      .catch(console.error);
  }, []);

  // Cargar hojas del archivo seleccionado
  useEffect(() => {
    if (!selectedFile) return;

    fetch(`http://127.0.0.1:8000/sheets/${encodeURIComponent(selectedFile)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.sheets) {
          setSheets(data.sheets);
          setSelectedSheet(0);
        } else {
          setSheets([]);
          setSelectedSheet("");
        }
      })
      .catch(console.error);
  }, [selectedFile]);

  return (
    <div className="calculadora-layout">
      {/* ---------------- Sección de Datos ---------------- */}
      <div className="calculadora-datos">
        <h2>- Archivos Subidos -</h2>

        <label className="etiqueta">Selecciona un archivo:</label>
        <select
          value={selectedFile}
          onChange={(e) => setSelectedFile(e.target.value)}
          className="selector-archivo"
        >
          {files.map((file) => (
            <option key={file.filename} value={file.filename}>
              {file.filename} ({file.author || "Desconocido"})
            </option>
          ))}
        </select>

        {/* Vista previa de la tabla editable */}
        <ExcelContent
          onSheetChange={(index) => setSelectedSheet(index)}
          filename={selectedFile}
          mostrarTabla={false}
        />

        {/* Calculadora de Excel */}
        <Calculadora_Excel
          filename={selectedFile}
          sheet={selectedSheet}
          usarTodaHoja={false}
          mostrarDatos={mostrarTabla} // Prop que solo muestra inputs
          onResultadoChange={setResultadoExcel}
        />

        {/* Tabla dinámica */}
        <TablaDinamica
          onTablaCreada={() => {
            // ⚡ Recargar lista de archivos tras crear tabla
            fetch("http://127.0.0.1:8000/files")
              .then(res => res.json())
              .then(data => {
                if (data.files) setFiles(data.files);
              });
          }}
        />

        <br />

        {/* Botón para mostrar u ocultar la Calculadora estadística */}
        <button
          onClick={() => setMostrarCalculadora(!mostrarCalculadora)}
          className={`px-3 py-2 mt-4 rounded text-white ${
            mostrarCalculadora ? "bg-blue-600" : "bg-gray-500"
          }`}
        >
          {mostrarCalculadora
            ? "Ocultar Calculadora Estadística"
            : "Mostrar Calculadora Estadística"}
        </button>

        {/* Calculadora independiente */}
        {mostrarCalculadora && <Calculator />}
      </div>

      {/* ---------------- Sección de Resultados y Gráficos ---------------- */}
      <div className="calculadora-resultados">
        {/* ---------------- Tabla de resultados ---------------- */}
        <div className="frecuencias">
          <h3>Frecuencias</h3>
          {resultadoExcel ? (
            Array.isArray(resultadoExcel) ? (
              <table
                border="1"
                cellPadding="5"
                style={{ borderCollapse: "collapse", marginTop: "10px" }}
              >
                <thead>
                  {resultadoExcel[0]["Haber básico"] ? (
                    // 🔹 Tabla de distribución por intervalos
                    <tr>
                      <th>Haber básico</th>
                      <th>fi</th>
                      <th>pi</th>
                      <th>Fi</th>
                      <th>Pi</th>
                      <th>F'i</th>
                      <th>P'i</th>
                    </tr>
                  ) : (
                    // 🔹 Tabla normal de frecuencias
                    <tr>
                      <th>x_i</th>
                      <th>Frecuencia absoluta (f_i)</th>
                      <th>Frecuencia acumulada (F_i)</th>
                      <th>Frecuencia acumulada inversa (F_i_inv)</th>
                      <th>Frecuencia relativa porcentual p_i (%)</th>
                      <th>Frecuencia relativa acumulada porcentual P_i (%)</th>
                      <th>
                        Frecuencia relativa acumulada inversa porcentual P_i_inv (%)
                      </th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {resultadoExcel.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td key={j}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <pre>{JSON.stringify(resultadoExcel, null, 2)}</pre>
            )
          ) : (
            <p>No hay resultados aún.</p>
          )}

               {/* ----------- Graficos Extras (Intervalos) ----------- */}
{Array.isArray(resultadoExcel) &&
 resultadoExcel.length > 0 &&
 resultadoExcel[0].Intervalo && (
  <div className="graficos-extra" style={{ marginTop: "30px" }}>
    <h3>Gráficos adicionales (Intervalos)</h3>
    <GraficoIntervalos datos={resultadoExcel} />
  </div>
)}
        </div>

        {/* ---------------- Gráficos ---------------- */}
        <div className="graficos">
          {resultadoExcel ? (
            Array.isArray(resultadoExcel) && resultadoExcel[0]["Haber básico"] ? (
              // 🔹 Solo para distribución por intervalos
              <GraficoIntervalos datos={resultadoExcel} />
            ) : (
              <>
                <div className="grafico">
                  <h4>Gráfico de Barras</h4>
                  <GraficoEstadistico datos={resultadoExcel} tipo="barras" />
                </div>

                <div className="grafico">
                  <h4>Gráfico Circular</h4>
                  <GraficoEstadistico datos={resultadoExcel} tipo="pastel" />
                </div>
              </>
            )
          ) : (
            <p>No hay resultados aún.</p>
          )}
        </div>
      </div>

    </div>
  );
}
