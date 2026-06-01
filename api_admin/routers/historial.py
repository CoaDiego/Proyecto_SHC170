import os
import json
from datetime import datetime
from typing import Any, Dict, Optional
from fastapi import APIRouter, Query, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
import models
from routers.archivos import sanitizar_nombre_carpeta

router = APIRouter()
HISTORIAL_FOLDER = "historial"
os.makedirs(HISTORIAL_FOLDER, exist_ok=True)

class RegistroHistorial(BaseModel):
    autor: str
    calculo: str
    archivo_origen: str
    snapshot: Optional[Dict[str, Any]] = None

def obtener_ruta_historial(autor: str, db: Session) -> str:
    user = db.query(models.Usuario).filter(models.Usuario.nombre == autor).first()
    if user:
        nombre_sanitizado = sanitizar_nombre_carpeta(user.nombre)
        carpeta_nombre = f"{nombre_sanitizado}_{user.id}"
    else:
        nombre_sanitizado = sanitizar_nombre_carpeta(autor)
        carpeta_nombre = nombre_sanitizado
    return os.path.join(HISTORIAL_FOLDER, carpeta_nombre)

@router.post("/guardar_historial")
async def guardar_historial(registro: RegistroHistorial, db: Session = Depends(get_db)):
    try:
        user_historial_folder = obtener_ruta_historial(registro.autor, db)
        os.makedirs(user_historial_folder, exist_ok=True)
        
        historial_file = os.path.join(user_historial_folder, "historial.json")
        historial_data = []
        if os.path.exists(historial_file):
            with open(historial_file, "r", encoding="utf-8") as f:
                historial_data = json.load(f)
        
        nuevo_registro = {
            "id": f"HIST_{int(datetime.now().timestamp())}",
            "fecha": datetime.now().strftime("%d/%m/%Y"),
            "hora": datetime.now().strftime("%H:%M:%S"),
            "calculo": registro.calculo,
            "archivo_origen": registro.archivo_origen,
            "snapshot": registro.snapshot
        }
        
        historial_data.insert(0, nuevo_registro)
        with open(historial_file, "w", encoding="utf-8") as f:
            json.dump(historial_data, f, indent=4)
            
        return {"message": "Historial guardado con éxito", "registro": nuevo_registro}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.get("/obtener_historial")
async def obtener_historial(autor: str = Query(...), db: Session = Depends(get_db)):
    user_historial_folder = obtener_ruta_historial(autor, db)
    historial_file = os.path.join(user_historial_folder, "historial.json")
    if not os.path.exists(historial_file):
        return {"historial": []}
        
    with open(historial_file, "r", encoding="utf-8") as f:
        return {"historial": json.load(f)}

@router.delete("/eliminar_historial/{registro_id}")
async def eliminar_historial(registro_id: str, autor: str = Query(...), db: Session = Depends(get_db)):
    user_historial_folder = obtener_ruta_historial(autor, db)
    historial_file = os.path.join(user_historial_folder, "historial.json")
    if not os.path.exists(historial_file):
        return JSONResponse(status_code=404, content={"error": "Historial no encontrado"})
        
    with open(historial_file, "r", encoding="utf-8") as f:
        historial_data = json.load(f)
        
    nuevo_historial = [reg for reg in historial_data if reg.get("id") != registro_id]
    with open(historial_file, "w", encoding="utf-8") as f:
        json.dump(nuevo_historial, f, indent=4)
        
    return {"message": "Registro eliminado con éxito"}