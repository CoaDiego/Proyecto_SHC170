// src/components/resultados/PanelGraficos.jsx
import React from "react";
import GraficoEstadistico from "../graficos/GraficoEstadistico";
import GraficoIntervalos from "../graficos/GraficoIntervalos";
import GraficoBivariado from "../graficos/GraficoBivariado";
import GraficoDispersionForma from "../graficos/GraficoDispersionForma";


export default function PanelGraficos({ resultado, esIntervalo }) {
  if (!resultado) return null;

  const esBivariada = !Array.isArray(resultado) && 
    (resultado.tipo === "bivariada" || resultado.tipo === "bivariada_avanzada");

    if (resultado.tipo === "variabilidad_y_forma") {
    return (
      <div className="graficos-grid">
        <div className="grafico-card" style={{ width: "100%", height: "350px" }}>
          <h4>Diagrama de Caja y Bigotes (Boxplot)</h4>
          <GraficoDispersionForma tipo="boxplot" resultado={resultado} />
        </div>
        <div className="grafico-card" style={{ width: "100%", height: "350px" }}>
          <h4>Histograma y Curva de Densidad Normal</h4>
          <GraficoDispersionForma tipo="campana" resultado={resultado} />
        </div>
        <div className="grafico-card" style={{ width: "100%", height: "350px", gridColumn: "1 / -1" }}>
          <h4>Gráfico de Desviaciones (x - μ)</h4>
          <GraficoDispersionForma tipo="desviaciones" resultado={resultado} />
        </div>
      </div>
    );
  }

  return (
    <div className="graficos-grid">
      {esBivariada ? (
        <>
          <div className="grafico-card" style={{ width: "100%", height: "350px" }}>
            <h4>Gráfico de Barras Agrupadas</h4>
            <GraficoBivariado datos={resultado} tipo="agrupadas" />
          </div>
          <div className="grafico-card" style={{ width: "100%", height: "350px" }}>
            <h4>Gráfico de Barras Apiladas (100%)</h4>
            <GraficoBivariado datos={resultado} tipo="apiladas_100" />
          </div>
        </>
      ) : Array.isArray(resultado) && esIntervalo ? (
        // 👇 AQUÍ LE AGREGAMOS EL minHeight
        <div className="grafico-card" style={{ width: "100%", minHeight: "400px" }}> 
          <h3>Gráficos de Intervalos</h3>
          <GraficoIntervalos datos={resultado} />
        </div>
      ) : Array.isArray(resultado) ? (
        <>
          <div className="grafico-card">
            <h4>Gráfico de Barras</h4>
            <GraficoEstadistico datos={resultado} tipo="barras" />
          </div>
          <div className="grafico-card">
            <h4>Gráfico Circular</h4>
            <GraficoEstadistico datos={resultado} tipo="pastel" />
          </div>
        </>
      ) : null}
    </div>
  );
}