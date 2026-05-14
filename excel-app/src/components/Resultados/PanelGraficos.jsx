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

export default function PanelGraficos({ resultado, esIntervalo, calculo }) {

  if (!resultado) return null;

  const esBivariada = !Array.isArray(resultado) && resultado.tipo === "distribucion_bivariada";

  return (
    <div className="panel-graficos-grid">

      {/* 1. TEMA: REGRESIÓN E ÍNDICES */}
      {resultado.tipo === "regresion" && (
        <MarcoWidget id="reg-main" titulo="Análisis de Regresión y Correlación" anchoCompleto={true}>
          <GraficoRegresion resultado={resultado} />
        </MarcoWidget>
      )}

      {["indices_compuestos", "operaciones_indices", "deflacion_financiera"].includes(resultado.tipo) && (
        <MarcoWidget id="ind-main" titulo="Indicadores Económicos e Índices" anchoCompleto={true}>
          <GraficoIndices resultado={resultado} />
        </MarcoWidget>
      )}

      {/* 2. TEMA: VARIABILIDAD Y FORMA (TEMA 4) */}
      {resultado.tipo === "variabilidad_y_forma" && (
        <>
          <MarcoWidget id="v1" titulo="Boxplot (Caja y Bigotes)">
            <GraficoDispersionForma tipo="boxplot" resultado={resultado} />
          </MarcoWidget>
          <MarcoWidget id="v2" titulo="Curva de Densidad Normal">
            <GraficoDispersionForma tipo="campana" resultado={resultado} />
          </MarcoWidget>
          <MarcoWidget id="v3" titulo="Desviaciones Respecto a la Media" anchoCompleto={true}>
            <GraficoDispersionForma tipo="desviaciones" resultado={resultado} />
          </MarcoWidget>
        </>
      )}

      {/* 3. TEMA: TENDENCIA Y POSICIÓN (TEMA 3) */}
      {resultado.tipo === "tendencia_y_posicion" && (
        <>
          <MarcoWidget id="t1" titulo="Histograma de Tendencia Central">
            <GraficoTendenciaPosicion tipo="histograma_tendencia" graficos={resultado.graficosTema3?.graficoData} indicadores={resultado.graficosTema3?.indicadores} />
          </MarcoWidget>
          <MarcoWidget id="t2" titulo="Gráfico de Ojiva (Frecuencias Acumuladas)">
            <GraficoTendenciaPosicion tipo="ojiva" graficos={resultado.graficosTema3?.graficoData} />
          </MarcoWidget>
        </>
      )}

      {/* TEMA: SERIES DE TIEMPO (TEMA 7) */}
      {resultado.tipo === "series_tiempo" && (
        <>
          <MarcoWidget id="ser-1" titulo="Gráfico de Serie Cronológica Histórica" anchoCompleto={true}>
            <GraficoSeriesTiempo resultado={resultado} tipo="historico" />
          </MarcoWidget>
          <MarcoWidget id="ser-2" titulo="Línea de Tendencia y Pronóstico" anchoCompleto={true}>
            <GraficoSeriesTiempo resultado={resultado} tipo="pronostico" />
          </MarcoWidget>
        </>
      )}

      {/* 4. TEMA: INTERVALOS (TEMA 2) */}
      {Array.isArray(resultado) && esIntervalo && (
        <>
          <MarcoWidget id="int-1" titulo="Histograma de Frecuencias">
            <GraficoIntervalos datos={resultado} tipo="histograma" />
          </MarcoWidget>
          <MarcoWidget id="int-2" titulo="Polígono de Frecuencias">
            <GraficoIntervalos datos={resultado} tipo="poligono" />
          </MarcoWidget>
          <MarcoWidget id="int-3" titulo="Ojiva Creciente (Fi)">
            <GraficoIntervalos datos={resultado} tipo="ojiva_creciente" />
          </MarcoWidget>
          <MarcoWidget id="int-4" titulo="Ojiva Decreciente (F'i)">
            <GraficoIntervalos datos={resultado} tipo="ojiva_decreciente" />
          </MarcoWidget>
          <MarcoWidget id="int-5" titulo="Histograma + Polígono (Mixto)" anchoCompleto={true}>
            <GraficoIntervalos datos={resultado} tipo="mixto" />
          </MarcoWidget>
        </>
      )}

      {/* 5. TEMA: TABLAS SIMPLES (TEMA 1) */}
      {Array.isArray(resultado) && !esIntervalo && calculo === "frecuencias_completas" && resultado.length > 0 && (
        <>
          <MarcoWidget id="uni-1" titulo="Gráfico de Barras">
            <GraficoEstadistico datos={resultado} tipo="barras" />
          </MarcoWidget>
          <MarcoWidget id="uni-2" titulo="Gráfico Circular (Pastel)">
            <GraficoEstadistico datos={resultado} tipo="pastel" />
          </MarcoWidget>
        </>
      )}

      {/* 6. TEMA: BIVARIADOS (TEMA 5) */}
      {esBivariada && (
        <>
          <MarcoWidget id="biv-1" titulo="Barras Agrupadas">
            <GraficoBivariado datos={resultado} tipo="agrupadas" />
          </MarcoWidget>
          <MarcoWidget id="biv-2" titulo="Barras Apiladas (100%)">
            <GraficoBivariado datos={resultado} tipo="apiladas_100" />
          </MarcoWidget>

          {resultado.ambosNumericos && (
            <MarcoWidget id="biv-3" titulo="Diagrama de Dispersión (Nube de Puntos)" anchoCompleto={true}>
              <GraficoBivariado datos={resultado} tipo="dispersion" />
            </MarcoWidget>
          )}
        </>
      )}
    </div>
  );
}