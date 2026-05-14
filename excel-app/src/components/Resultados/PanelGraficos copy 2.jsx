import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

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
  // ====================================================================
  // 1. ZONA SEGURA DE HOOKS (Todos los hooks DEBEN ir aquí arriba)
  // ====================================================================
  const [widgetsActivos, setWidgetsActivos] = useState([]);

 // Inicializamos los sensores sin restricciones para forzar el agarre
  const sensors = useSensors(
    useSensor(PointerSensor), // 👈 Le quitamos el { activationConstraint... }
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    // Si no hay resultado, limpiamos la lista y no hacemos nada más
    if (!resultado) {
      setWidgetsActivos([]);
      return;
    }

    const esBivariada = !Array.isArray(resultado) && resultado.tipo === "distribucion_bivariada";
    const nuevosWidgets = [];

    // TEMA 6: REGRESIÓN
    if (resultado.tipo === "regresion") {
      nuevosWidgets.push({ id: "reg-main", titulo: "Análisis de Regresión y Correlación", anchoCompleto: true, contenido: <GraficoRegresion resultado={resultado} /> });
    }

    // TEMA 8: ÍNDICES
    if (["indices_compuestos", "operaciones_indices", "deflacion_financiera"].includes(resultado.tipo)) {
      nuevosWidgets.push({ id: "ind-main", titulo: "Indicadores Económicos e Índices", anchoCompleto: true, contenido: <GraficoIndices resultado={resultado} /> });
    }

    // TEMA 4: VARIABILIDAD Y FORMA
    if (resultado.tipo === "variabilidad_y_forma") {
      nuevosWidgets.push({ id: "v1", titulo: "Boxplot (Caja y Bigotes)", contenido: <GraficoDispersionForma tipo="boxplot" resultado={resultado} /> });
      nuevosWidgets.push({ id: "v2", titulo: "Curva de Densidad Normal", contenido: <GraficoDispersionForma tipo="campana" resultado={resultado} /> });
      nuevosWidgets.push({ id: "v3", titulo: "Desviaciones Respecto a la Media", anchoCompleto: true, contenido: <GraficoDispersionForma tipo="desviaciones" resultado={resultado} /> });
    }

    // TEMA 3: TENDENCIA Y POSICIÓN
    if (resultado.tipo === "tendencia_y_posicion") {
      nuevosWidgets.push({ id: "t1", titulo: "Histograma de Tendencia Central", contenido: <GraficoTendenciaPosicion tipo="histograma_tendencia" graficos={resultado.graficosTema3?.graficoData} indicadores={resultado.graficosTema3?.indicadores} /> });
      nuevosWidgets.push({ id: "t2", titulo: "Gráfico de Ojiva (Frecuencias Acumuladas)", contenido: <GraficoTendenciaPosicion tipo="ojiva" graficos={resultado.graficosTema3?.graficoData} /> });
    }

    // TEMA 7: SERIES DE TIEMPO
    if (resultado.tipo === "series_tiempo") {
      nuevosWidgets.push({ id: "ser-1", titulo: "Gráfico de Serie Cronológica Histórica", anchoCompleto: true, contenido: <GraficoSeriesTiempo resultado={resultado} tipo="historico" /> });
      nuevosWidgets.push({ id: "ser-2", titulo: "Línea de Tendencia y Pronóstico", anchoCompleto: true, contenido: <GraficoSeriesTiempo resultado={resultado} tipo="pronostico" /> });
    }

    // TEMA 2: INTERVALOS
    if (Array.isArray(resultado) && esIntervalo) {
      nuevosWidgets.push({ id: "int-1", titulo: "Histograma de Frecuencias", contenido: <GraficoIntervalos datos={resultado} tipo="histograma" /> });
      nuevosWidgets.push({ id: "int-2", titulo: "Polígono de Frecuencias", contenido: <GraficoIntervalos datos={resultado} tipo="poligono" /> });
      nuevosWidgets.push({ id: "int-3", titulo: "Ojiva Creciente (Fi)", contenido: <GraficoIntervalos datos={resultado} tipo="ojiva_creciente" /> });
      nuevosWidgets.push({ id: "int-4", titulo: "Ojiva Decreciente (F'i)", contenido: <GraficoIntervalos datos={resultado} tipo="ojiva_decreciente" /> });
      nuevosWidgets.push({ id: "int-5", titulo: "Histograma + Polígono (Mixto)", anchoCompleto: true, contenido: <GraficoIntervalos datos={resultado} tipo="mixto" /> });
    }

    // TEMA 1: TABLAS SIMPLES
    if (Array.isArray(resultado) && !esIntervalo && calculo === "frecuencias_completas" && resultado.length > 0) {
      nuevosWidgets.push({ id: "uni-1", titulo: "Gráfico de Barras", contenido: <GraficoEstadistico datos={resultado} tipo="barras" /> });
      nuevosWidgets.push({ id: "uni-2", titulo: "Gráfico Circular (Pastel)", contenido: <GraficoEstadistico datos={resultado} tipo="pastel" /> });
    }

    // TEMA 5: BIVARIADOS
    if (esBivariada) {
      nuevosWidgets.push({ id: "biv-1", titulo: "Barras Agrupadas", contenido: <GraficoBivariado datos={resultado} tipo="agrupadas" /> });
      nuevosWidgets.push({ id: "biv-2", titulo: "Barras Apiladas (100%)", contenido: <GraficoBivariado datos={resultado} tipo="apiladas_100" /> });
      if (resultado.ambosNumericos) {
        nuevosWidgets.push({ id: "biv-3", titulo: "Diagrama de Dispersión (Nube de Puntos)", anchoCompleto: true, contenido: <GraficoBivariado datos={resultado} tipo="dispersion" /> });
      }
    }

    setWidgetsActivos(nuevosWidgets);
  }, [resultado, esIntervalo, calculo]);

  const handleDragStart = (event) => {
    console.log("🔥 ¡Me están arrastrando! ID del gráfico:", event.active.id);
  };

  // Función que intercambia la posición cuando sueltas el gráfico
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setWidgetsActivos((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // ====================================================================
  // 2. ZONA DE SALIDA TEMPRANA (Debe ir estrictamente DESPUÉS de los hooks)
  // ====================================================================
  if (!resultado) return null;
  if (widgetsActivos.length === 0) return null;

  // ====================================================================
  // 3. RENDERIZADO VISUAL
  // ====================================================================
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <SortableContext items={widgetsActivos.map((w) => w.id)} strategy={rectSortingStrategy}>
        <div className="panel-graficos-grid">
          {widgetsActivos.map((w) => (
            <MarcoWidget key={w.id} id={w.id} titulo={w.titulo} anchoCompleto={w.anchoCompleto}>
              {w.contenido}
            </MarcoWidget>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}