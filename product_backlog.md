# 📋 Product Backlog Completo (Memoria Técnica)

Este documento detalla el **Product Backlog** estructurado para el desarrollo del **Software Estadístico**. Al ser un proyecto desarrollado por un **único ingeniero**, el backlog ha sido dimensionado para reflejar el esfuerzo unipersonal y el rendimiento real de los Sprints, incluyendo los retrasos técnicos y aplazamientos históricos experimentados en la base de código.

> [!NOTE]
> **Planificación Agile Unipersonal:** El cronograma de desarrollo del Product Backlog fue diseñado sin dependencias cruzadas entre desarrolladores, optimizando el tiempo de entrega y absorbiendo la deuda técnica de forma directa en el Sprint 4 y 5.

---

## 📈 Cronograma de Sprints e Hitos de Desarrollo

El siguiente diagrama ilustra el flujo de avance real del proyecto, destacando las desviaciones y la transferencia de historias de usuario debido a la deuda técnica:

```mermaid
graph TD
    S1[<b>Sprint 1: Holgura (+10h)</b><br>CU-08 Descrip.<br>CU-06 Ingesta Excel<br>CU-07 Prep. Variables<br>CU-11 Gráficos Base] --> S2[<b>Sprint 2: A Tiempo con Deuda</b><br>CU-09 Regresión y Correl.<br>CU-06/07 Tabla Dinámica<br><i>*Deuda: Paso a paso pospuesto</i>]
    S2 --> S3[<b>Sprint 3: Retraso Crítico</b><br>CU-10 Series Tiempo: T7<br>CU-11 Refinamiento UI<br>CU-12 Copiado a Excel<br><i>*Índices T8: Aplazado a S4</i>]
    S3 --> S4[<b>Sprint 4: Absorción de Retraso</b><br>CU-10 Índices: T8<br>CU-01 Autenticación<br>CU-02 Cuenta Usuario<br>CU-12 Reportes PDF<br>CU-13 Historial JSON]
    S4 --> S5[<b>Sprint 5: Estabilización</b><br>CU-03 Aulas Virtuales<br>CU-04 Matriculación Estud.<br>CU-05 Admin. Estudiantes<br>CU-14 Notificaciones<br>CU-15 Admin. Sistema]

    style S1 fill:#d1e7dd,stroke:#0f5132,stroke-width:2px;
    style S2 fill:#fff3cd,stroke:#664d03,stroke-width:2px;
    style S3 fill:#f8d7da,stroke:#842029,stroke-width:2px;
    style S4 fill:#cfe2ff,stroke:#084298,stroke-width:2px;
    style S5 fill:#e2e3e5,stroke:#41464b,stroke-width:2px;
```

---

## 📊 Tabla del Product Backlog

| ID PBI | CU Asociado | Título del PBI | Historia de Usuario | Sprint y Estado |
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
| **PBI-10.2** | CU-10: Análisis de Series Temporales | Índices de Precios y Cantidades (Tema 8) | Como Usuario o Administrador quiero estimar índices compuestos para analizar variaciones socioeconómicas. | Sprint 3 $\rightarrow$ Aplazado y terminado en Sprint 4 |
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

Como Product Owner y Arquitecto, la asignación de Sprints y el flujo del desarrollo unipersonal fue estructurado considerando los siguientes hitos de rendimiento técnico:

> [!WARNING]
> **Gestión de Retrasos en el Sprint 3:** La complejidad algorítmica de los modelos de Series de Tiempo (Tema 7) y el copiado de tablas asíncrono causaron un retraso crítico, forzando la transferencia del desarrollo de Números Índices (Tema 8) al Sprint 4. Esto se estabilizó exitosamente gracias al rendimiento del Sprint 4.

*   **Sprint 1 (Holgura y Productividad):** Se completó el motor analítico básico (estadística descriptiva, cargas simples e histogramas base) con un ahorro de 10 horas debido al uso de algoritmos nativos eficientes en Python y mapeadores de React directos.
*   **Sprint 2 (Deuda Técnica Temprana):** Se cubrió a tiempo el motor bivariado (Correlación y Regresión), pero para lograrlo se contrajo deuda técnica posponiendo los cálculos paso a paso del desglose matemático (lo cual se catalogó como deuda de refactorización posterior).
*   **Sprint 3 (Retraso Crítico Algorítmico):** El desarrollo de Series de Tiempo (Tema 7) y el copiado directo al portapapeles consumieron más horas de las presupuestas debido al análisis de orden cronológico en arrays y problemas de copiado asíncrono en navegadores móviles. Esto provocó el **aplazamiento de Números Índices (Tema 8)**, el cual se catalogó como iniciado pero incompleto.
*   **Sprint 4 (Recuperación y Absorción):** Se completó exitosamente el Tema 8 de Series Temporales (retrasado del Sprint 3) y se absorbieron los retrasos implementando la autenticación robusta, la configuración del perfil, la serialización JSON del historial y el conversor a PDF.
*   **Sprint 5 (Estabilización y Despliegue):** Se completó el desarrollo del ecosistema colaborativo (Aulas Virtuales, Inscripciones y Administración de estudiantes), el sistema de notificaciones asíncronas y el control global de roles del administrador, dejando la aplicación 100% operativa y estabilizada.
