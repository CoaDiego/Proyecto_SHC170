import { useState } from "react";

export default function Calculator() {
  // ==========================
  // ESTADOS
  // ==========================
  const [curso, setCurso] = useState("MAT151"); 
  const [tema, setTema] = useState("Tema2");   
  const [tipo, setTipo] = useState("media");   
  const [input, setInput] = useState("");      
  const [resultado, setResultado] = useState(null); 
  const [pesos, setPesos] = useState("");   
  const [alpha, setAlpha] = useState(0.5);
   

  // ✅ Para Tema5 (bivariado)
  const [inputX, setInputX] = useState(""); 
  const [inputY, setInputY] = useState(""); 


  // ✅ Para Tema6 - Regresión Multivariante
  const [inputsX, setInputsX] = useState([[""]]); // lista de variables X
  const [inputYMulti, setInputYMulti] = useState([]); // variable dependiente

  const agregarVariableX = () => {
    setInputsX([...inputsX, [""]]);
  };

  // ==========================
  // FUNCIÓN PRINCIPAL
  // ==========================
  const handleCalculate = async () => {
    setResultado(null);

    let bodyData = { tipo, tema };
    let url = "http://127.0.0.1:8000/calcular"; // por defecto

   if (tema === "Tema5" || tema === "Tema6") {
   if (tema === "Tema6" && tipo === "regresion_multivariante") {
    // ✅ Multivariante → endpoint especial
    bodyData = { X: inputsX, y: inputYMulti, tipo };
    url = "http://127.0.0.1:8000/calcular_multivariante";
  } else {
    // ✅ Tema5 y regresiones simples de Tema6 → endpoint bivariado
    const datosX = inputX.split(",").map(Number).filter((x) => !isNaN(x));
    const datosY = inputY.split(",").map(Number).filter((x) => !isNaN(x));
    bodyData = { x: datosX, y: datosY, tipo };
    url = "http://127.0.0.1:8000/calcular_bivariada";
  }

/* if (tema === "Tema7") {
  url = "http://127.0.0.1:8000/calcular_tema7";
  const datos = input.split(",").map(Number).filter((x) => !isNaN(x));
  bodyData = { tipo, datos };

  if (tipo === "promedio_movil_simple") {
    bodyData.ventana = parseInt(ventana);
  }
  if (tipo === "promedio_movil_ponderado") {
    const pesosList = pesos.split(",").map(Number).filter((x) => !isNaN(x));
    bodyData.pesos = pesosList;
  }
  if (tipo === "suavizamiento_exponencial") {
    bodyData.alpha = parseFloat(alpha);
  }
  if (tipo === "autocorrelacion") {
    bodyData.lag = parseInt(lag);
  }
} */
if (tema === "Tema7") {
  url = "http://127.0.0.1:8000/calcular_tema7";

  const datosArray = input.split(",").map(Number).filter(x => !isNaN(x));

  bodyData = {
    tipo: tipo.toLowerCase(), // 🔹 importante
    datos: datosArray,
    ventana: ventana,         // para promedio móvil
    alpha: alpha,             // para suavizamiento exponencial
    lag: lag,                 // para autocorrelación
    pesos: pesos
      ? pesos.split(",").map(Number).filter(x => !isNaN(x))
      : undefined
  };
}


}

    else {
      // Para los demás temas solo una lista de datos
      const datos = input.split(",").map(Number).filter((x) => !isNaN(x));
      bodyData.datos = datos;

      // Para media ponderada enviamos pesos
      if (tipo === "media_ponderada") {
        const pesosList = pesos.split(",").map(Number).filter((x) => !isNaN(x));
        bodyData.pesos = pesosList;
      }
    }




    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      setResultado(data);
    } catch (err) {
      console.error("Error:", err);
      setResultado({ error: "No se pudo conectar con la API" });
    }
  };

  // ==========================
  // RENDER DEL COMPONENTE
  // ==========================
  return (
    <div>
      <h2>Calculadora Estadística</h2>

      {/* Selección del curso */}
      <label>Curso: </label>
      <select value={curso} onChange={(e) => setCurso(e.target.value)}>
        <option value="MAT151">MAT151 - Estadística General</option>
        <option value="MAT251">MAT251 - Estadística Matemática</option>
      </select>
      <br />

      {/* Selección del tema */}
      <label>Tema: </label>
      <select value={tema} onChange={(e) => setTema(e.target.value)}>
        <option value="Tema2">Tema 2 - Distribución de frecuencias</option>
        <option value="Tema3">Tema 3 - Tendencia central</option>
        <option value="Tema4">Tema 4 - Dispersión y forma</option>
        <option value="Tema5">Tema 5 - Distribuciones bivariantes</option>
        <option value="Tema6">Tema 6 - Análisis de Regresión</option>  {/* <-- Nuevo */}
        <option value="Tema7">Tema 7 - Series de Tiempo</option>

      </select>
      <br />

      {/* Selección del cálculo */}
      <label>Cálculo: </label>
      <select
        value={tipo}
        onChange={(e) => {
          setTipo(e.target.value);
          setResultado(null);
        }}
      >
        {/* Opciones según tema */}
        {tema === "Tema2" && (
          <>
            <option value="frecuencia_absoluta">Frecuencia absoluta</option>
            <option value="frecuencia_relativa">Frecuencia relativa</option>
            <option value="frecuencia_acumulada">Frecuencia acumulada</option>
            <option value="frecuencia_acumulada_relativa">Frecuencia acumulada relativa</option>
            <option value="tabla_clases">Tabla por intervalos</option>
          </>
        )}

        {tema === "Tema3" && (
          <>
            <option value="media">Media</option>
            <option value="media_geometrica">Media Geométrica</option>
            <option value="media_ponderada">Media Ponderada</option>
            <option value="mediana">Mediana</option>
            <option value="moda">Moda</option>
          </>
        )}

        {tema === "Tema4" && (
          <>
            <option value="varianza">Varianza</option>
            <option value="desviacion">Desviación estándar</option>
            <option value="coef_variacion">Coeficiente de variación</option>
          </>
        )}

        {tema === "Tema5" && (
          <>
            <option value="covarianza">Covarianza</option>
            <option value="correlacion">Coeficiente de correlación</option>
            <option value="regresion">Regresión lineal (Y sobre X)</option>
          </>
        )}

        {tema === "Tema6" && (
          <>
            <option value="regresion_lineal">Regresión Lineal</option>
            <option value="regresion_no_lineal">Regresión No Lineal</option>
            <option value="regresion_multivariante">Regresión Multivariante</option>
          </>
         )}

         {tema === "Tema7" && (
          <>
            <option value="promedio_movil_simple">Promedio Móvil Simple</option>
            <option value="promedio_movil_ponderado">Promedio Móvil Ponderado</option>
            <option value="suavizamiento_exponencial">Suavizamiento Exponencial</option>
            <option value="indice_estacional">Índice Estacional</option>
            <option value="autocorrelacion">Autocorrelación</option>
            <option value="pronostico_basico">Pronóstico Básico</option>
          </>
        )}


      </select>
      <br />

      {/* ========================== */}
      {/* Inputs de datos según tema */}
      {/* ========================== */}

      {/* Tema2, Tema3 y Tema4 usan un solo input */}
      {(tema === "Tema2" || tema === "Tema3" || tema === "Tema4") && (
        <>
          <textarea
            rows="4"
            cols="40"
            placeholder="Escribe los datos separados por coma, ej: 10,20,15,18"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <br />
        </>
      )}

      {/* Input adicional de pesos solo para media ponderada */}
      {tipo === "media_ponderada" && (
        <>
          <label>Pesos:</label>
          <textarea
            rows="2"
            cols="40"
            placeholder="Ej: 1,2,1,3"
            value={pesos}
            onChange={(e) => setPesos(e.target.value)}
          />
          <br />
        </>
      )}

     {/* Tema5 o Tema6 (excepto multivariante) */}
{(tema === "Tema5" || (tema === "Tema6" && tipo !== "regresion_multivariante")) && (
  <>
    <label>Variable X:</label>
    <textarea
      rows="2"
      cols="40"
      placeholder="Ej: 2,4,6,8"
      value={inputX}
      onChange={(e) => setInputX(e.target.value)}
    />
    <br />
    <label>Variable Y:</label>
    <textarea
      rows="2"
      cols="40"
      placeholder="Ej: 3,5,7,9"
      value={inputY}
      onChange={(e) => setInputY(e.target.value)}
    />
    <br />
  </>
)}

{/* Tema6 - Regresión Multivariante */}
{tema === "Tema6" && tipo === "regresion_multivariante" && (
  <>
    {inputsX.map((xArray, idx) => (
      <div key={idx}>
        <label>Variable X{idx + 1}:</label>
        <textarea
          rows="2"
          cols="40"
          placeholder="Ej: 2,4,6,8"
          value={xArray}
          onChange={(e) => {
            const newInputs = [...inputsX];
            newInputs[idx] = e.target.value.split(",").map(Number).filter(n => !isNaN(n));
            setInputsX(newInputs);
          }}
        />
        <br />
      </div>
    ))}
    <button type="button" onClick={agregarVariableX}>Agregar otra variable X</button>
    <br />
    <label>Variable Y:</label>
    <textarea
      rows="2"
      cols="40"
      placeholder="Ej: 3,5,7,9"
      value={inputYMulti}
      onChange={(e) => setInputYMulti(e.target.value.split(",").map(Number).filter(n => !isNaN(n)))}
    />
    <br />
  </>
)}

{/* Inputs para Tema7 */}
{tema === "Tema7" && (
  <>
    <label>Datos:</label>
    <textarea
      rows="4"
      cols="40"
      placeholder="Ej: 10,20,30,40"
      value={input}
      onChange={(e) => setInput(e.target.value)}
    />
    <br />
    
    {/* Pesos solo para promedio móvil ponderado */}
    {tipo === "promedio_movil_ponderado" && (
      <>
        <label>Pesos:</label>
        <textarea
          rows="2"
          cols="40"
          placeholder="Ej: 1,2,3,4"
          value={pesos}
          onChange={(e) => setPesos(e.target.value)}
        />
        <br />
      </>
    )}

    {/* Alpha solo para suavizamiento exponencial */}
    {tipo === "suavizamiento_exponencial" && (
      <>
        <label>Alpha (0 a 1):</label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={alpha}
          onChange={(e) => setAlpha(parseFloat(e.target.value))}
        />
        <br />
      </>
    )}
  </>
)}



      {/* Botón */}
      <button onClick={handleCalculate}>Calcular</button>
{/* Mostrar resultado */}
{resultado && (
  <div>
    <h3>Resultado:</h3>

    {/* Caso 1: array de objetos → tabla */}
    {Array.isArray(resultado.resultado) ? (
      <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", marginTop: "10px" }}>
        <thead>
          <tr>
            {Object.keys(resultado.resultado[0]).map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resultado.resultado.map((row, idx) => (
            <tr key={idx}>
              {Object.values(row).map((val, i) => (
                <td key={i}>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    ) : resultado.resultado !== undefined ? (
      // Caso 2: valor simple
      <p>{resultado.resultado}</p>
    ) : (
      // Caso 3: varios campos (ej. regresión lineal)
      <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", marginTop: "10px" }}>
        <tbody>
          {Object.entries(resultado).map(([key, value]) => (
            <tr key={key}>
              <td><b>{key}</b></td>
              <td>
  {typeof value === "number"
    ? value.toFixed(5)
    : Array.isArray(value)
      ? value.map(v => v.toFixed(5)).join(", ")
      : value}
</td>

            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
)}


    </div>
  );
}
