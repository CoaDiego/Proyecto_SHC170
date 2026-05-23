import React, { useState } from "react";
import Latex from "../excel/Latex";
import { copiarTablaAExcel } from "../../utils/exportUtils";
import { IconoCopiar } from "../ui/iconos";
import { glosarioEstadistico } from "../../utils/diccionario"; 

const StatLabel = ({ formulaKey, formulaLatex, align = "center" }) => {
  const info = glosarioEstadistico[formulaKey] || { texto: formulaKey, math: "" };
  
  return (
    <span className="stat-label-container">
      <Latex formula={formulaLatex || formulaKey} />
      <div className={`stat-tooltip tooltip-${align}`}>
        <span>{info.texto}</span>
        {info.math && (
          <div className="tooltip-math">
            <Latex formula={info.math} /> 
          </div>
        )}
      </div>
    </span>
  );
};

export default function TablasUnidimensionales({ 
  resultado, calculo, formatearCelda, filtroFractil, setFiltroFractil, modoImpresion = false 
}) {
  // 🚀 NUEVO ESTADO: Controla qué columnas ve el usuario
  const [vistaDatos, setVistaDatos] = useState("individuales");

  if (!resultado) return null;
  if (resultado.tipo === "bivariada" || resultado.tipo === "bivariada_avanzada") return null;

  // 🚀 COMPONENTE REUTILIZABLE: Los Radio Buttons
  const SelectorVista = () => {
    // Si estamos imprimiendo en PDF, ocultamos los botones
    if (modoImpresion) return null;
    
    return (
      <div style={{ 
        marginBottom: "20px", padding: "12px 15px", backgroundColor: "var(--bg-card)", 
        borderRadius: "8px", border: "1px solid var(--border-color)", 
        display: "flex", gap: "25px", alignItems: "center", flexWrap: "wrap" 
      }}>
        <strong style={{ margin: 0, color: "var(--primary-color)" }}>Modo de Visualización:</strong>
        <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: vistaDatos === "individuales" ? "bold" : "normal" }}>
          <input type="radio" name="vistaDatos" value="individuales" checked={vistaDatos === "individuales"} onChange={() => setVistaDatos("individuales")} />
          Datos Individuales
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: vistaDatos === "agrupados" ? "bold" : "normal" }}>
          <input type="radio" name="vistaDatos" value="agrupados" checked={vistaDatos === "agrupados"} onChange={() => setVistaDatos("agrupados")} />
          Datos en Conjuntos (Agrupados)
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: vistaDatos === "ambos" ? "bold" : "normal" }}>
          <input type="radio" name="vistaDatos" value="ambos" checked={vistaDatos === "ambos"} onChange={() => setVistaDatos("ambos")} />
          Comparativa y Error
        </label>
      </div>
    );
  };

  // =========================================================
  // --- CASO 1: TENDENCIA Y POSICIÓN (Tema 3) ---
  // =========================================================
  if (resultado.tipo === "tendencia_y_posicion") {
    return (
      <div className="contenedor-tendencia-posicion">
        
        <SelectorVista />

        <h4>1. Análisis de Tendencia Central</h4>
        <div className="container_tablas_academica" style={{ overflowX: "auto" }}>
          <table className="tabla-academica">
            <thead>
              <tr>
                <th>Medida</th>
                {/* 🚀 Renderizado Condicional de Columnas */}
                {(vistaDatos === "individuales" || vistaDatos === "ambos") && <th>D. Individuales</th>}
                {(vistaDatos === "agrupados" || vistaDatos === "ambos") && <th>D. Agrupados</th>}
                {vistaDatos === "ambos" && <th>Error (Proporción)</th>}
              </tr>
            </thead>
            <tbody>
              {resultado.tendencia.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: "bold" }}>{row["Medida"]}</td>
                  {(vistaDatos === "individuales" || vistaDatos === "ambos") && <td>{formatearCelda(row["D. Individuales"])}</td>}
                  {(vistaDatos === "agrupados" || vistaDatos === "ambos") && <td>{formatearCelda(row["D. Agrupados"])}</td>}
                  {vistaDatos === "ambos" && (
                    <td style={{ color: parseFloat(row["Error %"]) > 0.05 ? "#e74c3c" : "inherit", fontWeight: "bold" }}>
                      {row["Error %"]}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h4 style={{ marginTop: "25px" }}>2. Medidas de Posición</h4>
        
        {modoImpresion ? (
          <div className="pdf-medidas-posicion">
            {["Cuartil", "Decil", "Percentil"].map((tipo) => {
              const datosTipo = resultado.posicion.filter(r => (r.Medida || r.Tipo) === tipo);
              if (datosTipo.length === 0) return null;

              return (
                <div key={tipo} style={{ marginBottom: "25px" }}>
                  <h5 style={{ fontSize: "11pt", color: "#2c3e50", borderBottom: "1px solid #ccc", paddingBottom: "4px", marginBottom: "10px" }}>
                    • {tipo}es
                  </h5>
                  <div style={{ overflowX: "auto" }}>
                    <table className="tabla-academica">
                      <thead>
                        <tr>
                          <th>Medida</th>
                          <th>Símbolo</th>
                          {(vistaDatos === "individuales" || vistaDatos === "ambos") && <th>D. Individuales</th>}
                          {(vistaDatos === "agrupados" || vistaDatos === "ambos") && <th>D. Agrupados</th>}
                          {vistaDatos === "ambos" && <th>Error (Proporción)</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {datosTipo.map((row, i) => (
                          <tr key={i}>
                            <td>{row.Medida || row.Tipo}</td>
                            <td style={{ fontWeight: "bold" }}>{row.Símbolo}</td>
                            {(vistaDatos === "individuales" || vistaDatos === "ambos") && <td style={{ fontFamily: "monospace", fontSize: "1.1em" }}>{formatearCelda(row["D. Individuales"])}</td>}
                            {(vistaDatos === "agrupados" || vistaDatos === "ambos") && <td style={{ fontFamily: "monospace", fontSize: "1.1em" }}>{formatearCelda(row["D. Agrupados"])}</td>}
                            {vistaDatos === "ambos" && (
                              <td style={{ color: parseFloat(row["Error %"]) > 0.05 ? "#e74c3c" : "inherit", fontWeight: "bold" }}>
                                {row["Error %"]}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <div className="container_subtendencia" style={{ marginBottom: "15px" }}>
              {["Cuartil", "Decil", "Percentil"].map((tipo) => (
                <button 
                  key={tipo} 
                  onClick={() => setFiltroFractil(tipo)} 
                  className="button_subtendencia"
                  style={{ 
                    backgroundColor: filtroFractil === tipo ? "var(--accent-color)" : "var(--bg-card)", 
                    color: filtroFractil === tipo ? "#fff" : "inherit",
                    marginRight: "10px", padding: "8px 15px", border: "1px solid var(--border-color)",
                    borderRadius: "4px", cursor: "pointer", fontWeight: filtroFractil === tipo ? "bold" : "normal"
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
                    {(vistaDatos === "individuales" || vistaDatos === "ambos") && <th>D. Individuales</th>}
                    {(vistaDatos === "agrupados" || vistaDatos === "ambos") && <th>D. Agrupados</th>}
                    {vistaDatos === "ambos" && <th>Error (Proporción)</th>}
                  </tr>
                </thead>
                <tbody>
                  {resultado.posicion.filter(r => (r.Medida || r.Tipo) === filtroFractil).map((row, i) => (
                    <tr key={i}>
                      <td>{row.Medida || row.Tipo}</td>
                      <td style={{ fontWeight: "bold" }}>{row.Símbolo}</td>
                      {(vistaDatos === "individuales" || vistaDatos === "ambos") && <td style={{ fontFamily: "monospace", fontSize: "1.1em" }}>{formatearCelda(row["D. Individuales"])}</td>}
                      {(vistaDatos === "agrupados" || vistaDatos === "ambos") && <td style={{ fontFamily: "monospace", fontSize: "1.1em" }}>{formatearCelda(row["D. Agrupados"])}</td>}
                      {vistaDatos === "ambos" && (
                        <td style={{ color: parseFloat(row["Error %"]) > 0.05 ? "#e74c3c" : "inherit", fontWeight: "bold" }}>
                          {row["Error %"]}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    );
  }

  // =========================================================
  // --- CASO 2: VARIABILIDAD Y FORMA (Tema 4) ---
  // =========================================================
  if (resultado.tipo === "variabilidad_y_forma") {
    return (
      <div className="contenedor-variabilidad-forma">
        
        <SelectorVista />

        <h4>3. Medidas de Dispersión</h4>
        <div style={{ overflowX: "auto", marginBottom: "30px" }}>
          <table className="tabla-academica">
            <thead>
              <tr>
                <th>Estadígrafo</th>
                <th>Sigla</th>
                {(vistaDatos === "individuales" || vistaDatos === "ambos") && <th>D. Individuales</th>}
                {(vistaDatos === "agrupados" || vistaDatos === "ambos") && <th>D. Agrupados</th>}
                {vistaDatos === "ambos" && <th>Error (Proporción)</th>}
              </tr>
            </thead>
            <tbody>
              {resultado.dispersion?.map((row, i) => (
                <tr key={i}>
                  <td>{row["Estadígrafo"]}</td>
                  <td style={{ fontWeight: "bold" }}><StatLabel formulaKey={row["Sigla"]} /></td>
                  {(vistaDatos === "individuales" || vistaDatos === "ambos") && <td style={{ fontFamily: "monospace", fontSize: "1.1em" }}>{formatearCelda(row["D. Individuales"])}</td>}
                  {(vistaDatos === "agrupados" || vistaDatos === "ambos") && <td style={{ fontFamily: "monospace", fontSize: "1.1em" }}>{formatearCelda(row["D. Agrupados"])}</td>}
                  {vistaDatos === "ambos" && (
                    <td style={{ color: parseFloat(row["Error %"]) > 0.05 ? "#e74c3c" : "inherit", fontWeight: "bold" }}>{row["Error %"]}</td>
                  )}
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
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <button 
            data-html2canvas-ignore="true" onClick={() => copiarTablaAExcel(resultado, calculo)} className="btn-icon"
            style={{ backgroundColor: '#107c41', color: 'white', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            title="Copiar datos puros para Excel"
          >
            <IconoCopiar /> Copiar Tabla
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="tabla-academica">
            <thead>
              <tr>
                {Object.keys(resultado[0]).map((key, idx, arr) => {
                  let alineacion = "center";
                  if (idx === 0) alineacion = "left";
                  else if (idx >= arr.length - 2) alineacion = "right";

                  return (
                    <th key={key}>
                      {key === "f_i" || key === "fi" ? <StatLabel formulaKey="f_i" align={alineacion} /> :
                       key === "p_i" ? <StatLabel formulaKey="p_i" formulaLatex="p_i" align={alineacion} /> :
                       key === "F_i" ? <StatLabel formulaKey="F_i" align={alineacion} /> :
                       key === "P_i" ? <StatLabel formulaKey="P_i" formulaLatex="P_i" align={alineacion} /> :
                       key === "x_i" ? <StatLabel formulaKey="x_i" align={alineacion} /> :
                       key === "F_i_inv" || key === "F'i" ? <StatLabel formulaKey="F_i_inv" formulaLatex="F^{\uparrow}_i" align={alineacion} /> :
                       key === "P_i_inv" || key === "P'i" ? <StatLabel formulaKey="P_i_inv" formulaLatex="P^{\uparrow}_i" align={alineacion} /> : 
                       key}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {resultado.map((row, i) => (
                <tr key={i}>
                  {Object.entries(row).map(([key, val], j) => (
                    <td key={j} className={key.includes("Total") ? "celda-total" : ""}>
                      {formatearCelda(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}