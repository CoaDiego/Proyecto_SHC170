// src/utils/estadisticaRegresion.js

export const calcularRegresionSimple = (arrX, arrY, tipo = "lineal") => {
  let datosValidos = [];
  for (let i = 0; i < arrX.length; i++) {
    const x = arrX[i]; const y = arrY[i];
    let esValido = typeof x === 'number' && !isNaN(x) && typeof y === 'number' && !isNaN(y);
    
    // Validaciones matemáticas
    if (tipo === "logaritmica" || tipo === "potencial") { if (x <= 0) esValido = false; }
    if (tipo === "exponencial" || tipo === "potencial") { if (y <= 0) esValido = false; }
    if (tipo === "reciproco") { if (x === 0) esValido = false; } // No se puede dividir entre 0
    
    if (esValido) datosValidos.push({ xOriginal: x, yOriginal: y });
  }

  const n = datosValidos.length;
  if (n < 2) return null;

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  let filasCalculo = []; // 🛡️ AQUÍ GUARDAMOS LA TABLA DE CÁLCULOS

  datosValidos.forEach(pto => {
    let xCalc = pto.xOriginal; let yCalc = pto.yOriginal;
    
    // Transformaciones
    if (tipo === "logaritmica") xCalc = Math.log(pto.xOriginal);
    if (tipo === "exponencial") yCalc = Math.log(pto.yOriginal);
    if (tipo === "potencial") { xCalc = Math.log(pto.xOriginal); yCalc = Math.log(pto.yOriginal); }
    if (tipo === "reciproco") { xCalc = 1 / pto.xOriginal; }

    const x2 = xCalc * xCalc;
    const y2 = yCalc * yCalc;
    const xy = xCalc * yCalc;

    sumX += xCalc; sumY += yCalc; sumXY += xy; sumX2 += x2; sumY2 += y2;

    // Guardamos la fila para la tabla del usuario
    filasCalculo.push({
      xOrig: pto.xOriginal, yOrig: pto.yOriginal,
      xTrans: xCalc, yTrans: yCalc,
      x2: x2, y2: y2, xy: xy
    });
  });

  const denominador = (n * sumX2) - (sumX * sumX);
  if (denominador === 0) return null;

  const b_calc = ((n * sumXY) - (sumX * sumY)) / denominador;
  const a_calc = (sumY - (b_calc * sumX)) / n;

  let a = a_calc; let b = b_calc; let cadenaEcuacion = "";
  
  if (tipo === "lineal") cadenaEcuacion = `Y = ${a.toFixed(4)} ${b >= 0 ? '+' : ''} ${b.toFixed(4)}X`;
  else if (tipo === "logaritmica") cadenaEcuacion = `Y = ${a.toFixed(4)} ${b >= 0 ? '+' : ''} ${b.toFixed(4)}ln(X)`;
  else if (tipo === "exponencial") { a = Math.exp(a_calc); cadenaEcuacion = `Y = ${a.toFixed(4)} * e^(${b.toFixed(4)}X)`; }
  else if (tipo === "potencial") { a = Math.exp(a_calc); cadenaEcuacion = `Y = ${a.toFixed(4)} * X^(${b.toFixed(4)})`; }
  else if (tipo === "reciproco") { cadenaEcuacion = `Y = ${a.toFixed(4)} ${b >= 0 ? '+' : ''} ${b.toFixed(4)}(1/X)`; }

  const predecirY = (xVal) => {
    if (tipo === "lineal") return a + (b * xVal);
    if (tipo === "logaritmica") return a + (b * Math.log(xVal));
    if (tipo === "exponencial") return a * Math.exp(b * xVal);
    if (tipo === "potencial") return a * Math.pow(xVal, b);
    if (tipo === "reciproco") return a + (b * (1 / xVal));
    return 0;
  };

  let sse = 0; let sst = 0;
  const mediaYOriginal = datosValidos.reduce((acc, curr) => acc + curr.yOriginal, 0) / n;
  datosValidos.forEach(pto => {
    const yPred = predecirY(pto.xOriginal);
    sse += Math.pow(pto.yOriginal - yPred, 2); sst += Math.pow(pto.yOriginal - mediaYOriginal, 2);
  });

  const r2 = sst !== 0 ? 1 - (sse / sst) : 0;
  const signoR = b_calc >= 0 ? 1 : -1;
  const r = signoR * Math.sqrt(Math.max(0, r2)); 
  const errorEstandar = n > 2 ? Math.sqrt(sse / (n - 2)) : 0;

  const datosOrdenados = [...datosValidos].sort((p1, p2) => p1.xOriginal - p2.xOriginal);
  const datosGrafico = datosOrdenados.map(pto => ({ x: pto.xOriginal, yReal: pto.yOriginal }));

  return {
    tipoModelo: tipo, n_validos: n, coeficientes: { a, b }, ecuacion: cadenaEcuacion,
    indicadores: { r2: r2, r: r, error_estandar: errorEstandar },
    datosGrafico: datosGrafico, funcionPredictora: predecirY,
    // 🛡️ EXPORTAMOS LAS TABLAS DE CÁLCULO
    tablaCalculos: {
      filas: filasCalculo,
      sumas: { sumX, sumY, sumX2, sumY2, sumXY }
    }
  };
};