import { useState } from "react";
import { NavLink } from "react-router-dom";
import OscuroClaro from "./oscuro_claro";
import escudoAdmin from "../../assets/images/escudoAdmin.png";

export default function Menu() {
  // Estado para saber si el menú del celular está abierto o cerrado
  const [isOpen, setIsOpen] = useState(false);

  // Función para cerrar el menú automáticamente cuando el usuario haga clic en un enlace
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="main-navbar">
      
      {/* 1. ZONA DEL LOGO */}
      <div className="nav-brand">
       <img src={escudoAdmin} alt="Escudo Administración" className="nav-logo" />
      </div>

      {/* 2. BOTÓN DE HAMBURGUESA (Solo visible en Celular) */}
      <button 
        className={`hamburger-menu ${isOpen ? "open" : ""}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir menú"
      >
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>

      {/* 3. CONTENEDOR DESPLEGABLE (Enlaces + Botón Tema) */}
      <div className={`nav-menu ${isOpen ? "active" : ""}`}>
        
        {/* Enlaces */}
        <ul className="nav-links">
          <li>
            <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink to="/archivos" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
              Archivos
            </NavLink>
          </li>
          <li>
            <NavLink to="/calculadora" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
              Calculadora
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
              Sobre la App
            </NavLink>
          </li>
        </ul>

        {/* Botón de Oscuro/Claro */}
        <div className="nav-theme">
          <OscuroClaro />
        </div>

      </div>
    </nav>
  );
}