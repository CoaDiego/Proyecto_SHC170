const BASE_URL = import.meta.env.VITE_API_URL;
//Base url de Render
/* const BASE_URL = "https://api-admin-shc170.onrender.com"; */

export const api = {
  // --- Función para leer la hoja de Excel ---
  // 🆕 Añadimos el parámetro 'autor'
  obtenerDatosHoja: async (filename, hojaIndex, autor) => {
    try {
      const res = await fetch(
        `${BASE_URL}/view/${encodeURIComponent(filename)}?hoja=${hojaIndex}&autor=${encodeURIComponent(autor)}`,
      );
      if (!res.ok) throw new Error("Error al leer la hoja del servidor");
      return await res.json();
    } catch (error) {
      console.error("Error en api.obtenerDatosHoja:", error);
      throw error;
    }
  },

  // --- Función para obtener las hojas de un Excel ---
  // 🆕 Añadimos el parámetro 'autor'
  obtenerHojas: async (filename, autor) => {
    try {
      const res = await fetch(
        `${BASE_URL}/sheets/${encodeURIComponent(filename)}?autor=${encodeURIComponent(autor)}`,
      );
      if (!res.ok) throw new Error("Error al obtener las hojas");
      return await res.json();
    } catch (error) {
      console.error("Error en api.obtenerHojas:", error);
      throw error;
    }
  },

  // --- Funciones para la Calculadora Manual (Se mantienen igual) ---
  calcularUnivariada: async (bodyData) => {
    try {
      const res = await fetch(`${BASE_URL}/calcular`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      if (!res.ok) throw new Error("Error en cálculo univariado");
      return await res.json();
    } catch (error) {
      console.error("Error en api.calcularUnivariada:", error);
      throw error;
    }
  },

  calcularBivariadaManual: async (bodyData) => {
    try {
      const res = await fetch(`${BASE_URL}/calcular_bivariada`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      if (!res.ok) throw new Error("Error en cálculo bivariado");
      return await res.json();
    } catch (error) {
      console.error("Error en api.calcularBivariadaManual:", error);
      throw error;
    }
  },

  calcularMultivariante: async (bodyData) => {
    try {
      const res = await fetch(`${BASE_URL}/calcular_multivariante`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      if (!res.ok) throw new Error("Error en cálculo multivariante");
      return await res.json();
    } catch (error) {
      console.error("Error en api.calcularMultivariante:", error);
      throw error;
    }
  },

  guardarTabla: async (nombre, datos, autor) => {
    try {
      const res = await fetch(`${BASE_URL}/save_table`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre, tabla: datos, autor: autor }),
      });
      if (!res.ok) throw new Error("Error al guardar la tabla");
      return await res.json();
    } catch (error) {
      console.error("Error en api.guardarTabla:", error);
      throw error;
    }
  },

  // --- SUBIR ARCHIVO ---
  // (Esta queda casi igual, porque el 'autor' se lo agregaremos al formData desde el componente visual)
  subirArchivo: async (formData) => {
    try {
      const res = await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.detail?.[0]?.msg || "Error al subir el archivo");
      return data;
    } catch (error) {
      console.error("Error en api.subirArchivo:", error);
      throw error;
    }
  },

  // --- ELIMINAR ARCHIVO ---
  // 🆕 Añadimos el parámetro 'autor'
  eliminarArchivo: async (filename, autor) => {
    try {
      const res = await fetch(
        `${BASE_URL}/files/${encodeURIComponent(filename)}?autor=${encodeURIComponent(autor)}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) throw new Error("Error al eliminar el archivo");
      return true;
    } catch (error) {
      console.error("Error en api.eliminarArchivo:", error);
      throw error;
    }
  },

  // --- DESCARGAR BINARIO (Para la Calculadora) ---
  descargarArchivoBinario: async (filename, autor) => {
    try {
      const res = await fetch(
        `${BASE_URL}/files/${encodeURIComponent(filename)}?autor=${encodeURIComponent(autor)}`,
      );
      if (!res.ok)
        throw new Error("No se pudo obtener el archivo del servidor");

      // 🆕 Devolvemos el arrayBuffer (los bytes puros del archivo)
      return await res.arrayBuffer();
    } catch (error) {
      console.error("Error en api.descargarArchivoBinario:", error);
      throw error;
    }
  },

  // --- OBTENER LISTA DE ARCHIVOS ---
  // 🆕 Añadimos el parámetro 'autor'
  obtenerArchivos: async (autor) => {
    try {
      const res = await fetch(
        `${BASE_URL}/files?autor=${encodeURIComponent(autor)}`,
      );
      if (!res.ok) throw new Error("Error al obtener la lista de archivos");
      return await res.json();
    } catch (error) {
      console.error("Error en api.obtenerArchivos:", error);
      throw error;
    }
  },

  // --- ACTUALIZAR EXCEL ---
  actualizarExcel: async (filename, hojaindex, datos, autor) => {
    try {
      const res = await fetch(`${BASE_URL}/update_excel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: filename,
          hoja_index: hojaindex, // ✅ CORREGIDO: Ahora coincide con el backend
          datos: datos,
          autor: autor,
        }),
      });
      if (!res.ok) throw new Error("Error al actualizar el excel");
      return await res.json();
    } catch (error) {
      console.error("Error en api.actualizarExcel", error);
      throw error;
    }
  },

  descargarArchivoExcel: async (filename) => {
    try {
      const res = await fetch(`${BASE_URL}/files/${encodeURIComponent(filename)}`, {
        cache: 'no-store'
      });
      if (!res.ok) throw new Error("No se pudo descargar el archivo del servidor.");
      // Retornamos directamente el ArrayBuffer
      return await res.arrayBuffer();
    } catch (error) {
      console.error("Error en api.descargarArchivoExcel:", error);
      throw error;
    }
  },

  // --- GUARDAR EN HISTORIAL ---
  guardarEnHistorial: async (autor, calculo, archivo, colX, colY, hoja) => {
    try {
      const res = await fetch(`${BASE_URL}/guardar_historial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autor: autor,
          calculo: calculo,
          archivo_origen: archivo,
          columna_x: colX,
          columna_y: colY,
          hoja: hoja
        }),
      });
      return await res.json();
    } catch (error) {
      console.error("Error en api.guardarEnHistorial:", error);
      throw error;
    }
  },

  // --- OBTENER HISTORIAL ---
  obtenerHistorial: async (autor) => {
    try {
      const res = await fetch(
        `${BASE_URL}/obtener_historial?autor=${encodeURIComponent(autor)}`,
      );
      if (!res.ok)
        throw new Error("Error al obtener el historial del servidor");
      return await res.json();
    } catch (error) {
      console.error("Error en api.obtenerHistorial:", error);
      throw error;
    }
  },

  // --- ELIMINAR DEL HISTORIAL ---
  eliminarHistorial: async (registro_id, autor) => {
    try {
      const res = await fetch(
        `${BASE_URL}/eliminar_historial/${registro_id}?autor=${encodeURIComponent(autor)}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) throw new Error("Error al eliminar el registro");
      return await res.json();
    } catch (error) {
      console.error("Error en api.eliminarHistorial", error);
      throw error;
    }
  },
};

export default api;
