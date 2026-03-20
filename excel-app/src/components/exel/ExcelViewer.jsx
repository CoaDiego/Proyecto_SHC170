import { useState } from "react";
//  IMPORTAMOS EL MODAL (Ajusta la ruta si está en otra carpeta)
import Modal from "../../utils/Modal";

import "../../styles/components/excel/ExcelViewer.css";

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
      <div className="container_Viewer">
        {/*  Adaptado a texto principal */}
        <h4>Archivos Disponibles</h4>
        <span>
          {files.length} {files.length === 1 ? 'archivo' : 'archivos'}
        </span>
      </div>

      {/* ESTADO VACÍO */}
      {files.length === 0 ? (
        <div className="container_Viewer_vacio">
          <p>No hay archivos en el servidor.</p>
        </div>
      ) : (
        /* LISTA DE ARCHIVOS */
        <ul className="container_lista">
          {files.map((f, index) => (
            <li
              key={index}
              className="container_lista_li"
              onMouseOver={(e) => e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.15)"}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"}
            >

              {/* IZQUIERDA: Nombre del archivo */}
              <div className="container_name_file">
                <p>
                  {f.filename}
                </p>
              </div>

              {/* DERECHA: Botones de acción */}
              <div className="container_button">
                <button
                  onClick={() => onSelect(f.filename)}
                  className="container_button_1"
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "var(--accent-color)"; e.currentTarget.style.color = "white"; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--accent-color)"; }}
                >
                  Ver
                </button>

                <button
                  onClick={() => openDeleteModal(f.filename)}
                  className="container_button_2"
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
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirmar eliminación"
        maxWidth="400px"
      >
        <div className="modal_viewer">
          <p>
            ¿Estás seguro de que deseas eliminar permanentemente el archivo <br />
            <strong>"{fileToDelete}"</strong>?
          </p>
        </div>

        <div className="modal_viewer_button">
          <button
            onClick={() => setIsModalOpen(false)}
            className="modal_viewer_button_si"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirmDelete}
            className="modal_viewer_button_no "
          >
            Eliminar
          </button>
        </div>
      </Modal>

    </div>
  );
}