# 📋 Especificación del Product Backlog del Sistema
Este documento contiene la especificación formal y detallada del Product Backlog del Software Estadístico, estructurado bajo los principios de la metodología Scrum. Al ser un proyecto desarrollado de manera unipersonal por un único ingeniero, el backlog ha sido dimensionado para reflejar fielmente el esfuerzo individual y la velocidad de desarrollo real a lo largo de los sprints.

---

## 📋 Resumen del Plan de Sprints

*   **Sprint 1:** Implementación del motor analítico descriptivo básico, ingesta inicial de planillas de cálculo y generación de gráficos base.
*   **Sprint 2:** Incorporación del módulo de regresión y correlación lineal bivariada, junto con el desarrollo de la tabla de visualización dinámica de datos.
*   **Sprint 3:** Desarrollo de algoritmos de series temporales correspondientes al Tema 7 y optimización de herramientas de exportación tabular directa.
*   **Sprint 4:** Finalización del Tema 8 de series temporales, desarrollo de la capa de seguridad, autenticación, gestión del perfil del usuario e historial de reportes.
*   **Sprint 5:** Desarrollo del entorno colaborativo de aulas virtuales, matriculación de estudiantes, administración académica y el panel del administrador del sistema.

---

## 📊 Tabla del Product Backlog

