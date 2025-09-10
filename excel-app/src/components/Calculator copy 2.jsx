import { useState } from "react";

export default function Calculator() {
  // Estados
  const [curso, setCurso] = useState("MAT151"); // Curso seleccionado
  const [tema, setTema] = useState("Tema2");   // Tema seleccionado
  const [tipo, setTipo] = useState("media");   // Tipo de cálculo seleccionado
  const [input, setInput] = useState("");      // Datos ingresados por el usuario
  const [resultado, setResultado] = useState(null); // Resultado recibido de la API
  const [pesos, setPesos] = useState(""); // Input adicional de pesos

  const handleCalculate = async () => {
    setResultado(null); // limpia el resultado viejo

    // Convertir input en números
    const datos = input.split(",").map(Number).filter((x) => !isNaN(x));
    const pesosList = pesos.split(",").map(Number).filter((x) => !isNaN(x));

    const [inputX, setInputX] = useState("");
    const [inputY, setInputY] = useState("");



    // Preparamos body para enviar a la API
    let bodyData = { datos, tipo, tema };

    // Si es media ponderada, agregamos pesos
    if (tipo === "media_ponderada") {
      bodyData.pesos = pesosList;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/calcular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      setResultado(data); // Guardamos el resultado
    } catch (err) {
      console.error("Error:", err);
      setResultado({ error: "No se pudo conectar con la API" });
    }
  };

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
        <option value="Tema5">Tema 5 - Distribuciones Bivariantes</option>
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
        {tema === "Tema2" && (
          <>
            <option value="frecuencia_absoluta">Frecuencia absoluta</option>
            <option value="frecuencia_relativa">Frecuencia relativa</option>
            <option value="frecuencia_acumulada">Frecuencia acumulada</option>
            <option value="frecuencia_acumulada_relativa">Frecuencia acumulada relativa</option>
            <option value="tabla_clases">Tabla por intervalos (con marcas de clase)</option>
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
            <option value="rango">Rango</option>
            <option value="coef_variacion">Coeficiente de variación</option>
          </>
        )}

        {tema === "Tema5" && (
          <>
            <option value="covarianza">Covarianza</option>
            <option value="correlacion">Correlación</option>
            <option value="regresion">Regresión lineal</option>
          </>
        )}
      </select>
      <br />

      {/* Input adicional de pesos solo para media ponderada */}
      {tipo === "media_ponderada" && (
        <>
          <label>Pesos:</label>
          <textarea
            rows="2"
            cols="40"
            placeholder="Escribe los pesos separados por coma, ej: 1,2,1,3"
            value={pesos}
            onChange={(e) => setPesos(e.target.value)}
          />
          <br />
        </>
      )}

// Entrada de datos para variables x e y
{tema === "Tema5" && (
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

      {/* Entrada de datos */}
      <textarea
        rows="4"
        cols="40"
        placeholder="Escribe los datos separados por coma, ej: 10,20,15,18"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <br />

      {/* Botón para calcular */}
      <button onClick={handleCalculate}>Calcular</button>

      {/* Mostrar resultado */}
      {resultado && (
        <div>
          <h3>Resultado:</h3>
          <pre>{JSON.stringify(resultado, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
