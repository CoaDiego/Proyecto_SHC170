import React from 'react';

const VariableCard = ({ v, currentSheet, actions }) => {
    return (
        <div className="variable-card" style={{
            borderLeft: `8px solid ${v.color}`,
            borderTop: '2px solid var(--border-color)',
            borderRight: '2px solid var(--border-color)',
            borderBottom: '2px solid var(--border-color)',
            padding: '8px',
            marginBottom: '10px',
            background: 'var(--bg-card)',
            borderRadius: '5px',
            overflow: 'hidden'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <div style={{ display: 'flex', gap: '8px', flex: 1, alignItems: 'center' }}>
                    <input
                        type="text"
                        value={v.nombre}
                        onChange={(e) => actions.update(v.id, { nombre: e.target.value })}
                        style={{ fontSize: '10px', width: '65%', background: 'transparent', color: '#60a5fa', border: 'none', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', height: '15px' }}
                    />
                    <button onClick={() => actions.assignName(v.id)} style={{ padding: '4px 8px', fontSize: '10px', background: 'var(--header-bg)', color: 'var(--text-variable)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}>Excel</button>
                </div>
                <button onClick={() => actions.delete(v.id)} className="btn-delete" title="Eliminar variable" style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                </button>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-variable)', marginBottom: '12px' }}>
                Hoja:
                <span
                    onClick={() => actions.switchSheet(v.sheet)}
                    style={{ color: v.sheet === currentSheet ? '#4ade80' : '#f87171', cursor: v.sheet ? 'pointer' : 'default', textDecoration: v.sheet ? 'underline' : 'none', marginLeft: '5px', fontWeight: 'bold' }}
                >
                    {v.sheet || "Sin asignar"}
                </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-variable)' }}>Rango:</span>
                <input
                    type="text"
                    value={v.rangoLabel}
                    placeholder="B2:B10"
                    onChange={(e) => actions.manualRange(v.id, e.target.value)}
                    style={{ background: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '5px 10px', fontSize: '10px', width: '65px' }}
                />
                <button
                    onClick={() => actions.capture(v.id)}
                    style={{ flex: 1, fontSize: '11px', padding: '6px', backgroundColor: 'var(--primary-color)', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Capturar
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-variable)', borderTop: '1px solid var(--border-color)', paddingTop: '5px' }}>
                <span>Muestras: <strong style={{ color: 'var(--text-main)' }}>{v.datos.length}</strong></span>
            </div>
        </div>
    );
};

export default VariableCard;