// src/utils/diccionario.js
export const glosarioEstadistico = {
  "x_i": { texto: "Marca de clase (Centro del intervalo)", math: "" },
  "f_i": { texto: "Frecuencia Absoluta (Conteo)", math: "" },
  "p_i": { texto: "Frecuencia Relativa", math: "p_i = \\frac{f_i}{n}" },
  "F_i": { texto: "Frecuencia Absoluta Acumulada", math: "F_i = \\sum_{j=1}^{i} f_j" },
  "P_i": { texto: "Frecuencia Relativa Acumulada", math: "P_i = \\frac{F_i}{n}" },
  "F_i_inv": { texto: "Frec. Absoluta Acumulada Inversa", math: "F^{\\uparrow}_i = \\sum_{j=i}^{k} f_j" },
  "P_i_inv": { texto: "Frec. Relativa Acumulada Inversa", math: "P^{\\uparrow}_i = \\frac{F^{\\uparrow}_i}{n}" },
  "x̄": { texto: "Media Aritmética", math: "\\bar{x} = \\frac{\\sum x_i f_i}{n}" },
  "Me": { texto: "Mediana (Agrupados)", math: "Me = L_i + \\frac{\\frac{n}{2} - F_{i-1}}{f_i} \\cdot A" },
  "Mo": { texto: "Moda (Agrupados)", math: "Mo = L_i + \\frac{d_1}{d_1 + d_2} \\cdot A" },
  "S²": { texto: "Varianza Muestral", math: "S^2 = \\frac{\\sum (x_i - \\bar{x})^2 f_i}{n-1}" },
  "S": { texto: "Desviación Estándar", math: "S = \\sqrt{S^2}" },
  "CV": { texto: "Coeficiente de Variación", math: "CV = \\frac{S}{\\bar{x}}" }, 

  // --- TEMA 3 Y 4: TENDENCIA, POSICIÓN Y FORMA ---
  "DM": { texto: "Desviación Media", math: "DM = \\frac{\\sum |x_i - \\bar{x}| f_i}{n}" },
  "G": { texto: "Media Geométrica", math: "G = \\sqrt[n]{x_1 \\cdot x_2 \\cdots x_n}" },
  "H": { texto: "Media Armónica", math: "H = \\frac{n}{\\sum \\frac{f_i}{x_i}}" },
  "Q_k": { texto: "Cuartil (Agrupados)", math: "Q_k = L_i + \\frac{\\frac{k \\cdot n}{4} - F_{i-1}}{f_i} \\cdot A" },
  "D_k": { texto: "Decil (Agrupados)", math: "D_k = L_i + \\frac{\\frac{k \\cdot n}{10} - F_{i-1}}{f_i} \\cdot A" },
  "P_k": { texto: "Percentil (Agrupados)", math: "P_k = L_i + \\frac{\\frac{k \\cdot n}{100} - F_{i-1}}{f_i} \\cdot A" },
  "As": { texto: "Asimetría de Fisher", math: "As = \\frac{m_3}{S^3}" },
  "K": { texto: "Curtosis", math: "K = \\frac{m_4}{S^4} - 3" }
};