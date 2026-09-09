# Mapa de Cambios - Proyecto SHC170

Este documento registra los cambios significativos aplicados en el proyecto, detallando la fecha, los archivos modificados y el propósito de cada ajuste.

---

## [2026-09-01] Corrección de Conexión Local Frontend-Backend y Configuración CORS

### Problema Resuelto
Al iniciar el entorno de desarrollo local (Frontend React en `http://localhost:5173` y Backend FastAPI en `http://localhost:8000`), la aplicación web se quedaba en estado de carga indefinido (`Validando sesión...`) debido a que las peticiones del frontend apuntaban a una URL de producción remota en Render (`https://calculadora-administracion-de-empresas.onrender.com`) en lugar de la API local.

### Cambios Aplicados

1. **Variables de Entorno del Frontend (`excel-app/.env` y `excel-app/.env.development`)**
   - **[MODIFICADO]** `excel-app/.env`: Se configuró `VITE_API_URL=http://localhost:8000`.
   - **[MODIFICADO]** `excel-app/.env.development`: Se reemplazó la URL de Render por `VITE_API_URL=http://localhost:8000`.

2. **Servicio API Frontend (`excel-app/src/services/api.js`)**
   - **[MODIFICADO]** `excel-app/src/services/api.js`:
     - Se añadió un fallback por defecto a `"http://localhost:8000"` en `BASE_URL`: `import.meta.env.VITE_API_URL || "http://localhost:8000"`.
     - Se actualizó la función `obtenerPerfilActual` para incluir la cabecera `Authorization: Bearer <token>` requerida por el backend en `/me`.

3. **Vistas de Autenticación Frontend (`ForgotPassword.jsx` y `ResetPassword.jsx`)**
   - **[MODIFICADO]** `excel-app/src/pages/ForgotPassword.jsx`: Se aseguró la constante `BASE_URL` con fallback a `http://localhost:8000`.
   - **[MODIFICADO]** `excel-app/src/pages/ResetPassword.jsx`: Se aseguró la constante `BASE_URL` con fallback a `http://localhost:8000`.

4. **Configuración de CORS en Backend (`api_admin/main.py`)**
   - **[MODIFICADO]** `api_admin/main.py`:
     - Se confirmó la permisión explícita de `http://localhost:5173` y `http://127.0.0.1:5173`.
     - Se añadieron puertos de desarrollo alternativos (`http://localhost:5174`, `http://127.0.0.1:5174`).
     - Se agregó soporte para cargar orígenes dinámicos desde variables de entorno `FRONTEND_URL` y `CORS_ORIGINS`.


### [2026-09-04] - Limpieza de UI y Ajuste de Componentes Flotantes
**Objetivo:** Eliminar el banner de "Entorno de Pruebas (Beta)" y resolver la colisión visual entre el Selector de Rol de Administrador y el botón de Guía Rápida.
**Archivos Modificados (Local):**
- `src/pages/Calculadora.jsx` (Eliminación de BannerEntornoBeta)
- `src/pages/Archivos.jsx` (Eliminación de BannerEntornoBeta)
- `src/components/ui/SelectorRol.jsx` (Ajuste de `bottom` a 80px)
**Tipo de Despliegue:** Frontend (Sobrescribir archivos estáticos).

---

### [2026-09-04] - Incorporación de Forma Correlacional en Regresión Simple
**Objetivo:** Incorporar la representación matemática de la Forma Correlacional (Ecuación en variables estandarizadas Z) en la tabla comparativa de regresión simple.
**Archivos Modificados (Local):**
- `src/utils/estadisticaRegresion.js` (Adición de propiedades aditivas `formaCorrelacionalLatex` y `formaCorrelacionalTexto`)
- `src/components/Resultados/TablaRegresion.jsx` (Renderizado KaTeX en celda r/Forma Correlacional y actualización de exportación a Excel)
**Descripción del Cambio:**
- Generación matemática dinámica para modelos simples: Lineal ($Z_Y = r Z_X$), Logarítmica ($Z_Y = r Z_{\ln(X)}$), Exponencial ($Z_{\ln(Y)} = r Z_X$), Potencial ($Z_{\ln(Y)} = r Z_{\ln(X)}$), Recíproca ($Z_Y = r Z_{1/X}$).
- Representación académicamente rigurosa para modelos polinomiales Cuadrático y Cúbico como Correlación Múltiple $R$.
- Integración visual apilada usando el componente KaTeX `<Latex />` existente.
**Validaciones Realizadas:**
- Compilación `npm run build` ejecutada exitosamente (0 errores).
- Confirmado que el gráfico (`GraficoRegresion.jsx`) y las tablas de desarrollo no sufrieron cambios.
- Confirmado que los coeficientes, predicciones, $r$, $R^2$ y $S_{yx}$ se mantuvieron 100% idénticos.
**Tipo de Despliegue:** Frontend (Local). Sin modificaciones en servidores, backend ni producción.

---

### [2026-09-08] - Resolución de Incidencias de UI, Permisos, Exportación PDF, Historial y Guía Rápida

