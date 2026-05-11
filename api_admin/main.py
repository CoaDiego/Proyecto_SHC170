import pandas as pd
from fastapi import FastAPI, File, UploadFile, Form, Query, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse

from MAT151 import tema2, tema3, tema4, tema5, tema6
from MAT151.tema2 import tabla_por_clases

from pydantic import BaseModel
from typing import Optional, List
import os, shutil
import json

import urllib.parse # 🆕 Nuevo import estándar de Python

app = FastAPI()

# =======================
# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # El asterisco permite que cualquier IP (como tu celular) se conecte
    allow_credentials=True,
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
# 🆕 SIMULADOR DE INGRESO LTI (Integración Moodle)
# =======================
@app.post("/lti/launch")
async def lti_launch(request: Request):
    """
    Recibe la petición POST desde la plataforma educativa (ej. Moodle)
    y redirige al frontend de React con los datos del usuario.
    """
    try:
        # 1. Extraemos los datos del formulario que envía la plataforma
        form_data = await request.form()
        
        # 2. Obtenemos los campos clave (con valores por defecto por si acaso)
        user_id = form_data.get("user_id", "ID_USFX_001")
        full_name = form_data.get("lis_person_name_full", "Estudiante de Prueba")
        roles = form_data.get("roles", "Learner")
        
        # 3. Limpiamos los textos para pasarlos seguros por la URL (evita errores con espacios/tildes)
        safe_name = urllib.parse.quote(full_name)
        safe_role = urllib.parse.quote(roles)
        
        # 4. Construimos la URL hacia tu frontend (Vite corre por defecto en 5173)
        # Asegúrate de que el path coincida con el que pusimos en App.jsx ("/lti-tester")
        target_url = f"http://localhost:5173/lti-tester?name={safe_name}&role={safe_role}&id={user_id}"
        
        # 5. Redirigimos usando un código 303 (See Other) para que el navegador haga GET
        return RedirectResponse(url=target_url, status_code=303)
        
    except Exception as e:
        return {"error": f"Fallo en la conexión LTI: {str(e)}"}
    

# =======================
# 🆕 SISTEMA DE USUARIOS LOCALES (Híbrido)
# =======================
USUARIOS_FILE = "usuarios.json"

# Modelos de datos esperados
# 1. Actualizamos el modelo para que sea más universal
class UsuarioRegistro(BaseModel):
    nombre: str
    usuario: str
    email: str
    perfil: str         # 🆕 Ej: Empresa, Investigador, Estudiante
    institucion: str    # 🆕 Reemplaza a "carrera"
    password: str

class UsuarioLogin(BaseModel):
    usuario: str
    password: str

# Función auxiliar para leer o crear el archivo JSON
def cargar_usuarios():
    if not os.path.exists(USUARIOS_FILE):
        # Si no existe, lo creamos e insertamos a tu usuario Admin por defecto
        default_users = {
            "admin": {
                "nombre": "Diego (Administrador)",
                "password": "123",
                "rol": "Administrador"
            }
        }
        with open(USUARIOS_FILE, "w") as f:
            json.dump(default_users, f)
        return default_users
    
    with open(USUARIOS_FILE, "r") as f:
        return json.load(f)

def guardar_usuarios(usuarios_dict):
    with open(USUARIOS_FILE, "w") as f:
        json.dump(usuarios_dict, f)

# Endpoint 1: Registrar nuevo usuario
# 2. Actualizamos cómo se guarda en el diccionario
@app.post("/registrar_usuario")
async def registrar_usuario(user_data: UsuarioRegistro):
    usuarios = cargar_usuarios()
    
    if user_data.usuario in usuarios:
        return JSONResponse(status_code=400, content={"error": "El nombre de usuario ya está en uso"})
    
    usuarios[user_data.usuario] = {
        "nombre": user_data.nombre,
        "email": user_data.email,
        "perfil": user_data.perfil,           # Nuevo
        "institucion": user_data.institucion, # Nuevo
        "password": user_data.password, 
        "rol": "Usuario Externo" 
    }
    guardar_usuarios(usuarios)
    return {"message": "Usuario registrado con éxito"}

# Endpoint 2: Iniciar sesión manualmente
@app.post("/login_local")
async def login_local(credentials: UsuarioLogin):
    usuarios = cargar_usuarios()
    
    user_info = usuarios.get(credentials.usuario)
    
    if not user_info or user_info["password"] != credentials.password:
        return JSONResponse(status_code=401, content={"error": "Credenciales incorrectas"})
    
    # Si todo está bien, devolvemos el perfil para React
    return {
        "id": credentials.usuario,
        "nombre": user_info["nombre"],
        "rol": user_info["rol"]
    }

    
# =======================
# Carpeta para Excel
# =======================
EXCEL_FOLDER = "excels"
os.makedirs(EXCEL_FOLDER, exist_ok=True)

