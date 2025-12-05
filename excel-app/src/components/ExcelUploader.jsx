/* import { useState } from "react";

export default function ExcelUploader({ setRefreshFiles }) {
  const [file, setFile] = useState(null);
  const [autor, setAutor] = useState("");  // nuevo
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file || !autor) {
      setMessage("Debe seleccionar un archivo y escribir su nombre");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("autor", autor); // enviar autor

  

    try {
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setMessage(data.message);

      // refrescar lista de archivos
      setRefreshFiles(prev => !prev);
    } catch (err) {
      console.error(err);
      setMessage("Error al subir archivo");
    }
  };

  return (
    <div>
      <h2>- Subir archivo Excel -</h2>
      <input type="text" placeholder="Nombre del autor" value={autor} onChange={e => setAutor(e.target.value)} /> <br />
      <input type="file"  onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Subir</button>
      {message && <p>{message}</p>}
    </div>
  );
}
 */



import { useState } from "react";

export default function ExcelUploader({ onUpload }) {
  const [file, setFile] = useState(null);

  const handleSubmit = () => {
    if (file) {
      onUpload(file); // Le pasa el archivo al padre (Archivos.jsx)
      setFile(null);  // Limpia el estado local
      // Limpiar input visualmente
      document.getElementById("fileInput").value = "";
    } else {
      alert("Selecciona un archivo primero.");
    }
  };

  return (
    <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
      <h3>Subir Archivo</h3>
      <input 
        id="fileInput"
        type="file" 
        accept=".xlsx, .xls"
        onChange={(e) => setFile(e.target.files[0])} 
      />
      <button onClick={handleSubmit} style={{ marginLeft: "10px" }}>
        Subir
      </button>
    </div>
  );
}