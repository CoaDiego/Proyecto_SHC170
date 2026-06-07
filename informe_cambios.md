# 📊 Informe Técnico de Desarrollo y Mejoras

Este documento detalla todas las modificaciones, refactorizaciones y correcciones de errores aplicadas el día de hoy en el proyecto **Software Estadístico**, tanto en el Frontend (React) como en el Backend (FastAPI), para implementar gestión por roles, verificar el estado del sistema, mejorar el diseño responsivo en móviles y robustecer el control de errores en producción.

---

## 🔍 Resumen General

Se han completado con éxito cinco áreas clave de desarrollo y depuración:
1. **Control de Acceso y Gestión por Roles (Docente vs. Admin):** Implementación de la gestión de alumnos matriculados por grupo para docentes, restricciones de listados y desmatriculación segura ("Eliminar estudiante").
2. **Sistema de Health Check & Polling:** Verificación de estado de base de datos activa antes de permitir el inicio de sesión con alertas flotantes tipo toast en la esquina inferior izquierda.
3. **Limpieza Visual & Estética Profesional:** Eliminación de emojis decorativos e iconos redundantes, mejorando la legibilidad en modo oscuro de desplegables y opciones.
4. **Diseño Responsivo en Móviles (Tablas y Navbar):** Conversión de tablas complejas de usuarios y alumnos a vistas de tarjetas apiladas interactivas. Posicionamiento del dropdown de notificaciones para evitar desbordamientos en pantallas pequeñas.
5. **Robustez y Despliegue en la Nube:** Creación automática de tablas al arrancar la API, control de fallos en endpoints críticos (evitando el Error 500) y apertura regulada de CORS para Vercel y entornos locales.

---

## 🛠️ Detalle de Cambios por Componente