# =======================
# Subir archivo Excel
# =======================
@app.post("/upload")
async def upload_file(file: UploadFile = File(...), autor: str = Form(...)):
    file_path = os.path.join(EXCEL_FOLDER, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Guardar metadata
    meta_path = os.path.join(EXCEL_FOLDER, f"{file.filename}.meta")
    meta_data = {"filename": file.filename, "author": autor}
    with open(meta_path, "w") as f:
        json.dump(meta_data, f)

    return {"message": f"Archivo {file.filename} subido correctamente!", "author": autor}

# =======================
# Listar archivos Excel
# =======================
""" @app.get("/files")
async def list_files():
    return {"files": os.listdir(EXCEL_FOLDER)}
 """

@app.get("/files")
def list_files():
    files_list = []
    for fname in os.listdir(EXCEL_FOLDER):
        if fname.endswith(".xlsx"):
            meta_file = f"{fname}.meta"
            author = "Desconocido"
            meta_path = os.path.join(EXCEL_FOLDER, meta_file)
            if os.path.exists(meta_path):
                with open(meta_path, "r") as f:
                    meta_data = json.load(f)
                    author = meta_data.get("author", "Desconocido")
            files_list.append({"filename": fname, "author": author})
    return {"files": files_list}



# =======================
# Descargar archivo Excel
# =======================
@app.get("/files/{filename}")
async def get_file(filename: str):
    file_path = os.path.join(EXCEL_FOLDER, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return {"error": "Archivo no encontrado"}


# ========= Ver contenido de una hoja específica ==========
@app.get("/view/{filename}")
async def view_excel(filename: str, hoja: int = 0):
    file_path = os.path.join(EXCEL_FOLDER, filename)
    if not os.path.exists(file_path):
        return {"error": "Archivo no encontrado"}

    try:
        with pd.ExcelFile(file_path) as xls:
            # Leer hoja sin asumir encabezados (header=None) para ver datos crudos
            df = pd.read_excel(xls, sheet_name=hoja)
            
            # Eliminar filas totalmente vacías
            df = df.dropna(how="all")
            
            # 🛠️ CORRECCIÓN CRÍTICA: Reemplazar NaN (vacíos) con None (null en JSON)
            # Esto arregla el problema de las columnas con diferente cantidad de datos
            df = df.where(pd.notnull(df), None)

            if df.empty:
                return {"error": "Archivo sin datos detectables"}
            
            # Renombrar columnas genéricamente para evitar problemas de llaves duplicadas
            df.columns = [str(c) for c in df.columns]
            
            json_data = df.to_dict(orient="records")

        return JSONResponse(content=json_data)

    except Exception as e:
        print(f"Error leyendo Excel: {e}") # Log para debug
        return {"error": f"Error al leer el Excel: {str(e)}"}


# ========= Listar hojas de un archivo ==========
@app.get("/sheets/{filename}")
async def list_sheets(filename: str):
    file_path = os.path.join("excels", filename)
    if not os.path.exists(file_path):
        return {"error": "Archivo no encontrado"}

    try:
        with pd.ExcelFile(file_path) as xls:
            return {"sheets": xls.sheet_names}
    except Exception as e:
        return {"error": f"No se pudieron obtener las hojas: {e}"}
    
    
# ======== Eliminar archivo ===============
@app.delete("/files/{filename}")
async def delete_file(filename: str):
    file_path = os.path.join(EXCEL_FOLDER, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        return {"message": f"Archivo {filename} eliminado correctamente"}
    return {"error": "Archivo no encontrado"}

# =======================
# CREAR TABLA DE CÁLCULO NUEVA
# =======================

@app.post("/create_table")
async def create_table(nombre: str = Query(None), num_columnas: int = 1, num_filas: int = 1):
    import pandas as pd
    import os

    if not nombre:
        # Buscar el siguiente nombre disponible
        existing_files = [f for f in os.listdir(EXCEL_FOLDER) if f.endswith(".xlsx")]
        nombre = f"Ejemplo {len(existing_files)+1}"

    # Crear dataframe vacío con las columnas indicadas
    cols = [f"Col {i+1}" for i in range(num_columnas)]
    df = pd.DataFrame([[0]*num_columnas for _ in range(num_filas)], columns=cols)

    filename = f"{nombre}.xlsx"
    file_path = os.path.join(EXCEL_FOLDER, filename)
    df.to_excel(file_path, index=False, header= False)

    return {"message": "Tabla creada correctamente", "filename": filename}


#correciones al momento de guardar un exel con datos

@app.post("/save_table")
async def save_table(body: dict = Body(...)):
    """
    Recibe JSON:
    {
        "nombre": "Ejemplo 1",
        "tabla": [
            ["1", "2"],
            ["3", "4"]
        ]
    }
    """
    try:
        nombre = body.get("nombre", "Ejemplo")
        tabla = body.get("tabla", [])

        if not tabla:
            return {"error": "No se recibieron datos para la tabla"}

        # Convertir a DataFrame
        df = pd.DataFrame(tabla)
        # Generar nombre de archivo

        df.replace("", pd.NA , inplace= True)
        df.dropna(how="all", inplace= True)


        contador = 1
        base_filename = f"{nombre}.xlsx"
        filepath = os.path.join(EXCEL_FOLDER, base_filename)
        while os.path.exists(filepath):
            contador += 1
            filepath = os.path.join(EXCEL_FOLDER, f"{nombre}_{contador}.xlsx")

        # Guardar Excel
        df.to_excel(filepath, index=False, header= True)

        # Guardar metadata
        meta_path = filepath + ".meta"
        meta_data = {"filename": os.path.basename(filepath), "author": "Usuario"}
        with open(meta_path, "w") as f:
            import json
            json.dump(meta_data, f)

        return {"filename": os.path.basename(filepath)}

    except Exception as e:
        return {"error": str(e)}

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

@app.post("/update_excel")
async def update_excel(body: dict = Body(...)):
    try:
        filename = body.get("filename")
        hoja_index = body.get("hoja_index", 0)
        datos = body.get("datos", [])

        file_path = os.path.join(EXCEL_FOLDER, filename)
        
        df_nuevo = pd.DataFrame(datos)

        for col in df_nuevo.columns:
            df_nuevo = df_nuevo[df_nuevo[col] != col]

        with pd.ExcelFile(file_path) as xls:
            nombre_hoja = xls.sheet_names[hoja_index]

        with pd.ExcelWriter(file_path, engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
            df_nuevo.to_excel(writer, sheet_name=nombre_hoja, index=False, header=True)

        return {"message": "Actualizado correctamente"}
    except Exception as e:
        return {"error": str(e)} 

    

