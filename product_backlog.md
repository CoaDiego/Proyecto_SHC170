# 📋 Especificación del Product Backlog del Sistema

Este documento contiene la especificación formal y detallada del **Product Backlog** del **Software Estadístico**, estructurado bajo los principios de la metodología Scrum. Al ser un proyecto desarrollado de manera unipersonal por un **único ingeniero**, el backlog ha sido dimensionado para reflejar fielmente el esfuerzo individual y la velocidad de desarrollo real a lo largo de los sprints.

---

## 📋 Resumen del Plan de Sprints

A continuación, se presenta la distribución cronológica y los objetivos generales definidos para cada periodo de desarrollo:

*   **Sprint 1:** Implementación del motor analítico descriptivo básico, ingesta inicial de planillas de cálculo y generación de gráficos base.
*   **Sprint 2:** Incorporación del módulo de regresión y correlación lineal bivariada, junto con el desarrollo de la tabla de visualización dinámica de datos.
*   **Sprint 3:** Desarrollo de algoritmos de series temporales correspondientes al Tema 7 y optimización de herramientas de exportación tabular directa.
*   **Sprint 4:** Finalización del Tema 8 de series temporales, desarrollo de la capa de seguridad, autenticación, gestión del perfil del usuario e historial de reportes.
*   **Sprint 5:** Desarrollo del entorno colaborativo de aulas virtuales, matriculación de estudiantes, administración académica y el panel del administrador del sistema.

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
| **PBI-03.1** | CU-03: Gestión de Aulas Virtuales | Creación de Aulas Virtuales | Como Docente quiero abrir clases o grupos con códigos de acceso para organizar mis materias. | Sprint 5 (Terminado) |
| **PBI-03.2** | CU-03: Gestión de Aulas Virtuales | Re-generación de Códigos Únicos | Como Docente quiero restablecer el código de un grupo para bloquear el ingreso de nuevos alumnos. | Sprint 5 (Terminado) |
| **PBI-03.3** | CU-03: Gestión de Aulas Virtuales | Eliminación de Aulas Virtuales | Como Docente quiero borrar grupos académicos inactivos para depurar mi panel principal. | Sprint 5 (Terminado) |
| **PBI-04.1** | CU-04: Matriculación de Estudiantes | Validación de Código de Acceso | Como Estudiante quiero validar el código provisto por el docente para verificar que el grupo sea correcto. | Sprint 5 (Terminado) |
| **PBI-04.2** | CU-04: Matriculación de Estudiantes | Inscripción en Aulas Activas | Como Estudiante quiero unirme a una clase validada para acceder a las planillas y ejercicios. | Sprint 5 (Terminado) |
| **PBI-05.1** | CU-05: Administración de Estudiantes | Reporte de Alumnos Matriculados | Como Docente o Administrador quiero visualizar la lista de inscritos en una clase para controlar la asistencia. | Sprint 5 (Terminado) |
| **PBI-05.2** | CU-05: Administración de Estudiantes | Desmatriculación Activa ("Eliminar estudiante") | Como Docente o Administrador quiero remover a un alumno de mi grupo para revocar sus accesos. | Sprint 5 (Terminado) |
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
| **PBI-10.2** | CU-10: Análisis de Series Temporales | Índices de Precios y Cantidades (Tema 8) | Como Usuario o Administrador quiero estimar índices compuestos para analizar variaciones socioeconómicas. | Sprint 3 -> Aplazado y terminado en Sprint 4 |
| **PBI-11.1** | CU-11: Visualización de Gráficos | Histogramas Dinámicos | Como Usuario o Administrador quiero generar histogramas de frecuencia para evaluar visualmente la variable. | Sprint 1 (Terminado) |
| **PBI-11.2** | CU-11: Visualización de Gráficos | Polígonos de Extremos Cerrados y Ojivas | Como Usuario o Administrador quiero ver polígonos anclados a cero y curvas ojivas acumulativas para reportar datos. | Sprint 3 (Terminado) |
| **PBI-12.1** | CU-12: Exportación de Resultados | Copiado Rápido a Portapapeles | Como Usuario o Administrador quiero copiar tablas directamente en formato Excel para abrirlas en otro software. | Sprint 3 (Terminado) |
| **PBI-12.2** | CU-12: Exportación de Resultados | Reporte de Resultados en PDF | Como Usuario o Administrador quiero exportar un PDF con mis tablas y gráficos para mis entregas formales. | Sprint 4 (Terminado) |
| **PBI-12.3** | CU-12: Exportación de Resultados | Exportación de Gráficos a Imagen | Como Usuario o Administrador quiero guardar los gráficos en imágenes PNG para insertarlos en otros informes. | Sprint 4 (Terminado) |
| **PBI-13.1** | CU-13: Gestión de Historial | Bitácora de Análisis Guardados | Como Usuario o Administrador quiero acceder a mi historial para revisar mis actividades previas. | Sprint 4 (Terminado) |
| **PBI-13.2** | CU-13: Gestión de Historial | Re-renderizado de Reportes pasados | Como Usuario o Administrador quiero restaurar en pantalla un cálculo de mi bitácora a partir de su JSON. | Sprint 4 (Terminado) |
| **PBI-13.3** | CU-13: Gestión de Historial | Depuración de Bitácora | Como Usuario o Administrador quiero borrar registros de mi historial para mantener limpio mi listado. | Sprint 4 (Terminado) |
| **PBI-14.1** | CU-14: Gestión de Notificaciones | Consumo de Avisos Personales y Globales | Como Usuario o Administrador quiero ver alertas de sistema y de aula en tiempo real para estar informado. | Sprint 5 (Terminado) |
| **PBI-14.2** | CU-14: Gestión de Notificaciones | Marcado y Limpieza de Alertas | Como Usuario o Administrador quiero marcar los avisos como leídos para vaciar el contador del Navbar. | Sprint 5 (Terminado) |
| **PBI-15.1** | CU-15: Administración del Sistema | Dashboard General de Usuarios | Como Administrador quiero ver la lista global de usuarios registrados para auditar la plataforma. | Sprint 5 (Terminado) |
| **PBI-15.2** | CU-15: Administración del Sistema | Regulación de Roles y Estados | Como Administrador quiero suspender cuentas o alterar roles para proteger los accesos del sistema. | Sprint 5 (Terminado) |
| **PBI-15.3** | CU-15: Administración del Sistema | Emisión de Anuncios de Sistema | Como Administrador quiero redactar alertas globales para notificar mantenimientos a los usuarios. | Sprint 5 (Terminado) |

