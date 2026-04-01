// src/utils/estadisticaRegresion.js

/**
 * Función central para calcular Regresión Simple (Lineal y No Lineal)
 * @param {Array} arrX - Arreglo de datos de la variable independiente (X)
 * @param {Array} arrY - Arreglo de datos de la variable dependiente (Y)
 * @param {String} tipo - "lineal", "logaritmica", "exponencial", "potencial"
 */
export const calcularRegresionSimple = (arrX, arrY, tipo = "lineal") => {
  // 1. Limpieza y validación de datos (pares válidos)
  let datosValidos = [];
  for (let i = 0; i < arrX.length; i++) {
    const x = arrX[i];
    const y = arrY[i];
    
    // Para transformaciones logarítmicas, los valores deben ser estrictamente mayores a 0
    let esValido = typeof x === 'number' && !isNaN(x) && typeof y === 'number' && !isNaN(y);
    if (tipo === "logaritmica" || tipo === "potencial") { if (x <= 0) esValido = false; }
    if (tipo === "exponencial" || tipo === "potencial") { if (y <= 0) esValido = false; }
    
    if (esValido) {
      datosValidos.push({ xOriginal: x, yOriginal: y });
    }
  }

  const n = datosValidos.length;
  if (n < 2) return null; // Mínimo 2 puntos para trazar una recta

  // 2. Transformación de variables según el modelo
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

  datosValidos.forEach(pto => {
    let xCalc = pto.xOriginal;
    let yCalc = pto.yOriginal;

    if (tipo === "logaritmica") xCalc = Math.log(pto.xOriginal);
    if (tipo === "exponencial") yCalc = Math.log(pto.yOriginal);
    if (tipo === "potencial") {
      xCalc = Math.log(pto.xOriginal);
      yCalc = Math.log(pto.yOriginal);
    }

    sumX += xCalc;
    sumY += yCalc;
    sumXY += (xCalc * yCalc);
    sumX2 += (xCalc * xCalc);
    sumY2 += (yCalc * yCalc);
  });

  // 3. Sistema de Ecuaciones (Mínimos Cuadrados Ordinarios)
  const denominador = (n * sumX2) - (sumX * sumX);
  if (denominador === 0) return null; // Evitar división por cero si todos los X son iguales

  const b_calc = ((n * sumXY) - (sumX * sumY)) / denominador;
  const a_calc = (sumY - (b_calc * sumX)) / n;

  // 4. Re-conversión a los coeficientes reales (a y b) para la fórmula
  let a = a_calc;
  let b = b_calc;
  let cadenaEcuacion = "";

  if (tipo === "lineal") {
    cadenaEcuacion = `Y = ${a.toFixed(4)} ${b >= 0 ? '+' : ''} ${b.toFixed(4)}X`;
  } else if (tipo === "logaritmica") {
    cadenaEcuacion = `Y = ${a.toFixed(4)} ${b >= 0 ? '+' : ''} ${b.toFixed(4)}ln(X)`;
  } else if (tipo === "exponencial") {
    a = Math.exp(a_calc);
    cadenaEcuacion = `Y = ${a.toFixed(4)} * e^(${b.toFixed(4)}X)`;
  } else if (tipo === "potencial") {
    a = Math.exp(a_calc);
    cadenaEcuacion = `Y = ${a.toFixed(4)} * X^(${b.toFixed(4)})`;
  }

  // 5. Función predictora interna (Módulo de Inferencia)
  const predecirY = (xVal) => {
    if (tipo === "lineal") return a + (b * xVal);
    if (tipo === "logaritmica") return a + (b * Math.log(xVal));
    if (tipo === "exponencial") return a * Math.exp(b * xVal);
    if (tipo === "potencial") return a * Math.pow(xVal, b);
    return 0;
  };

  // 6. Bondad de Ajuste (r, R², Syx)
  let sse = 0; // Suma de Cuadrados del Error (Residual)
  let sst = 0; // Suma de Cuadrados Total
  const mediaYOriginal = datosValidos.reduce((acc, curr) => acc + curr.yOriginal, 0) / n;

  datosValidos.forEach(pto => {
    const yPred = predecirY(pto.xOriginal);
    sse += Math.pow(pto.yOriginal - yPred, 2);
    sst += Math.pow(pto.yOriginal - mediaYOriginal, 2);
  });

  const r2 = sst !== 0 ? 1 - (sse / sst) : 0;
  // El signo de 'r' depende de 'b' en modelos lineales/logarítmicos
  const signoR = b_calc >= 0 ? 1 : -1;
  const r = signoR * Math.sqrt(Math.max(0, r2)); 
  const errorEstandar = n > 2 ? Math.sqrt(sse / (n - 2)) : 0;

  // 7. Preparar datos para el gráfico de dispersión y la línea de tendencia
  // Ordenamos X de menor a mayor para que la línea se dibuje correctamente
  const datosOrdenados = [...datosValidos].sort((p1, p2) => p1.xOriginal - p2.xOriginal);
  const datosGrafico = datosOrdenados.map(pto => ({
    x: pto.xOriginal,
    yReal: pto.yOriginal,
    yAjustado: predecirY(pto.xOriginal)
  }));

  return {
    tipoModelo: tipo,
    n_validos: n,
    coeficientes: { a, b },
    ecuacion: cadenaEcuacion,
    indicadores: {
      r2: r2,
      r: r,
      error_estandar: errorEstandar
    },
    datosGrafico: datosGrafico,
    // Exportamos la función para que la interfaz pueda usarla en el simulador en tiempo real
    funcionPredictora: predecirY 
  };
};