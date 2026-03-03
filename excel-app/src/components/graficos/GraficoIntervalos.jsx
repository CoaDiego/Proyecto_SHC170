import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, ComposedChart, Legend
} from "recharts";

// =========================================================
// 1. ESTILOS MOVIDOS AFUERA
// =========================================================
const chartContainerStyle = {
  backgroundColor: "var(--bg-card)", 
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

const expandedOverlayStyle = {
  position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
  backgroundColor: "rgba(0,0,0,0.8)", zIndex: 9999,
  display: "flex", justifyContent: "center", alignItems: "center", padding: "20px"
};

const expandedCardStyle = {
  backgroundColor: "var(--bg-card)", 
  width: "90%", height: "85%", borderRadius: "12px", padding: "20px",
  display: "flex", flexDirection: "column",
  boxShadow: "0 4px 20px rgba(0,0,0,0.5)", position: "relative",
  color: "var(--text-main)"
};

const titleStyle = {
  textAlign: "center", marginBottom: "10px", fontWeight: "bold",
  color: "var(--text-main)", 
  fontSize: "1rem",
};

// =========================================================
// 2. SUB-COMPONENTES MOVIDOS AFUERA
// =========================================================

// Botón independiente
// Botón independiente
const MaximizeButton = ({ isExpanded, onToggle }) => (
  <button 
    onClick={onToggle}
    title={isExpanded ? "Cerrar" : "Maximizar"}
    style={{
      /* Ajustes para evitar que se corte en móviles */
      position: "absolute", 
      top: "12px", 
      right: "12px",
      background: "var(--bg-input)", 
      border: "1px solid var(--border-color)",
      borderRadius: "4px", 
      cursor: "pointer", 
      padding: "6px", /* Un poco más de padding para que sea fácil de tocar */
      zIndex: 10, 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      transition: "background-color 0.2s"
    }}
    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--border-color)"}
    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "var(--bg-input)"}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {isExpanded 
        ? <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></> 
        : <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />}
    </svg>
  </button>
);

// CORRECCIÓN: Convertido a Componente en mayúsculas (Mata el warning "Inline render function")
const ChartContent = ({ type, isExpanded, datosProcesados }) => {
  const fontSize = isExpanded ? 14 : 11;
  const margin = isExpanded 
    ? { top: 20, right: 30, bottom: 20, left: 10 } 
    : { top: 10, right: 10, bottom: 0, left: -10 };
  
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

const ChartCard = ({ title, isExpanded, onToggle, children }) => (
  <div style={{
    ...chartContainerStyle,
    /* Añadimos más espacio arriba para que el botón entre bien */
    paddingTop: "40px",
  }}>
    <h4 style={{
      ...titleStyle,
      /* Movemos el título un poco arriba para centrarlo con el botón */
      position: "absolute",
      top: "15px",
      left: "0",
      right: "0",
      margin: "0"
    }}>{title}</h4>
    
    <MaximizeButton isExpanded={isExpanded} onToggle={onToggle} />
    
    <div style={{ flex: 1, width: "100%", minHeight: 0, marginTop: "10px" }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  </div>
);
// =========================================================
// 3. COMPONENTE PRINCIPAL
// =========================================================
export default function GraficoIntervalos({ datos }) {
  const [expandedChart, setExpandedChart] = useState(null);

  if (!datos || datos.length === 0) return <p style={{ color: "var(--text-muted)" }}>No hay datos para graficar.</p>;

  const datosProcesados = datos.map(item => ({
    Intervalo: item["Haber básico"] || item["Intervalos"] || item["Intervalo"] || "",
    f_i: Number(item["f_i"] || item["fi"] || 0),
    F_i: Number(item["F_i"] || item["Fi"] || 0),
    "F'i": Number(item["F'i"] || item["F_i_inv"] || 0)
  }));

  const handleToggle = (chartId) => {
    setExpandedChart(expandedChart === chartId ? null : chartId);
  };

  const getChartType = (id) => {
    const map = { 'hist': 'histograma', 'poli': 'poligono', 'ojiva1': 'ojiva_creciente', 'ojiva2': 'ojiva_decreciente', 'mixto': 'mixto' };
    return map[id] || 'histograma';
  };

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginTop: "10px" }}>
        {/* CORRECCIÓN: Optimización de la lista de tarjetas y pasar keys correctos */}
        {['hist', 'poli', 'ojiva1', 'ojiva2', 'mixto'].map(id => (
          <ChartCard 
            key={id} 
            title={id === 'hist' ? 'Histograma (fi)' : id === 'poli' ? 'Polígono de Frecuencias' : id === 'ojiva1' ? 'Ojiva Creciente (Fi)' : id === 'ojiva2' ? 'Ojiva Decreciente (F\'i)' : 'Histograma + Polígono'} 
            isExpanded={expandedChart === id} 
            onToggle={() => handleToggle(id)}
          >
            <ChartContent type={getChartType(id)} isExpanded={false} datosProcesados={datosProcesados} />
          </ChartCard>
        ))}
      </div>

      {/* VENTANA MODAL (MAXIMIZAR GRÁFICO) */}
      {expandedChart && (
        <div 
          className="modal-grafico-overlay" /* Usando la clase CSS */
          onClick={() => setExpandedChart(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if(e.key === 'Escape' || e.key === 'Enter') setExpandedChart(null); }}
        >
          <div className="modal-grafico-card" /* Usando la clase CSS */ 
               onClick={(e) => e.stopPropagation()} 
               role="presentation"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
               
               <h2 className="modal-grafico-titulo">Detalle del Gráfico</h2> {/* Usando la clase CSS */}
               
               <MaximizeButton isExpanded={true} onToggle={() => setExpandedChart(null)} />
            </div>
            
            <div style={{ flex: 1, width: "100%", minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                 <ChartContent type={getChartType(expandedChart)} isExpanded={true} datosProcesados={datosProcesados} />
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </>
  );
}