# 📋 Especificación Funcional: Casos de Uso del Sistema (Memoria Técnica)

Este documento contiene la especificación formal y refinada de los **Casos de Uso (CU)** del **Software Estadístico**, diseñada a partir de la arquitectura física del código (React en Frontend y FastAPI en Backend). La estructura de los casos de uso está optimizada para su incorporación directa en la memoria técnica de tu **Trabajo Dirigido**.

---

## 🔍 1. Relación General de Casos de Uso Propuestos

A continuación se detallan las especificaciones individuales para cada uno de los 15 Casos de Uso identificados en la arquitectura del sistema.

### CU-01: Control de Acceso y Recuperación de Credenciales

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-01 |
| **Título** | Control de Acceso y Recuperación de Credenciales |
| **Actores** | Estudiante, Docente, Administrador |
| **Descripción** | Permite el registro de nuevas cuentas de usuario en el sistema, la autenticación segura mediante el intercambio de credenciales por tokens JWT (JSON Web Tokens) y la solicitud/ejecución del flujo de recuperación de contraseñas olvidadas por medio de un enlace de seguridad temporal enviado al correo electrónico. |

---

### CU-02: Gestión del Perfil de Usuario

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-02 |
| **Título** | Gestión del Perfil de Usuario |
| **Actores** | Estudiante, Docente, Administrador |
| **Descripción** | Permite a un usuario autenticado consultar la información registrada de su cuenta (nombre, rol, institución de origen), modificar sus datos generales, actualizar su contraseña activa o solicitar la baja definitiva (eliminación) de sus datos y registros personales del sistema. |

---

### CU-03: Gestión de Aulas Virtuales y Grupos

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-03 |
| **Título** | Gestión de Aulas Virtuales y Grupos |
| **Actores** | Docente, Administrador |
| **Descripción** | Permite la creación de nuevas aulas virtuales (grupos académicos de materia) asignándoles un nombre y parámetros temporales, la edición de su código único de matriculación externa (`MAT-{id}-{hash}`) y la eliminación definitiva del grupo junto con sus inscripciones asociadas. |

---

### CU-04: Matriculación en Aulas Virtuales

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-04 |
| **Título** | Matriculación en Aulas Virtuales |
| **Actores** | Estudiante |
| **Descripción** | Permite a un estudiante matriculado ingresar un código alfanumérico único para vincularse de manera autónoma a un aula virtual abierta por un docente, ganando acceso a los recursos asignados a dicho grupo. |

---

### CU-05: Control y Seguimiento de Estudiantes

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-05 |
| **Título** | Control y Seguimiento de Estudiantes |
| **Actores** | Docente, Administrador |
| **Descripción** | Permite a los docentes visualizar el roster completo de estudiantes inscritos en sus clases y desmatricularlos de forma controlada ("Eliminar estudiante") para revocar su acceso al material y reportes del curso. |

---

### CU-06: Gestión de Archivos de Datos (Planillas Excel)

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-06 |
| **Título** | Gestión de Archivos de Datos (Planillas Excel) |
| **Actores** | Docente, Administrador |
| **Descripción** | Permite subir archivos de cálculo Excel (`.xlsx`) al servidor, estructurarlos internamente en base de datos y cargarlos en un visor tabular interactivo que soporta la edición de celdas y la aplicación de tres estrategias de guardado (sobrescribir actual, añadir como columna editada o crear una nueva pestaña). |

---

### CU-07: Selección y Preparación de Variables para Análisis

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-07 |
| **Título** | Selección y Preparación de Variables para Análisis |
| **Actores** | Estudiante, Docente, Administrador |
| **Descripción** | Permite a los usuarios seleccionar variables cuantitativas o cualitativas específicas de la planilla cargada, filtrar filas no requeridas u ordenar arreglos numéricos como paso previo y obligatorio a la parametrización de cálculos matemáticos. |

---

### CU-08: Análisis de Estadística Descriptiva de Frecuencias

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-08 |
| **Título** | Análisis de Estadística Descriptiva de Frecuencias |
| **Actores** | Estudiante, Docente, Administrador |
| **Descripción** | Calcula de forma automatizada las tablas de distribución de frecuencias para variables continuas o discretas (bajo notaciones de intervalos abiertos/cerrados personalizables), y computa medidas de tendencia central (media, mediana, moda), medidas de dispersión (varianza, desviación estándar) y cuantiles. |

---

### CU-09: Análisis de Correlación y Modelos Predictivos

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-09 |
| **Título** | Análisis de Correlación y Modelos Predictivos |
| **Actores** | Estudiante, Docente, Administrador |
| **Descripción** | Computa el coeficiente de correlación lineal de Pearson entre dos variables métricas, genera la ecuación de la recta de regresión por mínimos cuadrados ordinarios y evalúa estimaciones predictivas basadas en datos independientes de entrada. |

---

