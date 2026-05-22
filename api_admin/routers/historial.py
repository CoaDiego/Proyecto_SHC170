import os
import json
import urllib.parse
from datetime import datetime
from typing import Any, Dict, Optional  # 👈 Importación corregida
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel

router = APIRouter()
HISTORIAL_FOLDER = "historial"
os.makedirs(HISTORIAL_FOLDER, exist_ok=True)

# 1. MODELO ACTUALIZADO
class RegistroHistorial(BaseModel):
    autor: str
    calculo: str
    archivo_origen: str
    snapshot: Optional[Dict[str, Any]] = None  # 👈 Permite recibir el JSON gigante

@router.post("/guardar_historial")
async def guardar_historial(registro: RegistroHistorial):
    try:
        safe_author = urllib.parse.quote(registro.autor)
        user_historial_folder = os.path.join(HISTORIAL_FOLDER, safe_author)
        os.makedirs(user_historial_folder, exist_ok=True)
        
        historial_file = os.path.join(user_historial_folder, "historial.json")
        historial_data = []
        if os.path.exists(historial_file):
            with open(historial_file, "r", encoding="utf-8") as f:
                historial_data = json.load(f)
        
        # 2. GUARDADO CON SNAPSHOT
        nuevo_registro = {
            "id": f"HIST_{int(datetime.now().timestamp())}",
            "fecha": datetime.now().strftime("%d/%m/%Y"),
            "hora": datetime.now().strftime("%H:%M:%S"),
            "calculo": registro.calculo,
            "archivo_origen": registro.archivo_origen,
            "snapshot": registro.snapshot  # 👈 Se guarda tal cual
        }
        
        historial_data.insert(0, nuevo_registro)
        with open(historial_file, "w", encoding="utf-8") as f:
            json.dump(historial_data, f, indent=4)
            
        return {"message": "Historial guardado con éxito", "registro": nuevo_registro}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.get("/obtener_historial")
async def obtener_historial(autor: str = Query(...)):
    safe_author = urllib.parse.quote(autor)
    historial_file = os.path.join(HISTORIAL_FOLDER, safe_author, "historial.json")
    if not os.path.exists(historial_file):
        return {"historial": []}
        
    with open(historial_file, "r", encoding="utf-8") as f:
        return {"historial": json.load(f)}

@router.delete("/eliminar_historial/{registro_id}")
async def eliminar_historial(registro_id: str, autor: str = Query(...)):
    safe_author = urllib.parse.quote(autor)
    historial_file = os.path.join(HISTORIAL_FOLDER, safe_author, "historial.json")
    if not os.path.exists(historial_file):
        return JSONResponse(status_code=404, content={"error": "Historial no encontrado"})
        
    with open(historial_file, "r", encoding="utf-8") as f:
        historial_data = json.load(f)
        
    nuevo_historial = [reg for reg in historial_data if reg.get("id") != registro_id]
    with open(historial_file, "w", encoding="utf-8") as f:
        json.dump(nuevo_historial, f, indent=4)
        
    return {"message": "Registro eliminado con éxito"}