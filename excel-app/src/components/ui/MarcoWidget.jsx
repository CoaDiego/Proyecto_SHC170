import React, { useState } from 'react';

export default function MarcoWidget({ id, titulo, children, anchoCompleto = false }) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const style = {
    gridColumn: anchoCompleto && !isMaximized ? "1 / -1" : "auto",
    zIndex: isMaximized ? 9999 : 1
  };

  // 🧠 MAGIA DE REACT: Inyectamos 'isMaximized' al gráfico que esté adentro
  const childrenConProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { isMaximized });
    }
    return child;
  });

  return (
    <div id={id} style={style} className={`widget-grafico ${isMaximized ? 'maximizada' : ''} ${isMinimized ? 'minimizada' : ''}`}>
      <div className="widget-header">
        <h4 className="widget-titulo">📊 {titulo}</h4>
        <div className="widget-controles">
          <button className="widget-btn" onClick={() => setIsMinimized(!isMinimized)} title={isMinimized ? "Mostrar" : "Ocultar"}>
            {isMinimized ? '👁️' : '➖'}
          </button>
          <button className="widget-btn" onClick={() => { setIsMaximized(!isMaximized); setIsMinimized(false); }} title={isMaximized ? "Restaurar" : "Maximizar"}>
            {isMaximized ? '🗗' : '🗖'}
          </button>
        </div>
      </div>
      <div className={`widget-body ${isMinimized ? 'oculto' : ''}`}>
        {/* Movimos el div interno aquí para mantener tu código ordenado */}
        <div className="contenedor-grafico-interno">
          {childrenConProps}
        </div>
      </div>
    </div>
  );
}