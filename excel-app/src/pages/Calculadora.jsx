import { useEffect, useState } from "react";
import Calculator from "../components/Calculator";
import ExcelContent from "../components/ExcelContent";
import Calculadora_Excel from "../components/Calculadora_Excel";
import GraficoEstadistico from "../components/GraficoEstadistico";


export default function Calculadora() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [resultadoExcel, setResultadoExcel] = useState(null); // ⬅️ Nuevo estado para mostrar el resultado

  useEffect(() => {
    fetch("http://127.0.0.1:8000/files")
      .then((res) => res.json())
      .then((data) => {
        if (data.files) {
          setFiles(data.files);
          if (data.files.length > 0) {
            setSelectedFile(data.files[0].filename);
          }
        }
      })
      .catch((err) => console.error("Error al cargar archivos:", err));
  }, []);

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
      .catch((err) => console.error("Error al cargar hojas:", err));
  }, [selectedFile]);

  return (
    <div className="calculadora-layout">
      {/* 🟦 Sección de Datos */}
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

        {selectedFile && (
          <div className="vista-previa">
            <ExcelContent
              filename={selectedFile}
              onSheetChange={(index) => setSelectedSheet(index)}
            />
          </div>
        )}

        <p className="archivo-en-uso">
          Archivo en uso: <b>{selectedFile}</b>
        </p>

        {selectedFile && selectedSheet !== "" && (
          <Calculadora_Excel
            filename={selectedFile}
            sheet={selectedSheet}
            usarTodaHoja={false}
            onResultadoChange={setResultadoExcel} // ⬅️ Pasamos la función al hijo
          />
        )}

        <Calculator />
      </div>

      {/* 🟧 Sección de Resultados */}
      <div className="calculadora-resultados">
        <div className="frecuencias">
          <h3>Frecuencias</h3>

          {/* ⬇️ Aquí se mostrará el resultado del cálculo */}
          {resultadoExcel ? (
            Array.isArray(resultadoExcel) ? (
              <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", marginTop: "10px" }}>
                <thead>
                  <tr>
                     <th>x_i</th>
                     <th> Frecuencia absoluta (f_i) </th>
                     <th> Frecuencia acumulada (F_i) </th>
                     <th> Frecuencia acumulada inversa (F_i_inv) </th>
                     <th> Frecuencia relativa porcentual p_i (%)</th>
                     <th> Frecuencia relativa acumulada porcentual P_i (%)</th>
                     <th> Frecuencia relativa acumulada inversa porcentual P_i_inv (%)</th>{/* 
                      f_i → cuántas veces ocurre.
                      F_i → cuántas veces ha ocurrido hasta ahí.
                      F_i_inv → cuántas veces ocurrirá de ahí en adelante.
                      p_i (%) → qué porcentaje representa.
                      P_i (%) → porcentaje acumulado hacia abajo.
                      P_i_inv (%) → porcentaje acumulado hacia arriba. */}
                  </tr>
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

            {/* <div className="grafico">
    <h4>Gráfico de Barras</h4>
    <GraficoEstadistico datos={resultadoExcel} tipo="barras" />
  </div>
  <br />
   <br />
    <br />
     <br />
      <br />
  <div className="grafico">
    <h4>Gráfico Circular</h4>
    <GraficoEstadistico datos={resultadoExcel} tipo="pastel" />
  </div> */}
        </div>

        <div className="graficos">
  <div className="grafico">
    <h4>Gráfico de Barras</h4>
    <GraficoEstadistico datos={resultadoExcel} tipo="barras" />
  </div>

  <div className="grafico">
    <h4>Gráfico Circular</h4>
    <GraficoEstadistico datos={resultadoExcel} tipo="pastel" />
  </div>
</div>

      </div>
    </div>
  );
}
