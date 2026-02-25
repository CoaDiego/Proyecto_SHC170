import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Menu from "./components/ui/Menu";

import { useState } from "react";
import { sileo, Toaster } from "sileo"; // 👈 1. Importamos el componente Toaster

import Inicio from "./pages/Inicio";
import Archivos from "./pages/Archivos";
import Calculadora from "./pages/Calculadora";
import About from "./pages/About";
import Login from "./pages/Login";
import "./App.css";

function App() {
  const [isAuth, setIsAuth] = useState(false);

  return (
    <Router>
      <div className="App">

        {/* 👇 2. Colocamos el Toaster en la parte más alta de la app */}

        <>
          <Toaster position="bottom-right" />
        </>
        {/* Menú de navegación con el botón incluido */}
        {isAuth && (
          <header className="flex justify-between items-center p-4 shadow-md">
            <Menu /> {/* 👈 Ahora el botón está dentro del Menu */}
          </header>
        )}

        {/* Contenido que cambia según la ruta */}
        <div className="content">

          <Routes>
            {!isAuth ? (
              <>
                <Route path="/login" element={<Login onLogin={setIsAuth} />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Inicio />} />
                <Route path="/archivos" element={<Archivos />} />
                <Route path="/calculadora" element={<Calculadora />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Navigate to="/" />} />
              </>
            )}
          </Routes>
        </div>

      </div>
    </Router>
  );
}

export default App;