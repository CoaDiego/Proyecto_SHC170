import { useState } from "react";

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
