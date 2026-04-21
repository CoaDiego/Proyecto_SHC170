import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList,
    PieChart, Pie, Cell, Label
} from 'recharts';
import '../../../styles/components/MAT251/Graficas/GraficosEstadisticos.css';

const RADIAN = Math.PI / 180;

const renderCustomizedLabelLine = (props, colores) => {
    const { cx, cy, midAngle, outerRadius, percent, index } = props;
    if (percent === 0) return null;

    const radius = outerRadius + 5;
    const elbowRadius = outerRadius + 25;
    const horizontalLength = 20;

    // Punto A: Inicio
    const x1 = cx + radius * Math.cos(-midAngle * RADIAN);
    const y1 = cy + radius * Math.sin(-midAngle * RADIAN);

    // Punto B: El quiebre (codo)
    const x2 = cx + elbowRadius * Math.cos(-midAngle * RADIAN);
    const y2 = cy + elbowRadius * Math.sin(-midAngle * RADIAN);

    // Punto C: Final de la línea horizontal
    const isLeft = x2 < cx;
    const x3 = x2 + (isLeft ? -horizontalLength : horizontalLength);
    const y3 = y2;

    const color = colores[index % colores.length];

    return (
        <g>
            <path
                d={`M${x1},${y1} L${x2},${y2} L${x3},${y3}`}
                stroke={color}
                fill="none"
                strokeWidth={1.5}
            />
            <circle cx={x3} cy={y3} r={4} fill={color} stroke="none" />
        </g>
    );
};

const renderCustomizedLabelText = (props, colores) => {
    const { cx, cy, midAngle, outerRadius, percent, index } = props;
    if (percent === 0) return null;

    const elbowRadius = outerRadius + 25;
    const horizontalLength = 20;
    const textOffset = 10;

    const x2 = cx + elbowRadius * Math.cos(-midAngle * RADIAN);
    const y2 = cy + elbowRadius * Math.sin(-midAngle * RADIAN);

    const isLeft = x2 < cx;
    const x3 = x2 + (isLeft ? -horizontalLength : horizontalLength);
    const y3 = y2;

    const textX = x3 + (isLeft ? -textOffset : textOffset);
    const textY = y3;

    return (
        <text
            x={textX}
            y={textY}
            fill={colores[index % colores.length]}
            textAnchor={isLeft ? 'end' : 'start'}
            dominantBaseline="central"
            fontWeight="bold"
            fontSize="14px"
        >
            {(percent * 100).toFixed(2)}%
        </text>
    );
};


export default function GraficosProbabilidad({ resProbabilidad, datosArray }) {
    if (!resProbabilidad) return null;

    const dataPie = [
        { name: 'Éxito (Favorables)', value: resProbabilidad.casosFavorables },
        { name: 'Resto (No Favorables)', value: resProbabilidad.casosTotales - resProbabilidad.casosFavorables }
    ];

    const tonoBase = (resProbabilidad.casosTotales * 47 + resProbabilidad.casosFavorables * 23) % 360;

    const COLORS = [
        `hsl(${tonoBase}, 95%, 45%)`,
        `hsl(${(tonoBase + 180) % 360}, 20%, 70%)`
    ];

    const frecuencias = datosArray.reduce((acc, current) => {
        acc[current] = (acc[current] || 0) + 1;
        return acc;
    }, {});

    const dataBarra = Object.keys(frecuencias).map(key => ({
        nombre: key,
        frecuencia: frecuencias[key]
    })).sort((a, b) => a.nombre - b.nombre);

    return (
        <div className="contenedor-graficos-prob">
            {/* ESTILOS INYECTADOS PARA LA MEJORA VISUAL */}
            <style>{`
                .titulo-profesional {
                    font-size: 1.15rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 20px;
                    text-align: center;
                }
            `}</style>

            <div className="grafico-card full-width">
                <h3 className="titulo-profesional">Probabilidad de Ocurrencia</h3>
                <div className="termometro-container">
                    <div
                        className="termometro-fill"
                        style={{ width: `${resProbabilidad.probabilidadPorcentaje}%` }}
                    >
                        {resProbabilidad.probabilidadPorcentaje}%
                    </div>
                </div>
                <p className="leyenda-termometro">0% (Imposible) — 100% (Seguro)</p>
            </div>

            <div className="grid-graficos">
                <div className="grafico-card">
                    <h3 className="titulo-profesional">Distribución del Evento</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart margin={{ top: 10, right: 30, left: 30, bottom: 20 }}>
                            <Pie
                                data={dataPie}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={75}
                                paddingAngle={0}
                                dataKey="value"
                                label={(props) => renderCustomizedLabelText(props, COLORS)}
                                labelLine={(props) => renderCustomizedLabelLine(props, COLORS)}
                            >
                                {dataPie.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${value} casos`, name]} />
                            <Legend
                                verticalAlign="bottom"
                                height={20}
                                wrapperStyle={{ paddingTop: '25px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="grafico-card">
                    <h3 className="titulo-profesional">Frecuencia de Datos Únicos</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart
                            data={dataBarra}
                            margin={{ top: 30, right: 30, left: 10, bottom: 20 }}
                            barCategoryGap="15%"
                        >
                            <defs>
                                <linearGradient id="colorBarraPro" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                                    <stop offset="100%" stopColor="#1e40af" stopOpacity={1} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                strokeDasharray="3 3"
                                strokeWidth={1.5}
                                fill="#979696"
                                fillOpacity={0.06}
                            />

                            <XAxis
                                dataKey="nombre"
                                axisLine={{ stroke: '#000000', strokeWidth: 1.5 }}
                                tickLine={{ stroke: '#000000' }}
                                tick={{ fill: '#475569', fontSize: 12, fontWeight: 600, dy: 10 }}
                            >
                                <Label
                                    value="Valor"
                                    offset={-15}
                                    position="insideBottom"
                                    style={{ fill: '#64748b', fontSize: 13, fontWeight: 'bold' }}
                                />
                            </XAxis>

                            <YAxis
                                axisLine={{ stroke: '#000000', strokeWidth: 1.5 }}
                                tickLine={{ stroke: '#000000' }}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                allowDecimals={false}
                            >
                                <Label
                                    value="Frecuencia"
                                    angle={-90}
                                    position="insideLeft"

                                    style={{ fill: '#2a2a2a', fontSize: 13, fontWeight: 'bold', textAnchor: 'middle' }}
                                />
                            </YAxis>

                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
                            />

                            <Bar
                                dataKey="frecuencia"
                                fill="url(#colorBarraPro)"
                                radius={[1, 1, 0, 0]}
                            >
                                <LabelList
                                    dataKey="frecuencia"
                                    position="top"
                                    style={{ fill: '#1e3a8a', fontSize: '13px', fontWeight: 'bold' }}
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}