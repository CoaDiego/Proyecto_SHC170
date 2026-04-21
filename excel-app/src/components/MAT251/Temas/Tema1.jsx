import React, { useState, useEffect, useRef } from 'react';

import { DataGrid } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import { useData } from '../../../components/excel/DataContext';
import { calcularTecnicasConteo, calcularProbabilidadClasica } from '../Matematicas/logica_Tema1';
import katex from "katex";
import "katex/dist/katex.min.css";
import "../../../styles/components/MAT251/Tema1.css";

import GraficosProbabilidad from '../Graficas/GraficosEstadisticos';




export default function Tema1() {
  const { variables } = useData();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [herramientaActiva, setHerramientaActiva] = useState(null);

  const [n, setN] = useState('0');
  const [r, setR] = useState('0');
  const [dataResultado, setDataResultado] = useState(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);

  //modal
  const [modalVariablesAbierto, setModalVariablesAbierto] = useState(false);
  const [varSeleccionadaDetalle, setVarSeleccionadaDetalle] = useState(null);


  //excel
  const [modalEditorAbierto, setModalEditorAbierto] = useState(false);
  const [filasExcel, setFilasExcel] = useState([{ id: 1, valor: '' }]);
  const columnasExcel = [
    { key: 'id', name: 'Nº', width: 60, frozen: true },
    { key: 'valor', name: 'Dato (Valor)', editable: true }
  ];


  // Función para pasar datos de la variable seleccionada al Excel
  const cargarDatosAlExcel = (datos) => {
    if (!datos) return;
    const nuevasFilas = datos.map((dato, index) => ({
      id: index + 1,
      valor: dato.toString()
    }));
    // Añadimos una fila vacía al final para facilitar la escritura
    nuevasFilas.push({ id: nuevasFilas.length + 1, valor: '' });
    setFilasExcel(nuevasFilas);
  };

  // Modifica tu función seleccionarVariableDesdeModal para que llame a la nueva
  const seleccionarVariableDesdeModal = (variable) => {
    if (!variable) return;
    setVarSeleccionadaDetalle(variable);

    if (variable.datos) {
      setInputDatos(variable.datos.join(', '));
      cargarDatosAlExcel(variable.datos); // <-- NUEVO
      setEventoFavorable('');
      setResProbabilidad(null);
    }
    setModalVariablesAbierto(false);
  };

  // Función para guardar lo del Excel al input principal
  const guardarExcel = () => {
    // Filtramos las celdas vacías y extraemos solo los valores
    const datosLimpios = filasExcel
      .map(fila => fila.valor)
      .filter(valor => valor && valor.trim() !== "");

    setInputDatos(datosLimpios.join(', '));
    setModalEditorAbierto(false);
  };

  // Función para añadir una fila nueva en blanco
  const agregarFilaVacia = () => {
    setFilasExcel([...filasExcel, { id: filasExcel.length + 1, valor: '' }]);
  };


  //Estado de Probabilidad
  const [inputDatos, setInputDatos] = useState('');
  const [eventoFavorable, setEventoFavorable] = useState('');
  const [resProbabilidad, setResProbabilidad] = useState(null);

  const formulaRef = useRef(null);
  const formulaProbRef = useRef(null);

  const cargarVariable = (nombreVar) => {
    if (!variables) return;
    const variableSeleccionada = variables.find(v => v.nombre === nombreVar);

    if (variableSeleccionada && variableSeleccionada.datos) {
      // Une los datos con comas y los pone en el textarea (sirve para enteros y strings)
      setInputDatos(variableSeleccionada.datos.join(', '));
      // Limpia el evento favorable anterior para evitar confusiones
      setEventoFavorable('');
      setResProbabilidad(null);
    }
  };
  const manejarProbabilidad = () => {
    if (!inputDatos) return alert("Ingresa o selecciona datos para el espacio muestral");
    if (!eventoFavorable) return alert("Ingresa el evento favorable que buscas");

    // Limpiamos los datos: quitamos espacios vacíos y aseguramos que sean strings
    const datosArray = inputDatos
      .split(',')
      .map(d => d.trim())
      .filter(d => d !== "");

    // Llamamos a la lógica pasándole el evento favorable limpio
    const res = calcularProbabilidadClasica(datosArray, eventoFavorable.trim());

    if (res) {
      setResProbabilidad(res);
    } else {
      alert("Hubo un error al calcular. Revisa los datos.");
    }
  };


  // 🌟 EFECTO DE CÁLCULO AUTOMÁTICO
  useEffect(() => {
    if (tipoSeleccionado !== null) {
      const res = calcularTecnicasConteo(n, r, tipoSeleccionado);
      if (res && !res.error) {
        setDataResultado(res);
      } else {
        setDataResultado(null);
      }
    }
  }, [n, r, tipoSeleccionado]);

  const manejarCalculo = (importaOrden) => {
    const res = calcularTecnicasConteo(n, r, importaOrden);
    if (res?.error) {
      alert(res.error);
      return;
    }
    setDataResultado(res);
  };

  const ajustarValor = (setFun, actual, operacion) => {
    const valor = parseInt(actual) || 0;
    const nuevo = operacion === '+' ? valor + 1 : Math.max(0, valor - 1);
    setFun(nuevo.toString());
  };

  useEffect(() => {
    if (formulaRef.current && dataResultado) {
      const esP = dataResultado.simbolo === "nPr";
      const formulaLatex = esP
        ? `P(${n}, ${r}) = \\frac{${n}!}{(${n}-${r})!} = ${dataResultado.resultado.toLocaleString()}`
        : `C(${n}, ${r}) = \\frac{${n}!}{${r}!(${n}-${r})!} = ${dataResultado.resultado.toLocaleString()}`;

      katex.render(formulaLatex, formulaRef.current, {
        throwOnError: false,
        displayMode: true
      });
    }
  }, [dataResultado, n, r]);


  //KATEX para la Probabilidad
  useEffect(() => {
    if (formulaProbRef.current && resProbabilidad) {
      const latex = `P(A) = \\frac{n(A)}{N} = \\frac{${resProbabilidad.casosFavorables}}{${resProbabilidad.casosTotales}} = ${resProbabilidad.probabilidadDecimal}`;
      katex.render(latex, formulaProbRef.current, { throwOnError: false, displayMode: true });
    }
  }, [resProbabilidad]);



  return (
    <div className="tema1-container">
      <main className="area-trabajo-cuadriculada">
        <div className="contenedor-flotante-menu">
          <button
            className={`btn-hamburguesa-simple ${menuAbierto ? 'abierto' : ''}`}
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            <span></span><span></span><span></span><span></span>
          </button>

          {menuAbierto && (
            <div className="menu-desplegable-pro">
              <button onClick={() => { setHerramientaActiva('conteo'); setMenuAbierto(false); }}>
                Técnicas de Conteo
              </button>
              <button onClick={() => { setHerramientaActiva('probabilidad'); setMenuAbierto(false); }}>
                Probabilidad Clásica
              </button>
              <button disabled className="btn-off">Muestreo</button>
            </div>
          )}
        </div>

        <div className="contenido-real">
          {herramientaActiva === 'conteo' && (
            <div className="modulo-render">
              <h2
                style={{ marginBottom: '25px', color: 'var(--text-primary)', textAlign: 'center' }}
              >Técnicas de Conteo</h2>

              <div className="interfaz-conteo">
                {/* 🌟 CONTROLES CON BOTONES + Y - */}
                <div className="fila-controles">
                  <div className="control-numero">
                    <label>Total (n)</label>
                    <div className="selector-numerico">
                      <button onClick={() => ajustarValor(setN, n, '-')}>-</button>
                      <input type="number" value={n} onChange={e => setN(e.target.value)} />
                      <button onClick={() => ajustarValor(setN, n, '+')}>+</button>
                    </div>
                  </div>

                  <div className="control-numero">
                    <label>Muestra (r)</label>
                    <div className="selector-numerico">
                      <button onClick={() => ajustarValor(setR, r, '-')}>-</button>
                      <input type="number" value={r} onChange={e => setR(e.target.value)} />
                      <button onClick={() => ajustarValor(setR, r, '+')}>+</button>
                    </div>
                  </div>
                </div>

                {/* 🌟 BOTONES DE CÁLCULO ABAJO Y AL CENTRO */}
                <div className="acciones-principales">
                  <button onClick={() => manejarCalculo(true)}>Permutación</button>
                  <button onClick={() => manejarCalculo(false)}>Combinación</button>
                </div>
              </div>

              {dataResultado && (
                <div className="pizarra-resultado">
                  <div ref={formulaRef}></div>
                  <p className="explicacion-texto">{dataResultado.explicacion}</p>
                </div>
              )}
            </div>
          )}

          {herramientaActiva === 'probabilidad' && (
            <div className="modulo-render">
              <h2 style={{ marginBottom: '25px', color: 'var(--text-primary)', textAlign: 'center' }}>Probabilidad Clásica</h2>

              <div className="interfaz-probabilidad">

                <div className="grupo-entrada">
                  {/* --- NUEVO BLOQUE DE ORIGEN DE DATOS (2 COLUMNAS) --- */}
                  <div className="contenedor-datos-doble">

                    {/* Columna Izquierda: Selección */}
                    <div className="columna-variable">
                      <label className="etiqueta-paso">1. Cargar Variable (Opcional):</label>
                      <div className="panel-seleccion-variable">
                        <button
                          className="btn-abrir-modal"
                          onClick={() => setModalVariablesAbierto(true)}
                        >
                          {varSeleccionadaDetalle ? "Cambiar Variable" : "Abrir Gestor"}
                        </button>

                        {varSeleccionadaDetalle && (
                          <div className="info-variable-seleccionada">
                            <span className="info-titulo"><strong>Nombre:</strong> {varSeleccionadaDetalle.nombre}</span>
                            <span className="info-detalle"><strong>Muestras:</strong> {varSeleccionadaDetalle.datos?.length || 0}</span>
                            <span className="info-detalle"><strong>Estado:</strong> Cargada</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Columna Derecha: Editor Manual */}
                    {/* Columna Derecha: Entrada de Datos */}
                    <div className="columna-editor">
                      <label className="etiqueta-paso">2. Espacio Muestral (Datos):</label>

                      <div className="panel-entrada-datos">
                        <input
                          type="text"
                          className="input-datos-principal"
                          placeholder="Ej: 20, 45, 60..."
                          value={inputDatos}
                          onChange={(e) => setInputDatos(e.target.value)}
                        />

                        <div className="acciones-editor">
                          <button
                            className="btn-abrir-excel"
                            onClick={() => {
                              // Si no hay filas, preparamos unas vacías
                              if (filasExcel.length <= 1 && inputDatos === "") {
                                setFilasExcel([{ id: 1, valor: '' }, { id: 2, valor: '' }, { id: 3, valor: '' }]);
                              }
                              setModalEditorAbierto(true);
                            }}
                          >
                            Abrir Editor Avanzado (Excel)
                          </button>

                          <button
                            className="btn-limpiar"
                            onClick={() => {
                              setInputDatos('');
                              setVarSeleccionadaDetalle(null);
                              setFilasExcel([{ id: 1, valor: '' }]);
                            }}
                          >
                            Limpiar
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                  {/* ---------------------------------------------------- */}
                </div>

                {modalVariablesAbierto && (
                  <div className="overlay-modal" onClick={() => setModalVariablesAbierto(false)}>
                    <div className="contenido-modal" onClick={(e) => e.stopPropagation()}>
                      <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Selecciona una Variable</h3>

                      <div className="lista-variables-modal">
                        {variables && variables.length > 0 ? (
                          variables.map((v, index) => (
                            <div
                              key={index}
                              className="tarjeta-variable-modal"
                              onClick={() => seleccionarVariableDesdeModal(v)}
                            >
                              <h4>{v.nombre}</h4>
                              <p>{v.datos?.length || 0} datos disponibles</p>
                            </div>
                          ))
                        ) : (
                          <p className="vacio-mensaje" style={{ marginTop: '20px' }}>No hay variables importadas.</p>
                        )}
                      </div>

                      <div style={{ textAlign: 'right', marginTop: '15px' }}>
                        <button className="btn-cerrar-modal" onClick={() => setModalVariablesAbierto(false)}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grupo-entrada">
                  <label>2. Espacio Muestral (Puedes editarlo manualmente):</label>
                  <textarea
                    placeholder="Ej: cara, cruz o 1, 2, 3, 4, 5, 6"
                    value={inputDatos}
                    onChange={(e) => setInputDatos(e.target.value)}
                  />
                </div>

                {/* --- 🌟 PASO 3: ESTO ES LO QUE TE FALTA --- */}
                <div className="grupo-entrada" style={{ marginTop: '20px' }}>
                  <label className="etiqueta-paso" style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    3. ¿Qué evento buscas? (Evento Favorable):
                  </label>
                  <input
                    type="text"
                    className="input-datos-principal"
                    placeholder="Ej: 20"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      marginTop: '8px'
                    }}
                    value={eventoFavorable}
                    onChange={(e) => setEventoFavorable(e.target.value)}
                  />
                  <small style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    Escribe el valor exacto que quieres contar del grupo de arriba.
                  </small>
                </div>

                <div className="acciones-principales" style={{ justifyContent: 'center', width: '100%', marginTop: '10px' }}>
                  <button onClick={manejarProbabilidad} style={{ padding: '12px 30px', fontSize: '1.1rem' }}>
                    Calcular Probabilidad
                  </button>
                </div>
              </div>

              {resProbabilidad && (
                <>
                  <div className="pizarra-resultado">
                    <div ref={formulaProbRef}></div>
                    <div className="detalles-probabilidad">
                      <p><strong>Evento buscado (A):</strong> {eventoFavorable}</p> {/* 👈 Añade esto */}
                      <p><strong>Total (N):</strong> {resProbabilidad.casosTotales}</p>
                      <p><strong>Casos n(A):</strong> {resProbabilidad.casosFavorables}</p>
                      <p><strong>Porcentaje:</strong> {resProbabilidad.probabilidadPorcentaje}%</p>
                    </div>
                  </div>
                  <GraficosProbabilidad
                    resProbabilidad={resProbabilidad}
                    datosArray={inputDatos.split(',').map(d => d.trim()).filter(d => d !== "")}
                  />
                </>
              )}

              {/* --- MODAL DEL EDITOR TIPO EXCEL --- */}
              {modalEditorAbierto && (
                <div className="overlay-modal" onClick={() => setModalEditorAbierto(false)}>
                  <div className="contenido-modal modal-ancho" onClick={(e) => e.stopPropagation()}>
                    <div className="cabecera-modal-excel">
                      <h3>Editor de Datos (Espacio Muestral)</h3>
                      <span className="contador-datos-excel">Total: {filasExcel.filter(f => f.valor.trim() !== "").length}</span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                      Haz doble clic en una celda para editarla. Los datos vacíos serán ignorados.
                    </p>

                    <div className="contenedor-grid">
                      <DataGrid
                        columns={columnasExcel}
                        rows={filasExcel}
                        onRowsChange={setFilasExcel}
                        className="rdg-light" /* Usa tema claro por defecto */
                      />
                    </div>

                    <div className="acciones-modal-excel">
                      <button className="btn-secundario" onClick={agregarFilaVacia}>
                        + Añadir Fila
                      </button>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-cerrar-modal" onClick={() => setModalEditorAbierto(false)}>
                          Cancelar
                        </button>
                        <button className="btn-guardar-excel" onClick={guardarExcel}>
                          Guardar Datos
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}