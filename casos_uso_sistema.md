# 📋 Especificación de Casos de Uso del Sistema

Este documento contiene la especificación formal y refinada de los **Casos de Uso (CU)** del **Software Estadístico**, reestructurados bajo los principios de arquitectura limpia. Se ha eliminado el uso de la conjunción "y" en los títulos para mantener conceptos únicos por módulo y se han separado rigurosamente los dominios de autenticación y de configuración de cuenta de usuario.

---

## 📂 Relación de Casos de Uso (CU)

---

### CU-01: Gestión de Autenticación

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-01 |
| **Título** | Gestión de Autenticación |
| **Actores** | Estudiante, Docente, Administrador |
| **Descripción** | Permite registrar nuevas cuentas de usuario en el sistema, realizar el inicio de sesión seguro mediante el intercambio de credenciales por tokens JWT y ejecutar el flujo de restablecimiento de contraseña mediante el envío de correos SMTP con tokens temporales de seguridad. |

---

### CU-02: Gestión de Cuenta de Usuario

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-02 |
| **Título** | Gestión de Cuenta de Usuario |
| **Actores** | Estudiante, Docente, Administrador |
| **Descripción** | Permite a los usuarios autenticados consultar su información personal, actualizar su contraseña activa, modificar sus datos y solicitar la auto-eliminación definitiva de sus registros y datos personales en el sistema. |

---

### CU-03: Gestión de Aulas Virtuales

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-03 |
| **Título** | Gestión de Aulas Virtuales |
| **Actores** | Docente, Administrador |
| **Descripción** | Permite a los docentes crear y eliminar aulas virtuales para sus asignaturas, así como generar y restablecer códigos de acceso únicos (`MAT-{id}-{hash}`) para controlar la entrada de alumnos. |

---

### CU-04: Matriculación de Estudiantes

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-04 |
| **Título** | Matriculación de Estudiantes |
| **Actores** | Estudiante |
| **Descripción** | Permite a los estudiantes ingresar un código alfanumérico único para vincularse de forma autónoma a una clase activa, obteniendo acceso a los recursos didácticos de dicha aula. |

---

### CU-05: Administración de Estudiantes

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-05 |
| **Título** | Administración de Estudiantes |
| **Actores** | Docente, Administrador |
| **Descripción** | Permite a los docentes visualizar la lista de estudiantes inscritos en sus respectivas aulas virtuales y desmatricularlos de forma controlada ("Eliminar estudiante") para revocar su acceso. |

---

### CU-06: Gestión de Archivos

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-06 |
| **Título** | Gestión de Archivos |
| **Actores** | Docente, Administrador |
| **Descripción** | Permite la carga de archivos de cálculo Excel (`.xlsx`) en el servidor, su visualización interactiva en formato tabular, la edición de celdas individuales y el guardado mediante tres estrategias distintas (sobrescribir actual, añadir como columna editada o crear una nueva pestaña). |

---

### CU-07: Preparación de Datos

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-07 |
| **Título** | Preparación de Datos |
| **Actores** | Estudiante, Docente, Administrador |
| **Descripción** | Permite interactuar con la planilla Excel cargada para seleccionar variables y columnas específicas, ordenar conjuntos numéricos o filtrar registros como fase previa a la ejecución de algoritmos estadísticos. |

---

### CU-08: Análisis de Estadística Descriptiva

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-08 |
| **Título** | Análisis de Estadística Descriptiva |
| **Actores** | Estudiante, Docente, Administrador |
| **Descripción** | Calcula las tablas de frecuencias por intervalos dinámicos para variables cuantitativas continuas o discretas (respetando la notación de intervalos y forzando el cierre del último intervalo), y computa medidas de tendencia central, dispersión y percentiles. |

---

### CU-09: Análisis de Correlación

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-09 |
| **Título** | Análisis de Correlación |
| **Actores** | Estudiante, Docente, Administrador |
| **Descripción** | Computa coeficientes de correlación de Pearson entre variables métricas pares, genera la recta de regresión por mínimos cuadrados ordinarios y evalúa estimaciones predictivas. |

---

### CU-10: Análisis de Series Temporales

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-10 |
| **Título** | Análisis de Series Temporales |
| **Actores** | Estudiante, Docente, Administrador |
| **Descripción** | Modela el comportamiento cronológico de variables y calcula números índices simples o compuestos de precios, cantidades o valor. |

---

### CU-11: Visualización de Gráficos

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-11 |
| **Título** | Visualización de Gráficos |
| **Actores** | Estudiante, Docente, Administrador |
| **Descripción** | Genera y renderiza histogramas, polígonos de frecuencia cerrados a cero en sus extremos y curvas acumulativas (ojivas) dinámicas con tooltips interactivos de lectura de datos. |

---

### CU-12: Exportación de Resultados

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-12 |
| **Título** | Exportación de Resultados |
| **Actores** | Estudiante, Docente, Administrador |
| **Descripción** | Permite descargar los reportes de análisis y gráficas generadas en formatos imprimibles de PDF, descargar planillas Excel modificadas o guardar gráficos como imágenes PNG. |

---

### CU-13: Gestión de Historial

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-13 |
| **Título** | Gestión de Historial |
| **Actores** | Estudiante, Docente, Administrador |
| **Descripción** | Permite a los usuarios acceder al catálogo de análisis pasados, cargar nuevamente en el frontend los datos serializados JSON del servidor o depurar elementos del historial. |

---

### CU-14: Gestión de Notificaciones

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-14 |
| **Título** | Gestión de Notificaciones |
| **Actores** | Estudiante, Docente, Administrador |
| **Descripción** | Muestra en tiempo real avisos globales del sistema o notificaciones de estado individuales, permitiendo marcarlas como leídas para actualizar las notificaciones activas. |

---

### CU-15: Administración del Sistema

| Elemento | Detalle |
| :--- | :--- |
| **ID** | CU-15 |
| **Título** | Administración del Sistema |
| **Actores** | Administrador |
| **Descripción** | Concede privilegios para supervisar usuarios, cambiar roles en base de datos, suspender/reactivar cuentas, eliminar registros globales y emitir comunicados de sistema. |

---

## 🛠️ Justificación de Cambios (Rediseño de Requisitos)

*   **Generalización de Títulos y Supresión de la Conjunción "Y":** Se renombraron títulos descriptivos dobles (ej: *"Carga y Gestión de Recursos"*) a conceptos únicos generales (ej: *"Gestión de Archivos"*). Esto elimina la ambigüedad en la definición de límites del Caso de Uso, dejando las acciones compuestas específicas para las Historias de Usuario individuales.
*   **División Estricta de Autenticación y Cuenta (CU-01 vs. CU-02):** Se separó la capa de acceso y seguridad (donde reside el control de logins JWT y envío SMTP) de la configuración personal de la cuenta del usuario (donde se realiza el cambio voluntario de datos y la auto-eliminación física). Esto protege el principio de segregación de responsabilidades.
*   **Inclusión del Administrador en Módulos Estadísticos:** Al actuar el Administrador como un superusuario en el sistema, cuenta con facultades para evaluar y auditar los análisis matemáticos realizados en la plataforma. Por ello, se le incluyó formalmente junto a Docentes y Estudiantes como actor activo en los CU de cálculo (CU-07 al CU-13).
