import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import OscuroClaro from "./oscuro_claro";
import escudoAdmin from "../../assets/images/Logo-Adm.png";

export default function Menu({ usuario }) {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);
  const navigate = useNavigate();

  return (
    <nav className="main-navbar">
      
      {/* 1. ZONA DEL LOGO */}
      <div className="nav-brand">
       <img src={escudoAdmin} alt="Escudo Administración" className="nav-logo" />
      </div>

      {/* 2. CONTENEDOR DESPLEGABLE (Solo enlaces) - Se posiciona absoluto en móvil */}
      <div className={`nav-menu ${isOpen ? "active" : ""}`}>
        <ul className="nav-links">
          <li><NavLink to="/" onClick={closeMenu}>Inicio</NavLink></li>
          <li><NavLink to="/archivos" onClick={closeMenu}>Archivos</NavLink></li>
          <li><NavLink to="/calculadora" onClick={closeMenu}>Calculadora</NavLink></li>
          <li><NavLink to="/MAT251" onClick={closeMenu}>MAT-251</NavLink></li>
          <li><NavLink to="/historial" onClick={closeMenu}>Historial</NavLink></li>
          <li><NavLink to="/about" onClick={closeMenu}>Sobre la App</NavLink></li>
        </ul>
      </div>

      {/* 3. ZONA DERECHA: Siempre visible (Tema + Usuario) */}
      <div className="menu-derecha">
        <div className="nav-theme">
          <OscuroClaro />
        </div>

        {usuario && (
          <div 
            className="perfil-usuario-menu" 
            title={`${usuario.nombre} - ${usuario.rol}`}
            onClick={() => {
              navigate('/perfil');
              closeMenu();
            }}
          >
            <div className="avatar-naranja">
              {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : '👤'}
            </div>
            <span className="user-name-text">{usuario.nombre.split(' ')[0]}</span>
          </div>
        )}
      </div>

      {/* 4. BOTÓN DE HAMBURGUESA - Al final para que esté a la derecha en móvil */}
      <button 
        className={`hamburger-menu ${isOpen ? "open" : ""}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir menú"
      >
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>
    </nav>
  );
}