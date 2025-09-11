import pandas as pd
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from MAT151 import tema2   # importamos las funciones del Tema 2
from MAT151.tema2 import tabla_por_clases
from MAT151 import tema3  # importar funciones de Tema 3
from MAT151 import tema4
from MAT151 import tema5
from MAT151 import tema6


from pydantic import BaseModel
import os
import shutil
from typing import Optional, List

app = FastAPI()

# =======================
# Configuración CORS
# =======================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # ⚠️ en producción restringe esto
    allow_methods=["*"],
    allow_headers=["*"],
)

# =======================
# Carpeta donde se guardan los Excel
# =======================
EXCEL_FOLDER = "excels"
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
# Descargar archivo Excel
# =======================
@app.get("/files/{filename}")
async def get_file(filename: str):
    file_path = os.path.join(EXCEL_FOLDER, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return {"error": "Archivo no encontrado"}

# =======================
# Ruta raíz de prueba
# =======================
@app.get("/")
async def root():
    return {"message": "API funcionando correctamente"}

# =======================
# Ver archivo Excel en JSON
# =======================
@app.get("/view/{filename}")
async def view_excel(filename: str):
    file_path = os.path.join(EXCEL_FOLDER, filename)
    if os.path.exists(file_path):
        df = pd.read_excel(file_path)
        return JSONResponse(content=df.to_dict(orient="records"))
    return {"error": "Archivo no encontrado"}


# =======================
# MODELOS DE DATOS
# =======================
class DataInput(BaseModel):
    datos: List[float]
    tipo: str   # media, mediana, moda, varianza, etc.
    tema: str
    pesos: Optional[List[float]] = None  # para media ponderada

class DataBivariada(BaseModel):
    x: List[float]
    y: List[float]
    tipo: str  # covarianza, correlacion, regresion

class DataMultivariante(BaseModel):
    X: List[List[float]]  # Lista de listas: cada sublista es una variable independiente
    y: List[float]        # Variable dependiente
    tipo: str             # Solo "regresion_multivariante"



# =======================
# ENDPOINTS DE CÁLCULOS
# =======================
@app.post("/calcular")
async def calcular(data: DataInput):
    datos = data.datos
    tipo = data.tipo.lower()
    tema = data.tema.lower()

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
        elif tema == "tema3":
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

        # ----------------- TEMA 4 -----------------
        elif tema == "tema4":
            if tipo == "varianza":
                return tema4.calcular_varianza(datos)
            elif tipo == "desviacion":
                return tema4.calcular_desviacion(datos)
            elif tipo == "rango":
                return tema4.calcular_rango(datos)
            elif tipo == "coef_variacion":
                return tema4.calcular_coef_variacion(datos)

        return {"error": f"Tipo de cálculo '{tipo}' no reconocido"}
    except Exception as e:
        return {"error": str(e)}


# =======================
# ENDPOINT PARA TEMA 5
# =======================
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
        # Regresion lineal de Tema5
        elif tipo in ("regresion", "recta_regresion"):
            return tema5.calcular_regresion_lineal(x, y)
        # Regresion de Tema6
        elif tipo == "regresion_lineal":
            return tema6.regresion_lineal(x, y)
        elif tipo == "regresion_no_lineal":
            return tema6.regresion_no_lineal(x, y)
        elif tipo == "regresion_multivariante":
            return tema6.regresion_multivariante(x, y)
        else:
            return {"error": f"Tipo de cálculo '{tipo}' no reconocido"}
    except Exception as e:
        return {"error": str(e)}

    
@app.post("/calcular_multivariante")
async def calcular_multivariante(data: DataMultivariante):
    X = data.X
    y = data.y
    tipo = data.tipo.lower()

    if tipo != "regresion_multivariante":
        return {"error": f"Tipo de cálculo '{tipo}' no soportado en este endpoint"}

    try:
        import numpy as np
        from sklearn.linear_model import LinearRegression

        X_array = np.array(X).T  # Transponemos para que cada columna sea una variable
        y_array = np.array(y)

        modelo = LinearRegression()
        modelo.fit(X_array, y_array)

        coef = modelo.coef_.tolist()
        intercept = modelo.intercept_.item() if hasattr(modelo.intercept_, 'item') else modelo.intercept_

        return {"intercepto": intercept, "coeficientes": coef}

    except Exception as e:
        return {"error": str(e)}

