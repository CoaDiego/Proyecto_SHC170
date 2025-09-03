import pandas as pd
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.responses import JSONResponse

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
    tipo: str  # media, mediana, moda, varianza, desviacion, frecuencias

@app.post("/calcular")
async def calcular(data: DataInput):
    datos = data.datos
    tipo = data.tipo.lower()

    if len(datos) == 0:
        return {"error": "No se enviaron datos"}

    try:
        if tipo == "media":
            return {"resultado": statistics.mean(datos)}
        elif tipo == "mediana":
            return {"resultado": statistics.median(datos)}

        elif tipo == "moda":
            return {"resultado": statistics.mode(datos)}

        elif tipo == "varianza":
            return {"resultado": statistics.variance(datos)}

        elif tipo == "desviacion":
            return {"resultado": statistics.stdev(datos)}

        elif tipo == "frecuencias":
            # distribución simple, no por intervalos
            tabla = {}
            for x in datos:
                tabla[x] = tabla.get(x, 0) + 1
            return {"resultado": [{"valor": k, "f": v} for k, v in tabla.items()]}
        
        
        #Nuevos Calculos#########
        elif tipo == "frecuencia_absoluta":
        # contar ocurrencias de cada valor
            tabla = {}
            for x in datos:
                tabla[x] = tabla.get(x, 0) + 1
            return {"resultado": [{"valor": k, "f": v} for k, v in tabla.items()]}
        elif tipo == "frecuencia_relativa":
            tabla = {}
            for x in datos:
                tabla[x] = tabla.get(x, 0) + 1
            n = len(datos)
            return {"resultado": [{"valor": k, "h": v / n} for k, v in tabla.items()]}
        
        elif tipo == "frecuencia_acumulada":
            tabla = {}
            for x in datos:
                tabla[x] = tabla.get(x, 0) + 1
            acumulada = 0
            resultado = []
            for k, v in sorted(tabla.items()):
                acumulada += v
                resultado.append({"valor": k, "F": acumulada})
            return {"resultado": resultado}
        
        elif tipo == "frecuencia_acumulada_relativa":
            tabla = {}
            for x in datos:
                tabla[x] = tabla.get(x, 0) + 1
            n = len(datos)
            acumulada = 0
            resultado = []
            for k, v in sorted(tabla.items()):
                acumulada += v / n
                resultado.append({"valor": k, "H": acumulada})
            return {"resultado": resultado}


        ###########################

    except Exception as e:
        return {"error": str(e)}