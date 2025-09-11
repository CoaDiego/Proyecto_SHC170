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

  // ✅ Para Tema5 (bivariado)
  const [inputX, setInputX] = useState(""); 
  const [inputY, setInputY] = useState(""); 

  // ==========================
  // FUNCIÓN PRINCIPAL
  // ==========================
  const handleCalculate = async () => {
    setResultado(null);

    let bodyData = { tipo, tema };
    let url = "http://127.0.0.1:8000/calcular"; // por defecto

    if (tema === "Tema5" || tema === "Tema6") {
      // Para Tema5 usamos el otro endpoint
      const datosX = inputX.split(",").map(Number).filter((x) => !isNaN(x));
      const datosY = inputY.split(",").map(Number).filter((x) => !isNaN(x));
      bodyData = { x: datosX, y: datosY, tipo };
      url = "http://127.0.0.1:8000/calcular_bivariada";
    } else {
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

      {/* Tema5 requiere dos listas de datos (X e Y) */}
     {tema === "Tema5" || tema === "Tema6" ? (
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
) : null}


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
              <td>{value}</td>
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
