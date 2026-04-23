import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Menu from "./components/ui/Menu";
import Pie_pagina from "./components/ui/Pie_pagina"; 
import { useState } from "react";
import { sileo, Toaster } from "sileo";

import Inicio from "./pages/Inicio";
import Archivos from "./pages/Archivos";
import Calculadora from "./pages/Calculadora";
import About from "./pages/About";
import Login from "./pages/Login";
import MAT251 from "./pages/MAT251/Pantalla";

// 👇 1. IMPORTAMOS EL DATAPROVIDER DE LA CARPETA EXCEL
import { DataProvider } from "./components/excel/DataContext"; 

import "./App.css"; 

function App() {
  const [isAuth, setIsAuth] = useState(false);

  return (
    // 👇 2. ENVOLVEMOS TODA LA APLICACIÓN CON EL DATAPROVIDER
    <DataProvider>
      <Router>
        <div className="App">

          <>
            <Toaster position="bottom-right" />
          </>
          
          {/* Menú de navegación con el botón incluido */}
          {isAuth && (
            <header className="flex justify-between items-center p-4 shadow-md">
              <Menu /> 
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
                  <Route path="/MAT251" element={<MAT251 />} />
                </>
              )}
            </Routes>
          </div>
          
          {isAuth && <Pie_pagina />}

        </div>
      </Router>
    </DataProvider>
  );
}

export default App;