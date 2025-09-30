import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Menu from "./components/Menu";
import Inicio from "./pages/Inicio";
import Archivos from "./pages/Archivos";
import Calculadora from "./pages/Calculadora";
import About from "./pages/About";
import "./App.css";



function App() {
  
  return (
    <Router>
      <div className="App">
        {/* Menú de navegación visible en todas las páginas */}
        <Menu />

        {/* Contenido que cambia según la ruta */}
        <div className="content">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/archivos" element={<Archivos />} />
            <Route path="/calculadora" element={<Calculadora />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
