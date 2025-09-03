import { useState } from "react";

export default function Calculator() {
  // Estados
  const [curso, setCurso] = useState("MAT151"); // Curso seleccionado
  const [tema, setTema] = useState("Tema2");   // Tema seleccionado
  const [tipo, setTipo] = useState("media");   // Tipo de cálculo seleccionado
  const [input, setInput] = useState("");      // Datos ingresados por el usuario
  const [resultado, setResultado] = useState(null); // Resultado recibido de la API

  // Función principal para enviar datos a la API y calcular
  /* const handleCalculate = async () => {
    setResultado(null); // limpiar antes de pedir nuevo cálculo
    // Convierte el input "10,20,30" en [10, 20, 30]
    const datos = input.split(",").map(Number).filter((x) => !isNaN(x));
 */
const handleCalculate = async () => {
  setResultado(null); // 👈 limpia el resultado viejo antes de pedir el nuevo
  const datos = input.split(",").map(Number).filter((x) => !isNaN(x));
    
    try {
      // Petición a la API
      const res = await fetch("http://127.0.0.1:8000/calcular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datos, tipo, curso, tema }), // Enviamos datos y selección
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
        {/* Aquí podrás agregar más temas si los necesitas */}
      </select>
      <br />

      {/* Selección del cálculo (depende del tema elegido) */}
      <label>Cálculo: </label>
      <select
        value={tipo}
        onChange={(e) => {
            setTipo(e.target.value);
            setResultado(null); // 👈 agregado
      }}
       >
        {tema === "Tema2" && (
          <>
            <option value="frecuencia_absoluta">Frecuencia absoluta</option>
            <option value="frecuencia_relativa">Frecuencia relativa</option>
            <option value="frecuencia_acumulada">Frecuencia acumulada</option>
            <option value="frecuencia_acumulada_relativa">Frecuencia acumulada relativa</option>
        </>
        )}

        {tema === "Tema3" && (
          <>
            <option value="media">Media</option>
            <option value="mediana">Mediana</option>
            <option value="moda">Moda</option>
          </>
        )}
        {tema === "Tema4" && (
          <>
            <option value="varianza">Varianza</option>
            <option value="desviacion">Desviación estándar</option>
          </>
        )}
      </select>
      <br />

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
