/* export default function Excels() {
  return (
    <div>
      <h2>Gestión de Excels</h2>
      <p>Aquí podrás subir y ver archivos Excel.</p>
    </div>
  );
}
 */

/* import { useState } from "react";
import ExcelViewer from "../components/ExcelViewer";
import ExcelReader from "../components/ExcelReader";
import ExcelUploader from "../components/ExcelUploader";
import ExcelContent from "../components/ExcelContent";


export default function Archivos() {
  const [refreshFiles, setRefreshFiles] = useState(false);

  return (
    <div>
      <h1>Archivos Excel</h1>

      <ExcelUploader setRefreshFiles={setRefreshFiles} />

      <ExcelViewer refreshFiles={refreshFiles} setRefreshFiles={setRefreshFiles} />
      <ExcelReader />
    </div>
  );
}
 */


import { useState } from "react";
import ExcelViewer from "../components/ExcelViewer";
import ExcelReader from "../components/ExcelReader";
import ExcelUploader from "../components/ExcelUploader";
import ExcelContent from "../components/ExcelContent";

export default function Archivos() {
  const [refreshFiles, setRefreshFiles] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // archivo elegido

  return (
    <div>
      <h1>Archivos Excel</h1>

      {/* Subida */}
      <ExcelUploader setRefreshFiles={setRefreshFiles} />

      {/* Lista de archivos con opción de seleccionar */}
      <ExcelViewer 
        refreshFiles={refreshFiles} 
        setRefreshFiles={setRefreshFiles}
        onSelectFile={setSelectedFile} 
        
      />

      {/* Vista previa del archivo seleccionado */}
      {selectedFile && (
        <div style={{ marginTop: "20px" }}>
          <ExcelContent filename={selectedFile} />
        </div>
      )}

      {/* Lector local (opcional) */}
      <ExcelReader />
    </div>
  );
}
