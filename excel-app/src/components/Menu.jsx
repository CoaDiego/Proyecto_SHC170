/* import { NavLink } from "react-router-dom";
import "./Menu.css";

export default function Menu() {
  return (
    <nav>
      <ul>
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
      </ul>
    </nav>
  );
}
 */

import { NavLink } from "react-router-dom";
import OscuroClaro from "./oscuro_claro"; // 👈 nombre correcto del archivo
import "./Menu.css";

export default function Menu() {
  return (
    <nav>
      <ul>
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
        {/* 👇 Agregar el botón como último elemento de la lista */}
        <li className="theme-toggle-item">
          <OscuroClaro />
        </li>
      </ul>
    </nav>
  );
}