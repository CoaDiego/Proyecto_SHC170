import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, ComposedChart, Legend
} from "recharts";

export default function GraficoIntervalos({ datos }) {
  const [expandedChart, setExpandedChart] = useState(null);

  if (!datos || datos.length === 0) return <p className="text-gray-500 text-sm">No hay datos para graficar.</p>;

  // Estilos de tarjeta normal
  const chartContainerStyle = {
    backgroundColor: "#f5f5f5",
    padding: "15px",
    borderRadius: "10px",
    border: "1px solid #ccc", 
    height: "300px", 
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    position: "relative" // Necesario para posicionar el botón absoluto
  };

  // Estilos para el modo EXPANDIDO (Modal)
  const expandedOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.8)",
    zIndex: 9999,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px"
  };

  const expandedCardStyle = {
    backgroundColor: "white",
    width: "90%",
    height: "85%",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
    position: "relative"
  };

  const titleStyle = {
    textAlign: "center",
    marginBottom: "10px",
    fontWeight: "bold",
    color: "#333",
    fontSize: "1rem",
  };

  const axisStyle = { fontSize: 11, fill: '#666' };

  // Función para renderizar el botón de maximizar/cerrar
  const renderMaximizeButton = (chartId) => (
    <button 
      onClick={() => setExpandedChart(expandedChart === chartId ? null : chartId)}
      title={expandedChart === chartId ? "Cerrar" : "Maximizar"}
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        background: "rgba(255,255,255,0.8)",
        border: "1px solid #ccc",
        borderRadius: "4px",
        cursor: "pointer",
        padding: "4px",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {expandedChart === chartId ? (
        // Icono Cerrar (X)
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      ) : (
        // Icono Maximizar (Cuadrado con flechas)
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
      )}
    </button>
  );

  // Función auxiliar para renderizar el contenido del gráfico
  const renderChartContent = (type, isExpanded = false) => {
    const fontSize = isExpanded ? 14 : 11;
    const margin = isExpanded 
      ? { top: 20, right: 30, bottom: 20, left: 10 } 
      : { top: 10, right: 10, bottom: 0, left: -10 };
    
    const currentAxisStyle = { fontSize, fill: '#666' };

    switch (type) {
      case 'histograma':
        return (
          <BarChart data={datos} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Intervalo" tick={currentAxisStyle} interval={0} angle={-10} textAnchor="end" height={isExpanded ? 60 : 40}/>
            <YAxis tick={currentAxisStyle} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: isExpanded ? '1.2rem' : '0.8rem' }}/>
            <Bar dataKey="f_i" fill="#2563eb" name="Frecuencia Absoluta" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'poligono':
        return (
          <LineChart data={datos} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Intervalo" tick={currentAxisStyle} interval={0} angle={-10} textAnchor="end" height={isExpanded ? 60 : 40}/>
            <YAxis tick={currentAxisStyle} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: isExpanded ? '1.2rem' : '0.8rem' }}/>
            <Line type="monotone" dataKey="f_i" stroke="#2563eb" strokeWidth={3} dot={{r:4}} name="Frecuencia Absoluta" />
          </LineChart>
        );
      case 'ojiva_creciente':
        return (
          <AreaChart data={datos} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Intervalo" tick={currentAxisStyle} interval={0} angle={-10} textAnchor="end" height={isExpanded ? 60 : 40} />
            <YAxis tick={currentAxisStyle} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: isExpanded ? '1.2rem' : '0.8rem' }}/>
            <Area type="monotone" dataKey="F_i" stroke="#10b981" fill="#d1fae5" strokeWidth={3} name="Frecuencia Acumulada" />
          </AreaChart>
        );
      case 'ojiva_decreciente':
        return (
          <AreaChart data={datos} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Intervalo" tick={currentAxisStyle} interval={0} angle={-10} textAnchor="end" height={isExpanded ? 60 : 40} />
            <YAxis tick={currentAxisStyle} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: isExpanded ? '1.2rem' : '0.8rem' }}/>
            <Area type="monotone" dataKey="F'i" stroke="#ef4444" fill="#fee2e2" strokeWidth={3} name="Frec. Acumulada Inv." />
          </AreaChart>
        );
      case 'mixto':
        return (
          <ComposedChart data={datos} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Intervalo" tick={currentAxisStyle} interval={0} angle={-10} textAnchor="end" height={isExpanded ? 60 : 40} />
            <YAxis tick={currentAxisStyle} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: isExpanded ? '1.2rem' : '0.8rem' }}/>
            <Bar dataKey="f_i" fill="#93c5fd" name="Histograma" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="f_i" stroke="#1e40af" strokeWidth={3} dot={{r:4}} name="Polígono" />
          </ComposedChart>
        );
      default: return null;
    }
  };

  // Componente interno para envolver cada tarjeta (Normal)
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
      {/* GRID NORMAL */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", 
        gap: "20px", 
        width: "100%",
        marginTop: "10px"
      }}>
        <ChartCard id="hist" title="Histograma (fi)" type="histograma" />
        <ChartCard id="poli" title="Polígono de Frecuencias" type="poligono" />
        <ChartCard id="ojiva1" title="Ojiva Creciente (Fi)" type="ojiva_creciente" />
        <ChartCard id="ojiva2" title="Ojiva Decreciente (F'i)" type="ojiva_decreciente" />
        <ChartCard id="mixto" title="Histograma + Polígono" type="mixto" />
      </div>

      {/* MODAL DE EXPANSIÓN (Solo si hay uno seleccionado) */}
      {expandedChart && (
        <div style={expandedOverlayStyle} onClick={() => setExpandedChart(null)}>
          <div style={expandedCardStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
               <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>
                 {expandedChart === 'hist' && "Histograma Detallado"}
                 {expandedChart === 'poli' && "Polígono de Frecuencias Detallado"}
                 {expandedChart === 'ojiva1' && "Ojiva Creciente Detallada"}
                 {expandedChart === 'ojiva2' && "Ojiva Decreciente Detallada"}
                 {expandedChart === 'mixto' && "Gráfico Mixto Detallado"}
               </h2>
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