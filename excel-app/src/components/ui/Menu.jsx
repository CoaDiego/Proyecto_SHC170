import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import OscuroClaro from "./oscuro_claro";
import escudoAdmin from "../../assets/images/Logo-Adm.png";
import '../../styles/components/ui/Menu.css';

export default function Menu({ usuario }) {
  const [isOpen, setIsOpen] = useState(false);
  // 🚀 1. Nuevo estado para controlar cuándo se abre el submenú (útil para móviles)
  const [dropdownOpen, setDropdownOpen] = useState(false); 
  
  const closeMenu = () => {
    setIsOpen(false);
    setDropdownOpen(false); // 🚀 Cerramos también el submenú
  };
  
  const navigate = useNavigate();
  const location = useLocation();
  const navLinksRef = useRef(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0, opacity: 0 });

  // 🚀 2. Detectamos si estamos en alguna de las páginas de la calculadora
  const isCalculadoraActive = location.pathname === '/calculadora' || location.pathname === '/MAT251';

  useEffect(() => {
    const updateUnderline = () => {
      // 🚀 3. Modificamos la búsqueda para que también detecte nuestro "span" activo del submenú
      let activeLink = navLinksRef.current?.querySelector('a.active, span.active');
      if (activeLink) {
        let leftPos = activeLink.offsetLeft;
        let width = activeLink.offsetWidth;

        // Corregimos la posición si es parte del menú desplegable
        // ya que su contenedor (li) tiene position: relative y offsetLeft devuelve 0
        const dropdownParent = activeLink.closest('.dropdown-container');
        if (dropdownParent) {
          leftPos = dropdownParent.offsetLeft;
          // Queremos que el ancho de la línea sea del span "Calculadora", no de todo el li
          // aunque el li no tiene padding, el span es más preciso.
          const span = dropdownParent.querySelector('span');
          width = span ? span.offsetWidth : dropdownParent.offsetWidth;
        }

        setUnderlineStyle({
          left: leftPos,
          width: width,
          opacity: 1
        });
      } else {
        setUnderlineStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };

    updateUnderline();
    window.addEventListener("resize", updateUnderline);
    const timer = setTimeout(updateUnderline, 100);

    return () => {
      window.removeEventListener("resize", updateUnderline);
      clearTimeout(timer);
    };
  }, [location.pathname]);

  return (
    <nav className="main-navbar">
      
      <div className="nav-brand">
       <img src={escudoAdmin} alt="Escudo Administración" className="nav-logo" />
      </div>

      <div className={`nav-menu ${isOpen ? "active" : ""}`}>
        <ul className="nav-links" ref={navLinksRef}>
          <li><NavLink to="/" onClick={closeMenu}>Inicio</NavLink></li>
          <li><NavLink to="/archivos" onClick={closeMenu}>Archivos</NavLink></li>
          
          {/* 🚀 4. EL NUEVO CONTENEDOR DESPLEGABLE */}
          <li 
            className="nav-item dropdown-container"
            onClick={() => setDropdownOpen(!dropdownOpen)} // Abrir solo con clic
          >
            {/* El título "Calculadora" se marca como activo si estamos en esas rutas */}
            <span className={`nav-link-dropdown ${isCalculadoraActive ? 'active' : ''}`}>
              Calculadora
              <svg 
                className={`chevron-icon ${dropdownOpen ? 'open' : ''}`} 
                width="16" height="16" viewBox="0 0 24 24" 
                fill="none" stroke="currentColor" strokeWidth="3.5" 
                strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </span>

            <ul className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
              <li className="dropdown-li" style={{ transitionDelay: '0.05s' }}>
                <NavLink to="/calculadora" onClick={closeMenu} className="dropdown-item">
                  Estadística General
                </NavLink>
              </li>
              <li className="dropdown-li" style={{ transitionDelay: '0.1s' }}>
                <NavLink to="/MAT251" onClick={closeMenu} className="dropdown-item">
                  Estadística Matemática
                </NavLink>
              </li>
            </ul>
          </li>

          <li><NavLink to="/historial" onClick={closeMenu}>Historial</NavLink></li>
          <li><NavLink to="/grupos" onClick={closeMenu}>Grupos</NavLink></li>
         
         <span className="nav-underline" style={underlineStyle} />
        </ul>

        <div className="nav-menu-mobile-extra mobile-only">
          <OscuroClaro />
        </div>
      </div>

      <div className="menu-derecha">
        <div className="nav-theme desktop-only">
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
            <span className="user-name-text">
              {usuario.nombre?.split(' ')[0] || 'Usuario'}
            </span>
          </div>
        )}
      </div>

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