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
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

export default function GraficoEstadistico({ datos = [], tipo = "barras" }) {
  if (!Array.isArray(datos) || datos.length === 0) {
    return <p className="text-gray-500 text-sm">No hay datos para graficar.</p>;
  }

  const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

  // === GRAFICO DE BARRAS ===
  if (tipo === "barras") {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={datos}>
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

  // === GRAFICO DE PASTEL ===
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

  // === HISTOGRAMA SIMPLE ===
  if (tipo === "histograma") {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="intervalo" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="f_i" fill="#2563eb" name="Frecuencia absoluta" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // === POLÍGONO DE FRECUENCIAS ===
  if (tipo === "poligono") {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x_i" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="f_i" stroke="#2563eb" name="Frecuencia absoluta" />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // === OJIVA CRECIENTE ===
  if (tipo === "ojiva_creciente") {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x_i" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="F_i" stroke="#10b981" name="Frecuencia acumulada creciente" />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // === OJIVA DECRECIENTE ===
  if (tipo === "ojiva_decreciente") {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x_i" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="F_i_desc" stroke="#ef4444" name="Frecuencia acumulada decreciente" />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return <p>Tipo de gráfico no soportado.</p>;
}
