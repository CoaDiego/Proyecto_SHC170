import { useState } from "react";

/* export default function ExcelUploader() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
  if (!file) return;
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    });

    // Verifica si la respuesta fue exitosa
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    const data = await res.json();
    setMessage(data.message);
  } catch (err) {
    console.error("Error real:", err);
    setMessage("Error al subir archivo: " + err.message);
  }
};

  return (
    <div>
      <h2>Subir archivo Excel</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Subir</button>
      {message && <p>{message}</p>}
    </div>
  );
} */

export default function ExcelUploader({ setRefreshFiles }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setMessage(data.message);

      // Avisar al componente ExcelViewer que hay que refrescar la lista
      setRefreshFiles(prev => !prev);
    } catch (err) {
      console.error(err);
      setMessage("Error al subir archivo");
    }
  };

  return (
    <div>
      <h2>Subir archivo Excel</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Subir</button>
      {message && <p>{message}</p>}
    </div>
  );
}
