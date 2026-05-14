import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconoGrafico, IconoMostrar, IconoOcultar, IconoMaximizar, IconoRestaurar } from './iconos';

const IconoMover = () => (
  <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" style={{ cursor: 'grab', opacity: 0.6 }}>
    <path d="M7 2a2 2 0 1 0 .001 4.001 A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001 A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001 A2 2 0 0 0 7 14zm6-12a2 2 0 1 0 .001 4.001 A2 2 0 0 0 13 2zm0 6a2 2 0 1 0 .001 4.001 A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001 A2 2 0 0 0 13 14z" />
  </svg>
);

export default function MarcoWidget({ id, titulo, children, anchoCompleto = false, ancho, alto }) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isMaximized });

  // 🛠️ AJUSTE 1: Usamos 'Translate' en lugar de 'Transform' y forzamos relative
  const style = {
    transform: CSS.Translate.toString(transform), 
    transition,
    opacity: isDragging ? 0.8 : 1, // Le damos un poquito más de opacidad al arrastrar
    gridColumn: anchoCompleto && !isMaximized ? "1 / -1" : "auto",
    zIndex: isDragging ? 9999 : (isMaximized ? 9999 : 1),
    width: anchoCompleto && !isMaximized ? "100%" : (!isMaximized && ancho ? ancho : undefined),
    height: !isMaximized && alto ? alto : undefined,
    position: "relative", // 👈 Fijo en relative para que no salte
  };

  const childrenConProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { isMaximized });
    }
    return child;
  });

  return (
<div ref={setNodeRef} id={id} style={style} className={`widget-grafico pdf-section ${isMaximized ? 'maximizada' : ''} ${isMinimized ? 'minimizada' : ''}`}>
      <div className="widget-header">
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* 🛠️ AJUSTE 2: touchAction: 'none' es obligatorio para que dnd-kit detecte el mouse */}
          {!isMaximized && (
            <div 
              {...attributes} 
              {...listeners} 
              style={{ display: 'flex', alignItems: 'center', cursor: 'grab', touchAction: 'none', padding: '4px' }} 
              title="Arrastrar gráfico"
            >
              <IconoMover />
            </div>
          )}
          <h4 className="widget-titulo" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconoGrafico /> {titulo}
          </h4>
        </div>

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