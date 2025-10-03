import { useEffect, useState } from "react";

export default function ExcelViewer({ refreshFiles, onSelectFile }) {
  const [files, setFiles] = useState([]); // ahora cada file = { filename, author }

  // Traer archivos desde la API cada vez que refreshFiles cambie
  useEffect(() => {
    fetch("http://127.0.0.1:8000/files")
      .then((res) => res.json())
      .then((data) => {
        if (data.files) {
          setFiles(data.files);
        }
      })
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
        // actualizar estado
        setFiles((prev) => prev.filter((f) => f.filename !== filename));
        onSelectFile && onSelectFile(null);
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error("Error al eliminar archivo:", err);
    }
  };

  // Agrupar archivos por autor
  const filesByAuthor = files.reduce((acc, f) => {
    const author = f.author || "Desconocido";
    if (!acc[author]) acc[author] = [];
    acc[author].push(f);
    return acc;
  }, {});

  return (
    <div>
      <h2>- Archivos subidos -</h2>

      {files.length === 0 ? (
        <p>No hay archivos.</p>
      ) : (
        <>
          {/* Lista simple */}
          <h3>Lista de Archivos:</h3>
          <ul>
            {files.map((f) => (
              <li key={f.filename}>
                {f.filename} ({f.author || "Desconocido"}){" "}
                <button onClick={() => onSelectFile(f.filename)}>Ver contenido</button>{" "}
                <button onClick={() => handleDelete(f.filename)}>Eliminar</button>
              </li>
            ))}
          </ul>

          {/* Lista agrupada por autor */}
          <h3>Por autor/docente:</h3>
          {Object.entries(filesByAuthor).map(([author, fList]) => (
            <div key={author} style={{ marginBottom: "10px" }}>
              <strong>{author}</strong>
              <ul>
                {fList.map((f) => (
                  <li key={f.filename}>
                    {f.filename}{" "}
                    <button onClick={() => onSelectFile(f.filename)}>Ver contenido</button>{" "}
                    <button onClick={() => handleDelete(f.filename)}>Eliminar</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
