import React, { useMemo, useEffect } from "react";
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

export default function PanelGraficos({
  resultado,
  esIntervalo,
  calculo,
  orden,
  setOrden,
}) {
  // 1. MEMORIZACIÓN DE COMPONENTES
  const widgetsDisponibles = useMemo(() => {
    if (!resultado) return [];

    const esBivariada =
      !Array.isArray(resultado) && resultado.tipo === "distribucion_bivariada";
    const nuevosWidgets = [];

    // TEMA: REGRESIÓN
    if (resultado.tipo === "regresion") {
      nuevosWidgets.push({
        id: "reg-main",
        titulo: "Análisis de Regresión y Correlación",
        anchoCompleto: true,
        contenido: <GraficoRegresion resultado={resultado} />,
      });
    }

    // TEMA: ÍNDICES
    if (
      [
        "indices_compuestos",
        "operaciones_indices",
        "deflacion_financiera",
      ].includes(resultado.tipo)
    ) {
      nuevosWidgets.push({
        id: "ind-main",
        titulo: "Indicadores Económicos e Índices",
        anchoCompleto: true,
        contenido: <GraficoIndices resultado={resultado} />,
      });
    }

    // TEMA: VARIABILIDAD Y FORMA
    if (resultado.tipo === "variabilidad_y_forma") {
      nuevosWidgets.push({
        id: "v1",
        titulo: "Boxplot (Caja y Bigotes)",
        contenido: (
          <GraficoDispersionForma tipo="boxplot" resultado={resultado} />
        ),
      });
      nuevosWidgets.push({
        id: "v2",
        titulo: "Curva de Densidad Normal",
        contenido: (
          <GraficoDispersionForma tipo="campana" resultado={resultado} />
        ),
      });
      nuevosWidgets.push({
        id: "v3",
        titulo: "Desviaciones Respecto a la Media",
        anchoCompleto: true,
        contenido: (
          <GraficoDispersionForma tipo="desviaciones" resultado={resultado} />
        ),
      });
    }

    // TEMA: TENDENCIA Y POSICIÓN
    if (resultado.tipo === "tendencia_y_posicion") {
      nuevosWidgets.push({
        id: "t1",
        titulo: "Histograma de Tendencia Central",
        contenido: (
          <GraficoTendenciaPosicion
            tipo="histograma_tendencia"
            graficos={resultado.graficosTema3?.graficoData}
            indicadores={resultado.graficosTema3?.indicadores}
          />
        ),
      });
      nuevosWidgets.push({
        id: "t2",
        titulo: "Gráfico de Ojiva (Frecuencias Acumuladas)",
        contenido: (
          <GraficoTendenciaPosicion
            tipo="ojiva"
            graficos={resultado.graficosTema3?.graficoData}
          />
        ),
      });
    }

    // TEMA: SERIES DE TIEMPO
    if (resultado.tipo === "series_tiempo") {
      nuevosWidgets.push({
        id: "ser-1",
        titulo: "Gráfico de Serie Cronológica Histórica",
        anchoCompleto: true,
        contenido: (
          <GraficoSeriesTiempo resultado={resultado} tipo="historico" />
        ),
      });
      nuevosWidgets.push({
        id: "ser-2",
        titulo: "Línea de Tendencia y Pronóstico",
        anchoCompleto: true,
        contenido: (
          <GraficoSeriesTiempo resultado={resultado} tipo="pronostico" />
        ),
      });
    }

    // TEMA: DISTRIBUCIÓN POR INTERVALOS
    if (Array.isArray(resultado) && esIntervalo) {
      nuevosWidgets.push({
        id: "int-1",
        titulo: "Histograma de Frecuencias",
        contenido: <GraficoIntervalos datos={resultado} tipo="histograma" />,
      });
      nuevosWidgets.push({
        id: "int-2",
        titulo: "Polígono de Frecuencias",
        contenido: <GraficoIntervalos datos={resultado} tipo="poligono" />,
      });
      nuevosWidgets.push({
        id: "int-3",
        titulo: "Ojiva Creciente (Fi)",
        contenido: (
          <GraficoIntervalos datos={resultado} tipo="ojiva_creciente" />
        ),
      });
      nuevosWidgets.push({
        id: "int-4",
        titulo: "Ojiva Decreciente (F'i)",
        contenido: (
          <GraficoIntervalos datos={resultado} tipo="ojiva_decreciente" />
        ),
      });
      nuevosWidgets.push({
        id: "int-5",
        titulo: "Histograma + Polígono (Mixto)",
        anchoCompleto: true,
        contenido: <GraficoIntervalos datos={resultado} tipo="mixto" />,
      });
    }

    // TEMA: TABLAS DE FRECUENCIAS SIMPLES
    if (
      Array.isArray(resultado) &&
      !esIntervalo &&
      calculo === "frecuencias_completas" &&
      resultado.length > 0
    ) {
      nuevosWidgets.push({
        id: "uni-1",
        titulo: "Gráfico de Barras",
        contenido: <GraficoEstadistico datos={resultado} tipo="barras" />,
      });
      nuevosWidgets.push({
        id: "uni-2",
        titulo: "Gráfico Circular (Pastel)",
        contenido: <GraficoEstadistico datos={resultado} tipo="pastel" />,
      });
    }

    // TEMA: ANÁLISIS BIVARIADO
    if (esBivariada) {
      nuevosWidgets.push({
        id: "biv-1",
        titulo: "Barras Agrupadas",
        contenido: <GraficoBivariado datos={resultado} tipo="agrupadas" />,
      });
      nuevosWidgets.push({
        id: "biv-2",
        titulo: "Barras Apiladas (100%)",
        contenido: <GraficoBivariado datos={resultado} tipo="apiladas_100" />,
      });
      if (resultado.ambosNumericos) {
        nuevosWidgets.push({
          id: "biv-3",
          titulo: "Diagrama de Dispersión",
          anchoCompleto: true,
          contenido: <GraficoBivariado datos={resultado} tipo="dispersion" />,
        });
      }
    }

    return nuevosWidgets;
  }, [resultado, esIntervalo, calculo]);

  // 2. SINCRONIZACIÓN CON EL ESTADO DE CALCULOS.JSX
  useEffect(() => {
    if (widgetsDisponibles.length > 0 && setOrden) {
      // Solo inicializamos si el orden está vacío para evitar bucles
      setOrden(widgetsDisponibles.map((w) => w.id));
    }
  }, [widgetsDisponibles, setOrden]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || !setOrden) return;

    if (active.id !== over.id) {
      setOrden((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (!resultado || widgetsDisponibles.length === 0) return null;

  // Usamos el orden que viene por props para renderizar
  const listaRender =
    orden && orden.length > 0 ? orden : widgetsDisponibles.map((w) => w.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={listaRender} strategy={rectSortingStrategy}>
        <div className="panel-graficos-grid">
          {listaRender.map((id) => {
            const widget = widgetsDisponibles.find((w) => w.id === id);
            if (!widget) return null;

            return (
              <MarcoWidget
                key={widget.id}
                id={widget.id}
                titulo={widget.titulo}
                anchoCompleto={widget.anchoCompleto}
              >
                {widget.contenido}
              </MarcoWidget>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