**Objetivo:** Resolver las 5 incidencias de la aplicación (Modo oscuro en modal, permisos de subida docente en cursos, peso de PDF, autenticación de historial y guía rápida en gestión docente).

**Archivos Modificados:**
- `excel-app/src/styles/utils/Modal.css`: Reemplazo de colores fijos por variables CSS globales (`var(--bg-card)`, `var(--text-main)`, `var(--border-color)`, `var(--text-muted)`) para soporte de Modo Oscuro en modales.
- `excel-app/src/pages/Archivos.jsx`: Normalización de `cursoSeleccionado` como cadena de texto en navegación y selector de cursos para docentes.
- `api_admin/routers/archivos.py`: Ajuste de la consulta de usuario en `/upload` para matchear nombre o correo electrónico del docente.
- `excel-app/src/utils/exportUtils.js`: Optimización de `generarPDFReporte` utilizando imágenes en formato `JPEG` (calidad 0.80) y compresión rápida en `jsPDF`, reduciendo el peso final del archivo PDF en más del 80%.
- `excel-app/src/services/api.js`: Inclusión de cabecera `Authorization: Bearer <token>` en `guardarEnHistorial`, `obtenerHistorial` y `eliminarHistorial` (cumpliendo con la restricción de no modificar la base de datos ni `models.py`).
- `excel-app/src/pages/GestionDocente.jsx`: Integración de `driver.js`, adición del botón de "Guía Rápida" e identificadores de tour interactivo (`#tour-titulo-gestion`, `#tour-selector-curso`, `#tour-tabla-estudiantes`, `.tour-btn-eliminar-estudiante`).

**Tipo de Despliegue:** Frontend y Backend Local.

---

### [2026-09-09] - Optimización Visual y Truncamiento Flexbox en Lista de Archivos Disponibles

**Objetivo:** Eliminar el truncamiento prematuro de los nombres de archivos (`max-width: 180px`), evitar que los botones de acción ("Ver", "Descargar", "Eliminar") compriman el texto o consuman la totalidad del ancho disponible, y añadir soporte responsive para etiquetas y tooltip.

**Archivos Modificados:**
- `excel-app/src/components/excel/ExcelViewer.jsx`: Adición del atributo `title={f.filename}` en el elemento `<p>` del nombre de archivo, y envoltorio `<span className="btn-label">` en el texto de los botones Descargar y Eliminar con atributos `title` informativos.
- `excel-app/src/styles/components/excel/ExcelViewer.css`: 
  - Eliminación de la propiedad rígida `max-Width: 180px` en `.container_name_file p`.
  - Configuración de `flex: 1` y `min-width: 0` en `.container_name_file` para habilitar el aprovechamiento máximo de espacio y el correcto truncamiento con puntos suspensivos (`text-overflow: ellipsis`).
  - Adición de `flex-shrink: 0` en `.container_button` para asegurar que los botones mantengan sus dimensiones.
  - Implementación de media query `@media (max-width: 1400px)` ocultando `.btn-label` (convirtiendo los controles secundarios a botones de icono compactos) para liberar mas del 75% del espacio horizontal al texto del nombre.
- `excel-app/src/styles/pages/Archivos.css`: Ajuste de la columna izquierda `.archivos-col-izq` a `flex: 0 0 38%` y `min-width: 320px` para un diseño más amplio en escritorio.

**Tipo de Despliegue:** Frontend Local.

---

### [2026-09-09] - Eliminación de Confirmación Nativa Redundante (Bug Doble Confirmación en Archivos)

**Objetivo:** Corregir la incidencia de "doble confirmación" donde al intentar eliminar un archivo se disparaba simultáneamente el modal nativo `window.confirm` del navegador y el componente Modal personalizado de React.

**Archivos Modificados:**
- `excel-app/src/pages/Archivos.jsx`: Eliminación del llamado a `window.confirm()` y su validación asociada dentro de `handleDeleteFile`. El flujo de eliminación ahora depende exclusivamente del Modal modalizado de React (`ExcelViewer.jsx` / `Modal.jsx`).

**Tipo de Despliegue:** Frontend Local.

---

### [2026-09-09] - Corrección de Sobreajuste Polinomial (Criterio de Recomendación MIN S_yx y Principio de Parsimonia)

**Objetivo:** Eliminar el sesgo de sobreajuste (overfitting) por el cual los modelos polinomiales resultaban sobre-recomendados. Integrar el Principio de Parsimonia ponderado (factores 1.10 para Cuadrático y 1.30 para Cúbico) y normalización insensible a tildes/propiedades (`modelo`, `tipo` o `tipoModelo`), permitiendo que modelos simples como Cuadrático, Potencial y Recíproco reciban la recomendación favorita (⭐) cuando su ajuste real lo justifique.

**Archivos Modificados:**
- `excel-app/src/hooks/useCalculadoraExcel.js`: Actualización de la función de ordenación `.sort()` en la comparativa de regresión con normalización de cadena `normalize("NFD")` y factores de parsimonia sobre $S_{yx}$.

**Tipo de Despliegue:** Frontend Local.