| ID PBI | Caso de Uso Asociado | Título | Descripción General | Sprint |
| :--- | :--- | :--- | :--- | :--- |
| **PBI-06.1** | CU-06: Gestión de Archivos | Ingesta de Planillas Excel | Habilita la subida y procesamiento de archivos en formato Excel (.xlsx) en el sistema. | Sprint 1 |
| **PBI-06.2** | CU-06: Gestión de Archivos | Visor Tabular de Datos | Presenta los datos importados en una cuadrícula interactiva para su exploración y validación visual. | Sprint 1 |
| **PBI-07.1** | CU-07: Preparación de Datos | Selección de Variables | Permite la selección específica de columnas numéricas en la planilla para el cálculo de variables. | Sprint 1 |
| **PBI-08.1** | CU-08: Procesamiento de Estadística Descriptiva | Tabla de Distribución de Frecuencias | Genera la tabla de frecuencias agrupada en intervalos automáticos o personalizados para resumir la muestra de datos. | Sprint 1 |
| **PBI-08.2** | CU-08: Procesamiento de Estadística Descriptiva | Medidas de Tendencia Central | Realiza el cálculo matemático de la media aritmética, la mediana y la moda de la variable seleccionada. | Sprint 1 |
| **PBI-08.3** | CU-08: Procesamiento de Estadística Descriptiva | Medidas de Variabilidad y Percentiles | Computa la varianza, desviación estándar y percentiles requeridos para evaluar la dispersión de la distribución. | Sprint 1 |
| **PBI-11.1** | CU-11: Visualización de Gráficos | Histogramas Dinámicos | Renderiza histogramas interactivos basados en los intervalos calculados en la distribución de frecuencias. | Sprint 1 |
| **PBI-06.3** | CU-06: Gestión de Archivos | Edición Directa de Celdas | Permite la modificación en tiempo real de los datos directamente en las celdas de la tabla interactiva. | Sprint 2 |
| **PBI-06.4** | CU-06: Gestión de Archivos | Guardado Versátil de Planillas | Ofrece opciones para sobrescribir el archivo original, añadir nuevas columnas o almacenar los datos modificados en pestañas adicionales. | Sprint 2 |
| **PBI-07.2** | CU-07: Preparación de Datos | Filtros y Ordenamiento | Habilita el filtrado condicional y el ordenamiento ascendente o descendente de las series numéricas. | Sprint 2 |
| **PBI-09.1** | CU-09: Análisis de Correlación | Coeficiente de Pearson | Calcula numéricamente el coeficiente de correlación de Pearson para analizar el grado de asociación lineal de dos variables. | Sprint 2 |
| **PBI-09.2** | CU-09: Análisis de Correlación | Recta de Regresión Lineal | Determina los coeficientes de la recta de regresión por mínimos cuadrados para modelar la relación bivariada. | Sprint 2 |
| **PBI-09.3** | CU-09: Análisis de Correlación | Predicciones del Modelo | Proporciona proyecciones estimadas para una variable a partir de valores de entrada ingresados en la ecuación de regresión. | Sprint 2 |
| **PBI-10.1** | CU-10: Análisis de Series Temporales | Tendencias Históricas (Tema 7) | Computa modelos de tendencia secular en series de tiempo para estimar la evolución temporal de la variable. | Sprint 3 |
| **PBI-11.2** | CU-11: Visualización de Gráficos | Polígonos de Extremos Cerrados y Ojivas | Genera las representaciones gráficas del polígono de frecuencias cerrado y la curva ojiva acumulada correspondientes al análisis. | Sprint 3 |
| **PBI-12.1** | CU-12: Exportación de Resultados | Copiado Rápido a Portapapeles | Permite copiar las tablas de resultados al portapapeles del sistema en un formato compatible con Excel. | Sprint 3 |
| **PBI-01.1** | CU-01: Gestión de Autenticación | Registro de Usuarios | Permite el registro de nuevas cuentas de usuario en el sistema. | Sprint 4 |
| **PBI-01.2** | CU-01: Gestión de Autenticación | Inicio de Sesión Seguro (JWT) | Autentica la identidad del usuario y emite un token JWT firmado de forma segura para proteger los accesos. | Sprint 4 |
| **PBI-01.3** | CU-01: Gestión de Autenticación | Recuperación de Contraseña (SMTP) | Procesa la solicitud y envía un enlace seguro para restablecer credenciales a través de correo electrónico (SMTP). | Sprint 4 |
| **PBI-02.1** | CU-02: Gestión de Cuenta de Usuario | Modificación de Perfil | Facilita la edición de datos generales del perfil y de la institución académica del usuario. | Sprint 4 |
| **PBI-02.2** | CU-02: Gestión de Cuenta de Usuario | Cambio de Contraseña Activa | Permite el cambio seguro de la contraseña activa validando la credencial anterior del usuario. | Sprint 4 |
| **PBI-02.3** | CU-02: Gestión de Cuenta de Usuario | Auto-eliminación de Cuenta | Elimina de forma definitiva y permanente la cuenta y el perfil del usuario de la base de datos. | Sprint 4 |
| **PBI-10.2** | CU-10: Análisis de Series Temporales | Índices de Precios y Cantidades (Tema 8) | Calcula índices de precios y cantidades (métodos de Laspeyres, Paasche y Fisher) para medir variaciones temporales. | Sprint 4 |
| **PBI-12.2** | CU-12: Exportación de Resultados | Reporte de Resultados en PDF | Compila y genera un archivo PDF formal con los resultados del análisis estadístico y los gráficos asociados. | Sprint 4 |
| **PBI-12.3** | CU-12: Exportación de Resultados | Exportación de Gráficos a Imagen | Habilita la descarga y exportación directa de los gráficos interactivos en formato de imagen PNG. | Sprint 4 |
| **PBI-13.1** | CU-13: Gestión de Historial | Bitácora de Análisis Guardados | Ofrece una interfaz de bitácora para revisar el historial completo de análisis ejecutados y guardados por el usuario. | Sprint 4 |
| **PBI-13.2** | CU-13: Gestión de Historial | Re-renderizado de Reportes pasados | Restaura la vista interactiva de análisis históricos a partir de sus datos en formato JSON. | Sprint 4 |
| **PBI-13.3** | CU-13: Gestión de Historial | Depuración de Bitácora | Permite eliminar registros de la bitácora individual para depurar el historial de análisis del usuario. | Sprint 4 |
| **PBI-03.1** | CU-03: Gestión de Aulas Virtuales | Creación de Aulas Virtuales | Habilita la creación de clases virtuales o grupos docentes protegidos por códigos de acceso. | Sprint 5 |
| **PBI-03.2** | CU-03: Gestión de Aulas Virtuales | Re-generación de Códigos Únicos | Permite cambiar y re-generar el código único de un aula virtual para bloquear o permitir nuevas inscripciones. | Sprint 5 |
| **PBI-03.3** | CU-03: Gestión de Aulas Virtuales | Eliminación de Aulas Virtuales | Facilita el borrado completo de aulas virtuales o grupos inactivos en el perfil del docente. | Sprint 5 |
| **PBI-04.1** | CU-04: Matriculación de Estudiantes | Validación de Código de Acceso | Verifica la validez del código de aula ingresado por un estudiante antes de proceder con el registro en la clase. | Sprint 5 |
| **PBI-04.2** | CU-04: Matriculación de Estudiantes | Inscripción en Aulas Activas | Completa la matriculación y vinculación del estudiante en la clase validada para habilitar el acceso a recursos. | Sprint 5 |
| **PBI-05.1** | CU-05: Administración de Estudiantes | Reporte de Alumnos Matriculados | Despliega una tabla organizada con la lista de los estudiantes inscritos en una clase específica. | Sprint 5 |
| **PBI-05.2** | CU-05: Administración de Estudiantes | Desmatriculación Activa ("Eliminar estudiante") | Permite la expulsión y desvinculación formal de un estudiante matriculado en un curso o aula virtual. | Sprint 5 |
| **PBI-14.1** | CU-14: Gestión de Notificaciones | Consumo de Avisos Personales y Globales | Carga y muestra notificaciones generales del sistema y alertas particulares de aulas en tiempo real. | Sprint 5 |
| **PBI-14.2** | CU-14: Gestión de Notificaciones | Marcado y Limpieza de Alertas | Permite al usuario marcar avisos específicos como leídos para actualizar el contador de notificaciones pendientes. | Sprint 5 |
| **PBI-15.1** | CU-15: Administración del Sistema | Dashboard General de Usuarios | Presenta un panel unificado de administración para auditar la lista de todos los usuarios registrados en el sistema. | Sprint 5 |
| **PBI-15.2** | CU-15: Administración del Sistema | Regulación de Roles y Estados | Habilita la suspensión temporal o definitiva de cuentas y la alteración de los roles de usuario por el administrador. | Sprint 5 |
| **PBI-15.3** | CU-15: Administración del Sistema | Emisión de Anuncios de Sistema | Permite al administrador publicar anuncios globales visibles para todos los usuarios en la plataforma. | Sprint 5 |

