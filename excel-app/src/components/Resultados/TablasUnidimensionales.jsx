import React from "react";
import Latex from "../excel/Latex";

export default function TablasUnidimensionales({ 
  resultado, calculo, formatearCelda, filtroFractil, setFiltroFractil 
}) {
  // 1. Candado de seguridad: Si no hay resultado o es Bivariada, no hacemos nada aquí
  if (!resultado) return null;
  if (resultado.tipo === "bivariada" || resultado.tipo === "bivariada_avanzada") {
    return null;
  }

  // =========================================================
  // --- CASO 1: TENDENCIA Y POSICIÓN (Tema 3) ---
  // =========================================================
  if (resultado.tipo === "tendencia_y_posicion") {
    return (
      <div className="contenedor-tendencia-posicion">
        <h4>1. Análisis de Tendencia Central</h4>
        <div className="container_tablas_academica" style={{ overflowX: "auto" }}>
          <table className="tabla-academica">
            <thead>
              <tr>
                <th>Medida</th>
                <th>D. Individuales</th>
                <th>D. Agrupados</th>
                <th>Error %</th>
              </tr>
            </thead>
            <tbody>
              {resultado.tendencia.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: "bold" }}>{row["Medida"]}</td>
                  <td>{formatearCelda(row["D. Individuales"])}</td>
                  <td>{formatearCelda(row["D. Agrupados"])}</td>
                  <td style={{ color: parseFloat(row["Error %"]) > 5 ? "#e74c3c" : "inherit", fontWeight: "bold" }}>
                    {row["Error %"]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h4>2. Medidas de Posición</h4>
        <div className="container_subtendencia" style={{ marginBottom: "15px" }}>
          {["Cuartil", "Decil", "Percentil"].map((tipo) => (
            <button 
              key={tipo} 
              onClick={() => setFiltroFractil(tipo)} 
              className="button_subtendencia"
              style={{ 
                backgroundColor: filtroFractil === tipo ? "var(--accent-color)" : "var(--bg-card)", 
                color: filtroFractil === tipo ? "#fff" : "inherit",
                marginRight: "10px",
                padding: "8px 15px",
                border: "1px solid var(--border-color)",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: filtroFractil === tipo ? "bold" : "normal"
              }}
            >
              {tipo}es
            </button>
          ))}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="tabla-academica">
            <thead>
              <tr>
                <th>Medida</th>
                <th>Símbolo</th>
                <th>D. Individuales</th>
                <th>D. Agrupados</th>
                <th>Error %</th>
              </tr>
            </thead>
            <tbody>
              {resultado.posicion.filter(r => (r.Medida || r.Tipo) === filtroFractil).map((row, i) => (
                <tr key={i}>
                  <td>{row.Medida || row.Tipo}</td>
                  <td style={{ fontWeight: "bold" }}>{row.Símbolo}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "1.1em" }}>{formatearCelda(row["D. Individuales"])}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "1.1em" }}>{formatearCelda(row["D. Agrupados"])}</td>
                  <td style={{ color: parseFloat(row["Error %"]) > 5 ? "#e74c3c" : "inherit", fontWeight: "bold" }}>
                    {row["Error %"]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // =========================================================
  // --- CASO 2: VARIABILIDAD Y FORMA (Tema 4) ---
  // =========================================================
  if (resultado.tipo === "variabilidad_y_forma") {
    return (
      <div className="contenedor-variabilidad-forma">
        <h4>3. Medidas de Dispersión</h4>
        <div style={{ overflowX: "auto", marginBottom: "30px" }}>
          <table className="tabla-academica">
            <thead>
              <tr>
                <th>Estadígrafo</th>
                <th>Sigla</th>
                <th>D. Individuales</th>
                <th>D. Agrupados</th>
                <th>Error %</th>
              </tr>
            </thead>
            <tbody>
              {resultado.dispersion?.map((row, i) => (
                <tr key={i}>
                  <td>{row["Estadígrafo"]}</td>
                  <td style={{ fontWeight: "bold" }}>{row["Sigla"]}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "1.1em" }}>{formatearCelda(row["D. Individuales"])}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "1.1em" }}>{formatearCelda(row["D. Agrupados"])}</td>
                  <td style={{ color: parseFloat(row["Error %"]) > 5 ? "#e74c3c" : "inherit", fontWeight: "bold" }}>{row["Error %"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <h4 style={{ color: "var(--primary-color)", borderBottom: "2px solid var(--border-color)", paddingBottom: "5px" }}>
          4. Medidas de Forma
        </h4>
        <div style={{ overflowX: "auto" }}>
          <table className="tabla-academica">
            <thead>
              <tr>
                <th>Estadígrafo</th>
                <th>Valor Calculado</th>
                <th>Interpretación</th>
              </tr>
            </thead>
            <tbody>
              {resultado.forma?.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: "bold" }}>{row["Estadígrafo"]}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "1.1em", color: "var(--primary-color)" }}>
                    {formatearCelda(row["Valor Calculado"])}
                  </td>
                  <td style={{ fontStyle: "italic" }}>{row["Interpretación"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // =========================================================
  // --- CASO 3: TABLAS SIMPLES (Frecuencias, Intervalos) ---
  // =========================================================
  if (Array.isArray(resultado)) {
    return (
      <div style={{ overflowX: "auto" }}>
        <table className="tabla-academica">
          <thead>
            <tr>
              {Object.keys(resultado[0]).map((key) => (
                <th key={key}>
                  {key === "f_i" || key === "fi" ? <Latex formula="f_i" /> :
                   key === "p_i" ? <Latex formula="p_i \%" /> :
                   key === "F_i" ? <Latex formula="F_i" /> :
                   key === "P_i" ? <Latex formula="P_i \%" /> :
                   key === "x_i" ? <Latex formula="x_i" /> :
                   key === "F_i_inv" || key === "F'i" ? <Latex formula="F^{\uparrow}_i" /> :
                   key === "P_i_inv" || key === "P'i" ? <Latex formula="P^{\uparrow}_i \%" /> : key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resultado.map((row, i) => (
              <tr key={i}>
                {Object.entries(row).map(([key, val], j) => (
                  <td 
                    key={j} 
                    className={key.includes("Total") ? "celda-total" : ""}
                  >
                    {formatearCelda(val)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}