### CU-10: Análisis de Series de Tiempo e Indicadores

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-10 |
| **Título** | Análisis de Series de Tiempo e Indicadores |
| **Actores** | Estudiante, Docente, Administrador |
| **Descripción** | Permite el análisis cronológico de variables temporales, identificando tendencias a largo plazo y calculando números índices simples y compuestos de precios, cantidad o valor para análisis socioeconómicos. |

---

### CU-11: Visualización Interactiva de Gráficos Estadísticos

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-11 |
| **Título** | Visualización Interactiva de Gráficos Estadísticos |
| **Actores** | Estudiante, Docente, Administrador |
| **Descripción** | Renderiza gráficas dinámicas basadas en los análisis procesados (histogramas estructurados, polígonos de frecuencia con extremos cerrados a cero y ojivas lineales acumulativas), ofreciendo leyendas interactivas y tooltips informativos sobre los puntos de datos. |

---

### CU-12: Exportación y Reportes de Resultados

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-12 |
| **Título** | Exportación y Reportes de Resultados |
| **Actores** | Estudiante, Docente, Administrador |
| **Descripción** | Genera reportes listos para impresión de las tablas de datos, estadísticas descriptivas y diagramas generados. Permite la exportación en formatos como PDF estructurado, descarga de planillas Excel modificadas o almacenamiento directo de gráficos en formato de imagen PNG. |

---

### CU-13: Gestión del Historial de Análisis

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-13 |
| **Título** | Gestión del Historial de Análisis |
| **Actores** | Estudiante, Docente, Administrador |
| **Descripción** | Permite acceder a una bitácora centralizada que archiva cada cálculo guardado por el usuario, brindando la posibilidad de recargar la información (mediante lectura de datos JSON guardados en backend) para visualizarlos de nuevo en pantalla o eliminar registros obsoletos del historial. |

---

### CU-14: Gestión y Consumo de Notificaciones

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-14 |
| **Título** | Gestión y Consumo de Notificaciones |
| **Actores** | Estudiante, Docente, Administrador |
| **Descripción** | Permite a los usuarios recibir avisos dirigidos a su perfil individual (ej: avisos de matriculación) o alertas generales publicadas de forma global por administradores, marcándolas como leídas y manteniendo el contador del Navbar sincronizado. |

---

### CU-15: Administración Centralizada del Sistema

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-15 |
| **Título** | Administración Centralizada del Sistema |
| **Actores** | Administrador |
| **Descripción** | Concede privilegios globales al rol administrador para auditar y gestionar el padrón de usuarios registrados. Incluye modificar roles de acceso en la base de datos, suspender o reactivar cuentas temporalmente, eliminar cuentas restringidas y publicar alertas/notificaciones de sistema globales. |

---

## 🛠️ 2. Justificación Técnica de la Reestructuración

Como Ingeniero de Requisitos y Arquitecto de Software, he refinado y expandido la lista preliminar de 12 a 15 Casos de Uso basándome en las siguientes observaciones del código del proyecto:

1.  **Segregación del Perfil y Control de Acceso (Separación de CU-01 en CU-01 y CU-02):**
    *   *Razón:* La autenticación (`auth.py` y `Login.jsx`) se gestiona mediante tokens JWT efímeros y encriptación SHA-256/Bcrypt con flujos externos de restablecimiento de contraseña vía correo electrónico. En contraste, la gestión del perfil (`Perfil.jsx` y endpoints de `/usuarios`) realiza modificaciones físicas directas sobre la base de datos de usuarios e incluye el borrado lógico/físico de la cuenta del usuario en sesión, exigiendo procesos de negocio aislados.
2.  **Aislamiento del Módulo de Notificaciones (Inclusión de CU-14):**
    *   *Razón:* La arquitectura física del código cuenta con un enrutador modularizado específico (`notificaciones.py`) y una tabla física (`notificaciones`) en el esquema de base de datos relacional. El Navbar (`Menu.jsx`) incluye una campana interactiva y badges dinámicos que se actualizan de forma asíncrona mediante sondeo, lo cual representa una funcionalidad funcional sustancial que amerita un caso de uso independiente.
3.  **Independencia de la Gestión de Estudiantes (Separación de CU-03 y CU-05):**
    *   *Razón:* Se separó para dotar al docente de responsabilidades específicas de seguimiento. Mientras que la matriculación y aulas son parte del flujo curricular ordinario de grupos (`Grupos.jsx`), el listado y la revocación de matrícula ("Eliminar estudiante") se implementaron en un componente separado (`GestionDocente.jsx`) que interactúa con endpoints de desmatriculación dedicados en `grupos.py`.
4.  **Delimitación de la Administración Centralizada (CU-15):**
    *   *Razón:* Tu código implementa un Panel de Administración (`Admin.jsx`) y endpoints en el backend reservados con validación de roles (`require_role("Administrador")`) que alteran el comportamiento del sistema (como suspender cuentas mediante cambios en el flag `activo` en la base de datos). Para resguardar el principio de menor privilegio, las actividades exclusivas de administración no deben mezclarse con la gestión común de perfiles.
