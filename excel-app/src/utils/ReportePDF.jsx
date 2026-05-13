import { alerta } from './Notificaciones';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Función para copiar a Excel (la que ya probaste) ---
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

        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(contenidoTSV);
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = contenidoTSV;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            textArea.remove();
        }
        alerta.exito("¡Tabla copiada!", `Datos de ${nombreCalculo} listos para Excel.`);
    } catch (err) {
        alerta.error("Error al copiar", "No se pudo acceder al portapapeles.");
    }
};

// --- 🆕 Función para Generar el PDF Formal (Tamaño Carta) ---
export const generarPDFReporte = async (elementId, nombreArchivo = "Reporte_Estadistico") => {
    const input = document.getElementById(elementId);
    if (!input) return;

    try {
        alerta.success("Generando reporte...", "Preparando el documento formal.");
        
        // Capturamos el componente con alta resolución (scale: 2)
        const canvas = await html2canvas(input, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff"
        });

        const imgData = canvas.toDataURL('image/png');
        
        // Configuramos jsPDF en formato 'letter' (Carta)
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'in',
            format: 'letter'
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${nombreArchivo}.pdf`);
        
        alerta.exito("PDF Guardado", "El reporte se ha descargado correctamente.");
    } catch (error) {
        console.error("Error al generar PDF:", error);
        alerta.error("Error PDF", "No se pudo generar el archivo.");
    }
};