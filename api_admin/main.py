import pandas as pd
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.responses import JSONResponse
from MAT151 import tema2   # 👈 importamos las funciones del Tema 2

from pydantic import BaseModel
import statistics
import math

import os
import shutil

app = FastAPI()

# Configuración CORS para React local
app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://127.0.0.1:5173"],  # tu app React
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Carpeta donde se guardan los Excel
EXCEL_FOLDER = "excels"

# Crear carpeta si no existe
os.makedirs(EXCEL_FOLDER, exist_ok=True)

# =======================
# Subir archivo Excel
# =======================
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(EXCEL_FOLDER, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"message": f"Archivo {file.filename} subido correctamente!"}

# =======================
# Listar archivos Excel
# =======================
@app.get("/files")
async def list_files():
    files = os.listdir(EXCEL_FOLDER)
    return {"files": files}

# =======================
# Descargar/abrir un archivo Excel
# =======================
@app.get("/files/{filename}")
async def get_file(filename: str):
    file_path = os.path.join(EXCEL_FOLDER, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return {"error": "Archivo no encontrado"}

# =======================
# Ruta raíz para prueba
# =======================
@app.get("/")
async def root():
    return {"message": "API funcionando correctamente"}


@app.get("/view/{filename}")
async def view_excel(filename: str):
    file_path = os.path.join(EXCEL_FOLDER, filename)
    if os.path.exists(file_path):
        df = pd.read_excel(file_path)
        return JSONResponse(content=df.to_dict(orient="records"))
    return {"error": "Archivo no encontrado"}


 
# Modelo de entrada
class DataInput(BaseModel):
    datos: list[float]
    tipo: str  # media, mediana, moda, varianza, etc.

@app.post("/calcular")
async def calcular(data: DataInput):
    datos = data.datos
    tipo = data.tipo.lower()

    if len(datos) == 0:
        return {"error": "No se enviaron datos"}

    try:
        if tipo == "media":
            return tema2.calcular_media(datos)
        elif tipo == "mediana":
            return tema2.calcular_mediana(datos)
        elif tipo == "moda":
            return tema2.calcular_moda(datos)
        elif tipo == "varianza":
            return tema2.calcular_varianza(datos)
        elif tipo == "desviacion":
            return tema2.calcular_desviacion(datos)
        elif tipo == "frecuencia_absoluta":
            return tema2.calcular_frecuencia_absoluta(datos)
        elif tipo == "frecuencia_relativa":
            return tema2.calcular_frecuencia_relativa(datos)
        elif tipo == "frecuencia_acumulada":
            return tema2.calcular_frecuencia_acumulada(datos)
        elif tipo == "frecuencia_acumulada_relativa":
            return tema2.calcular_frecuencia_acumulada_relativa(datos)
        else:
            return {"error": f"Tipo de cálculo '{tipo}' no reconocido"}
    except Exception as e:
        return {"error": str(e)}