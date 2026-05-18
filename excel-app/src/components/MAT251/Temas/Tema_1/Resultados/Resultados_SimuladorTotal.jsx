import React, { useEffect, useRef, useMemo } from 'react';
import { FONT, FS, RADIUS, cardStyle, labelStyle } from '../../../Principal/Constantes';
import { IconoCalculadora, EditarDatos } from '../../../../ui/iconos';
import katex from 'katex';
import ArbolProbabilidad from '../../../Graficas/ArbolProbabilidad';

export default function ResultadosSimuladorTotal({ 
    filas, varSeleccionada,
    colCausa, setColCausa,
    colEvento, setColEvento,
    valExito, setValExito,
    ramas, setRamas,
    resultado, setResultadoSimulador,
    errorSimulador, setErrorSimulador,
    statsDatos, abrirEditor
}) {
    const formulaRef = useRef(null);

    // Extraer valores únicos para el selector de "Éxito" del evento
    const valoresUnicosEvento = useMemo(() => {
        if (!varSeleccionada || !colEvento) return [];
        const colIndex = varSeleccionada.nombresColumnas?.indexOf(colEvento);
        if (colIndex === -1 || colIndex === undefined) return [];
        
        const vals = filas.map(f => {
            const partes = f.valor.split(' | ').map(p => p.trim());
            return partes[colIndex];
        }).filter(Boolean);
        return [...new Set(vals)].sort();
    }, [varSeleccionada, colEvento, filas]);

    const calcular = () => {
        if (!varSeleccionada) {
            setErrorSimulador("Importa una Matriz de Excel primero."); 
            setResultadoSimulador(null);
            return;
        }
        if (!colCausa || !colEvento || !valExito) {
            setErrorSimulador("Selecciona las columnas de Causa y Evento, así como el valor de éxito."); 
            setResultadoSimulador(null);
            return;
        }
        
        const idxCausa = varSeleccionada.nombresColumnas.indexOf(colCausa);
        const idxEvento = varSeleccionada.nombresColumnas.indexOf(colEvento);
        
        if (idxCausa === -1 || idxEvento === -1) {
            setErrorSimulador("Columnas no encontradas en la matriz.");
            setResultadoSimulador(null);
            return;
        }

        // Extraer valores estructurados
        const datosParseados = filas.map(f => {
            const p = f.valor.split(' | ').map(v => v.trim());
            return { causa: p[idxCausa], evento: p[idxEvento] };
        }).filter(d => d.causa !== undefined && d.evento !== undefined && d.causa !== '' && d.evento !== '');

        const totalDatos = datosParseados.length;
        if (totalDatos === 0) {
            setErrorSimulador("No hay datos válidos para procesar.");
            setResultadoSimulador(null);
            return;
        }

        // Identificar causas únicas
        const causasUnicas = [...new Set(datosParseados.map(d => d.causa))].sort();

        let probB = 0;
        const desglose = [];
        
        causasUnicas.forEach((causa, index) => {
            const datosCausa = datosParseados.filter(d => d.causa === causa);
            const n_Ai = datosCausa.length;
            const pA = n_Ai / totalDatos;

            const datosExito = datosCausa.filter(d => d.evento === valExito);
            const n_B_dado_Ai = datosExito.length;
            const pB_A = n_Ai > 0 ? n_B_dado_Ai / n_Ai : 0;

            const mult = pA * pB_A;
            probB += mult;

            desglose.push({
                id: index + 1,
                nombre: causa,
                n_Ai: n_Ai,
                totalDatos: totalDatos,
                pA: pA,
                n_B_dado_Ai: n_B_dado_Ai,
                pB_A: pB_A,
                mult: mult
            });
        });

        setRamas(desglose);
        setResultadoSimulador({ probB, desglose });
        setErrorSimulador('');
    };

    // Recalcular automáticamente si cambian los datos o las selecciones
    useEffect(() => {
        if (varSeleccionada && colCausa && colEvento && valExito) {
            calcular();
        } else {
            setResultadoSimulador(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filas, colCausa, colEvento, valExito, varSeleccionada]);


    useEffect(() => {
        if (formulaRef.current && resultado) {
            let formulaLatex = `\\begin{aligned}\n`;
            formulaLatex += `P(B) &= \\sum_{i=1}^{n} P(A_i) \\cdot P(B|A_i) \\\\\n`;
            
            let sumatoriaStr = resultado.desglose.map(r => `P(\\text{${r.nombre}}) \\cdot P(B|\\text{${r.nombre}})`).join(' + ');
            formulaLatex += `P(B) &= ${sumatoriaStr} \\\\\n`;
            
            let valoresStr = resultado.desglose.map(r => `(${r.pA.toFixed(4)} \\cdot ${r.pB_A.toFixed(4)})`).join(' + ');
            formulaLatex += `P(B) &= ${valoresStr} \\\\\n`;
            
            let multsStr = resultado.desglose.map(r => `${r.mult.toFixed(4)}`).join(' + ');
            formulaLatex += `P(B) &= ${multsStr} \\\\\n`;
            
            formulaLatex += `P(B) &= \\mathbf{${resultado.probB.toFixed(4)}}\n`;
            formulaLatex += `\\end{aligned}`;

            katex.render(formulaLatex, formulaRef.current, { throwOnError: false, displayMode: true });
        }
    }, [resultado]);



    return (
        <div style={{ marginTop: '0px' }}>
            <div style={{ ...cardStyle, marginBottom: '20px' }}>
                {/* ── BARRA DE DATOS Y EDITOR ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div>
                        <span style={{ ...labelStyle, margin: 0 }}>Matriz Detectada (Datos Históricos):</span>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
                            <small title="Datos provenientes de variables externas" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                Cargados: <strong style={{ color: 'var(--primary-color)' }}>{statsDatos?.cargados || 0}</strong>
                            </small>
                            <small title="Datos ingresados manualmente" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                Agregados: <strong style={{ color: '#3b82f6' }}>{statsDatos?.agregados || 0}</strong>
                            </small>
                            <small title="Total de datos válidos" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                Total: <strong>{statsDatos?.total || 0}</strong>
                            </small>
                        </div>
                    </div>
                    <button
                        onClick={abrirEditor}
                        className="btn-icon"
                        style={{
                            borderRadius: RADIUS,
                            fontSize: FS.sm,
                            padding: '6px 14px',
                            background: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <EditarDatos />
                        Editar Datos
                    </button>
                </div>
                {varSeleccionada && varSeleccionada.nombresColumnas && varSeleccionada.nombresColumnas.length > 1 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end', marginBottom: '20px', background: 'var(--bg-input)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontWeight: 600 }}>
                                Variable Causa <span dangerouslySetInnerHTML={{ __html: katex.renderToString('A_i') }} />:
                            </label>
                            <select 
                                value={colCausa} 
                                onChange={(e) => {
                                    setColCausa(e.target.value);
                                }}
                                className="container_cal_input"
                                style={{ width: '100%', borderRadius: RADIUS, padding: '8px', fontSize: FS.sm, border: '1px solid var(--border-color)' }}
                            >
                                <option value="">-- Seleccionar --</option>
                                {varSeleccionada.nombresColumnas.map(col => (
                                    <option key={col} value={col}>{col}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontWeight: 600 }}>
                                Variable Evento <span dangerouslySetInnerHTML={{ __html: katex.renderToString('B') }} />:
                            </label>
                            <select 
                                value={colEvento} 
                                onChange={(e) => {
                                    setColEvento(e.target.value);
                                    setValExito('');
                                }}
                                className="container_cal_input"
                                style={{ width: '100%', borderRadius: RADIUS, padding: '8px', fontSize: FS.sm, border: '1px solid var(--border-color)' }}
                            >
                                <option value="">-- Seleccionar --</option>
                                {varSeleccionada.nombresColumnas.filter(c => c !== colCausa).map(col => (
                                    <option key={col} value={col}>{col}</option>
                                ))}
                            </select>
                        </div>

                        {colEvento && valoresUnicosEvento.length > 0 && (
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'block', marginBottom: '4px', color: 'var(--primary-color)', fontWeight: 'bold' }}>Valor de "Éxito":</label>
                                <select 
                                    value={valExito} 
                                    onChange={(e) => {
                                        setValExito(e.target.value);
                                    }}
                                    className="container_cal_input"
                                    style={{ width: '100%', borderRadius: RADIUS, padding: '8px', fontSize: FS.sm, border: '2px solid var(--primary-color)' }}
                                >
                                    <option value="">-- Seleccionar --</option>
                                    {valoresUnicosEvento.map(val => (
                                        <option key={val} value={val}>{val}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button 
                            onClick={calcular} 
                            className="button_calcular btn-icon" 
                            style={{ padding: '8px 25px', borderRadius: RADIUS, fontSize: FS.sm, fontWeight: 700, height: '36px', background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer' }}
                            disabled={!varSeleccionada || !colCausa || !colEvento || !valExito}
                        >
                            <IconoCalculadora />
                            CALCULAR
                        </button>
                    </div>
                ) : varSeleccionada ? (
                    <div style={{ padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: RADIUS, fontSize: FS.sm, marginBottom: '15px' }}>
                        Para usar el Teorema de Probabilidad Total, debes importar una "Matriz" que contenga al menos 2 columnas.
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: FS.sm }}>
                        Importa una matriz en el panel izquierdo para comenzar.
                    </p>
                )}

                {errorSimulador && (
                    <div style={{ marginBottom: '15px', padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: RADIUS, border: '1px solid #f87171', fontWeight: 'bold', fontSize: FS.xs }}>
                        {errorSimulador}
                    </div>
                )}
            </div>

            {resultado && (
                <>
                    <div style={{ ...cardStyle, marginBottom: '20px' }}>
                        <h4 style={{ color: 'var(--primary-color)', margin: '0 0 10px 0', fontSize: FS.sm }}>
                            Desglose de la Matriz:
                        </h4>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: FS.sm }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-input)', borderBottom: '2px solid var(--border-color)' }}>
                                        <th style={{ padding: '8px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>Causa Única <span dangerouslySetInnerHTML={{ __html: katex.renderToString('A_i') }} /></th>
                                        <th style={{ padding: '8px 6px', color: 'var(--text-muted)', fontWeight: 500 }}>Frecuencia <span dangerouslySetInnerHTML={{ __html: katex.renderToString('(n)') }} /></th>
                                        <th style={{ padding: '8px 6px' }}><span dangerouslySetInnerHTML={{ __html: katex.renderToString('P(A_i)') }} /></th>
                                        <th style={{ padding: '8px 6px', color: 'var(--text-muted)', fontWeight: 500 }}>Éxitos en <span dangerouslySetInnerHTML={{ __html: katex.renderToString('A_i') }} /></th>
                                        <th style={{ padding: '8px 6px' }}><span dangerouslySetInnerHTML={{ __html: katex.renderToString('P(B|A_i)') }} /></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ramas.map((rama) => (
                                        <tr key={rama.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '8px 6px', fontWeight: 600 }}>{rama.nombre}</td>
                                            <td style={{ padding: '8px 6px', color: 'var(--text-muted)', fontSize: '0.9em' }}>
                                                {rama.n_Ai} / {rama.totalDatos}
                                            </td>
                                            <td style={{ padding: '8px 6px', fontWeight: 'bold' }}>{rama.pA.toFixed(4)}</td>
                                            <td style={{ padding: '8px 6px', color: 'var(--text-muted)', fontSize: '0.9em' }}>
                                                {rama.n_B_dado_Ai} / {rama.n_Ai}
                                            </td>
                                            <td style={{ padding: '8px 6px', fontWeight: 'bold' }}>{rama.pB_A.toFixed(4)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style={{ ...cardStyle }}>
                        <h3 style={{ color: 'var(--primary-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', fontSize: FS.md, margin: '0 0 15px 0' }}>
                            Desarrollo Matemático
                        </h3>
                        <div style={{ overflowX: 'auto', background: 'var(--bg-input)', padding: '10px', borderRadius: RADIUS }}>
                            <div ref={formulaRef}></div>
                        </div>
                        <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(2, 132, 199, 0.05)', border: '1.5px solid var(--primary-color)', borderRadius: RADIUS, textAlign: 'center' }}>
                            <div style={{ fontSize: FS.lg, fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                P(B) = {resultado.probB.toFixed(4)}
                            </div>
                            <div style={{ fontSize: FS.sm, color: 'var(--text-main)', marginTop: '4px' }}>
                                ({ (resultado.probB * 100).toFixed(2) }% probabilidad)
                            </div>
                        </div>
                        <ArbolProbabilidad resultado={resultado} ramas={ramas} />
                    </div>
                </>
            )}
        </div>
    );
}
