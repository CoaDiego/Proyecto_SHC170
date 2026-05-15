import React, { useState, useRef, useMemo, useEffect } from "react";
import { AgGridReact, AgGridProvider } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

import { useData } from "../components/excel/DataContext";
import { keyToNum, getExcelChar, excelToCoords } from "../utils/excelHelpers";
import VariableCard from "../components/excel/VariableCard";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "../styles/pages/Datos.css";
import * as XLSX from "xlsx";

import api from "../services/api";

ModuleRegistry.registerModules([AllCommunityModule]);

// 🆕 Recibimos los nuevos props desde Calculadora.jsx
const SimuladorMAT251 = ({
  setSelectedFile,
  selectedFile,
  setSelectedSheet,
  setSelectedCourse,
  selectedCourse,
}) => {
  const gridRef = useRef();
  const {
    workbook,
    sheetNames,
    currentSheet,
    rowData,
    variables,
    limiteFilas,
    handleFileUpload,
    cargarHoja,
    agregarVariable,
    eliminarVariable,
    actualizarVariable,
    setLimiteFilas,
    usuario,
  } = useData();

  const [selection, setSelection] = useState({
    start: null,
    end: null,
    isDragging: false,
  });
  const selectionRef = useRef(selection);
  const variablesRef = useRef(variables);

  useEffect(() => {
    selectionRef.current = selection;
  }, [selection]);

  useEffect(() => {
    variablesRef.current = variables;
  }, [variables]);

  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // 🆕 Cambiamos archivosApi por una estructura agrupada
  const [gruposArchivos, setGruposArchivos] = useState([]);
  const [cargandoApi, setCargandoApi] = useState(false);
  const [archivoActivo, setArchivoActivo] = useState(null);
  const [_selectedApiFile, setSelectedApiFile] = useState("");
  const [modalMatrizInfo, setModalMatrizInfo] = useState(null);

  // 🆕 USE-EFFECT REPOTENCIADO: Carga personal y de cursos
  useEffect(() => {
    const cargarListaArchivos = async () => {
      if (!usuario) return;
      try {
        setCargandoApi(true); // Mostrar indicador de carga
        const resultadoFinal = [];

        // 1. Cargar Archivos Personales
        const resPersonal = await api.obtenerArchivos(
          usuario.nombre,
          "personal",
        );
        resultadoFinal.push({
          label: "👤 Mis Archivos Personales",
          cursoId: "", // Sin curso
          files: resPersonal.files || [],
        });

        // 2. Cargar Cursos (del localStorage)
        const key =
          usuario.rol === "Estudiante" ? "cursos_estudiante" : "cursos_docente";
        const cursos = JSON.parse(localStorage.getItem(key) || "[]");

        // 3. Buscar archivos compartidos por cada curso
        for (const curso of cursos) {
          const resCurso = await api.obtenerArchivos(
            usuario.nombre,
            "privado",
            curso.codigo,
          );
          if (resCurso.files && resCurso.files.length > 0) {
            resultadoFinal.push({
              label: `📚 ${curso.codigo} - ${curso.nombre}`,
              cursoId: curso.codigo,
              files: resCurso.files,
            });
          }
        }

        setGruposArchivos(resultadoFinal);
      } catch (error) {
        console.error("Error al cargar la lista de archivos:", error);
      } finally {
        setCargandoApi(false);
      }
    };
    cargarListaArchivos();
  }, [usuario]);

  const manejarSubidaLocal = (e) => {
    const files = e.target?.files || e.dataTransfer?.files;
    if (files && files.length > 0) {
      setArchivoActivo({ nombre: files[0].name, origen: "LOCAL" });
      setSelectedApiFile("");
      if (setSelectedFile) setSelectedFile(""); // 🆕 Limpiar estado global
      if (setSelectedCourse) setSelectedCourse(""); // 🆕 Limpiar curso global
      handleFileUpload(e);
    }
  };

  // 🆕 FUNCIÓN ACTUALIZADA: Descarga y notifica a la Calculadora
  const cargarDesdeAPI = async (valorCombinado) => {
    if (!valorCombinado) return;

    // 🆕 Extraemos el nombre del archivo y el ID del curso de la selección
    const [filename, cursoId] = valorCombinado.split("|");

    if (!usuario) {
      alert("Error: No hay un usuario activo. Por favor recarga la página.");
      return;
    }
    try {
      setCargandoApi(true);

      // 🆕 Actualizamos los estados en Calculadora.jsx para que useCalculadoraExcel sepa a dónde ir
      if (setSelectedFile) setSelectedFile(filename);
      if (setSelectedCourse) setSelectedCourse(cursoId || "");
      if (setSelectedSheet) setSelectedSheet(0); // Reiniciar a la primera hoja

      // Descargar el binario (quizás necesites actualizar esta función en api.js para que también acepte el curso si el backend lo requiere para descargar el binario correcto)
      const dataBuffer = await api.descargarArchivoBinario(
        filename,
        usuario.nombre,
      );
      const fileVirtual = new File([dataBuffer], filename, {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      setArchivoActivo({ nombre: filename, origen: "API", curso: cursoId });
      handleFileUpload({ target: { files: [fileVirtual] } });
    } catch (error) {
      alert("Error al cargar dataset: " + error.message);
    } finally {
      setCargandoApi(false);
    }
  };

  // ... (Mantén todo el código de useEffect de selección, drag and drop, actions, y columnDefs exactamente igual) ...
  // ... [Aquí va tu código intermedio sin modificar] ...

  useEffect(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.refreshCells({ force: true, suppressFlash: true });
    }
  }, [selection, variables, currentSheet]);

  useEffect(() => {
    const handleGlobalUp = () =>
      setSelection((prev) => ({ ...prev, isDragging: false }));
    window.addEventListener("mouseup", handleGlobalUp);
    return () => window.removeEventListener("mouseup", handleGlobalUp);
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
    const dataCompleta = XLSX.utils.sheet_to_json(ws, {
      header: "A",
      defval: "",
    });
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

  // Agrupamos las acciones para pasarlas a la VariableCard
  const actions = {
    delete: eliminarVariable,
    update: actualizarVariable,
    openMatrixModal: (v) => setModalMatrizInfo(v),
    switchSheet: (name) => name && workbook && cargarHoja(workbook, name),
    assignName: (id) => {
      const val =
        rowData[selection.start?.row]?.[getExcelChar(selection.start?.col)];
      if (val) actualizarVariable(id, { nombre: String(val) });
    },

    clear: (id) => {
      if (
        window.confirm("¿Estás seguro de limpiar los datos de esta variable?")
      ) {
        actualizarVariable(id, {
          rangoLabel: "",
          coords: null,
          datos: [],
          sheet: null,
        });
      }
    },

    capture: (id) => {
      const { start, end } = selection;
      if (!start || !end)
        return alert("⚠️ Selecciona un rango en el Excel primero.");

      const rMin = Math.min(start.row, end.row);
      const rMax = Math.max(start.row, end.row);
      const cMin = Math.min(start.col, end.col);
      const cMax = Math.max(start.col, end.col);

      const solapada = variables.find((v) => {
        if (v.id !== id && v.sheet === currentSheet && v.coords) {
          const cruceFilas = rMin <= v.coords.rMax && rMax >= v.coords.rMin;
          const cruceColumnas = cMin <= v.coords.cMax && cMax >= v.coords.cMin;
          return cruceFilas && cruceColumnas;
        }
        return false;
      });

      if (solapada) {
        return alert(
          `⚠️ Error: El rango choca con la variable "${solapada.nombre}".`,
        );
      }

      // 🌟 LA RED DE CAPTURA CORREGIDA 🌟
      const datosValidos = [];
      let contadorNumeros = 0;
      let contadorTextos = 0;

      for (let r = rMin; r <= rMax; r++) {
        const filaValores = [];
        let tieneDatos = false;

        for (let c = cMin; c <= cMax; c++) {
          const rawVal = rowData[r]?.[getExcelChar(c)];
          if (rawVal !== undefined && rawVal !== null && rawVal !== "") {
            filaValores.push(rawVal);
            tieneDatos = true;
            if (isNaN(Number(rawVal))) {
              contadorTextos++;
            } else {
              contadorNumeros++;
            }
          } else {
            filaValores.push("");
          }
        }

        if (tieneDatos) {
          if (cMax > cMin) {
            datosValidos.push(filaValores.join(" | "));
          } else {
            datosValidos.push(filaValores[0]);
          }
        }
      }

      // Decisión por mayoría
      let tipoDetectado = "Sin datos";
      if (datosValidos.length > 0) {
        if (contadorNumeros > 0 && contadorTextos > 0) {
          tipoDetectado = "Mixta (Error)";
        } else if (contadorNumeros > 0 && contadorTextos === 0) {
          tipoDetectado = "Cuantitativa (Número)";
        } else {
          tipoDetectado = "Cualitativa (Texto)";
        }
      }

      // NOMBRES DE COLUMNAS (Intento de leer la fila anterior como headers)
      let nombresColumnas = [];
      if (cMax > cMin) {
        const headerRow = rMin > 0 ? rMin - 1 : rMin;
        for (let c = cMin; c <= cMax; c++) {
          const headerVal = rowData[headerRow]?.[getExcelChar(c)];
          nombresColumnas.push(
            headerVal !== undefined && headerVal !== ""
              ? String(headerVal)
              : `Col ${getExcelChar(c)}`,
          );
        }
      }

      // Actualizamos la variable inyectando los datos y el tipo
      actualizarVariable(id, {
        rangoLabel: `${getExcelChar(cMin)}${rMin + 1}:${getExcelChar(cMax)}${rMax + 1}`,
        coords: { rMin, rMax, cMin, cMax },
        datos: datosValidos, // 👈 Ahora esto ya no estará vacío
        sheet: currentSheet,
        tipo: tipoDetectado,
        nombresColumnas: nombresColumnas,
      });

      setSelection({ start: null, end: null, isDragging: false });
    },
    manualRange: (id, texto) => {
      const nuevoTexto = texto.toUpperCase();
      const partes = nuevoTexto.split(":");
      const inicio = excelToCoords(partes[0]);
      const fin = partes[1] ? excelToCoords(partes[1]) : inicio;

      if (inicio && fin) {
        const coords = {
          rMin: Math.min(inicio.r, fin.r),
          rMax: Math.max(inicio.r, fin.r),
          cMin: Math.min(inicio.c, fin.c),
          cMax: Math.max(inicio.c, fin.c),
        };

        // 🌟 LA MISMA RED DE CAPTURA QUE USAMOS EN EL BOTÓN 🌟
        const datosValidos = [];
        let contadorNumeros = 0;
        let contadorTextos = 0;

        for (let r = coords.rMin; r <= coords.rMax; r++) {
          const filaValores = [];
          let tieneDatos = false;

          for (let c = coords.cMin; c <= coords.cMax; c++) {
            const rawVal = rowData[r]?.[getExcelChar(c)];
            if (rawVal !== undefined && rawVal !== null && rawVal !== "") {
              filaValores.push(rawVal);
              tieneDatos = true;
              if (isNaN(Number(rawVal))) {
                contadorTextos++;
              } else {
                contadorNumeros++;
              }
            } else {
              filaValores.push("");
            }
          }

          if (tieneDatos) {
            if (coords.cMax > coords.cMin) {
              datosValidos.push(filaValores.join(" | "));
            } else {
              datosValidos.push(filaValores[0]);
            }
          }
        }

        // Decisión de tipo
        let tipoDetectado = "Sin datos";

        if (datosValidos.length > 0) {
          // Si hay por lo menos 1 número Y por lo menos 1 texto en la misma selección:
          if (contadorNumeros > 0 && contadorTextos > 0) {
            tipoDetectado = "Mixta (Error)";
          }
          // Si SOLO hay números:
          else if (contadorNumeros > 0 && contadorTextos === 0) {
            tipoDetectado = "Cuantitativa (Número)";
          }
          // Si SOLO hay textos:
          else {
            tipoDetectado = "Cualitativa (Texto)";
          }
        }

        // NOMBRES DE COLUMNAS
        let nombresColumnas = [];
        if (coords.cMax > coords.cMin) {
          const headerRow = coords.rMin > 0 ? coords.rMin - 1 : coords.rMin;
          for (let c = coords.cMin; c <= coords.cMax; c++) {
            const headerVal = rowData[headerRow]?.[getExcelChar(c)];
            nombresColumnas.push(
              headerVal !== undefined && headerVal !== ""
                ? String(headerVal)
                : `Col ${getExcelChar(c)}`,
            );
          }
        }

        actualizarVariable(id, {
          rangoLabel: nuevoTexto,
          coords,
          datos: datosValidos,
          sheet: currentSheet,
          tipo: tipoDetectado, // Inyectamos el tipo también aquí
          nombresColumnas: nombresColumnas,
        });
      } else {
        actualizarVariable(id, { rangoLabel: nuevoTexto });
      }
    },
  };

  const columnDefs = useMemo(() => {
    if (rowData.length === 0) return [];
    const keys = Object.keys(rowData[0]);
    const rowNumberCol = {
      headerName: "",
      valueGetter: "node.rowIndex + 1",
      width: 45,
      pinned: "left",
      cellStyle: {
        backgroundColor: "var(--bg-input, #f8fafc)",
        fontWeight: "bold",
        textAlign: "center",
        color: "var(--text-muted, #64748b)",
        fontSize: "11px",
      },
    };

    const dataCols = keys.map((key) => ({
      headerName: key,
      field: key,
      width: 120,
      resizable: true,
      cellClassRules: {
        "celda-azul-seleccion": (params) => {
          const sel = selectionRef.current;
          if (!sel || !sel.start || !sel.end) return false;
          const r = params.node.rowIndex,
            c = keyToNum(params.column.colId);
          const rMin = Math.min(sel.start.row, sel.end.row),
            rMax = Math.max(sel.start.row, sel.end.row);
          const cMin = Math.min(sel.start.col, sel.end.col),
            cMax = Math.max(sel.start.col, sel.end.col);
          return r >= rMin && r <= rMax && c >= cMin && c <= cMax;
        },
      },
      cellStyle: (params) => {
        const vars = variablesRef.current || [];
        const r = params.node.rowIndex,
          c = keyToNum(params.column.colId);
        const v = vars.find(
          (vItem) =>
            vItem.sheet === currentSheet &&
            vItem.coords &&
            r >= vItem.coords.rMin &&
            r <= vItem.coords.rMax &&
            c >= vItem.coords.cMin &&
            c <= vItem.coords.cMax,
        );
        return v
          ? { backgroundColor: v.color, fontWeight: "bold", fontSize: "10px" }
          : { fontSize: "11px" };
      },
    }));
    return [rowNumberCol, ...dataCols];
  }, [rowData, currentSheet]);

  return (
    <AgGridProvider modules={[AllCommunityModule]}>
      <div
        style={{
          backgroundColor: "var(--bg-body)",
          color: "var(--text-main)",
          minHeight: "100vh",
          fontFamily: "sans-serif",
          marginTop: "5px",
          padding: "10px",
        }}
      >
        <div
          className="header-datos-upload"
          style={{
            backgroundColor: "var(--bg-body)",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div className="upload-container">
            <div className="upload-column">
              <p className="upload-title">Archivos disponibles</p>

              {/* 🆕 SELECTOR ACTUALIZADO PARA MOSTRAR GRUPOS */}
              <select
                className="select-hoja"
                style={{ width: "60%", cursor: "pointer" }}
                disabled={cargandoApi || gruposArchivos.length === 0}
                onChange={(e) => cargarDesdeAPI(e.target.value)}
              >
                <option value="">
                  {gruposArchivos.length === 0
                    ? "Buscando archivos..."
                    : "Seleccionar Archivo"}
                </option>

                {gruposArchivos.map((grupo, idx) => (
                  <optgroup key={idx} label={grupo.label}>
                    {grupo.files.map((file, fIdx) => (
                      <option
                        key={fIdx}
                        value={`${file.filename}|${grupo.cursoId}`}
                      >
                        {file.filename}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              <p
                style={{
                  fontSize: "11px",
                  marginTop: "5px",
                  color: "var(--text-muted)",
                }}
              >
                {cargandoApi
                  ? "⏳ Buscando en el servidor..."
                  : "Elige un archivo para analizar"}
              </p>
            </div>
            <div className="column-divider"></div>
            <div
              className={`upload-box ${isDraggingFile ? "drag-over" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <p className="upload-title">Sube tu tabla de datos</p>
              <p className="upload-subtitle">
                Formatos soportados: .xlsx, .xls
              </p>

              <div className="upload-controls">
                <label className="btn-upload">
                  Explorar archivos
                  <input
                    type="file"
                    onChange={manejarSubidaLocal}
                    accept=".xlsx, .xls"
                    style={{ display: "none" }}
                  />
                </label>
                <span className="file-status">
                  {workbook
                    ? "Archivo cargado con éxito"
                    : "o arrastra el archivo aquí"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 🆕 ACTUALIZACIÓN VISUAL DEL INDICADOR DE ARCHIVO ACTIVO */}
        {sheetNames.length > 0 && (
          <div
            style={{
              margin: "10px 10px 5px 10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              padding: "10px 20px",
              backgroundColor: "var(--bg-card)",
              borderRadius: "5px",
              border: "1px solid var(--border-color)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
              <strong>Archivo en uso: </strong>
              <span style={{ color: "#3b82f6", marginRight: "8px" }}>
                {archivoActivo
                  ? archivoActivo.nombre
                  : workbook
                    ? "Documento cargado"
                    : "Sin archivo"}
              </span>
              {archivoActivo && (
                <span style={{ color: "var(--text-muted)" }}>
                  {archivoActivo.origen === "API"
                    ? archivoActivo.curso
                      ? `(Curso: ${archivoActivo.curso})`
                      : "(Mi Espacio)"
                    : "(Local)"}
                </span>
              )}
            </div>

            <div>
              <span
                style={{
                  marginRight: "10px",
                  fontWeight: "bold",
                  color: "var(--text-main)",
                  fontSize: "0.8rem",
                }}
              >
                Hoja activa del Excel:
              </span>
              <select
                value={currentSheet}
                onChange={(e) => {
                  cargarHoja(workbook, e.target.value);
                  if (setSelectedSheet) {
                    const index = sheetNames.indexOf(e.target.value);
                    setSelectedSheet(index > -1 ? index : 0);
                  }
                }}
                className="select-hoja"
              >
                {sheetNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ... (El resto del renderizado desde <div className='main-layout-flex'> sigue igual) ... */}
        <div className="main-layout-flex">
          <aside className="bloque-variables">
            <div className="header-variables">
              <h3 style={{ fontSize: "0.8rem", margin: 0 }}>Variables:</h3>
              <button onClick={agregarVariable} className="btn-nueva-var">
                Nueva variable
              </button>
            </div>
            <div className="seccion-scroll-variables">
              {variables.map((v) => (
                <VariableCard
                  key={v.id}
                  v={v}
                  currentSheet={currentSheet}
                  actions={actions}
                />
              ))}
            </div>
          </aside>

          <section className="contenedor-excel">
            <div className="ag-theme-alpine grid-wrapper">
              <AgGridReact
                ref={gridRef}
                rowData={rowData}
                columnDefs={columnDefs}
                onCellMouseDown={(p) =>
                  setSelection({
                    start: {
                      row: p.node.rowIndex,
                      col: keyToNum(p.column.colId),
                    },
                    end: {
                      row: p.node.rowIndex,
                      col: keyToNum(p.column.colId),
                    },
                    isDragging: true,
                  })
                }
                onCellMouseOver={(p) =>
                  selection.isDragging &&
                  setSelection((prev) => ({
                    ...prev,
                    end: {
                      row: p.node.rowIndex,
                      col: keyToNum(p.column.colId),
                    },
                  }))
                }
                suppressCellFocus={true}
                headerHeight={30}
                rowHeight={25}
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
                  marginTop: "10px",
                  backgroundColor: "var(--header-bg)",
                  color: "var(--text-main)",
                  border: "1px dashed var(--border-color)",
                  borderRadius: "5px",
                  padding: "8px",
                  cursor: "pointer",
                }}
              >
                Cargar 50 filas más... (Mostrando {rowData.length} de{" "}
                {totalFilasEnHoja})
              </button>
            )}
          </section>
        </div>

        {/* MODAL MATRIZ DETALLES */}
        {modalMatrizInfo && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 9999,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            onClick={() => setModalMatrizInfo(null)}
          >
            <div
              style={{
                backgroundColor: "var(--bg-card)",
                padding: "20px",
                borderRadius: "10px",
                maxWidth: "400px",
                width: "90%",
                border: "1px solid var(--border-color)",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                style={{
                  margin: "0 0 15px",
                  color: "var(--primary-color)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="3" y1="15" x2="21" y2="15"></line>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                  <line x1="15" y1="3" x2="15" y2="21"></line>
                </svg>
                Detalles de la Matriz
              </h3>
              <p
                style={{
                  margin: "0 0 10px",
                  fontSize: "0.9rem",
                  color: "var(--text-main)",
                }}
              >
                <strong>Variable:</strong> {modalMatrizInfo.nombre}
              </p>
              <p
                style={{
                  margin: "0 0 10px",
                  fontSize: "0.9rem",
                  color: "var(--text-main)",
                }}
              >
                <strong>Dimensiones:</strong>{" "}
                {modalMatrizInfo.coords.rMax - modalMatrizInfo.coords.rMin + 1}{" "}
                filas ×{" "}
                {modalMatrizInfo.coords.cMax - modalMatrizInfo.coords.cMin + 1}{" "}
                columnas
              </p>
              <div style={{ marginTop: "15px" }}>
                <strong
                  style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}
                >
                  Columnas detectadas:
                </strong>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "5px",
                    marginTop: "5px",
                  }}
                >
                  {modalMatrizInfo.nombresColumnas &&
                  modalMatrizInfo.nombresColumnas.length > 0 ? (
                    modalMatrizInfo.nombresColumnas.map((col, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: "rgba(192, 132, 252, 0.1)",
                          border: "1px solid #c084fc",
                          color: "#9333ea",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                        }}
                      >
                        [{col}]
                      </span>
                    ))
                  ) : (
                    <span
                      style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                    >
                      [Columna 1] [Columna 2]
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setModalMatrizInfo(null)}
                style={{
                  marginTop: "20px",
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </AgGridProvider>
  );
};

export default SimuladorMAT251;
