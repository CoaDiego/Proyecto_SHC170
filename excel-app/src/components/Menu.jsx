import { Link } from "react-router-dom";

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
