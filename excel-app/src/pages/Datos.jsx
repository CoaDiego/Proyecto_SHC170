import React, { useState, useRef, useMemo, useEffect } from 'react';
import { AgGridReact, AgGridProvider } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

import { useData } from '../components/exel/DataContext';
import { keyToNum, getExcelChar, excelToCoords } from '../utils/excelHelpers';
import VariableCard from '../components/exel/VariableCard';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import "../styles/pages/Datos.css";
import * as XLSX from 'xlsx'; // <--- ESTA ES LA QUE FALTA

ModuleRegistry.registerModules([AllCommunityModule]);

const SimuladorMAT251 = () => {
    const gridRef = useRef();
    const {
        workbook, sheetNames, currentSheet, rowData, variables, limiteFilas,
        handleFileUpload, cargarHoja, agregarVariable, eliminarVariable, actualizarVariable, setLimiteFilas
    } = useData();

    const [selection, setSelection] = useState({ start: null, end: null, isDragging: false });
    // Estado para el efecto visual de arrastrar archivo
    const [isDraggingFile, setIsDraggingFile] = useState(false);

    useEffect(() => {
        if (gridRef.current?.api) {
            gridRef.current.api.refreshCells({ force: true, suppressFlash: true });
        }
    }, [selection, variables, currentSheet]);

    useEffect(() => {
        const handleGlobalUp = () => setSelection(prev => ({ ...prev, isDragging: false }));
        window.addEventListener('mouseup', handleGlobalUp);
        return () => window.removeEventListener('mouseup', handleGlobalUp);
    }, []);

    // --- FUNCIONES PARA DRAG AND DROP ---
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDraggingFile(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDraggingFile(false);
    };

    const totalFilasEnHoja = useMemo(() => {
        if (!workbook || !currentSheet) return 0;
        const ws = workbook.Sheets[currentSheet];
        // XLSX.utils.sheet_to_json con header "A" nos da un array donde cada item es una fila
        const dataCompleta = XLSX.utils.sheet_to_json(ws, { header: "A", defval: "" });
        return dataCompleta.length;
    }, [workbook, currentSheet]);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDraggingFile(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            // Creamos un objeto similar al que genera el input file para reutilizar handleFileUpload
            const mockEvent = {
                target: {
                    files: files
                }
            };
            handleFileUpload(mockEvent);
        }
    };

    // Agrupamos las acciones para pasarlas a la VariableCard
    const actions = {
        delete: eliminarVariable,
        update: actualizarVariable,
        switchSheet: (name) => name && workbook && cargarHoja(workbook, name),
        assignName: (id) => {
            const val = rowData[selection.start?.row]?.[getExcelChar(selection.start?.col)];
            if (val) actualizarVariable(id, { nombre: String(val) });
        },
        capture: (id) => {
            const { start, end } = selection;
            if (!start || !end) return alert("⚠️ Selecciona un rango en el Excel primero.");

            const rMin = Math.min(start.row, end.row);
            const rMax = Math.max(start.row, end.row);
            const cMin = Math.min(start.col, end.col);
            const cMax = Math.max(start.col, end.col);

            const solapada = variables.find(v => {
                if (v.id !== id && v.sheet === currentSheet && v.coords) {
                    const cruceFilas = rMin <= v.coords.rMax && rMax >= v.coords.rMin;
                    const cruceColumnas = cMin <= v.coords.cMax && cMax >= v.coords.cMin;
                    return cruceFilas && cruceColumnas;
                }
                return false;
            });

            if (solapada) {
                return alert(`⚠️ Error: El rango choca con la variable "${solapada.nombre}".`);
            }

            const datosValidos = [];
            for (let r = rMin; r <= rMax; r++) {
                for (let c = cMin; c <= cMax; c++) {
                    const val = parseFloat(rowData[r]?.[getExcelChar(c)]);
                    if (!isNaN(val)) datosValidos.push(val);
                }
            }

            actualizarVariable(id, {
                rangoLabel: `${getExcelChar(cMin)}${rMin + 1}:${getExcelChar(cMax)}${rMax + 1}`,
                coords: { rMin, rMax, cMin, cMax },
                datos: datosValidos,
                sheet: currentSheet
            });
            setSelection({ start: null, end: null, isDragging: false });
        },
        manualRange: (id, texto) => {
            const nuevoTexto = texto.toUpperCase(), partes = nuevoTexto.split(':');
            const inicio = excelToCoords(partes[0]), fin = partes[1] ? excelToCoords(partes[1]) : inicio;
            if (inicio && fin) {
                const coords = { rMin: Math.min(inicio.r, fin.r), rMax: Math.max(inicio.r, fin.r), cMin: Math.min(inicio.c, fin.c), cMax: Math.max(inicio.c, fin.c) };
                const datos = [];
                for (let r = coords.rMin; r <= coords.rMax; r++) {
                    for (let c = coords.cMin; c <= coords.cMax; c++) {
                        const val = parseFloat(rowData[r]?.[getExcelChar(c)]);
                        if (!isNaN(val)) datos.push(val);
                    }
                }
                actualizarVariable(id, { rangoLabel: nuevoTexto, coords, datos, sheet: currentSheet });
            } else {
                actualizarVariable(id, { rangoLabel: nuevoTexto });
            }
        }
    };

    const columnDefs = useMemo(() => {
        if (rowData.length === 0) return [];
        const keys = Object.keys(rowData[0]);
        const rowNumberCol = {
            headerName: '', valueGetter: "node.rowIndex + 1", width: 45, pinned: 'left',
            cellStyle: { backgroundColor: '#f8fafc', fontWeight: 'bold', textAlign: 'center', color: '#64748b', fontSize: '11px' }
        };

        const dataCols = keys.map(key => ({
            headerName: key, field: key, width: 120, resizable: true,
            cellClassRules: {
                'celda-azul-seleccion': params => {
                    if (!selection.start || !selection.end) return false;
                    const r = params.node.rowIndex, c = keyToNum(params.column.colId);
                    const rMin = Math.min(selection.start.row, selection.end.row), rMax = Math.max(selection.start.row, selection.end.row);
                    const cMin = Math.min(selection.start.col, selection.end.col), cMax = Math.max(selection.start.col, selection.end.col);
                    return r >= rMin && r <= rMax && c >= cMin && c <= cMax;
                }
            },
            cellStyle: params => {
                const r = params.node.rowIndex, c = keyToNum(params.column.colId);
                const v = variables.find(vItem => vItem.sheet === currentSheet && vItem.coords && r >= vItem.coords.rMin && r <= vItem.coords.rMax && c >= vItem.coords.cMin && c <= vItem.coords.cMax);
                return v ? { backgroundColor: v.color, fontWeight: 'bold', fontSize: '10px' } : { fontSize: '11px' };
            }
        }));
        return [rowNumberCol, ...dataCols];
    }, [rowData, variables, currentSheet, selection]);
    console.log("ESTADO DE VARIABLES:", variables);

    return (
        <AgGridProvider modules={[AllCommunityModule]}>
            <div style={{ backgroundColor: 'var(--bg-body)', color: 'var(--text-main)', minHeight: '100vh', fontFamily: 'sans-serif', marginTop: '5px' }}>
                <header>
                    <div className="upload-container">
                        <div
                            className={`upload-box ${isDraggingFile ? 'drag-over' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <p className="upload-title">Sube tu tabla de datos</p>
                            <p className="upload-subtitle">Formatos soportados: .xlsx, .xls</p>

                            <div className="upload-controls">
                                <label className="btn-upload">
                                    Explorar archivos
                                    <input
                                        type="file"
                                        onChange={handleFileUpload}
                                        accept=".xlsx, .xls"
                                        style={{ display: 'none' }}
                                    />
                                </label>
                                <span className="file-status">
                                    {workbook ? "Archivo cargado con éxito" : "o arrastra el archivo aquí"}
                                </span>
                            </div>
                        </div>

                        {sheetNames.length > 0 && (
                            <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                <select
                                    value={currentSheet}
                                    onChange={(e) => cargarHoja(workbook, e.target.value)}
                                    className="select-hoja"
                                >
                                    {sheetNames.map(name => <option key={name} value={name}>{name}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                </header>

                <div className='main-layout-flex'>
                    <aside className='bloque-variables'>
                        <div className="header-variables">
                            <h3 style={{ fontSize: '0.8rem', margin: 0 }}>Variables:</h3>
                            <button onClick={agregarVariable} className="btn-nueva-var">
                                Nueva variable
                            </button>
                        </div>
                        <div className="seccion-scroll-variables">
                            {variables.map(v => (
                                <VariableCard key={v.id} v={v} currentSheet={currentSheet} actions={actions} />
                            ))}
                        </div>
                    </aside>

                    <section className='contenedor-excel'>
                        <div className="ag-theme-alpine grid-wrapper">
                            <AgGridReact
                                ref={gridRef} rowData={rowData} columnDefs={columnDefs}
                                onCellMouseDown={p => setSelection({ start: { row: p.node.rowIndex, col: keyToNum(p.column.colId) }, end: { row: p.node.rowIndex, col: keyToNum(p.column.colId) }, isDragging: true })}
                                onCellMouseOver={p => selection.isDragging && setSelection(prev => ({ ...prev, end: { row: p.node.rowIndex, col: keyToNum(p.column.colId) } }))}
                                suppressCellFocus={true} headerHeight={30} rowHeight={25}
                            />
                        </div>

                        {/* BOTÓN ÚNICO Y CORREGIDO */}
                        {workbook && rowData.length < totalFilasEnHoja && (
                            <button
                                onClick={() => {
                                    const n = limiteFilas + 50;
                                    setLimiteFilas(n);
                                    cargarHoja(workbook, currentSheet, n);
                                }}
                                style={{
                                    marginTop: '10px',
                                    backgroundColor: 'var(--header-bg)',
                                    color: 'var(--text-main)',
                                    border: '1px dashed var(--border-color)',
                                    borderRadius: '5px',
                                    padding: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cargar 50 filas más... (Mostrando {rowData.length} de {totalFilasEnHoja})
                            </button>
                        )}
                    </section>
                </div>
            </div>
        </AgGridProvider>
    );
};

export default SimuladorMAT251;