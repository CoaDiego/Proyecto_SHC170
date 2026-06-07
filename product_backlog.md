# 📋 Especificación del Product Backlog del Sistema

Este documento contiene la especificación formal y detallada del **Product Backlog** del **Software Estadístico**, estructurado bajo los principios de la metodología Scrum. Al ser un proyecto desarrollado de manera unipersonal por un **único ingeniero**, el backlog refleja el esfuerzo individual y la velocidad de desarrollo real, incluyendo la adaptación del cronograma mediante un sprint adicional (Sprint 5) para absorber la deuda técnica y los desbordamientos de los sprints anteriores.

---

## 📋 Resumen del Plan de Sprints y Fases de Desarrollo

El desarrollo se planificó inicialmente en tres fases (16 semanas). Sin embargo, debido a desviaciones técnicas y nuevos requerimientos aprobados en las revisiones, se incorporó una cuarta fase de estabilización en la actualidad.

### Fase 1: Fundamentos y Análisis Descriptivo (Semanas 1 a 8)

*   **Sprint 1: Módulo de Estadística Descriptiva (Temas 3 y 4)**
    *   **Duración:** Semanas 1 a 4 (120 horas de programación).
    *   **Objetivos:** Refactorización de la lógica heredada del Tema 2, desarrollo de algoritmos descriptivos, lectura de archivos Excel e implementación de las vistas de Archivos y Calculadora.
    *   **Desempeño:** Completado. Las horas de holgura se destinaron a corregir errores de diseño iniciales de la interfaz de usuario.
*   **Sprint 2: Módulo de Correlación y Predicción (Temas 5 y 6)**
    *   **Duración:** Semanas 5 a 8 (120 horas de programación).
    *   **Objetivos:** Programación algorítmica de análisis bivariante y regresiones. Migración a código modular y edición de datos en tiempo real.
    *   **Desempeño:** Completado con deuda técnica. El módulo de visualización de cálculos paso a paso quedó inconcluso.

*   **Revisión de Avance (Release 1):** Evaluación de la interactividad del selector de columnas en tiempo real, corrección técnica en Boxplot y ajuste de gráficos con líneas rectas de mayor precisión.

### Fase 2: Series de Tiempo y Optimización de Interfaz (Semanas 9 a 12)

*   **Sprint 3: Módulo de Series de Tiempo e Índices (Temas 7 y 8)**
    *   **Duración:** Semanas 9 a 12 (120 horas de programación).
    *   **Objetivos:** Implementación de Series de Tiempo (Tema 7), controles interactivos en gráficos, diccionario de resultados, copiado rápido a Excel y resolución de la deuda del Release 1.
    *   **Desempeño:** Completado con retraso técnico. El desarrollo del Tema 8 (Números Índices) quedó pendiente debido a la alta complejidad algorítmica de sus fórmulas.

*   **Revisión de Avance (Release 2):** Aprobación de correcciones. Incorporación de nuevos requerimientos críticos: módulo de exportación a PDF/imágenes e historial de cálculos guardados.

### Fase 3: Gestión de Usuarios y Entorno de Producción (Semanas 13 a 16)

*   **Sprint 4: Módulo de Gestión de Usuarios y Reportes**
    *   **Duración:** Semanas 13 a 16 (120 horas de programación).
    *   **Objetivos:** Culminación del Tema 8 de Series Temporales (pendiente del Sprint 3), configuración de base de datos MySQL, inicio de sesión (JWT) y perfiles. Implementación de reportes PDF e historial (solicitados en el Release 2).
    *   **Desempeño:** Completado con retraso técnico. La integración final de la lógica entre gestión de usuarios, archivos compartidos y acceso a cursos quedó pendiente.

*   **Revisión de Avance (Release 3):** Visto bueno general del despliegue básico del sistema integrado de los Temas 2 al 8. Presentación del avance oficial y traspaso de la materia a un nuevo colaborador para los módulos posteriores. Solicitud de refinamientos visuales menores.

### Fase 4: Estabilización (Semanas 17 a 18 - Actualidad)

