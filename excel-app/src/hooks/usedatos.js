import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { generarColorAleatorio } from '../utils/excelHelpers';
import { alerta } from "../utils/Notificaciones";

export const useSimuladorLogic = (usuario) => {
  const [workbook, setWorkbook] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [currentSheet, setCurrentSheet] = useState("");
  const [rowData, setRowData] = useState([]);
  const [variables, setVariables] = useState([]);
  const [limiteFilas, setLimiteFilas] = useState(50);

  const cargarHoja = useCallback((wb, sheetName, limite = limiteFilas) => {
    if (!wb) return;
    setCurrentSheet(sheetName);
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws, { header: "A", defval: "" }).slice(0, limite);
    
    console.log("📊 Filas extraídas del Excel:", data.length); // 👈 Chismoso para la consola
    setRowData(data);
  }, [limiteFilas]);

  // 1. MÉTODO LOCAL (Restaurado a tu versión original que funcionaba)
  const handleFileUpload = (e) => {
    const file = e.target?.files ? e.target.files[0] : null;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        setWorkbook(wb);
        setSheetNames(wb.SheetNames);
        setVariables([]); 
        cargarHoja(wb, wb.SheetNames[0], 50);
        alerta.success("Archivo cargado", `"${file.name}" leído correctamente.`);
      } catch (error) {
        console.error("Error local:", error);
        alerta.error("Error", "No se pudo leer el archivo Excel.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // 2. 🆕 NUEVO MÉTODO NUBE: Lee los bytes puros sin usar FileReader
  const procesarBufferExcel = (buffer, fileName) => {
    try {
      // Leemos el buffer que nos manda FastAPI directamente
      const data = new Uint8Array(buffer);
      const wb = XLSX.read(data, { type: 'array' });
      
      if (wb.SheetNames.length === 0) throw new Error("Excel sin hojas");

      setWorkbook(wb);
      setSheetNames(wb.SheetNames);
      setVariables([]);
      cargarHoja(wb, wb.SheetNames[0], 50);
      alerta.success("Sincronizado", `"${fileName}" cargado de tu nube.`);
    } catch (error) {
      console.error("Error de nube:", error);
      alerta.error("Error", "El archivo de la nube está dañado o vacío.");
    }
  };

  const agregarVariable = () => { /* tu código actual */ };
  const eliminarVariable = (id) => { /* tu código actual */ };
  const actualizarVariable = (id, data) => { /* tu código actual */ };

  return {
    usuario,
    workbook,
    sheetNames,
    currentSheet,
    rowData,
    variables,
    limiteFilas,
    setVariables,
    setLimiteFilas,
    handleFileUpload,
    procesarBufferExcel, // 👈 Exponemos la nueva función
    cargarHoja,
    agregarVariable,
    eliminarVariable,
    actualizarVariable
  };
};