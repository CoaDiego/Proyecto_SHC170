// src/utils/exportUtils.js
import { alerta } from './Notificaciones'; // 🆕 Importamos tu sistema de alertas
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


export const copiarTablaAExcel = async (datos, nombreCalculo) => {
    if (!datos || datos.length === 0) {
        alerta.advertencia("Sin datos", "No hay datos en la tabla para copiar.");
        return;
    }

    try {
        const cabeceras = Object.keys(datos[0]).join('\t');
        const filas = datos.map(fila => 
            Object.values(fila).map(v => (v === null || v === undefined ? "" : v)).join('\t')
        ).join('\n');

        const contenidoTSV = `${cabeceras}\n${filas}`;

        // Intento 1: API Moderna (Funciona en localhost o HTTPS)
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(contenidoTSV);
        } 
        // Intento 2: Plan de Respaldo (Para redes locales)
        else {
            const textArea = document.createElement("textarea");
            textArea.value = contenidoTSV;
            
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
            } catch (err) {
                console.error("El plan de respaldo falló:", err);
                throw new Error("No se pudo copiar.");
            } finally {
                textArea.remove();
            }
        }
        
        // 🆕 Usamos alerta.exito de tu proyecto
        alerta.exito(
            "¡Tabla copiada!", 
            `Los datos de ${nombreCalculo.replace(/_/g, " ")} están listos para Ctrl+V en Excel.`
        );
        
    } catch (err) {
        console.error("Error al copiar:", err);
        // 🆕 Usamos alerta.error de tu proyecto
        alerta.error(
            "Error al copiar", 
            "Tu navegador bloqueó el copiado automático."
        );
    }
};

// Actualiza esta función en src/utils/exportUtils.js
export const generarPDFReporte = async (elementId, nombreArchivo = "Reporte_Estadistico") => {
    const input = document.getElementById(elementId);
    if (!input) return;

    try {
        alerta.success("Generando reporte...", "Capturando gráficos y tablas...");
        
        // 🆕 Ajustes para evitar cortes y mejorar renderizado de gráficos:
        const canvas = await html2canvas(input, {
            scale: 2, 
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false,
            allowTaint: true,
            removeContainer: true,
            // Esperamos un poco para que Recharts termine de renderizar
            delay: 300,
            onclone: (clonedDoc) => {
                const el = clonedDoc.getElementById(elementId);
                if (el) {
                    el.style.position = "relative";
                    el.style.display = "block";
                    el.style.left = "0";
                    el.style.top = "0";
                    el.style.visibility = "visible";
                }
            }
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'in',
            format: 'letter'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

        let heightLeft = imgHeight;
        let position = 0;

        // Primera página
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;

        // Páginas adicionales si el reporte es muy largo
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(`${nombreArchivo}.pdf`);
        alerta.exito("PDF Guardado", "El reporte se ha generado sin cortes.");
    } catch (error) {
        console.error(error);
        alerta.error("Error PDF", "No se pudo generar el archivo.");
    }
};