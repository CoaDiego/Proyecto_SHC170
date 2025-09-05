import { NavLink } from "react-router-dom";
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
          <NavLink to="/excels" className={({ isActive }) => (isActive ? "active" : "")}>
            Excels
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