*   **Sprint 5: Refinamiento y Cierre de Gestión (Creado por Desviaciones)**
    *   **Duración:** Semanas 17 y 18 (En ejecución, primera semana de junio de 2026).
    *   **Objetivos:** Finalización de la estructura de tablas de usuarios, restricciones de rutas por rol, y vinculación de aulas virtuales con códigos de acceso y archivos (pendiente del Sprint 4). Estandarización de rutas de directorios sin tildes para garantizar estabilidad en la consola de Windows.

---

## 📊 Tabla del Product Backlog

| ID PBI | Caso de Uso Asociado | Título del Product Backlog Item | Historia de Usuario | Sprint y Estado |
| :--- | :--- | :--- | :--- | :--- |
| **PBI-01.1** | CU-01: Gestión de Autenticación | Registro de Usuarios | Como Estudiante o Docente quiero crear una cuenta para poder acceder a las herramientas del software. | Sprint 4 (Terminado) |
| **PBI-01.2** | CU-01: Gestión de Autenticación | Inicio de Sesión Seguro (JWT) | Como Usuario quiero autenticarme con credenciales seguras para resguardar mis datos e historial. | Sprint 4 (Terminado) |
| **PBI-01.3** | CU-01: Gestión de Autenticación | Recuperación de Contraseña (SMTP) | Como Usuario quiero restablecer mi contraseña olvidada por correo para no perder mi cuenta. | Sprint 4 (Terminado) |
| **PBI-02.1** | CU-02: Gestión de Cuenta de Usuario | Modificación de Perfil | Como Usuario quiero editar mis datos generales e institución para mantener mi registro actualizado. | Sprint 4 (Terminado) |
| **PBI-02.2** | CU-02: Gestión de Cuenta de Usuario | Cambio de Contraseña Activa | Como Usuario quiero renovar mi clave de seguridad actual para prevenir accesos no autorizados. | Sprint 4 (Terminado) |
| **PBI-02.3** | CU-02: Gestión de Cuenta de Usuario | Auto-eliminación de Cuenta | Como Usuario quiero eliminar mi perfil permanentemente para resguardar mi privacidad. | Sprint 4 (Terminado) |
| **PBI-03.1** | CU-03: Gestión de Aulas Virtuales | Creación de Aulas Virtuales | Como Docente quiero abrir clases o grupos con códigos de acceso para organizar mis materias. | Sprint 5 (En Ejecución) |
| **PBI-03.2** | CU-03: Gestión de Aulas Virtuales | Re-generación de Códigos Únicos | Como Docente quiero restablecer el código de un grupo para bloquear el ingreso de nuevos alumnos. | Sprint 5 (En Ejecución) |
| **PBI-03.3** | CU-03: Gestión de Aulas Virtuales | Eliminación de Aulas Virtuales | Como Docente quiero borrar grupos académicos inactivos para depurar mi panel principal. | Sprint 5 (En Ejecución) |
| **PBI-04.1** | CU-04: Matriculación de Estudiantes | Validación de Código de Acceso | Como Estudiante quiero validar el código provisto por el docente para verificar que el grupo sea correcto. | Sprint 5 (En Ejecución) |
| **PBI-04.2** | CU-04: Matriculación de Estudiantes | Inscripción en Aulas Activas | Como Estudiante quiero unirme a una clase validada para acceder a las planillas y ejercicios. | Sprint 5 (En Ejecución) |
| **PBI-05.1** | CU-05: Administración de Estudiantes | Reporte de Alumnos Matriculados | Como Docente o Administrador quiero visualizar la lista de inscritos en una clase para controlar la asistencia. | Sprint 5 (En Ejecución) |
| **PBI-05.2** | CU-05: Administración de Estudiantes | Desmatriculación Activa ("Eliminar estudiante") | Como Docente o Administrador quiero remover a un alumno de mi grupo para revocar sus accesos. | Sprint 5 (En Ejecución) |
| **PBI-06.1** | CU-06: Gestión de Archivos | Ingesta de Planillas Excel | Como Docente o Administrador quiero subir archivos Excel (.xlsx) para iniciar el análisis estadístico. | Sprint 1 (Terminado) |
| **PBI-06.2** | CU-06: Gestión de Archivos | Visor Tabular de Datos | Como Usuario o Administrador quiero explorar los datos del Excel en una tabla interactiva para entender la muestra. | Sprint 1 (Terminado) |
| **PBI-06.3** | CU-06: Gestión de Archivos | Edición Directa de Celdas | Como Usuario o Administrador quiero editar celdas en el navegador para corregir errores de dedo. | Sprint 2 (Terminado) |
| **PBI-06.4** | CU-06: Gestión de Archivos | Guardado Versátil de Planillas | Como Docente o Administrador quiero decidir si sobrescribir, agregar columnas o crear hojas en el archivo. | Sprint 2 (Terminado) |
| **PBI-07.1** | CU-07: Preparación de Datos | Selección de Variables | Como Usuario o Administrador quiero escoger qué columna numérica analizar para aplicar las fórmulas correctas. | Sprint 1 (Terminado) |
| **PBI-07.2** | CU-07: Preparación de Datos | Filtros y Ordenamiento | Como Usuario o Administrador quiero ordenar o filtrar la variable elegida para depurar la muestra. | Sprint 2 (Terminado) |
| **PBI-08.1** | CU-08: Procesamiento de Estadística Descriptiva | Tabla de Distribución de Frecuencias | Como Usuario o Administrador quiero agrupar los datos por intervalos coherentes para resumir la muestra. | Sprint 1 (Terminado) |
| **PBI-08.2** | CU-08: Procesamiento de Estadística Descriptiva | Medidas de Tendencia Central | Como Usuario o Administrador quiero computar la media, mediana y moda para medir el centro de la distribución. | Sprint 1 (Terminado) |
| **PBI-08.3** | CU-08: Procesamiento de Estadística Descriptiva | Medidas de Variabilidad y Percentiles | Como Usuario o Administrador quiero calcular varianza, desviación y percentiles para evaluar la dispersión. | Sprint 1 (Terminado) |
| **PBI-09.1** | CU-09: Análisis de Correlación | Coeficiente de Pearson | Como Usuario o Administrador quiero computar la correlación lineal para verificar la relación de dos variables. | Sprint 2 (Terminado) |
| **PBI-09.2** | CU-09: Análisis de Correlación | Recta de Regresión Lineal | Como Usuario o Administrador quiero obtener la ecuación de la recta para modelar el comportamiento bivariado. | Sprint 2 (Terminado) |
| **PBI-09.3** | CU-09: Análisis de Correlación | Predicciones del Modelo | Como Usuario o Administrador quiero ingresar valores y estimar proyecciones basadas en la regresión. | Sprint 2 (Terminado) |
| **PBI-10.1** | CU-10: Análisis de Series Temporales | Tendencias Históricas (Tema 7) | Como Usuario o Administrador quiero calcular tendencias a largo plazo para evaluar series cronológicas. | Sprint 3 (Terminado) |
| **PBI-10.2** | CU-10: Análisis de Series Temporales | Índices de Precios y Cantidades (Tema 8) | Como Usuario o Administrador quiero estimar índices compuestos para analizar variaciones socioeconómicas. | Sprint 4 (Terminado - Retrasado de Sprint 3) |
| **PBI-11.1** | CU-11: Visualización de Gráficos | Histogramas Dinámicos | Como Usuario o Administrador quiero generar histogramas de frecuencia para evaluar visualmente la variable. | Sprint 1 (Terminado) |
| **PBI-11.2** | CU-11: Visualización de Gráficos | Polígonos de Extremos Cerrados y Ojivas | Como Usuario o Administrador quiero ver polígonos anclados a cero y curvas ojivas acumulativas para reportar datos. | Sprint 3 (Terminado) |
| **PBI-12.1** | CU-12: Exportación de Resultados | Copiado Rápido a Portapapeles | Como Usuario o Administrador quiero copiar tablas directamente en formato Excel para abrirlas en otro software. | Sprint 3 (Terminado) |
| **PBI-12.2** | CU-12: Exportación de Resultados | Reporte de Resultados en PDF | Como Usuario o Administrador quiero exportar un PDF con mis tablas y gráficos para mis entregas formales. | Sprint 4 (Terminado - Solicitud de Release 2) |
| **PBI-12.3** | CU-12: Exportación de Resultados | Exportación de Gráficos a Imagen | Como Usuario o Administrador quiero guardar los gráficos en imágenes PNG para insertarlos en otros informes. | Sprint 4 (Terminado - Solicitud de Release 2) |
| **PBI-13.1** | CU-13: Gestión de Historial | Bitácora de Análisis Guardados | Como Usuario o Administrador quiero acceder a mi historial para revisar mis actividades previas. | Sprint 4 (Terminado - Solicitud de Release 2) |
| **PBI-13.2** | CU-13: Gestión de Historial | Re-renderizado de Reportes pasados | Como Usuario o Administrador quiero restaurar en pantalla un cálculo de mi bitácora a partir de su JSON. | Sprint 4 (Terminado - Solicitud de Release 2) |
| **PBI-13.3** | CU-13: Gestión de Historial | Depuración de Bitácora | Como Usuario o Administrador quiero borrar registros de mi historial para mantener limpio mi listado. | Sprint 4 (Terminado - Solicitud de Release 2) |
| **PBI-14.1** | CU-14: Gestión de Notificaciones | Consumo de Avisos Personales y Globales | Como Usuario o Administrador quiero ver alertas de sistema y de aula en tiempo real para estar informado. | Sprint 5 (En Ejecución) |
| **PBI-14.2** | CU-14: Gestión de Notificaciones | Marcado y Limpieza de Alertas | Como Usuario o Administrador quiero marcar los avisos como leídos para vaciar el contador del Navbar. | Sprint 5 (En Ejecución) |
| **PBI-15.1** | CU-15: Administración del Sistema | Dashboard General de Usuarios | Como Administrador quiero ver la lista global de usuarios registrados para auditar la plataforma. | Sprint 5 (En Ejecución) |
| **PBI-15.2** | CU-15: Administración del Sistema | Regulación de Roles y Estados | Como Administrador quiero suspender cuentas o alterar roles para proteger los accesos del sistema. | Sprint 5 (En Ejecución) |
| **PBI-15.3** | CU-15: Administración del Sistema | Emisión de Anuncios de Sistema | Como Administrador quiero redactar alertas globales para notificar mantenimientos a los usuarios. | Sprint 5 (En Ejecución) |

