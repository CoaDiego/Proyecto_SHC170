# 📊 Informe Técnico de Cambios y Mejoras

Este documento detalla todas las modificaciones, refactorizaciones y correcciones de errores implementadas el día de hoy en el software estadístico, tanto para el Frontend (React) como para el Backend (FastAPI).

---

## 🔍 Resumen General

Se han completado con éxito dos fases de desarrollo orientadas a robustecer el sistema en áreas críticas como:
1. **Precisión Matemática-Estadística:** Notación de intervalos dinámicos y cierre del último intervalo.
2. **Visualizaciones de Gráficos:** Estructura de polígono cerrado e integración de ojivas puras.
3. **Seguridad y Organización en el Servidor:** Sanitización de nombres de directorios y carpetas de usuarios/historial.
4. **Experiencia de Usuario (UX) Avanzada:** Panel lateral colapsable fluido, visualizador de contraseñas, reseteo de código de matriculación y estrategias de guardado seguro no destructivas para archivos de Excel.

---

## 🛠️ Detalle de Cambios por Componente

### 1. Edición y Sincronización de Columnas (Calculadora de Estadística)
*   **Hook de Control:** En [useCalculadoraExcel.js](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/hooks/useCalculadoraExcel.js), añadimos la lógica para actualizar la estructura de datos local con la función `handleActualizarColumna`.
*   **Componente de Vista:** En [Calculos.jsx](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/pages/Calculos.jsx), colocamos un botón interactivo y un modal de edición que permite actualizar los valores celda por celda o copiando/pegando un bloque de valores completo. Al confirmar la edición, todos los cálculos del reporte e índices estadísticos se regeneran en tiempo real.

> [!TIP]
> Esto evita la necesidad de re-subir planillas Excel completas ante errores tipográficos mínimos.

---

### 2. Backend Seguro y Sanitización de Directorios (FastAPI)
*   **Modulo de Archivos:** En [archivos.py](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/api_admin/routers/archivos.py), creamos funciones helper para la creación estandarizada de directorios utilizando el formato `{nombre_sanitizado}_{id}` para evitar colisiones y fallos de permisos en el sistema operativo.
*   **Migración e Historial:** Refactorizamos [historial.py](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/api_admin/routers/historial.py) para que las carpetas del historial de análisis del usuario se generen bajo la misma lógica segura.

---

### 3. Interfaz de Usuario e Interacciones del Frontend
*   **Visibilidad de Contraseñas:** Se integró un toggle interactivo con icono SVG en [Login.jsx](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/pages/Login.jsx) para alternar el tipo de campo (`text`/`password`) y facilitar el login seguro.
*   **Reseteo de Cursos:** En [Grupos.jsx](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/pages/Grupos.jsx) y el backend en [grupos.py](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/api_admin/routers/grupos.py), añadimos un botón de restablecimiento para generar un nuevo código único `MAT-{id}-{hash}`.
*   **Panel Lateral Colapsable:** Optimizamos la transición css de colapso en [PanelConfiguracion.jsx](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/components/Resultados/PanelConfiguracion.jsx) y [PanelResultados.jsx](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/components/Resultados/PanelResultados.jsx), ajustando el ancho del menú a `0px` exactos, removiendo sombras y bordes al cerrarse de modo que el espacio de gráficos y tablas ocupe el ancho total libre.
*   **Ampliación del Tour:** Actualizamos la guía de `driver.js` para incluir pasos que expliquen y destaquen estas nuevas características del entorno de trabajo.

---

### 4. Precisión de Gráficos Estadísticos (Recharts)
*   **Polígono de Frecuencias Cerrado:** Modificamos el procesado de datos en [GraficoIntervalos.jsx](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/components/graficos/GraficoIntervalos.jsx) para inyectar dinámicamente dos extremos virtuales con frecuencia cero ($y=0$). Esto obliga al gráfico lineal a bajar y anclarse al eje horizontal $X$.
*   **Ojivas Estrictas:** Reemplazamos la librería de visualización en las curvas acumuladas por `<LineChart>` plano. Se quitaron los gradientes e iluminaciones inferiores de tipo `<AreaChart>` para eliminar lecturas visuales confusas sobre el área bajo la curva.

---

### 5. Lógica de Agrupación por Intervalos
*   **Control del Límite Superior:** Se corrigieron los algoritmos de cálculo para respetar la notación seleccionada (`[a, b)`, `(a, b)` o `[a, b]`).
*   **Regla Estadística Crítica:** Independientemente de la opción seleccionada, la lógica fuerza a que **el último intervalo siempre se cierre en ambos límites (`[a, b]`)**. Esto garantiza que el valor máximo de la muestra nunca quede fuera del rango acumulado.

---

### 6. Guardado No Destructivo (Excel de Entrada)
*   **Modal Multiópción:** Añadimos un modal interactivo en [ExcelContent.jsx](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/components/excel/ExcelContent.jsx) al disparar "Guardar Cambios" con tres estrategias:
    1.  `overwrite`: Sobrescribe la hoja Excel actual.
    2.  `new_column`: Agrega las columnas modificadas con la etiqueta `(Editado)`, preservando el histórico.
    3.  `new_sheet`: Escribe los cambios en una nueva pestaña incremental de nombre `Datos_Editados_X`.
