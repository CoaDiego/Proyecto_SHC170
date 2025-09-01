import ExcelViewer from "./components/ExcelViewer";
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