---

## ⚙️ Notas de Planificación y Gestión de Desviaciones

El desarrollo de la aplicación por un único ingeniero requirió de una gestión activa de las desviaciones y la deuda técnica acumulada:

*   **Sprint 1 (Holgura de Inicio):** La implementación se completó según lo estimado. El tiempo excedente se destinó al rediseño visual de las vistas principales del frontend.
*   **Sprint 2 (Acumulación de Deuda):** La complejidad en el motor matemático forzó a posponer el desglose "paso a paso" de las fórmulas, registrándolo como deuda técnica pendiente.
*   **Sprint 3 (Retraso y Desbordamiento):** La lógica de series de tiempo (Tema 7) y los ajustes del Release 1 (como Boxplot y líneas rectas) consumieron las horas de desarrollo presupuestadas. El desarrollo del Tema 8 (Números Índices) debió postergarse oficialmente, lo que alteró la planificación inicial de 4 sprints.
*   **Sprint 4 (Incorporación de Nuevos Requerimientos y Traslado):** Se completó el Tema 8 pendiente y se absorbieron los requerimientos del Release 2 (PDF e Historial). Sin embargo, esto causó un nuevo desbordamiento, dejando pendiente la integración del control de acceso a cursos, la gestión académica y archivos compartidos.
*   **Sprint 5 (Estabilización y Cierre Técnico):** Diseñado específicamente para absorber la deuda de integración del Sprint 4, estructurar las restricciones de rol en las rutas y garantizar la estabilidad del sistema mediante rutas de directorios limpias. Actualmente se encuentra en ejecución.
