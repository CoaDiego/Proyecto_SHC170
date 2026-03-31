// src/components/resultados/PanelGraficos.jsx
import React from "react";
import GraficoEstadistico from "../graficos/GraficoEstadistico";
import GraficoIntervalos from "../graficos/GraficoIntervalos";
import GraficoBivariado from "../graficos/GraficoBivariado";
import GraficoDispersionForma from "../graficos/GraficoDispersionForma";
import GraficoTendenciaPosicion from "../graficos/GraficoTendenciaPosicion";

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

    // 👇 AGREGAR ESTO PARA EL TEMA 3 👇
  if (resultado.tipo === "tendencia_y_posicion") {
    const graficosTema3 = resultado.graficosTema3?.graficoData;
    const indicadores = resultado.graficosTema3?.indicadores;

    return (
      <div className="graficos-grid">
        <div className="grafico-card" style={{ width: "100%", height: "350px" }}>
          <h4>Histograma de Tendencia Central</h4>
          <GraficoTendenciaPosicion tipo="histograma_tendencia" graficos={graficosTema3} indicadores={indicadores} />
        </div>
        
        <div className="grafico-card" style={{ width: "100%", height: "350px" }}>
          <h4>Gráfico de Ojiva (Fractiles)</h4>
          <GraficoTendenciaPosicion tipo="ojiva" graficos={graficosTema3} />
        </div>

        {/* 🤯 REUTILIZACIÓN NIVEL DIOS: Llamamos a tu componente de Variabilidad para dibujar el Boxplot del Tema 3 */}
        {resultado.datosPuros && (
          <div className="grafico-card" style={{ width: "100%", height: "350px", gridColumn: "1 / -1" }}>
            <h4>Diagrama de Caja y Bigotes (Medidas de Posición)</h4>
            <p style={{textAlign: "center", color: "var(--text-muted)", fontSize: "0.9em"}}>
              Visualización de la distribución basada en los Cuartiles calculados.
            </p>
            {/* Como necesitamos calcular los cuartiles de Tukey para el gráfico, importaremos la función matemática pura aquí mismo */}
          </div>
        )}
      </div>
    );
  }
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