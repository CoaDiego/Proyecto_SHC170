/* import { useState } from "react";

export default function Calculator() {
  const [input, setInput] = useState("");
  const [tipo, setTipo] = useState("media");
  const [resultado, setResultado] = useState(null);

  const handleCalculate = async () => {
    const datos = input.split(",").map(Number).filter((x) => !isNaN(x));

    try {
      const res = await fetch("http://127.0.0.1:8000/calcular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datos, tipo }),
      });
      const data = await res.json();
      setResultado(data);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div>
      <h2>Calculadora Estadística</h2>
      <textarea
        rows="4"
        cols="40"
        placeholder="Escribe los datos separados por coma, ej: 10,20,15,18"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <br />

      <label>Selecciona cálculo: </label>
      <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
        <option value="media">Media</option>
        <option value="mediana">Mediana</option>
        <option value="moda">Moda</option>
        <option value="varianza">Varianza</option>
        <option value="desviacion">Desviación estándar</option>
        <option value="frecuencias">Distribución de frecuencias</option>
      </select>
      <br />

      <button onClick={handleCalculate}>Calcular</button>

      {resultado && (
        <div>
          <h3>Resultado:</h3>
          {tipo === "frecuencias" ? (
            <table border="1">
              <thead>
                <tr>
                  <th>Valor</th>
                  <th>Frecuencia</th>
                </tr>
              </thead>
              <tbody>
                {resultado.resultado.map((row, i) => (
                  <tr key={i}>
                    <td>{row.valor}</td>
                    <td>{row.f}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>{resultado.resultado}</p>
          )}
        </div>
      )}
    </div>
  );
}
 */


import { useState } from "react";

export default function Calculator() {
  const [curso, setCurso] = useState("MAT151");
  const [tema, setTema] = useState("Tema2");
  const [tipo, setTipo] = useState("media");
  const [input, setInput] = useState("");
  const [resultado, setResultado] = useState(null);

  const handleCalculate = async () => {
    const datos = input.split(",").map(Number).filter((x) => !isNaN(x));

    try {
      const res = await fetch("http://127.0.0.1:8000/calcular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datos, tipo, curso, tema }), // ahora enviamos curso y tema
      });
      const data = await res.json();
      setResultado(data);
    } catch (err) {
      console.error("Error:", err);
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
        {/* más temas... */}
      </select>
      <br />

      {/* Selección del cálculo */}
      <label>Cálculo: </label>
      <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
        {/* Aquí los cálculos dependen del tema */}
        {tema === "Tema2" && (
          <>
            <option value="frecuencias">Distribución de frecuencias</option>
            {/* aquí irían histogramas, polígonos, ojivas en un futuro */}
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
