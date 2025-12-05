export default function ExcelViewer({ files, onSelect, onDelete }) {
  return (
    <div>
      <h3>Lista de Archivos ({files.length})</h3>
      
      {files.length === 0 ? (
        <p>No hay archivos cargados.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {files.map((f, index) => (
            <li key={index} style={{ marginBottom: "10px", border: "1px solid #eee", padding: "5px" }}>
              <strong>{f.filename}</strong>
              <br />
              <div style={{ marginTop: "5px" }}>
                <button onClick={() => onSelect(f.filename)} style={{ marginRight: "5px" }}>
                  Ver
                </button>
                <button onClick={() => onDelete(f.filename)} /* style={{ color: "red" }} */>
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}