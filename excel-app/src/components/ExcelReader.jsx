import { useState } from "react";
import * as XLSX from "xlsx";

export default function ExcelReader() {
  const [data, setData] = useState([]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
a
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
      setData(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div>
      <h2> - Ver contenido del Excel - </h2>
      <input type="file" onChange={handleFile} />
      <table border="1">
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
