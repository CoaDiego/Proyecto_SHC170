import { useEffect, useState } from "react";

export default function ExcelViewer({ refreshFiles }) {
  const [files, setFiles] = useState([]);

  // Traer archivos desde la API cada vez que refreshFiles cambie
  useEffect(() => {
    fetch("http://127.0.0.1:8000/files")
      .then((res) => res.json())
      .then((data) => setFiles(data.files))
      .catch((err) => console.error("Error al obtener archivos:", err));
  }, [refreshFiles]); // <-- escucha cambios

  return (
    <div>
      <h2>Archivos subidos:</h2>
      {files.length === 0 ? (
        <p>No hay archivos.</p>
      ) : (
        <ul>
          {files.map((file) => (
            <li key={file}>
              <a
                href={`http://127.0.0.1:8000/files/${file}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {file}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
