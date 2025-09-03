
/* import { useState } from "react";
import ExcelUploader from "./components/ExcelUploader";
import ExcelViewer from "./components/ExcelViewer";
import ExcelReader from "./components/ExcelReader";
import Calculator from "./components/Calculator";

function App() {
  const [refreshFiles, setRefreshFiles] = useState(false);

  return (
    <div>
      <h1>Mi Proyecto Excel</h1>
      <ExcelUploader setRefreshFiles={setRefreshFiles} />
      <ExcelViewer refreshFiles={refreshFiles} setRefreshFiles={setRefreshFiles} />
       <ExcelReader />
       <h1>Proyecto MAT151</h1>
      <Calculator />
    </div>
  );
}

export default App; */


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Menu from "./components/Menu";
// Importar páginas
import Inicio from "./pages/Inicio";
import Excels from "./pages/Excels";
import Calculadora from "./pages/Calculadora";
import About from "./pages/About";

import { useState } from "react";
import ExcelUploader from "./components/ExcelUploader";
import ExcelViewer from "./components/ExcelViewer";
import ExcelReader from "./components/ExcelReader";
import Calculator from "./components/Calculator";

function App() {
  const [refreshFiles, setRefreshFiles] = useState(false);

  return (
    <Router>
      <div>
        {/* Menú arriba */}
        <Menu />

        {/* Rutas */}
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/excels" element={<Excels />} />
          <Route path="/calculadora" element={<Calculadora />} />
          <Route path="/about" element={<About />} />
        </Routes>

        {/* Contenido adicional que ya tenías */}
        <h1>Mi Proyecto Excel</h1>
        <ExcelUploader setRefreshFiles={setRefreshFiles} />
        <ExcelViewer refreshFiles={refreshFiles} setRefreshFiles={setRefreshFiles} />
        <ExcelReader />
        <h1>Proyecto MAT151</h1>
        <Calculator />
      </div>
    </Router>
  );
}

export default App;
