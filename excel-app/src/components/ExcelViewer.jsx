import { useEffect, useState } from "react";

export default function ExcelViewer({ refreshFiles, onSelectFile }) {
  const [files, setFiles] = useState([]);

  // Traer archivos desde la API cada vez que refreshFiles cambie
  useEffect(() => {
    fetch("http://127.0.0.1:8000/files")
      .then((res) => res.json())
      .then((data) => setFiles(data.files))
      .catch((err) => console.error("Error al obtener archivos:", err));
  }, [refreshFiles]);

  const handleDelete = async (filename) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/files/${encodeURIComponent(filename)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.message) {
        alert(data.message);
        setFiles((prev) => prev.filter((f) => f !== filename));
        onSelectFile && onSelectFile(null);
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error("Error al eliminar archivo:", err);
    }
  };

  return (
    <div>
      <h2>- Archivos subidos -</h2>
      {files.length === 0 ? (
        <p>No hay archivos.</p>
      ) : (
        <ul>
          {files.map((file) => (
            <li key={file} style={{ marginBottom: "5px" }}>
              {file}{" "}
              <button onClick={() => onSelectFile(file)}>Ver contenido</button>{" "}
              <button onClick={() => handleDelete(file)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

