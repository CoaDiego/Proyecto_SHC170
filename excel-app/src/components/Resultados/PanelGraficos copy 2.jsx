import React from "react";
import GraficoEstadistico from "../graficos/GraficoEstadistico";
import GraficoIntervalos from "../graficos/GraficoIntervalos";
import GraficoBivariado from "../graficos/GraficoBivariado";
import GraficoDispersionForma from "../graficos/GraficoDispersionForma";
import GraficoTendenciaPosicion from "../graficos/GraficoTendenciaPosicion";
import GraficoRegresion from "../graficos/GraficoRegresion";
import GraficoSeriesTiempo from "../graficos/GraficoSeriesTiempo";
import GraficoIndices from "../graficos/GraficoIndices";
import MarcoWidget from "../ui/MarcoWidget";

export default function PanelGraficos({ resultado, esIntervalo }) {

  if (!resultado) return null;

  const esBivariada = !Array.isArray(resultado) && 
    resultado.tipo === "distribucion_bivariada";

  return (
    <div className="graficos-grid">
      
      {/* 1. TEMA: REGRESIÓN E ÍNDICES */}
      {resultado.tipo === "regresion" && (
        <MarcoWidget id="reg-main" titulo="Análisis de Regresión y Correlación" anchoCompleto={true}>
          <div className="contenedor-grafico-interno">
            <GraficoRegresion resultado={resultado} />
          </div>
        </MarcoWidget>
      )}

      {["indices_compuestos", "operaciones_indices", "deflacion_financiera"].includes(resultado.tipo) && (
        <MarcoWidget id="ind-main" titulo="Indicadores Económicos e Índices" anchoCompleto={true}>
          <div className="contenedor-grafico-interno">
            <GraficoIndices resultado={resultado} />
          </div>
        </MarcoWidget>
      )}

      {/* 2. TEMA: VARIABILIDAD Y FORMA (TEMA 4) */}
      {resultado.tipo === "variabilidad_y_forma" && (
        <>
          <MarcoWidget id="v1" titulo="Boxplot (Caja y Bigotes)">
            <div className="contenedor-grafico-interno">
              <GraficoDispersionForma tipo="boxplot" resultado={resultado} />
            </div>
          </MarcoWidget>
          <MarcoWidget id="v2" titulo="Curva de Densidad Normal">
            <div className="contenedor-grafico-interno">
              <GraficoDispersionForma tipo="campana" resultado={resultado} />
            </div>
          </MarcoWidget>
          <MarcoWidget id="v3" titulo="Desviaciones Respecto a la Media" anchoCompleto={true}>
            <div className="contenedor-grafico-interno">
              <GraficoDispersionForma tipo="desviaciones" resultado={resultado} />
            </div>
          </MarcoWidget>
        </>
      )}

      {/* 3. TEMA: TENDENCIA Y POSICIÓN (TEMA 3) */}
      {resultado.tipo === "tendencia_y_posicion" && (
        <>
          <MarcoWidget id="t1" titulo="Histograma de Tendencia Central">
            <div className="contenedor-grafico-interno">
              <GraficoTendenciaPosicion tipo="histograma_tendencia" graficos={resultado.graficosTema3?.graficoData} indicadores={resultado.graficosTema3?.indicadores} />
            </div>
          </MarcoWidget>
          <MarcoWidget id="t2" titulo="Gráfico de Ojiva (Frecuencias Acumuladas)">
            <div className="contenedor-grafico-interno">
              <GraficoTendenciaPosicion tipo="ojiva" graficos={resultado.graficosTema3?.graficoData} />
            </div>
          </MarcoWidget>
        </>
      )}

      {/* TEMA: SERIES DE TIEMPO (TEMA 7) */}
      {resultado.tipo === "series_tiempo" && (
        <>
          <MarcoWidget id="ser-1" titulo="Gráfico de Serie Cronológica Histórica">
            <div className="contenedor-grafico-interno">
              <GraficoSeriesTiempo resultado={resultado} tipo="historico" />
            </div>
          </MarcoWidget>
          
          <MarcoWidget id="ser-2" titulo="Línea de Tendencia y Pronóstico" anchoCompleto={true}>
            <div className="contenedor-grafico-interno">
              <GraficoSeriesTiempo resultado={resultado} tipo="pronostico" />
            </div>
          </MarcoWidget>
        </>
      )}

      {/* 4. TEMA: INTERVALOS (TEMA 2) */}
      {Array.isArray(resultado) && esIntervalo && (
        <>
          <MarcoWidget id="int-1" titulo="Histograma de Frecuencias">
            <div className="contenedor-grafico-interno">
              <GraficoIntervalos datos={resultado} tipo="histograma" />
            </div>
          </MarcoWidget>
          <MarcoWidget id="int-2" titulo="Polígono de Frecuencias">
            <div className="contenedor-grafico-interno">
              <GraficoIntervalos datos={resultado} tipo="poligono" />
            </div>
          </MarcoWidget>
          <MarcoWidget id="int-3" titulo="Ojiva Creciente (Fi)">
            <div className="contenedor-grafico-interno">
              <GraficoIntervalos datos={resultado} tipo="ojiva_creciente" />
            </div>
          </MarcoWidget>
          <MarcoWidget id="int-4" titulo="Ojiva Decreciente (F'i)">
            <div className="contenedor-grafico-interno">
              <GraficoIntervalos datos={resultado} tipo="ojiva_decreciente" />
            </div>
          </MarcoWidget>
          <MarcoWidget id="int-5" titulo="Histograma + Polígono (Mixto)" anchoCompleto={true}>
            <div className="contenedor-grafico-interno">
              <GraficoIntervalos datos={resultado} tipo="mixto" />
            </div>
          </MarcoWidget>
        </>
      )}

      {/* 5. TEMA: TABLAS SIMPLES (TEMA 1) */}
      {Array.isArray(resultado) && !esIntervalo && resultado.length > 0 && (
        <>
          <MarcoWidget id="uni-1" titulo="Gráfico de Barras">
            <div className="contenedor-grafico-interno">
              <GraficoEstadistico datos={resultado} tipo="barras" />
            </div>
          </MarcoWidget>
          <MarcoWidget id="uni-2" titulo="Gráfico Circular (Pastel)">
            <div className="contenedor-grafico-interno">
              <GraficoEstadistico datos={resultado} tipo="pastel" />
            </div>
          </MarcoWidget>
        </>
      )}

      {/* 6. TEMA: BIVARIADOS (TEMA 5) */}
      {esBivariada && (
        <>
          <MarcoWidget id="biv-1" titulo="Barras Agrupadas">
            <div className="contenedor-grafico-interno">
              <GraficoBivariado datos={resultado} tipo="agrupadas" />
            </div>
          </MarcoWidget>
          <MarcoWidget id="biv-2" titulo="Barras Apiladas (100%)">
            <div className="contenedor-grafico-interno">
              <GraficoBivariado datos={resultado} tipo="apiladas_100" />
            </div>
          </MarcoWidget>

          {resultado.ambosNumericos && (
            <MarcoWidget id="biv-3" titulo="Diagrama de Dispersión (Nube de Puntos)" anchoCompleto={true}>
              <div className="contenedor-grafico-interno">
                <GraficoBivariado datos={resultado} tipo="dispersion" />
              </div>
            </MarcoWidget>
          )}
        </>
      )}
    </div>
  );
}