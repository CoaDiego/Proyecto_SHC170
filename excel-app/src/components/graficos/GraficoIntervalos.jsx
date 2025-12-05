import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, ComposedChart, Legend
} from "recharts";

export default function GraficoIntervalos({ datos }) {
  const [expandedChart, setExpandedChart] = useState(null);

  if (!datos || datos.length === 0) return <p style={{ color: "var(--text-muted)" }}>No hay datos para graficar.</p>;

  // --- ADAPTADOR DE DATOS ---
  const datosProcesados = datos.map(item => ({
    Intervalo: item["Haber básico"] || item["Intervalos"] || item["Intervalo"] || "",
    f_i: Number(item["f_i"] || item["fi"] || 0),
    F_i: Number(item["F_i"] || item["Fi"] || 0),
    "F'i": Number(item["F'i"] || item["F_i_inv"] || 0)
  }));

  // Estilos de tarjeta normal (CAMBIADO A VARIABLES)
  const chartContainerStyle = {
    backgroundColor: "var(--bg-card)", // Antes #f5f5f5
    padding: "15px",
    borderRadius: "10px",
    border: "1px solid var(--border-color)", 
    height: "300px", 
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    position: "relative",
    color: "var(--text-main)"
  };

  // Estilos para el modo EXPANDIDO (Modal)
  const expandedOverlayStyle = {
    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
    backgroundColor: "rgba(0,0,0,0.8)", zIndex: 9999,
    display: "flex", justifyContent: "center", alignItems: "center", padding: "20px"
  };

  const expandedCardStyle = {
    backgroundColor: "var(--bg-card)", // Antes white
    width: "90%", height: "85%", borderRadius: "12px", padding: "20px",
    display: "flex", flexDirection: "column",
    boxShadow: "0 4px 20px rgba(0,0,0,0.5)", position: "relative",
    color: "var(--text-main)"
  };

  const titleStyle = {
    textAlign: "center", marginBottom: "10px", fontWeight: "bold",
    color: "var(--text-main)", // Antes #333
    fontSize: "1rem",
  };

  // Botón Maximizar (CAMBIADO A VARIABLES)
  const renderMaximizeButton = (chartId) => (
    <button 
      onClick={() => setExpandedChart(expandedChart === chartId ? null : chartId)}
      title={expandedChart === chartId ? "Cerrar" : "Maximizar"}
      style={{
        position: "absolute", top: "10px", right: "10px",
        background: "var(--bg-input)", // Antes rgba(255,255,255,0.8)
        border: "1px solid var(--border-color)",
        borderRadius: "4px", cursor: "pointer", padding: "4px",
        zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center"
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {expandedChart === chartId 
            ? <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></> 
            : <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />}
      </svg>
    </button>
  );

  const renderChartContent = (type, isExpanded = false) => {
    const fontSize = isExpanded ? 14 : 11;
    const margin = isExpanded 
      ? { top: 20, right: 30, bottom: 20, left: 10 } 
      : { top: 10, right: 10, bottom: 0, left: -10 };
    
    // Ejes usando variables
    const currentAxisStyle = { fontSize, fill: 'var(--text-main)' };

    const commonProps = { margin };
    const commonGrid = <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />;
    const commonX = <XAxis dataKey="Intervalo" tick={currentAxisStyle} interval={0} angle={-10} textAnchor="end" height={isExpanded ? 60 : 40} stroke="var(--text-main)" />;
    const commonY = <YAxis tick={currentAxisStyle} stroke="var(--text-main)" />;
    const commonTooltip = <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />;
    const commonLegend = <Legend wrapperStyle={{ fontSize: isExpanded ? '1.2rem' : '0.8rem', color: 'var(--text-main)' }} />;

    switch (type) {
      case 'histograma':
        return (
          <BarChart data={datosProcesados} {...commonProps} barCategoryGap={0}>
            {commonGrid}{commonX}{commonY}{commonTooltip}{commonLegend}
            <Bar dataKey="f_i" fill="#2563eb" name="Frecuencia Absoluta" radius={[2, 2, 0, 0]} />
          </BarChart>
        );
      case 'poligono':
        return (
          <LineChart data={datosProcesados} {...commonProps}>
            {commonGrid}{commonX}{commonY}{commonTooltip}{commonLegend}
            <Line type="monotone" dataKey="f_i" stroke="#2563eb" strokeWidth={3} dot={{r:4}} name="Frecuencia Absoluta" />
          </LineChart>
        );
      case 'ojiva_creciente':
        return (
          <AreaChart data={datosProcesados} {...commonProps}>
            {commonGrid}{commonX}{commonY}{commonTooltip}{commonLegend}
            <Area type="monotone" dataKey="F_i" stroke="#10b981" fill="#d1fae5" strokeWidth={3} name="Frecuencia Acumulada" />
          </AreaChart>
        );
      case 'ojiva_decreciente':
        return (
          <AreaChart data={datosProcesados} {...commonProps}>
            {commonGrid}{commonX}{commonY}{commonTooltip}{commonLegend}
            <Area type="monotone" dataKey="F'i" stroke="#ef4444" fill="#fee2e2" strokeWidth={3} name="Frec. Acumulada Inv." />
          </AreaChart>
        );
      case 'mixto':
        return (
          <ComposedChart data={datosProcesados} {...commonProps}>
            {commonGrid}{commonX}{commonY}{commonTooltip}{commonLegend}
            <Bar dataKey="f_i" fill="#93c5fd" name="Histograma" barSize={40} />
            <Line type="monotone" dataKey="f_i" stroke="#1e40af" strokeWidth={3} dot={{r:4}} name="Polígono" />
          </ComposedChart>
        );
      default: return null;
    }
  };

  const ChartCard = ({ id, title, type }) => (
    <div style={chartContainerStyle}>
      <h4 style={titleStyle}>{title}</h4>
      {renderMaximizeButton(id)}
      <div style={{ flex: 1, width: "100%", minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChartContent(type, false)}
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px", width: "100%", marginTop: "10px" }}>
        <ChartCard id="hist" title="Histograma (fi)" type="histograma" />
        <ChartCard id="poli" title="Polígono de Frecuencias" type="poligono" />
        <ChartCard id="ojiva1" title="Ojiva Creciente (Fi)" type="ojiva_creciente" />
        <ChartCard id="ojiva2" title="Ojiva Decreciente (F'i)" type="ojiva_decreciente" />
        <ChartCard id="mixto" title="Histograma + Polígono" type="mixto" />
      </div>

      {expandedChart && (
        <div style={expandedOverlayStyle} onClick={() => setExpandedChart(null)}>
          <div style={expandedCardStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
               <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)' }}>Detalle del Gráfico</h2>
               {renderMaximizeButton(expandedChart)}
            </div>
            <div style={{ flex: 1, width: "100%", minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                 {renderChartContent(
                    expandedChart === 'hist' ? 'histograma' :
                    expandedChart === 'poli' ? 'poligono' :
                    expandedChart === 'ojiva1' ? 'ojiva_creciente' :
                    expandedChart === 'ojiva2' ? 'ojiva_decreciente' : 'mixto', 
                    true
                 )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </>
  );
}