---

## ⚙️ Notas de Planificación y Gestión de Desviaciones

El desarrollo de la aplicación por un único ingeniero requirió de una gestión activa de las desviaciones y la deuda técnica acumulada:

*   **Planificación de Holgura (Sprint 1):** La implementación inicial de la estadística descriptiva y la ingesta de archivos se completó antes del tiempo estimado. Esto generó una reserva de 10 horas que facilitó la absorción de tareas complejas en periodos subsiguientes.
*   **Gestión de Deuda Técnica (Sprint 2):** Se cumplieron los plazos de entrega de la regresión y la correlación lineal, pero se aplazó temporalmente el desglose matemático detallado ("paso a paso") para evitar demoras críticas en la interfaz de usuario.
*   **Desviación Algorítmica (Sprint 3):** Los requisitos matemáticos de las series temporales de la primera fase (Tema 7) y la sincronización de formatos de exportación requirieron un esfuerzo técnico mayor al estimado. Por esta razón, el desarrollo de números índices de la segunda fase (Tema 8) debió trasladarse oficialmente al Sprint 4.
*   **Absorción de Retrasos (Sprint 4):** Se integró exitosamente el Tema 8 postergado y se completaron los módulos de perfil de usuario, reportes en PDF y el historial de análisis en los tiempos previstos para este bloque de trabajo.
*   **Consolidación y Cierre (Sprint 5):** Se culminó la implementación de las herramientas de colaboración (aulas virtuales, administración de alumnos) y la seguridad del sistema, garantizando la puesta en producción del software.
