/* export default function Excels() {
  return (
    <div>
      <h2>Gestión de Excels</h2>
      <p>Aquí podrás subir y ver archivos Excel.</p>
    </div>
  );
}
 */

import { useState } from "react";
import ExcelViewer from "../components/ExcelViewer";
import ExcelReader from "../components/ExcelReader";

export default function Excels() {
  const [refreshFiles, setRefreshFiles] = useState(false);

  return (
    <div>
      <h1>Archivos Excel</h1>
      <ExcelViewer refreshFiles={refreshFiles} setRefreshFiles={setRefreshFiles} />
      <ExcelReader />
    </div>
  );
}
