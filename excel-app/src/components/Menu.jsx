/* import { Link } from "react-router-dom";

export default function Menu() {
  return (
    <nav>
      <ul style={{ display: "flex", gap: "1rem", listStyle: "none" }}>
        <li>
          <Link to="/">Inicio</Link>
        </li>
        <li>
          <Link to="/excels">Excels</Link>
        </li>
        <li>
          <Link to="/calculadora">Calculadora</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
      </ul>
    </nav>
  );
}
 */

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
            About
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