---

## ⚙️ Notas de Planificación y Gestión de Desviaciones

El desarrollo de la aplicación por un único ingeniero requirió de una gestión activa de las desviaciones y la deuda técnica acumulada:

*   **Planificación de Holgura (Sprint 1):** La implementación inicial de la estadística descriptiva y la ingesta de archivos se completó antes del tiempo estimado. Esto generó una reserva de 10 horas que facilitó la absorción de tareas complejas en periodos subsiguientes.
*   **Gestión de Deuda Técnica (Sprint 2):** Se cumplieron los plazos de entrega de la regresión y la correlación lineal, pero se aplazó temporalmente el desglose matemático detallado ("paso a paso") para evitar demoras críticas en la interfaz de usuario.
*   **Desviación Algorítmica (Sprint 3):** Los requisitos matemáticos de las series temporales de la primera fase (Tema 7) y la sincronización de formatos de exportación requirieron un esfuerzo técnico mayor al estimado. Por esta razón, el desarrollo de números índices de la segunda fase (Tema 8) debió trasladarse formalmente al Sprint 4.
*   **Absorción de Retrasos (Sprint 4):** Se integró exitosamente el Tema 8 postergado y se completaron los módulos de perfil de usuario, reportes en PDF y el historial de análisis en los tiempos previstos para este bloque de trabajo.
*   **Consolidación y Cierre (Sprint 5):** Se culminó la implementación de las herramientas de colaboración (aulas virtuales, administración de alumnos) y la seguridad del sistema, garantizando la puesta en producción del software.
