import React, { useState } from 'react';
import { IconoGrafico, IconoMostrar, IconoOcultar, IconoMaximizar, IconoRestaurar } from './iconos';

export default function MarcoWidget({ id, titulo, children, anchoCompleto = false, ancho, alto }) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const style = {
    gridColumn: anchoCompleto && !isMaximized ? "1 / -1" : "auto",
    zIndex: isMaximized ? 9999 : 1,
    width: anchoCompleto && !isMaximized ? "100%" : (!isMaximized && ancho ? ancho : undefined),
    height: !isMaximized && alto ? alto : undefined
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
        <h4 className="widget-titulo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconoGrafico /> {titulo}
        </h4>
        <div className="widget-controles">
          <button className="widget-btn" onClick={() => setIsMinimized(!isMinimized)} title={isMinimized ? "Mostrar" : "Ocultar"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isMinimized ? <IconoMostrar /> : <IconoOcultar />}
          </button>
          <button className="widget-btn" onClick={() => { setIsMaximized(!isMaximized); setIsMinimized(false); }} title={isMaximized ? "Restaurar" : "Maximizar"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isMaximized ? <IconoRestaurar /> : <IconoMaximizar />}
          </button>
        </div>
      </div>
      <div className={`widget-body ${isMinimized ? 'oculto' : ''}`} style={{ flex: 1, position: 'relative', minHeight: '300px', padding: 0 }}>
        {/* Usamos padding interno en lugar del padding del padre para evitar desbordamientos absolutos */}
        <div className="contenedor-grafico-interno" style={{ position: 'absolute', top: 15, left: 15, right: 15, bottom: 15, height: 'auto', width: 'auto' }}>
          {childrenConProps}
        </div>
      </div>
    </div>
  );
}