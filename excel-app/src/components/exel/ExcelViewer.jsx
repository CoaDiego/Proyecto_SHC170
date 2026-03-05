import { useState } from "react";
// 👇 IMPORTAMOS EL MODAL (Ajusta la ruta si está en otra carpeta)
import Modal from "../../utils/Modal"; 

export default function ExcelViewer({ files, onSelect, onDelete }) {
  
  // --- ESTADOS PARA EL MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  const openDeleteModal = (filename) => {
    setFileToDelete(filename);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (fileToDelete) {
      onDelete(fileToDelete); 
    }
    setIsModalOpen(false); 
    setFileToDelete(null); 
  };

  return (
    <div>
      {/* CABECERA MODERNA */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        {/* 👇 Adaptado a texto principal */}
        <h4 style={{ marginTop: "10px", color: "var(--text-main)"}}>Archivos Disponibles</h4>
        <span style={{ 
          // 👇 Adaptado a colores variables
          backgroundColor: "var(--bg-input)", 
          color: "var(--text-main)", 
          border: "1px solid var(--border-color)",
          padding: "3px 10px", 
          borderRadius: "20px", 
          fontSize: "0.8rem", 
          marginTop: "10px"
        }}>
          {files.length} {files.length === 1 ? 'archivo' : 'archivos'}
        </span>
      </div>
      
      {/* ESTADO VACÍO */}
      {files.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "30px 15px", 
          backgroundColor: "var(--bg-card)", 
          borderRadius: "8px", 
          border: "2px dashed var(--border-color)",
          color: "var(--text-muted)"
        }}>
          <p style={{ margin: 0, fontSize: "0.8rem" }}>No hay archivos en el servidor.</p>
        </div>
      ) : (
        /* LISTA DE ARCHIVOS */
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "5px" }}>
          {files.map((f, index) => (
            <li 
              key={index} 
              style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                // 👇 Cajas oscuras/claras dinámicas
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-color)", 
                borderRadius: "5px", 
                padding: "5px 10px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                transition: "transform 0.1s, boxShadow 0.1s"
              }}
              onMouseOver={(e) => e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.15)"}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"}
            >
              
              {/* IZQUIERDA: Nombre del archivo */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
                <p style={{  
                  fontSize: "0.9rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "180px",
                  color: "var(--text-main)" // 👇 Texto visible en ambos temas
                }}>
                  {f.filename}
                </p>
              </div>

              {/* DERECHA: Botones de acción */}
              <div style={{ display: "flex", gap: "8px" }}>
                <button 
                  onClick={() => onSelect(f.filename)} 
                  style={{ 
                    display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", 
                    backgroundColor: "transparent", // 👇 Transparente por defecto
                    color: "var(--accent-color)", 
                    border: "1px solid var(--accent-color)",
                    borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem",
                    fontWeight: "bold", 
                    transition: "background-color 0.2s, color 0.2s"
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "var(--accent-color)"; e.currentTarget.style.color = "white"; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--accent-color)"; }}
                >
                  Ver
                </button>

                <button 
                  onClick={() => openDeleteModal(f.filename)} 
                  style={{ 
                    display: "flex", alignItems: "center", padding: "6px 10px", 
                    backgroundColor: "transparent", // 👇 Transparente por defecto
                    color: "#ef4444", 
                    border: "1px solid #ef4444",
                    borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", transition: "background-color 0.2s, color 0.2s"
                  }}
                  title="Eliminar archivo"
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#ef4444"; e.currentTarget.style.color = "white"; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#ef4444"; }}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* =========================================================
          NUESTRO COMPONENTE MODAL REUTILIZABLE 
      ========================================================= */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Confirmar eliminación"
        maxWidth="400px"
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          {/* 👇 Texto del modal adaptado */}
          <p style={{ margin: 0, color: "var(--text-main)", fontSize: "1rem" }}>
            ¿Estás seguro de que deseas eliminar permanentemente el archivo <br/>
            <strong>"{fileToDelete}"</strong>?
          </p>
        </div>

        {/* Botones del Modal */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <button 
            onClick={() => setIsModalOpen(false)}
            style={{
              padding: "10px 20px", 
              backgroundColor: "var(--bg-input)", // 👇 Adaptado
              color: "var(--text-main)",          // 👇 Adaptado
              border: "1px solid var(--border-color)", 
              borderRadius: "6px", 
              fontWeight: "bold", 
              cursor: "pointer"
            }}
          >
            Cancelar
          </button>
          
          <button 
            onClick={handleConfirmDelete}
            style={{
              padding: "10px 20px", backgroundColor: "#ef4444", color: "white",
              border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer",
              boxShadow: "0 2px 4px rgba(239, 68, 68, 0.3)"
            }}
          >
            Eliminar
          </button>
        </div>
      </Modal>

    </div>
  );
}