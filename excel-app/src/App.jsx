/* import ExcelViewer from "./components/ExcelViewer";
import ExcelUploader from "./components/ExcelUploader";

function App() {
  return (
    <div>
      <h1>Proyecto Excel con Vite + FastAPI</h1>
      <ExcelUploader />
      <ExcelViewer />
    </div>
  );
}

export default App;
 */
import { useState } from "react";
import ExcelUploader from "./components/ExcelUploader";
import ExcelViewer from "./components/ExcelViewer";

function App() {
  const [refreshFiles, setRefreshFiles] = useState(false);

  return (
    <div>
      <h1>Mi Proyecto Excel</h1>
      <ExcelUploader setRefreshFiles={setRefreshFiles} />
      <ExcelViewer refreshFiles={refreshFiles} setRefreshFiles={setRefreshFiles} />
    </div>
  );
}

export default App;
