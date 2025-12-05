import { NavLink } from "react-router-dom";
import OscuroClaro from "./oscuro_claro";

// 1. IMPORTAR LA IMAGEN
import escudo from "../assets/images/escudoUSFX.JPEG"; 

export default function Menu() {
  return (
    <nav>
      <ul>
        {/* 2. AGREGAR EL LOGO COMO PRIMER ITEM */}
        <li className="logo-item">
            <img src={escudo} alt="Escudo Universidad" className="nav-logo" />
        </li>

        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
            Inicio
          </NavLink>
        </li>
        <li>
          <NavLink to="/archivos" className={({ isActive }) => (isActive ? "active" : "")}>
            Archivos
          </NavLink>
        </li>
        <li>
          <NavLink to="/calculadora" className={({ isActive }) => (isActive ? "active" : "")}>
            Calculadora
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
            Sobre la App
          </NavLink>
        </li>
        
        <li className="theme-toggle-item">
          <OscuroClaro />
        </li>
      </ul>
    </nav>
  );
}