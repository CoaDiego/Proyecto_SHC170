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