*   **Backend Dynamic Payload:** En [api.js](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/services/api.js) and [archivos.py](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/api_admin/routers/archivos.py), modificamos la API para procesar y ejecutar cada una de estas estrategias a través de Pandas y `openpyxl`.

---

### 7. Sistema de Autenticación JWT, Cifrado Bcrypt y Control de Roles (RBAC)
*   **Cifrado Bcrypt & Retrocompatibilidad:** Implementamos en [auth.py](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/api_admin/routers/auth.py) el hashing de contraseñas mediante `passlib` y `bcrypt` al registrar nuevos usuarios. Diseñamos un mecanismo de validación con *fallback* para verificar contraseñas antiguas sin hashear (texto plano), previniendo que se bloquee a usuarios previos.
*   **JSON Web Tokens (JWT):** Configuramos la emisión de tokens JWT firmados en `/login_local`. El payload contiene el id, email y rol del usuario, con un tiempo de expiración de 24 horas. Los parámetros criptográficos (`SECRET_KEY`, `ALGORITHM`) son leídos de forma segura desde un archivo [.env](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/api_admin/.env).
*   **Control de Accesos (RBAC):** Desarrollamos las dependencias `get_current_user` y `require_role(allowed_roles)` para bloquear accesos no autorizados en el backend. Creamos los endpoints protegidos `/me` y `/docente-only` para comprobar el funcionamiento, y restringimos `/usuarios` y `/cambiar_rol` únicamente a administradores.
*   **Interceptor Global de Peticiones:** Añadimos un interceptor global sobre `window.fetch` en [main.jsx](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/main.jsx) para inyectar automáticamente la cabecera `Authorization: Bearer <token>` en todas las llamadas a la API y reaccionar a respuestas de estado `401 Unauthorized` limpiando el token e instruyendo la redirección del navegador.
*   **Persistencia de Sesión:** En [App.jsx](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/App.jsx) implementamos una llamada asíncrona de restauración de sesión basada en token que se ejecuta al montar la aplicación (F5), y un cargador elegante para evitar el parpadeo de pantallas internas no logueadas.

---

## 📈 Tabla Resumen de Archivos Tocados

| Módulo/Área | Archivo | Acción | Propósito |
| :--- | :--- | :--- | :--- |
| **Frontend** | [useCalculadoraExcel.js](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/hooks/useCalculadoraExcel.js) | Modificado | Hook de edición e integración de columna |
| **Frontend** | [Calculos.jsx](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/pages/Calculos.jsx) | Modificado | Modal de edición de datos y pasos del tour |
| **Frontend** | [PanelConfiguracion.jsx](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/components/Resultados/PanelConfiguracion.jsx) | Modificado | Gestión de transición colapsable lateral izquierda |
| **Frontend** | [PanelResultados.jsx](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/components/Resultados/PanelResultados.jsx) | Modificado | Ajuste responsivo de ancho ante colapso |
| **Frontend** | [Login.jsx](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/pages/Login.jsx) | Modificado | Icono interactivo para revelar contraseña y guardado de token en localStorage |
| **Frontend** | [Grupos.jsx](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/pages/Grupos.jsx) | Modificado | Botón para re-generar token de matriculación |
| **Frontend** | [GraficoIntervalos.jsx](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/components/graficos/GraficoIntervalos.jsx) | Modificado | Polígono de frecuencia cerrado y ojivas planas |
| **Frontend** | [ExcelContent.jsx](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/components/excel/ExcelContent.jsx) | Modificado | Modal interactivo de guardado multi-estrategia |
| **Frontend** | [api.js](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/services/api.js) | Modificado | Estructura de payload con parámetro de guardado y endpoint de verificación `/me` |
| **Frontend** | [main.jsx](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/main.jsx) | Modificado | Interceptor global de fetch para inyectar token JWT y redirección 401 |
| **Frontend** | [App.jsx](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/App.jsx) | Modificado | Validación y restauración de sesión al arrancar la app con pantalla de carga |
| **Frontend** | [Perfil.jsx](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/pages/Perfil.jsx) | Modificado | Limpieza de token de localStorage al cerrar sesión y eliminar cuenta |
| **Backend** | [archivos.py](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/api_admin/routers/archivos.py) | Modificado | Lógica de guardado en Excel y sanitización de nombres |
| **Backend** | [historial.py](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/api_admin/routers/historial.py) | Modificado | Carpetas seguras para reportes históricos |
| **Backend** | [grupos.py](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/api_admin/routers/grupos.py) | Modificado | Lógica de base de datos para resetear token de grupo |
| **Backend** | [requirements.txt](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/api_admin/requirements.txt) | Modificado | Inclusión de pyjwt, passlib, bcrypt y python-dotenv |
| **Backend** | [.env](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/api_admin/.env) | Nuevo | Clave secreta y algoritmo de firma de tokens JWT |
| **Backend** | [main.py](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/api_admin/main.py) | Modificado | Carga inicial de variables de entorno mediante load_dotenv |
| **Backend** | [auth.py](file:///c:/Users/ASUS/Desktop/Semestre 1-2026/Trabajo Dirigido/Proyecto/Proyecto_SHC170/api_admin/routers/auth.py) | Modificado | Hashing de passwords, login JWT, dependencias de seguridad y endpoints de prueba |

---

> [!IMPORTANT]
> Todos los cambios han sido validados localmente y se encuentran listos para revisión y despliegue final en producción.
