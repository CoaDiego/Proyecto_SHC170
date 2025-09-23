import pandas as pd
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from MAT151 import tema2, tema3, tema4, tema5, tema6
from MAT151.tema2 import tabla_por_clases

from pydantic import BaseModel
from typing import Optional, List
import os, shutil

app = FastAPI()

# =======================
# Configuración CORS
# =======================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # ⚠️ En producción restringir
    allow_methods=["*"],
    allow_headers=["*"],
)

# =======================
# RUTA PRINCIPAL (para evitar 404 en "/")
# =======================
@app.get("/")
async def root():
    return {"message": "API de Estadística funcionando. Visita /docs para probar los endpoints."}

# =======================
# FAVICON (para evitar 404 en "/favicon.ico")
# =======================
@app.get("/favicon.ico")
async def favicon():
    return {}


# =======================
# Carpeta para Excel
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
    return {"files": os.listdir(EXCEL_FOLDER)}

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
# Ver archivo Excel en JSON
# =======================
""" @app.get("/view/{filename}")
async def view_excel(filename: str):
    file_path = os.path.join(EXCEL_FOLDER, filename)
    if os.path.exists(file_path):
        df = pd.read_excel(file_path)
        return JSONResponse(content=df.to_dict(orient="records"))
    return {"error": "Archivo no encontrado"} """

@app.get("/view/{filename}")
async def view_excel(filename: str, hoja: int = 0):

    file_path = os.path.join("excels", filename)
    if not os.path.exists(file_path):
        return {"error": "Archivo no encontrado"}

    try:
        # Abrir Excel dentro de un contexto para liberar handle
        with pd.ExcelFile(file_path) as xls:
            df = pd.read_excel(xls, sheet_name=hoja, header=None)
            df = df.dropna(how="all")
            if df.empty:
                return {"error": "Archivo sin datos detectables"}
            df.columns = [f"Col {i+1}" for i in range(len(df.columns))]
            json_data = df.to_dict(orient="records")  # convertir dentro del contexto

        return JSONResponse(content=json_data)

    except Exception as e:
        return {"error": f"Error al leer el Excel: {e}"}



# ========= Listar hojas del archivo ==============
@app.get("/view/{filename}")
async def view_excel(filename: str, hoja: int = 0):
    import pandas as pd
    import os
    from fastapi.responses import JSONResponse

    file_path = os.path.join("excels", filename)
    if not os.path.exists(file_path):
        return {"error": "Archivo no encontrado"}

    try:
        # Abrir Excel dentro de un contexto
        with pd.ExcelFile(file_path) as xls:
            df = pd.read_excel(xls, sheet_name=hoja, header=None)
            df = df.dropna(how="all")
            if df.empty:
                return {"error": "Archivo sin datos detectables"}
            df.columns = [f"Col {i+1}" for i in range(len(df.columns))]
            # Convertir a JSON dentro del contexto
            json_data = df.to_dict(orient="records")

        return JSONResponse(content=json_data)

    except Exception as e:
        return {"error": f"Error al leer el Excel: {e}"}


# ======== Eliminar archivo ===============
@app.delete("/files/{filename}")
async def delete_file(filename: str):
    file_path = os.path.join(EXCEL_FOLDER, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        return {"message": f"Archivo {filename} eliminado correctamente"}
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
    X: List[List[float]]  # Cada sublista es una variable independiente
    y: List[float]        # Variable dependiente
    tipo: str             # Solo "regresion_multivariante"

# =======================
# Diccionarios de funciones por tema
# =======================
tema2_funciones = {
    "frecuencia_absoluta": tema2.calcular_frecuencia_absoluta,
    "frecuencia_relativa": tema2.calcular_frecuencia_relativa,
    "frecuencia_acumulada": tema2.calcular_frecuencia_acumulada,
    "frecuencia_acumulada_relativa": tema2.calcular_frecuencia_acumulada_relativa,
    "numero_clases": lambda datos: {"resultado": tema2.calcular_numero_clases(datos)},
    "tabla_clases": lambda datos: {"resultado": tabla_por_clases(datos)},

    "minimo": tema2.calcular_minimo,
    "maximo": tema2.calcular_maximo,
    "cuartiles": tema2.calcular_cuartiles,
    "percentil": lambda datos, p=25: {"resultado": tema2.calcular_percentil(datos, p)},
    "rango_intercuartilico": tema2.calcular_rango_intercuartilico
    
}

tema3_funciones = {
    "media": tema3.calcular_media,
    "media_geometrica": tema3.calcular_media_geometrica,
    "media_ponderada": tema3.calcular_media_ponderada,
    "mediana": tema3.calcular_mediana,
    "moda": tema3.calcular_moda,
     # Nuevas funciones
    "media_agrupada": tema3.media_agrupada,
    "mediana_agrupada": tema3.mediana_agrupada,
    "moda_agrupada": tema3.moda_agrupada
}

tema4_funciones = {
    "varianza": tema4.calcular_varianza,
    "desviacion": tema4.calcular_desviacion,
    "rango": tema4.calcular_rango,
    "coef_variacion": tema4.calcular_coef_variacion,
}

# Diccionario general por tema
temas_dict = {
    "tema2": tema2_funciones,
    "tema3": tema3_funciones,
    "tema4": tema4_funciones,
}

# =======================
# ENDPOINT DE CÁLCULOS GENERALES (Temas 2-4)
# =======================
@app.post("/calcular")
async def calcular(data: DataInput):
    datos = data.datos
    tema = data.tema.lower()
    tipo = data.tipo.lower()
    

    if not datos:
        return {"error": "No se enviaron datos"}

    funciones = temas_dict.get(tema)
    if not funciones:
        return {"error": f"Tema '{tema}' no soportado"}

    funcion = funciones.get(tipo)
    if not funcion:
        return {"error": f"Tipo de cálculo '{tipo}' no reconocido"}

    try:
        if tema == "tema2" and tipo == "percentil":
         p = getattr(data, "p", 25)  # Si viene en el body, lo usamos; si no, 25
         return funcion(datos, p)

        # Para media ponderada necesitamos pasar pesos
        if tema == "tema3" and tipo == "media_ponderada":
            if not data.pesos:
                return {"error": "Se requieren los pesos para calcular la media ponderada"}
            return funcion(datos, data.pesos)
        # Para cálculos agrupados del Tema3
        if tema == "tema3" and tipo in ["media_agrupada", "mediana_agrupada", "moda_agrupada"]:
            return funcion(datos)  # enviamos datos crudos, Tema3.py se encargará de crear la tabla
        
        # Resto de cálculos
        return funcion(datos)

    except Exception as e:
        return {"error": str(e)}

# =======================
# ENDPOINT PARA TEMA5 (Bivariado)
# =======================
@app.post("/calcular_bivariada")
async def calcular_bivariada(data: DataBivariada):
    x, y, tipo = data.x, data.y, data.tipo.lower()
    try:
        if tipo == "covarianza":
            return tema5.calcular_covarianza(x, y)
        elif tipo == "correlacion":
            return tema5.calcular_correlacion(x, y)
        elif tipo in ("regresion", "recta_regresion"):
            return tema5.calcular_regresion_lineal(x, y)
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

# =======================
# ENDPOINT PARA TEMA6 (Multivariante)
# =======================
@app.post("/calcular_multivariante")
async def calcular_multivariante(data: DataMultivariante):
    X, y, tipo = data.X, data.y, data.tipo.lower()

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
