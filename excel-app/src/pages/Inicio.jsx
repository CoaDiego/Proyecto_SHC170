/* export default function Inicio() {
  return (
    <div>
      <h2>Página de Inicio</h2>
      <p>Bienvenido a mi proyecto 🚀</p>
    </div>
  );
}
 */

import { useState } from "react";
import ExcelUploader from "../components/ExcelUploader";

export default function Inicio() {
  const [refreshFiles, setRefreshFiles] = useState(false);

  return (
    <div>
      <h1>Subir Archivos Excel</h1>
      <ExcelUploader setRefreshFiles={setRefreshFiles} />
    </div>
  );
}
