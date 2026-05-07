// src/utils/estadisticaMultivariante.js

/**
 * Tabla de Doble Entrada Básica (Variables Categóricas o Discretas)
 */
export const calcularDistribucionBivariada = (dataX, dataY) => {
  const n = dataX.length;
  if (n === 0 || dataX.length !== dataY.length) return null;

  const categoriasX = [...new Set(dataX)].sort();
  const categoriasY = [...new Set(dataY)].sort();

  const matriz = {};
  const totalFilas = {};
  const totalColumnas = {};

  categoriasX.forEach(catX => {
    matriz[catX] = {};
    totalFilas[catX] = 0;
    categoriasY.forEach(catY => {
      matriz[catX][catY] = 0;
      totalColumnas[catY] = 0;
    });
  });
  
  categoriasY.forEach(catY => totalColumnas[catY] = 0);

  for (let i = 0; i < n; i++) {
    const valX = dataX[i];
    const valY = dataY[i];
    if (matriz[valX] && matriz[valX][valY] !== undefined) {
      matriz[valX][valY]++;
      totalFilas[valX]++;
      totalColumnas[valY]++;
    }
  }

  return {
    tipo: "bivariada",
    filas: categoriasX,
    columnas: categoriasY,
    datos: matriz,
    totalFilas: totalFilas,
    totalColumnas: totalColumnas,
    granTotal: n
  };
};

/**
 * Análisis Multivariante Avanzado (Covarianza, Correlación, Sturges 2D)
 */
export const calcularBivarianteAvanzada = (dataX, dataY) => {
  const n = dataX.length;
  if (n === 0 || dataX.length !== dataY.length) return null;

  // 1. Escáner: ¿Son números continuos o texto categórico?
  const esNumerico = dataX.every(v => typeof v === 'number' && !isNaN(v)) && 
                     dataY.every(v => typeof v === 'number' && !isNaN(v));

  let categoriasX = [];
  let categoriasY = [];
  let matriz = {};
  let totalFilas = {};
  let totalColumnas = {};

  // 2. CONSTRUCCIÓN DE LA TABLA
  if (esNumerico && n > 1) {
    // --- MODO INTERVALOS ---
    const k = Math.round(1 + 3.322 * Math.log10(n));
    
    const minX = Math.min(...dataX); const maxX = Math.max(...dataX);
    const ampX = (maxX - minX) / k || 1; 
    
    const minY = Math.min(...dataY); const maxY = Math.max(...dataY);
    const ampY = (maxY - minY) / k || 1;

    const limitesX = []; const limitesY = [];
    
    for (let i = 0; i < k; i++) {
      const lInfX = minX + i * ampX;
      const lSupX = i === k - 1 ? maxX : minX + (i + 1) * ampX; 
      const labelX = `[${lInfX.toFixed(2)} - ${lSupX.toFixed(2)}${i === k - 1 ? ']' : ')'}`;
      categoriasX.push(labelX);
      limitesX.push({ min: lInfX, max: lSupX, label: labelX, isLast: i === k - 1 });

      const lInfY = minY + i * ampY;
      const lSupY = i === k - 1 ? maxY : minY + (i + 1) * ampY;
      const labelY = `[${lInfY.toFixed(2)} - ${lSupY.toFixed(2)}${i === k - 1 ? ']' : ')'}`;
      categoriasY.push(labelY);
      limitesY.push({ min: lInfY, max: lSupY, label: labelY, isLast: i === k - 1 });
    }

    categoriasX.forEach(catX => {
      matriz[catX] = {};
      totalFilas[catX] = 0;
      categoriasY.forEach(catY => {
        matriz[catX][catY] = 0;
        totalColumnas[catY] = 0;
      });
    });

    for (let i = 0; i < n; i++) {
      const valX = dataX[i]; const valY = dataY[i];
      let binX = limitesX.find(b => b.isLast ? (valX >= b.min && valX <= b.max) : (valX >= b.min && valX < b.max));
      let binY = limitesY.find(b => b.isLast ? (valY >= b.min && valY <= b.max) : (valY >= b.min && valY < b.max));
      
      if (!binX) binX = limitesX[limitesX.length - 1];
      if (!binY) binY = limitesY[limitesY.length - 1];

      matriz[binX.label][binY.label]++;
      totalFilas[binX.label]++;
      totalColumnas[binY.label]++;
    }

  } else {
    // --- MODO TEXTO ---
    categoriasX = [...new Set(dataX)].sort();
    categoriasY = [...new Set(dataY)].sort();

    categoriasX.forEach(catX => {
      matriz[catX] = {};
      totalFilas[catX] = 0;
      categoriasY.forEach(catY => {
        matriz[catX][catY] = 0;
        totalColumnas[catY] = 0;
      });
    });
    categoriasY.forEach(catY => totalColumnas[catY] = 0);

    for (let i = 0; i < n; i++) {
      const valX = dataX[i]; const valY = dataY[i];
      if (matriz[valX] && matriz[valX][valY] !== undefined) {
        matriz[valX][valY]++;
        totalFilas[valX]++;
        totalColumnas[valY]++;
      }
    }
  }

  // 3. CÁLCULO DE COVARIANZA Y CORRELACIÓN (Solo numéricos)
  let covarianza = null;
  let correlacion = null;
  let interpretacion = "No aplicable (Variables Categóricas)";
  
  if (esNumerico && n > 1) {
    const meanX = dataX.reduce((a, b) => a + b, 0) / n;
    const meanY = dataY.reduce((a, b) => a + b, 0) / n;

    let sumCross = 0, sumSqX = 0, sumSqY = 0;

    for (let i = 0; i < n; i++) {
      const dx = dataX[i] - meanX; const dy = dataY[i] - meanY;
      sumCross += dx * dy; sumSqX += dx * dx; sumSqY += dy * dy;
    }

    covarianza = sumCross / (n - 1); 
    const stdX = Math.sqrt(sumSqX / (n - 1));
    const stdY = Math.sqrt(sumSqY / (n - 1));

    if (stdX > 0 && stdY > 0) {
      correlacion = covarianza / (stdX * stdY);
      const absR = Math.abs(correlacion);
      if (absR >= 0.9) interpretacion = correlacion > 0 ? "Correlación Positiva Muy Fuerte" : "Correlación Negativa Muy Fuerte";
      else if (absR >= 0.7) interpretacion = correlacion > 0 ? "Correlación Positiva Fuerte" : "Correlación Negativa Fuerte";
      else if (absR >= 0.4) interpretacion = correlacion > 0 ? "Correlación Positiva Moderada" : "Correlación Negativa Moderada";
      else if (absR >= 0.2) interpretacion = correlacion > 0 ? "Correlación Positiva Débil" : "Correlación Negativa Débil";
      else interpretacion = "Correlación Nula o Inexistente";
    } else {
      correlacion = 0;
      interpretacion = "Sin variación en los datos";
    }
  }

  return {
    tipo: "bivariada_avanzada",
    filas: categoriasX,
    columnas: categoriasY,
    datos: matriz,
    totalFilas,
    totalColumnas,
    granTotal: n,
    esNumerico,
    covarianza,
    correlacion,
    interpretacion
  };
};