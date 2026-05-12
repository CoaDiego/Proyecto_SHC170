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
import Registro from "./pages/Registro";
import Perfil from "./pages/Perfil";

// 👇 1. IMPORTAMOS EL DATAPROVIDER DE LA CARPETA EXCEL
import { DataProvider } from "./components/excel/DataContext"; 

import LtiTester from "./pages/LtiTester";

import "./App.css"; 

function App() {
  // 🆕 1. Cambiamos el estado para que guarde los datos del usuario (null = nadie logueado)
  const [usuario, setUsuario] = useState(null);

  // 🆕 2. Variable derivada: Si usuario no es nulo, significa que alguien inició sesión
  const isAuth = usuario !== null;

  return (
    // 👇 2. ENVOLVEMOS TODA LA APLICACIÓN CON EL DATAPROVIDER
    <DataProvider usuario={usuario}>
      <Router>
        <div className="App">

          <>
            <Toaster position="bottom-right" />
          </>
          
          {/* Menú de navegación unificado */}
         {/* Menú de navegación unificado */}
          {isAuth && (
            <header style={{ width: '100%' }}>
              {/* Le pasamos la variable 'usuario' como prop al componente Menu */}
              <Menu usuario={usuario} /> 
            </header>
          )}

         {/* Contenido que cambia según la ruta */}
          <div className="content">
            <Routes>
              {!isAuth ? (
                <>
                  {/* 🆕 3. Pasamos setUsuario a tus puertas de acceso en lugar de setIsAuth */}
                  <Route path="/login" element={<Login onLogin={setUsuario} />} />
                  
                  {/* 🆕 NUEVO: Añadimos la ruta del Registro aquí */}
                  <Route path="/registro" element={<Registro />} />
                  
                  <Route path="/lti-tester" element={<LtiTester onLogin={setUsuario} />} />
                  
                  <Route path="*" element={<Navigate to="/login" />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<Inicio />} />
                  <Route path="/archivos" element={<Archivos usuario={usuario} />} />
                  <Route path="/calculadora" element={<Calculadora />} />
                  <Route path="/about" element={<About />} />

                  <Route path="/lti-tester" element={<Navigate to="/" />} />
                  <Route path="/login" element={<Navigate to="/" />} />
                  
                  {/* 🆕 NUEVO: Si ya inició sesión y trata de registrarse, lo mandamos al inicio */}
                  <Route path="/registro" element={<Navigate to="/" />} />
                  
                  <Route path="/MAT251" element={<MAT251 />} />

                  <Route path="/perfil" element={<Perfil usuario={usuario} setUsuario={setUsuario} />} />
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