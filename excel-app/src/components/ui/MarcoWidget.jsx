import React, { useState } from 'react';

export default function MarcoWidget({ id, titulo, children, anchoCompleto = false }) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // NOTA PARA EL COMPAÑERO: Cuando quieras activar el Drag & Drop, 
  // descomenta los hooks de dnd-kit aquí y pásale el id al useSortable.
  // Por ahora, usamos estilos estáticos seguros.
  
  const style = {
    // Si la pantalla es pequeña o no queremos ancho completo, lo dejamos en auto
    gridColumn: anchoCompleto && !isMaximized ? "1 / -1" : "auto",
    zIndex: isMaximized ? 9999 : 1
  };

  return (
    <div 
      id={id}
      style={style} 
      className={`widget-grafico ${isMaximized ? 'maximizada' : ''} ${isMinimized ? 'minimizada' : ''}`}
    >
      <div className="widget-header">
        <h4 className="widget-titulo">📊 {titulo}</h4>
        <div className="widget-controles">
          <button 
            className="widget-btn" 
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? "Mostrar gráfico" : "Ocultar gráfico"}
          >
            {isMinimized ? '👁️' : '➖'}
          </button>
          <button 
            className="widget-btn" 
            onClick={() => { 
              setIsMaximized(!isMaximized); 
              setIsMinimized(false); 
            }}
            title={isMaximized ? "Restaurar tamaño" : "Pantalla completa"}
          >
            {isMaximized ? '🗗' : '🗖'}
          </button>
        </div>
      </div>
      <div className={`widget-body ${isMinimized ? 'oculto' : ''}`}>
        {children}
      </div>
    </div>
  );
}