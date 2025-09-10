import pandas as pd
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.responses import JSONResponse
from MAT151 import tema2   # importamos las funciones del Tema 2
from MAT151.tema2 import tabla_por_clases
from MAT151 import tema3  # importar funciones de Tema 3
from MAT151 import tema4
from MAT151 import tema5


from pydantic import BaseModel
import statistics
import math
from typing import Optional

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
    tema: str 
    pesos: Optional[list[float]] = None  # para media ponderada

# Modelo de entrada para Tema 5 (dos variables)
class DataBivariada(BaseModel):
    x: list[float]
    y: list[float]
    tipo: str  # covarianza, correlacion, regresion

@app.post("/calcular")
async def calcular(data: DataInput):
    datos = data.datos
    tipo = data.tipo.lower()

    if len(datos) == 0:
        return {"error": "No se enviaron datos"}

    try:
         # ----------------- TEMA 2 -----------------

        if tipo == "frecuencia_absoluta":
            return tema2.calcular_frecuencia_absoluta(datos)
        elif tipo == "frecuencia_relativa":
            return tema2.calcular_frecuencia_relativa(datos)
        elif tipo == "frecuencia_acumulada":
            return tema2.calcular_frecuencia_acumulada(datos)
        elif tipo == "frecuencia_acumulada_relativa":
            return tema2.calcular_frecuencia_acumulada_relativa(datos)
        elif tipo == "numero_clases":
            return {"resultado": tema2.calcular_numero_clases(datos)}
        elif tipo == "tabla_clases":
          resultado = tabla_por_clases(datos)
          return {"resultado": resultado}
        
         # ----------------- TEMA 3 -----------------

        elif data.tema.lower() == "tema3":
          if tipo == "media":
            return tema3.calcular_media(datos)
          elif tipo == "media_geometrica":
           return tema3.calcular_media_geometrica(datos)
          elif tipo == "media_ponderada":
           if not data.pesos:
               return {"error": "Se requieren los pesos para calcular la media ponderada"}
           return tema3.calcular_media_ponderada(datos, data.pesos)

          elif tipo == "mediana":
            return tema3.calcular_mediana(datos)
          elif tipo == "moda":
            return tema3.calcular_moda(datos)
            # si más adelante agregas media ponderada o geométrica, aquí van

      # ----------------- TEMA 4 -----------------
        elif data.tema.lower() == "tema4":
            if tipo == "varianza":
                return tema4.calcular_varianza(datos)
            elif tipo == "desviacion":
                return tema4.calcular_desviacion(datos)
            elif tipo == "rango":
                return tema4.calcular_rango(datos)
            elif tipo == "coef_variacion":
                return tema4.calcular_coef_variacion(datos)


        else:
            return {"error": f"Tipo de cálculo '{tipo}' no reconocido"}
    except Exception as e:
        return {"error": str(e)}
    
    @app.post("/calcular_bivariada")
    async def calcular_bivariada(data: DataBivariada):
        x = data.x
        y = data.y
        tipo = data.tipo.lower()

    try:
         if tipo == "covarianza":
               return tema5.calcular_covarianza(x, y)
         elif tipo == "correlacion":
                return tema5.calcular_correlacion(x, y)
         elif tipo == "regresion":
             return tema5.calcular_regresion_lineal(x, y)
         else:
                return {"error": f"Tipo de cálculo '{tipo}' no reconocido"}
    except Exception as e:
            return {"error": str(e)}