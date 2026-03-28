// src/components/resultados/PanelGraficos.jsx
import React from "react";
import GraficoEstadistico from "../graficos/GraficoEstadistico";
import GraficoIntervalos from "../graficos/GraficoIntervalos";
import GraficoBivariado from "../graficos/GraficoBivariado";

export default function PanelGraficos({ resultado, esIntervalo }) {
  if (!resultado) return null;

  const esBivariada = !Array.isArray(resultado) && 
    (resultado.tipo === "bivariada" || resultado.tipo === "bivariada_avanzada");

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