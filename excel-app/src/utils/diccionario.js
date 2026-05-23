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
  "Me": { texto: "Mediana", math: "" },
  "Mo": { texto: "Moda", math: "" },
  "S²": { texto: "Varianza Muestral", math: "S^2 = \\frac{\\sum (x_i - \\bar{x})^2 f_i}{n-1}" },
  "S": { texto: "Desviación Estándar", math: "S = \\sqrt{S^2}" },
  "CV": { texto: "Coeficiente de Variación", math: "CV = \\frac{S}{\\bar{x}}" }
};