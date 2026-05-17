const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
//Base url de Render
/* const BASE_URL = "https://api-admin-shc170.onrender.com"; */

export const api = {
  // --- OBTENER CONTADOR DE VISITAS ---
  obtenerVisitas: async () => {
    try {
      const response = await fetch(`${BASE_URL}/visitas`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.visitas;
    } catch (error) {
      console.error("Error en api.obtenerVisitas:", error);
      return null;
    }
  },

  // --- Función para obtener las hojas de un Excel ---
  obtenerHojas: async (filename, autor = "", curso = "") => {
    // 🛠️ CORREGIDO: Cambiamos API_URL por BASE_URL
    let url = `${BASE_URL}/sheets/${encodeURIComponent(filename)}?`;
    if (autor) url += `autor=${encodeURIComponent(autor)}&`;
    if (curso) url += `curso=${encodeURIComponent(curso)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al obtener las hojas del archivo");
    return response.json();
  },

  // --- Función unificada para leer los datos de la hoja ---
  obtenerDatosHoja: async (filename, hoja, autor = "", curso = "") => {
    // 🛠️ CORREGIDO: Cambiamos API_URL por BASE_URL y eliminamos el duplicado viejo
    let url = `${BASE_URL}/view/${encodeURIComponent(filename)}?hoja=${hoja}`;
    if (autor) url += `&autor=${encodeURIComponent(autor)}`;
    if (curso) url += `&curso=${encodeURIComponent(curso)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al visualizar el archivo");
    return response.json();
  },

  // --- OBTENER LISTA DE ARCHIVOS ---
  obtenerArchivos: async (autor, visibilidad = "personal", curso = "") => {
    // 🛠️ CORREGIDO: Cambiamos API_URL por BASE_URL
    let url = `${BASE_URL}/files?autor=${encodeURIComponent(autor)}&visibilidad=${visibilidad}`;
    if (curso) url += `&curso=${encodeURIComponent(curso)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al obtener archivos");
    return response.json();
  },

  // --- VER EXCEL (Solo metadatos/estructura) ---
  verExcel: async (filename, hoja = 0, autor = "", curso = "") => {
    // 🛠️ CORREGIDO: Cambiamos API_URL por BASE_URL
    let url = `${BASE_URL}/view/${encodeURIComponent(filename)}?hoja=${hoja}`;
    if (autor) url += `&autor=${encodeURIComponent(autor)}`;
    if (curso) url += `&curso=${encodeURIComponent(curso)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al visualizar el archivo");
    return response.json();
  },

  // --- ACTUALIZAR EXCEL ---
  actualizarExcel: async (filename, hoja, datos, autor = "", curso = "") => {
    const payload = { datos, autor, curso };
    // 🛠️ CORREGIDO: Cambiamos API_URL por BASE_URL
    const response = await fetch(
      `${BASE_URL}/update/${encodeURIComponent(filename)}?hoja=${hoja}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (!response.ok) throw new Error("Error al actualizar el archivo");
    return response.json();
  },

  // =================================================================
  // LAS FUNCIONES DE ABAJO SE MANTIENEN EXACTAMENTE IGUAL
  // =================================================================

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

  // Guardar múltiples hojas en un solo archivo Excel
  guardarTablaHojas: async (nombre, hojas, autor) => {
    try {
      const res = await fetch(`${BASE_URL}/save_table_hojas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, hojas, autor }),
      });
      if (!res.ok) throw new Error("Error al guardar las hojas");
      return await res.json();
    } catch (error) {
      console.error("Error en api.guardarTablaHojas:", error);
      throw error;
    }
  },

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

  eliminarArchivo: async (filename, autor) => {
    try {
      const res = await fetch(
        `${BASE_URL}/files/${encodeURIComponent(filename)}?autor=${encodeURIComponent(autor)}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Error al eliminar el archivo");
      return true;
    } catch (error) {
      console.error("Error en api.eliminarArchivo:", error);
      throw error;
    }
  },

  descargarArchivoBinario: async (filename, autor) => {
    try {
      const res = await fetch(
        `${BASE_URL}/files/${encodeURIComponent(filename)}?autor=${encodeURIComponent(autor)}`,
      );
      if (!res.ok)
        throw new Error("No se pudo obtener el archivo del servidor");
      return await res.arrayBuffer();
    } catch (error) {
      console.error("Error en api.descargarArchivoBinario:", error);
      throw error;
    }
  },

  descargarArchivoExcel: async (filename) => {
    try {
      const res = await fetch(
        `${BASE_URL}/files/${encodeURIComponent(filename)}`,
        { cache: "no-store" },
      );
      if (!res.ok)
        throw new Error("No se pudo descargar el archivo del servidor.");
      return await res.arrayBuffer();
    } catch (error) {
      console.error("Error en api.descargarArchivoExcel:", error);
      throw error;
    }
  },

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
          hoja: hoja,
        }),
      });
      return await res.json();
    } catch (error) {
      console.error("Error en api.guardarEnHistorial:", error);
      throw error;
    }
  },

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

  eliminarHistorial: async (registro_id, autor) => {
    try {
      const res = await fetch(
        `${BASE_URL}/eliminar_historial/${registro_id}?autor=${encodeURIComponent(autor)}`,
        { method: "DELETE" },
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
