import { useState } from "react";
import Tema2 from "./Tema2";
import Tema3 from "./Tema3";
import Tema4 from "./Tema4";
import Tema5 from "./Tema5";
import Tema6 from "./Tema6";
import Tema7 from "./Tema7";
import Tema8 from "./Tema8";

export default function MAT151() {
  const [tema, setTema] = useState("Tema2");

  return (
    <div>
      <h2>📘 MAT151 - Estadística General</h2>
      
      {/* Menú de temas */}
      <nav>
        <button onClick={() => setTema("Tema2")}>Tema 2 - Frecuencias</button>
        <button onClick={() => setTema("Tema3")}>Tema 3 - Tendencia Central</button>
        <button onClick={() => setTema("Tema4")}>Tema 4 - Dispersión</button>
        <button onClick={() => setTema("Tema5")}>Tema 5 - Distribuciones Bivariantes</button>
        <button onClick={() => setTema("Tema6")}>Tema 6 - Regresión</button>
        <button onClick={() => setTema("Tema7")}>Tema 7 - Series Cronológicas</button>
        <button onClick={() => setTema("Tema8")}>Tema 8 - Números Índices</button>
      </nav>

      {/* Contenido dinámico */}
      <div>
        {tema === "Tema2" && <Tema2 />}
        {tema === "Tema3" && <Tema3 />}
        {tema === "Tema4" && <Tema4 />}
        {tema === "Tema5" && <Tema5 />}
        {tema === "Tema6" && <Tema6 />}
        {tema === "Tema7" && <Tema7 />}
        {tema === "Tema8" && <Tema8 />}
      </div>
    </div>
  );
}
