import React, { useState, useRef, useMemo, useEffect } from 'react';
import { AgGridReact, AgGridProvider } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

import { useData } from '../components/excel/DataContext';
import { keyToNum, getExcelChar, excelToCoords } from '../utils/excelHelpers';
import VariableCard from '../components/excel/VariableCard';
import SelectorNube from '../components/excel/SelectorNube'; // 🆕 Importamos el nuevo componente

import "../styles/pages/Datos.css";
import * as XLSX from 'xlsx'; 

import api from '../services/api';
import { alerta } from '../utils/Notificaciones';

ModuleRegistry.registerModules([AllCommunityModule]);

const SimuladorMAT251 = () => {

    const gridRef = useRef();
    
    // 🆕 1. Extraemos el 'usuario' y la nueva vía directa 'procesarBufferExcel'
    const {
        workbook, sheetNames, currentSheet, rowData, variables, limiteFilas,
        handleFileUpload, procesarBufferExcel, cargarHoja, agregarVariable, 
        eliminarVariable, actualizarVariable, setLimiteFilas, usuario
    } = useData();

    const [selection, setSelection] = useState({ start: null, end: null, isDragging: false });
    const [isDraggingFile, setIsDraggingFile] = useState(false);
    const [archivoActivo, setArchivoActivo] = useState(null); 

    const manejarSubidaLocal = (e) => {
        const files = e.target?.files || e.dataTransfer?.files;
        if (files && files.length > 0) {
            setArchivoActivo({ nombre: files[0].name, origen: 'LOCAL' });
            handleFileUpload(e);
        }
    };

    // 🆕 2. FUNCIÓN DE LA NUBE ACTUALIZADA (Sin tocar el resto de la app)
    const cargarDesdeAPI = async (filename) => {
        if (!filename || !usuario) return;
        try {
            console.log(`Descargando ${filename} del servidor...`);
            // Usamos api.js con el nombre del usuario
            const dataBuffer = await api.descargarArchivoBinario(filename, usuario.nombre);
            // Procesamos los bytes directamente
            procesarBufferExcel(dataBuffer, filename);
            setArchivoActivo({ nombre: filename, origen: 'API' });
        } catch (error) {
            alerta.error("Error al importar", error.message);
        }
    };

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
        const dataCompleta = XLSX.utils.sheet_to_json(ws, { header: "A", defval: "" });
        return dataCompleta.length;
    }, [workbook, currentSheet]);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDraggingFile(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            manejarSubidaLocal({ target: { files: files } });
        }
    };

    // TUS ACCIONES INTACTAS
    const actions = {
        delete: eliminarVariable,
        update: actualizarVariable,
        switchSheet: (name) => name && workbook && cargarHoja(workbook, name),
        assignName: (id) => {
            const val = rowData[selection.start?.row]?.[getExcelChar(selection.start?.col)];
            if (val) actualizarVariable(id, { nombre: String(val) });
        },
        clear: (id) => {
            if (window.confirm("¿Estás seguro de limpiar los datos de esta variable?")) {
                actualizarVariable(id, { rangoLabel: '', coords: null, datos: [], sheet: null });
            }
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
            let contadorNumeros = 0;
            let contadorTextos = 0;

            for (let r = rMin; r <= rMax; r++) {
                for (let c = cMin; c <= cMax; c++) {
                    const columnaLetra = getExcelChar(c);
                    const rawVal = rowData[r]?.[columnaLetra];
                    if (rawVal !== undefined && rawVal !== null && rawVal !== "") {
                        datosValidos.push(rawVal);
                        if (isNaN(Number(rawVal))) {
                            contadorTextos++;
                        } else {
                            contadorNumeros++;
                        }
                    }
                }
            }

            let tipoDetectado = "Sin datos";
            if (datosValidos.length > 0) {
                if (contadorNumeros > 0 && contadorTextos > 0) tipoDetectado = "Mixta (Error)";
                else if (contadorNumeros > 0 && contadorTextos === 0) tipoDetectado = "Cuantitativa (Número)";
                else tipoDetectado = "Cualitativa (Texto)";
            }

            actualizarVariable(id, {
                rangoLabel: `${getExcelChar(cMin)}${rMin + 1}:${getExcelChar(cMax)}${rMax + 1}`,
                coords: { rMin, rMax, cMin, cMax },
                datos: datosValidos, 
                sheet: currentSheet,
                tipo: tipoDetectado
            });

            setSelection({ start: null, end: null, isDragging: false });
        },
        manualRange: (id, texto) => {
            const nuevoTexto = texto.toUpperCase();
            const partes = nuevoTexto.split(':');
            const inicio = excelToCoords(partes[0]);
            const fin = partes[1] ? excelToCoords(partes[1]) : inicio;

            if (inicio && fin) {
                const coords = {
                    rMin: Math.min(inicio.r, fin.r), rMax: Math.max(inicio.r, fin.r),
                    cMin: Math.min(inicio.c, fin.c), cMax: Math.max(inicio.c, fin.c)
                };

                const datosValidos = [];
                let contadorNumeros = 0;
                let contadorTextos = 0;

                for (let r = coords.rMin; r <= coords.rMax; r++) {
                    for (let c = coords.cMin; c <= coords.cMax; c++) {
                        const rawVal = rowData[r]?.[getExcelChar(c)];
                        if (rawVal !== undefined && rawVal !== null && rawVal !== "") {
                            datosValidos.push(rawVal);
                            if (isNaN(Number(rawVal))) contadorTextos++; else contadorNumeros++;
                        }
                    }
                }

                let tipoDetectado = "Sin datos";
                if (datosValidos.length > 0) {
                    if (contadorNumeros > 0 && contadorTextos > 0) tipoDetectado = "Mixta (Error)";
                    else if (contadorNumeros > 0 && contadorTextos === 0) tipoDetectado = "Cuantitativa (Número)";
                    else tipoDetectado = "Cualitativa (Texto)";
                }

                actualizarVariable(id, {
                    rangoLabel: nuevoTexto, coords, datos: datosValidos, sheet: currentSheet, tipo: tipoDetectado
                });
            } else {
                actualizarVariable(id, { rangoLabel: nuevoTexto });
            }
        }
    };

    // TUS COLUMNAS INTACTAS
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

    return (
        <AgGridProvider modules={[AllCommunityModule]}>
            <div style={{ backgroundColor: 'var(--bg-body)', color: 'var(--text-main)', minHeight: '100vh', fontFamily: 'sans-serif', marginTop: '5px' }}>
                <header>
                    <div className="upload-container">
                        
                        {/* 🆕 3. AQUÍ REEMPLAZAMOS EL SELECT VIEJO POR EL COMPONENTE NUEVO */}
                        <div className="upload-column" style={{ minWidth: '300px' }}>
                            {usuario ? (
                                <SelectorNube usuario={usuario} onImportar={cargarDesdeAPI} />
                            ) : (
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    Debes iniciar sesión para importar archivos del servidor.
                                </p>
                            )}
                        </div>

                        <div className="column-divider"></div>
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
                                        onChange={manejarSubidaLocal}
                                        accept=".xlsx, .xls"
                                        style={{ display: 'none' }}
                                    />
                                </label>
                                <span className="file-status">
                                    {workbook ? "Archivo cargado con éxito" : "o arrastra el archivo aquí"}
                                </span>
                            </div>
                        </div>
                    </div >
                    
                    {/* TU BARRA DE HOJAS ORIGINAL */}
                    {sheetNames.length > 0 && (
                        <div style={{
                            margin: '5px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            padding: '10px 20px',
                            backgroundColor: 'var(--bg-card)',
                            borderRadius: '5px',
                            border: '1px solid var(--border-color)'
                        }}>

                            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                <strong>Archivo: </strong>
                                <span style={{ color: '#3b82f6', marginRight: '8px' }}>
                                    {archivoActivo ? archivoActivo.nombre : (workbook ? "Documento cargado" : "Sin archivo")}
                                </span>
                                {archivoActivo && (
                                    <span style={{ color: 'var(--text-muted)' }}>
                                        {archivoActivo.origen === 'API' ? '(Servidor)' : '(Local)'}
                                    </span>
                                )}
                            </div>

                            <div>
                                <span style={{ marginRight: '10px', fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.8rem' }}>
                                    Hoja activa del Excel:
                                </span>
                                <select
                                    value={currentSheet}
                                    onChange={(e) => cargarHoja(workbook, e.target.value)}
                                    className="select-hoja"
                                >
                                    {sheetNames.map(name => <option key={name} value={name}>{name}</option>)}
                                </select>
                            </div>

                        </div>
                    )}

                </header>

                {/* TU DISEÑO DE PANEL Y TABLA ORIGINAL */}
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