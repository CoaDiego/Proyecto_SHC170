import { useState } from "react";
// 👇 IMPORTAMOS EL MODAL (Ajusta la ruta si está en otra carpeta)
import Modal from "../../utils/Modal"; 

export default function ExcelViewer({ files, onSelect, onDelete }) {
  
  // --- ESTADOS PARA EL MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  // Función para preparar la eliminación y abrir el modal
  const openDeleteModal = (filename) => {
    setFileToDelete(filename);
    setIsModalOpen(true);
  };

  // Función que se ejecuta cuando das clic en "Sí, Eliminar" dentro del modal
  const handleConfirmDelete = () => {
    if (fileToDelete) {
      onDelete(fileToDelete); // Llama a la función del padre (Archivos.jsx)
    }
    setIsModalOpen(false); // Cierra el modal
    setFileToDelete(null); // Limpia el estado
  };

  return (
    <div>
      {/* CABECERA MODERNA */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h4 style={{ marginTop: "10px", color: "#1e293b"}}>Archivos Disponibles</h4>
        <span style={{ 
          backgroundColor: "#e2e8f0", 
          color: "#475569", 
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
          backgroundColor: "#f8fafc", 
          borderRadius: "8px", 
          border: "2px dashed #e2e8f0",
          color: "#94a3b8"
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
                backgroundColor: "white",
                border: "1px solid #e2e8f0", 
                borderRadius: "5px", 
                padding: "5px 10px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                transition: "transform 0.1s, boxShadow 0.1s"
              }}
              onMouseOver={(e) => e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.08)"}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"}
            >
              
              {/* IZQUIERDA: Nombre del archivo */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
                <p style={{  
                  fontSize: "0.9rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "180px" 
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
                    backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe",
                    borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem",
                    fontWeight: "bold", transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#2563eb"; e.currentTarget.style.color = "white"; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#eff6ff"; e.currentTarget.style.color = "#2563eb"; }}
                >
                  Ver
                </button>

                {/* 👇 AQUI CAMBIAMOS onClick PARA QUE ABRA EL MODAL EN VEZ DE BORRAR DIRECTO */}
                <button 
                  onClick={() => openDeleteModal(f.filename)} 
                  style={{ 
                    display: "flex", alignItems: "center", padding: "6px 10px", 
                    backgroundColor: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca",
                    borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", transition: "all 0.2s"
                  }}
                  title="Eliminar archivo"
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#ef4444"; e.currentTarget.style.color = "white"; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#fef2f2"; e.currentTarget.style.color = "#ef4444"; }}
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
        onClose={() => setIsModalOpen(false)} // Si hace clic en la X, solo se cierra
        title="Confirmar eliminación"
        maxWidth="400px"
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <p style={{ margin: 0, color: "#334155", fontSize: "1rem" }}>
            ¿Estás seguro de que deseas eliminar permanentemente el archivo <br/>
            <strong>"{fileToDelete}"</strong>?
          </p>
        </div>

        {/* Botones del Modal */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <button 
            onClick={() => setIsModalOpen(false)}
            style={{
              padding: "10px 20px", backgroundColor: "#e2e8f0", color: "#475569",
              border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer"
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