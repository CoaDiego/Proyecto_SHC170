// 📊 components/graficos/GraficoIntervalos.jsx
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { useState } from "react";

export default function GraficoIntervalos({ datos = [] }) {
  const [combinar, setCombinar] = useState("histograma");

  if (!Array.isArray(datos) || datos.length === 0) {
    return <p className="text-gray-500 text-sm">No hay datos para graficar.</p>;
  }

  // Colores y estilos
  const COLORS = {
    barras: "#2563eb",
    linea1: "#10b981",
    linea2: "#ef4444",
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2">
        Visualización de Distribución por Intervalos
      </h3>

      {/* Selector de combinación */}
      <div className="mb-3">
        <label className="mr-2 font-medium">Tipo de gráfico:</label>
        <select
          value={combinar}
          onChange={(e) => setCombinar(e.target.value)}
          className="border border-gray-400 rounded px-2 py-1"
        >
          <option value="histograma">Histograma simple</option>
          <option value="hist_acum">Histograma acumulado</option>
          <option value="ojiva">Ojiva creciente + decreciente</option>
          <option value="hist_frec">Histograma + Frec. acumuladas</option>
          <option value="completo">Combinación completa</option>
        </select>
      </div>

      {/* Renderizado dinámico */}
      <ResponsiveContainer width="100%" height={350}>
        {combinar === "histograma" && (
          <BarChart data={datos} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Intervalo" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="f_i" fill={COLORS.barras} name="Frecuencia absoluta" />
          </BarChart>
        )}

        {combinar === "hist_acum" && (
          <BarChart data={datos}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Intervalo" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="F_i" fill={COLORS.barras} name="Frecuencia acumulada" />
          </BarChart>
        )}

        {combinar === "ojiva" && (
          <LineChart data={datos}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Intervalo" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="P_i" stroke={COLORS.linea1} name="Ojiva creciente" />
            <Line type="monotone" dataKey="P_i_inv" stroke={COLORS.linea2} name="Ojiva decreciente" />
          </LineChart>
        )}

        {combinar === "hist_frec" && (
          <BarChart data={datos}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Intervalo" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="f_i" fill={COLORS.barras} name="Frecuencia absoluta" />
            <Line type="monotone" dataKey="F_i" stroke={COLORS.linea1} name="Frecuencia acumulada" />
          </BarChart>
        )}

        {combinar === "completo" && (
          <BarChart data={datos}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Intervalo" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="f_i" fill={COLORS.barras} name="Frecuencia absoluta" />
            <Line type="monotone" dataKey="F_i" stroke={COLORS.linea1} name="Frecuencia acumulada" />
            <Line type="monotone" dataKey="P_i" stroke={COLORS.linea2} name="Ojiva creciente" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
