
import { useState } from "react";
import ExcelUploader from "./components/ExcelUploader";
import ExcelViewer from "./components/ExcelViewer";
import ExcelReader from "./components/ExcelReader";
import Calculator from "./components/Calculator";

function App() {
  const [refreshFiles, setRefreshFiles] = useState(false);

  return (
    <div>
      <h1>Mi Proyecto Excel</h1>
      <ExcelUploader setRefreshFiles={setRefreshFiles} />
      <ExcelViewer refreshFiles={refreshFiles} setRefreshFiles={setRefreshFiles} />
       <ExcelReader />
       <h1>Proyecto MAT151</h1>
      <Calculator />
    </div>
  );
}

export default App;