### 1. Gestión de Estudiantes para el Rol "Docente" (RBAC)
*   **Nueva Interfaz Frontend:** Creamos [GestionDocente.jsx](file:///c:/Users/ASUS/Desktop/Semestre%201-2026/Trabajo%20Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/pages/GestionDocente.jsx) para proveer un panel de control limpio a los profesores. Incluye un selector dinámico de cursos/clases, listado de estudiantes y botón explícito para desmatricular alumnos con la etiqueta **"Eliminar estudiante"**.
*   **Endpoints de API Protegidos:** Añadimos endpoints clave en [grupos.py](file:///c:/Users/ASUS/Desktop/Semestre%201-2026/Trabajo%20Dirigido/Proyecto/Proyecto_SHC170/api_admin/routers/grupos.py) utilizando `Depends(get_current_user)` para:
    *   `GET /clases/mis-clases`: Filtra y retorna solo las clases asignadas al docente identificado por el token.
    *   `GET /clases/{clase_id}/estudiantes`: Carga la lista de estudiantes inscritos en dicho grupo.
    *   `DELETE /clases/{clase_id}/desmatricular/{estudiante_id}`: Permite desmatricular a un estudiante.
*   **Ruteo y Navegación Dinámica:**
    *   Registramos la ruta `/gestion-docente` en [App.jsx](file:///c:/Users/ASUS/Desktop/Semestre%201-2026/Trabajo%20Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/App.jsx).
    *   Modificamos [Menu.jsx](file:///c:/Users/ASUS/Desktop/Semestre%201-2026/Trabajo%20Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/components/ui/Menu.jsx) para remover el enlace directo a "Gestión alumnos" y crear en su lugar un dropdown para "Grupos" con dos opciones limpias ("Gestión Grupos" y "Gestión Alumnos"), visibles solo para usuarios autenticados con rol `Docente` o `Administrador`.

---

### 2. Health Check de Base de Datos y Polling de Inicio
*   **Endpoint `/health`:** En [main.py](file:///c:/Users/ASUS/Desktop/Semestre%201-2026/Trabajo%20Dirigido/Proyecto/Proyecto_SHC170/api_admin/main.py) añadimos un endpoint de verificación de salud de la base de datos que ejecuta una consulta SQL básica (`SELECT 1`). Si responde, retorna `{"status": "OK"}`. Si falla, maneja la excepción internamente retornando un mensaje descriptivo sin colapsar el servidor.
*   **Lógica de Login:** En [Login.jsx](file:///c:/Users/ASUS/Desktop/Semestre%201-2026/Trabajo%20Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/pages/Login.jsx), se implementó un sistema de sondeo periódico (polling) al montar el componente. Mientras la base de datos no responda con "OK", el botón de inicio de sesión permanece deshabilitado.
*   **Notificación Flotante:** Mostramos un toast flotante en la esquina inferior izquierda (`bottom: 20px; left: 20px;`) avisando al usuario que el servidor se está inicializando (mitigando los retrasos de cold start en Render).

---

### 3. Limpieza Visual e Interfaz Limpia
*   **Remoción de Emojis e Iconos:** Eliminamos iconos de engranajes (`⚙️`), advertencias y candados innecesarios del encabezado en [Admin.jsx](file:///c:/Users/ASUS/Desktop/Semestre%201-2026/Trabajo%20Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/pages/Admin.jsx), del perfil en [Perfil.jsx](file:///c:/Users/ASUS/Desktop/Semestre%201-2026/Trabajo%20Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/pages/Perfil.jsx) y de las vistas de [Grupos.jsx](file:///c:/Users/ASUS/Desktop/Semestre%201-2026/Trabajo%20Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/pages/Grupos.jsx).
*   **Lectura en Modo Oscuro:** Modificamos las clases CSS globales de inputs y dropdowns (`<select>` y `<option>`) para forzar colores de fondo y texto legibles en modo oscuro, evitando el problema de texto invisible (blanco sobre blanco).

---

### 4. Responsividad Extrema en Móviles (Tablas y Notificaciones)
*   **Tablas a Tarjetas (Admin y Docente):** En [App.css](file:///c:/Users/ASUS/Desktop/Semestre%201-2026/Trabajo%20Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/App.css) y de forma específica para `.tabla-responsiva-panel` (dentro de `@media screen and (max-width: 768px)`), transformamos el layout de tabla ocultando el `thead` y convirtiendo las filas `tr` y columnas `td` en bloques apilados con diseño de tarjeta.
*   **Etiquetas Dinámicas ::before:** Inyectamos etiquetas legibles a la izquierda de cada valor en el panel de administración (`USUARIO:`, `ROL:`, `ESTADO:`, `REGISTRO:`, `ACCIONES:`) para dar una lectura clara.
*   **Botones y Dropdowns Táctiles:** Agrandamos los botones de suspender y eliminar y los organizamos de forma fluida a lo ancho de la tarjeta para facilitar la interacción táctil en celulares.
*   **Dropdown de Notificaciones Infallible:** En [Menu.css](file:///c:/Users/ASUS/Desktop/Semestre%201-2026/Trabajo%20Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/styles/components/ui/Menu.css), modificamos la clase `.notif-dropdown` en móviles para usar `position: fixed !important; top: 70px !important; left: 5% !important; width: 90vw !important; right: auto !important; z-index: 9999 !important;`. Esto extrae la caja del flujo del navbar y la centra en la pantalla con el ancho del dispositivo, eliminando el desbordamiento hacia la izquierda.

---

### 5. Configuración de Red, CORS e Inicialización de BD en la Nube
*   **Orígenes de CORS Ampliados:** Actualizamos la lista de orígenes autorizados en [main.py](file:///c:/Users/ASUS/Desktop/Semestre%201-2026/Trabajo%20Dirigido/Proyecto/Proyecto_SHC170/api_admin/main.py) para incluir el puerto `3000` (desarrollo local secundario de React) y las URLs oficiales de producción en Vercel, permitiendo todos los métodos, cabeceras y credenciales de sesión.
*   **Creación de Tablas Automática:** Agregamos `models.Base.metadata.create_all(bind=engine)` en la inicialización de FastAPI en `main.py`. Al arrancar el servicio en Render, la API creará automáticamente las tablas faltantes (como `notificaciones`) sin corromper la información existente.
*   **Protección contra el Error 500:** Modificamos el endpoint `GET /notificaciones` en [notificaciones.py](file:///c:/Users/ASUS/Desktop/Semestre%201-2026/Trabajo%20Dirigido/Proyecto/Proyecto_SHC170/api_admin/routers/notificaciones.py) para capturar excepciones internas del driver SQL, imprimir los errores detalladamente en la consola del servidor de Render para fines de depuración y retornar un arreglo vacío `[]` al cliente para que la aplicación del navegador nunca colapse visualmente.

---

## 📈 Tabla Resumen de Archivos Modificados

| Módulo | Archivo | Acción | Propósito del Cambio |
| :--- | :--- | :--- | :--- |
| **Backend** | [main.py](file:///c:/Users/ASUS/Desktop/Semestre%201-2026/Trabajo%20Dirigido/Proyecto/Proyecto_SHC170/api_admin/main.py) | Modificado | Endpoint `/health`, importaciones de orígenes de CORS (puerto 3000) y creación automática de tablas físicas al iniciar. |
| **Backend** | [grupos.py](file:///c:/Users/ASUS/Desktop/Semestre%201-2026/Trabajo%20Dirigido/Proyecto/Proyecto_SHC170/api_admin/routers/grupos.py) | Modificado | Nuevos endpoints de consulta de clases por docente, estudiantes del grupo y desmatriculación de alumnos. |
| **Backend** | [notificaciones.py](file:///c:/Users/ASUS/Desktop/Semestre%201-2026/Trabajo%20Dirigido/Proyecto/Proyecto_SHC170/api_admin/routers/notificaciones.py) | Modificado | Manejo robusto de excepciones (try/except) en `GET /notificaciones` retornando fallback `[]` para mitigar errores 500. |
| **Frontend** | [App.css](file:///c:/Users/ASUS/Desktop/Semestre%201-2026/Trabajo%20Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/App.css) | Modificado | Media queries responsivos para transformar la tabla de administración `.tabla-responsiva-panel` a tarjetas legibles y botones táctiles. |
| **Frontend** | [Menu.css](file:///c:/Users/ASUS/Desktop/Semestre%201-2026/Trabajo%20Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/styles/components/ui/Menu.css) | Modificado | Centrado absoluto de dropdown de notificaciones móviles mediante posicionamiento `fixed` y distribución Flexbox en el navbar. |
| **Frontend** | [Menu.jsx](file:///c:/Users/ASUS/Desktop/Semestre%201-2026/Trabajo%20Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/components/ui/Menu.jsx) | Modificado | Estructura dropdown de grupos (Gestión Grupos / Gestión Alumnos), ruteo dinámico de roles y limpieza de emojis en el perfil. |
| **Frontend** | [App.jsx](file:///c:/Users/ASUS/Desktop/Semestre%201-2026/Trabajo%20Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/App.jsx) | Modificado | Registro de la ruta `/gestion-docente` y enlace con la sesión de usuario. |
| **Frontend** | [Admin.jsx](file:///c:/Users/ASUS/Desktop/Semestre%201-2026/Trabajo%20Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/pages/Admin.jsx) | Modificado | Clases responsivas en el marcado de tabla, títulos limpios sin emojis y buscador alineado al 100% de ancho en móviles. |
| **Frontend** | [Login.jsx](file:///c:/Users/ASUS/Desktop/Semestre%201-2026/Trabajo%20Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/pages/Login.jsx) | Modificado | Polling asíncrono `/health` al iniciar sesión y mensaje toast de espera posicionado en la esquina inferior izquierda. |
| **Frontend** | [Perfil.jsx](file:///c:/Users/ASUS/Desktop/Semestre%201-2026/Trabajo%20Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/pages/Perfil.jsx) | Modificado | Limpieza visual (eliminación de iconos de candados y tarjetas) y estilización con variables de tema nativas. |
| **Frontend** | [GestionDocente.jsx](file:///c:/Users/ASUS/Desktop/Semestre%201-2026/Trabajo%20Dirigido/Proyecto/Proyecto_SHC170/excel-app/src/pages/GestionDocente.jsx) | Nuevo | Componente principal para el rol docente con carga selectiva de cursos, roster de alumnos y desmatriculación de alumnos. |

---

> [!IMPORTANT]
> Todos los archivos modificados fueron compilados exitosamente mediante Vite y las actualizaciones han sido confirmadas e implementadas en la rama principal (`main`) de tu repositorio de GitHub.
