// ✅ GraficoEstadistico.jsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

export default function GraficoEstadistico({ datos = [], tipo = "barras" }) {
  if (!Array.isArray(datos) || datos.length === 0) {
    return <p className="text-gray-500 text-sm">No hay datos para graficar.</p>;
  }

  const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

  if (tipo === "barras") {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={datos} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x_i" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="f_i" fill="#2563eb" name="Frecuencia absoluta" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (tipo === "pastel") {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={datos}
            dataKey="f_i"
            nameKey="x_i"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {datos.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return <p>Tipo de gráfico no soportado.</p>;
}
