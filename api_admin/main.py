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
# 🆕 CONTADOR DE VISITAS PERSISTENTE
# =======================
VISITAS_FILE = "visitas.txt"

@app.get("/visitas")
async def visitas():
    count = 1
    if os.path.exists(VISITAS_FILE):
        try:
            with open(VISITAS_FILE, "r") as f:
                content = f.read().strip()
                if content:
                    count = int(content) + 1
        except Exception:
            pass
    try:
        with open(VISITAS_FILE, "w") as f:
            f.write(str(count))
    except Exception:
        pass
    return {"visitas": count}


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
class UsuarioRegistro(BaseModel):
    nombre: str
    # ❌ Eliminamos "usuario: str" porque ya no lo usamos
    email: str          # 👈 Ahora el email es el rey
    password: str

class UsuarioLogin(BaseModel):
    email: str          # 👈 Cambiamos usuario por email
    password: str

# Función auxiliar para leer o crear el archivo JSON
def cargar_usuarios():
    if not os.path.exists(USUARIOS_FILE):
        # Si no existe, creamos el admin usando un correo por defecto
        default_users = {
            "admin@usfx.bo": {  # 👈 Ahora la "llave" es un correo
                "nombre": "Diego (Administrador)",
                "password": "123",
                "rol": "Administrador",
                "perfil": "Administrador",
                "institucion": "USFX"
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
@app.post("/registrar_usuario")
async def registrar_usuario(user_data: UsuarioRegistro):
    usuarios = cargar_usuarios()
    
    if user_data.email in usuarios:
        return JSONResponse(status_code=400, content={"error": "Este correo electrónico ya está registrado."})
    
    # Todo usuario nuevo nace estrictamente como Estudiante
    nombre_completo = f"{user_data.nombres} {user_data.apellidos}"
    
    usuarios[user_data.email] = {
        "nombres": user_data.nombres,
        "apellidos": user_data.apellidos,
        "nombre": nombre_completo, # Lo mantenemos por compatibilidad con el resto del sistema
        "email": user_data.email,
        "password": user_data.password, 
        "rol": "Estudiante" # 🚀 ASIGNACIÓN AUTOMÁTICA Y SEGURA
    }
    guardar_usuarios(usuarios)
    return {"message": "Usuario registrado con éxito"}

# Endpoint 2: Iniciar sesión manualmente
@app.post("/login_local")
async def login_local(credentials: UsuarioLogin):
    usuarios = cargar_usuarios()
    
    # Buscamos en la base de datos usando el EMAIL
    user_info = usuarios.get(credentials.email)
    
    if not user_info or user_info["password"] != credentials.password:
        return JSONResponse(status_code=401, content={"error": "Correo o contraseña incorrectos"})
    
    # Si todo está bien, devolvemos el perfil completo para React
    return {
        "id": credentials.email,
        "nombre": user_info.get("nombre"),
        "rol": user_info.get("rol"),
        "email": credentials.email,
        "perfil": user_info.get("perfil", "Estudiante Externo"),
        "institucion": user_info.get("institucion", "")
    }

    
# =======================
# Carpeta para Excel
# =======================
EXCEL_FOLDER = "excels"
os.makedirs(EXCEL_FOLDER, exist_ok=True)

# =======================
# Subir archivo Excel (Soporta Personales y Cursos)
# =======================
@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...), 
    autor: str = Form(...),
    visibilidad: str = Form("personal"), # 🆕 Recibimos si es personal o privado(curso)
    curso: str = Form(None)              # 🆕 Recibimos el ID del curso
):
    import urllib.parse
    
    # 1. Decidir dónde guardar basado en la visibilidad
    if visibilidad == "privado" and curso:
        # Ruta para Cursos: excels/_cursos/EST-101/
        safe_curso = urllib.parse.quote(curso)
        target_folder = os.path.join(EXCEL_FOLDER, "_cursos", safe_curso)
    else:
        # Ruta Personal: excels/Diego/
        safe_author = urllib.parse.quote(autor)
        target_folder = os.path.join(EXCEL_FOLDER, safe_author)

    os.makedirs(target_folder, exist_ok=True)
    
    # 2. Guardar el archivo
    file_path = os.path.join(target_folder, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"message": f"Archivo subido correctamente a {target_folder}"}

# =======================
# Listar archivos Excel
@app.get("/files")
def list_files(
    autor: str = Query(None), 
    visibilidad: str = Query("personal"), 
    curso: str = Query(None)
):
    import urllib.parse
    files_list = []

    # 1. Decidimos la ruta base
    if visibilidad == "privado" and curso:
        # IMPORTANTE: Para cursos, ignoramos quién es el autor, buscamos en la carpeta del curso
        safe_curso = urllib.parse.quote(curso)
        target_folder = os.path.join(EXCEL_FOLDER, "_cursos", safe_curso)
    else:
        # Para personales, buscamos en la carpeta del usuario
        if not autor: return {"files": []}
        safe_author = urllib.parse.quote(autor)
        target_folder = os.path.join(EXCEL_FOLDER, safe_author)
    
    # 2. DEBUG: Imprime en tu terminal de Python para ver qué está buscando
    print(f"DEBUG: Buscando archivos en: {target_folder}")

    # 3. Verificamos si existe, si no, devolvemos lista vacía en lugar de error
    if os.path.exists(target_folder):
        for fname in os.listdir(target_folder):
            if fname.endswith(".xlsx") or fname.endswith(".xls"):
                # Enviamos metadatos extra para que React sepa qué es
                files_list.append({
                    "filename": fname, 
                    "autor": autor, 
                    "es_curso": visibilidad == "privado"
                })
            
    return {"files": files_list}

# ========= Ver contenido de una hoja específica ==========
@app.get("/view/{filename}")
async def view_excel(
    filename: str, 
    hoja: int = 0, 
    autor: str = Query(None),
    curso: str = Query(None) # 🆕 Ahora puede buscar dentro de un curso
):
    import urllib.parse
    
    # ¿Buscamos en la carpeta de un curso o en la del autor?
    if curso:
        safe_curso = urllib.parse.quote(curso)
        file_path = os.path.join(EXCEL_FOLDER, "_cursos", safe_curso, filename)
    elif autor:
        safe_author = urllib.parse.quote(autor)
        file_path = os.path.join(EXCEL_FOLDER, safe_author, filename)
    else:
        file_path = os.path.join(EXCEL_FOLDER, filename)
        
    if not os.path.exists(file_path):
        return {"error": "Archivo no encontrado en el servidor"}

    try:
        import pandas as pd
        with pd.ExcelFile(file_path) as xls:
            df = pd.read_excel(xls, sheet_name=hoja)
            df = df.dropna(how="all")

            if df.empty:
                return {"error": "Archivo sin datos detectables"}

            df.columns = [str(c) for c in df.columns]

            # Reemplazar NaN con "" para evitar errores de serializaci\u00f3n JSON
            df = df.fillna("")

            json_data = df.to_dict(orient="records")

        return JSONResponse(content=json_data)
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {"error": f"Error al leer el Excel: {str(e)}"}


# ========= Listar hojas de un archivo ==========
# =======================
# Obtener nombres de las hojas
# =======================
@app.get("/sheets/{filename}")
async def get_sheets(
    filename: str, 
    autor: str = Query(None),
    curso: str = Query(None) # 🆕 Ahora también recibe el curso
):
    import urllib.parse
    import pandas as pd
    
    # ¿Dónde buscamos el archivo? Misma lógica que al visualizar
    if curso:
        safe_curso = urllib.parse.quote(curso)
        file_path = os.path.join(EXCEL_FOLDER, "_cursos", safe_curso, filename)
    elif autor:
        safe_author = urllib.parse.quote(autor)
        file_path = os.path.join(EXCEL_FOLDER, safe_author, filename)
    else:
        file_path = os.path.join(EXCEL_FOLDER, filename)

    if not os.path.exists(file_path):
        return {"error": "Archivo no encontrado en el servidor"}

    try:
        # Abrimos el Excel solo para leer los nombres de las pestañas
        xls = pd.ExcelFile(file_path)
        return {"sheets": xls.sheet_names}
    except Exception as e:
        return {"error": f"Error al leer hojas: {str(e)}"}
    
    
@app.get("/files/{filename}")
async def download_file(filename: str, autor: str = Query(None)):
    """Descarga el archivo Excel binario del servidor."""
    import urllib.parse
    if autor:
        safe_author = urllib.parse.quote(autor)
        file_path = os.path.join(EXCEL_FOLDER, safe_author, filename)
    else:
        file_path = os.path.join(EXCEL_FOLDER, filename)

    if not os.path.exists(file_path):
        return JSONResponse(status_code=404, content={"error": "Archivo no encontrado"})

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


@app.delete("/files/{filename}")
async def delete_file(filename: str, autor: str = Query(...)):
    import urllib.parse, gc, time, traceback
    safe_author = urllib.parse.quote(autor)
    file_path = os.path.join(EXCEL_FOLDER, safe_author, filename)

    if not os.path.exists(file_path):
        return JSONResponse(status_code=404, content={"error": "Archivo no encontrado"})

    # Forzar liberaci\u00f3n de handles abiertos por pandas/openpyxl
    gc.collect()

    last_error = None
    for intento in range(3):  # 3 intentos con delay
        try:
            os.remove(file_path)
            # Eliminar el .meta si existe
            meta_path = file_path + ".meta"
            if os.path.exists(meta_path):
                try:
                    os.remove(meta_path)
                except Exception:
                    pass
            return {"message": f"Archivo {filename} eliminado correctamente"}
        except PermissionError as e:
            last_error = e
            time.sleep(0.3)  # Esperar 300ms y reintentar
        except Exception as e:
            print(traceback.format_exc())
            return JSONResponse(status_code=500, content={"error": str(e)})

    # Si llegamos aqu\u00ed, fallaron los 3 intentos por archivo bloqueado
    print(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"error": f"No se puede eliminar '{filename}': el archivo está en uso. Cierra cualquier aplicaci\u00f3n que lo tenga abierto e intenta de nuevo."}
    )

@app.post("/save_table_hojas")
async def save_table_hojas(body: dict = Body(...)):
    """
    Recibe JSON con múltiples hojas:
    {
        "nombre": "MiArchivo",
        "autor": "NombreUsuario",
        "hojas": [
            { "nombre": "Hoja 1", "columnas": ["Edad", "Peso"], "datos": [{...}, {...}] },
            { "nombre": "Hoja 2", "columnas": [], "datos": [] }
        ]
    }
    Guarda cada hoja como una pestaña separada en el Excel.
    """
    try:
        import urllib.parse
        nombre = body.get("nombre", "Ejemplo")
        autor  = body.get("autor", "Desconocido")
        hojas  = body.get("hojas", [])

        if not hojas:
            return {"error": "No se recibieron hojas para guardar"}

        safe_author = urllib.parse.quote(autor)
        user_folder = os.path.join(EXCEL_FOLDER, safe_author)
        os.makedirs(user_folder, exist_ok=True)

        # Evitar sobreescribir archivos existentes
        contador = 1
        base_filename = f"{nombre}.xlsx"
        filepath = os.path.join(user_folder, base_filename)
        while os.path.exists(filepath):
            contador += 1
            filepath = os.path.join(user_folder, f"{nombre}_{contador}.xlsx")

        # Escribir cada hoja en el Excel
        with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
            for hoja in hojas:
                nombre_hoja = hoja.get("nombre", "Hoja")[:31]  # Excel limita a 31 chars
                datos       = hoja.get("datos", [])
                columnas    = hoja.get("columnas", [])  # nombres de columnas como respaldo

                if datos:
                    df = pd.DataFrame(datos)
                elif columnas:
                    # Hoja sin datos pero con encabezados definidos
                    df = pd.DataFrame(columns=columnas)
                else:
                    df = pd.DataFrame()

                df.to_excel(writer, sheet_name=nombre_hoja, index=False)

        # Guardar metadata
        meta_path = filepath + ".meta"
        meta_data = {"filename": os.path.basename(filepath), "author": autor}
        with open(meta_path, "w") as f:
            json.dump(meta_data, f)

        return {"filename": os.path.basename(filepath), "hojas": len(hojas)}

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {"error": str(e)}


# =======================
# CREAR TABLA DE CÁLCULO NUEVA
# =======================

@app.post("/create_table")
async def create_table(nombre: str = Query(None), num_columnas: int = 1, num_filas: int = 1, autor: str = Query(None)):
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
    
    # Soporte para la carpeta de autor
    if autor:
        safe_author = urllib.parse.quote(autor)
        user_folder = os.path.join(EXCEL_FOLDER, safe_author)
        os.makedirs(user_folder, exist_ok=True)
        file_path = os.path.join(user_folder, filename)
    else:
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
        autor = body.get("autor", "Desconocido") # 🆕 Extraer el autor enviado por React

        if not tabla:
            return {"error": "No se recibieron datos para la tabla"}

        # Convertir a DataFrame
        df = pd.DataFrame(tabla)
        
        # La limpieza de filas completamente vacías ya se hace en el frontend.
        # No aplicamos dropna aquí para evitar pérdida de datos si hay ceros u otros valores.


        # 1. Crear carpeta específica para el autor si no existe
        import urllib.parse
        safe_author = urllib.parse.quote(autor) 
        user_folder = os.path.join(EXCEL_FOLDER, safe_author)
        os.makedirs(user_folder, exist_ok=True)

        contador = 1
        base_filename = f"{nombre}.xlsx"
        filepath = os.path.join(user_folder, base_filename)
        while os.path.exists(filepath):
            contador += 1
            filepath = os.path.join(user_folder, f"{nombre}_{contador}.xlsx")

        # Guardar Excel
        df.to_excel(filepath, index=False, header= True)

        # No es estrictamente necesario guardar metadata si organizamos por carpetas,
        # pero mantenemos el bloque adaptado a la nueva ruta por compatibilidad.
        meta_path = filepath + ".meta"
        meta_data = {"filename": os.path.basename(filepath), "author": autor}
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
        autor = body.get("autor")

        if autor:
            import urllib.parse
            safe_author = urllib.parse.quote(autor)
            file_path = os.path.join(EXCEL_FOLDER, safe_author, filename)
        else:
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
    
    # =======================
# SISTEMA DE HISTORIAL
# =======================
from datetime import datetime

# Carpeta para guardar los historiales
HISTORIAL_FOLDER = "historial"
os.makedirs(HISTORIAL_FOLDER, exist_ok=True)

# Actualiza el modelo en main.py
class RegistroHistorial(BaseModel):
    autor: str
    calculo: str
    archivo_origen: str
    columna_x: str          # 🆕 Nuevo campo
    columna_y: str = None   # 🆕 Nuevo campo (opcional para unidimensionales)
    hoja: int = 0

@app.post("/guardar_historial")
async def guardar_historial(registro: RegistroHistorial):
    try:
        safe_author = urllib.parse.quote(registro.autor)
        user_historial_folder = os.path.join(HISTORIAL_FOLDER, safe_author)
        os.makedirs(user_historial_folder, exist_ok=True)
        
        # Cada usuario tendrá su propio archivo historial.json
        historial_file = os.path.join(user_historial_folder, "historial.json")
        
        # Cargar historial existente
        historial_data = []
        if os.path.exists(historial_file):
            with open(historial_file, "r", encoding="utf-8") as f:
                historial_data = json.load(f)
        
        # Crear el nuevo registro
        nuevo_registro = {
        "id": f"HIST_{int(datetime.now().timestamp())}",
        "fecha": datetime.now().strftime("%d/%m/%Y"),
        "hora": datetime.now().strftime("%H:%M:%S"),
        "calculo": registro.calculo,
        "archivo_origen": registro.archivo_origen,
        "columna_x": registro.columna_x,     # 🆕 Guardamos X
        "columna_y": registro.columna_y,      # 🆕 Guardamos Y
        "hoja": registro.hoja
    }
        
        # Añadir al inicio de la lista (para que el más reciente salga primero)
        historial_data.insert(0, nuevo_registro)
        
        # Guardar archivo actualizado
        with open(historial_file, "w", encoding="utf-8") as f:
            json.dump(historial_data, f, indent=4)
            
        return {"message": "Historial guardado con éxito", "registro": nuevo_registro}
        
    except Exception as e:
        print(f"Error al guardar historial: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/obtener_historial")
async def obtener_historial(autor: str = Query(...)):
    safe_author = urllib.parse.quote(autor)
    historial_file = os.path.join(HISTORIAL_FOLDER, safe_author, "historial.json")
    
    if not os.path.exists(historial_file):
        return {"historial": []}
        
    with open(historial_file, "r", encoding="utf-8") as f:
        return {"historial": json.load(f)}

@app.delete("/eliminar_historial/{registro_id}")
async def eliminar_historial(registro_id: str, autor: str = Query(...)):
    safe_author = urllib.parse.quote(autor)
    historial_file = os.path.join(HISTORIAL_FOLDER, safe_author, "historial.json")
    
    if not os.path.exists(historial_file):
        return JSONResponse(status_code=404, content={"error": "Historial no encontrado"})
        
    with open(historial_file, "r", encoding="utf-8") as f:
        historial_data = json.load(f)
        
    # Filtramos la lista, conservando solo los que NO tengan el ID a eliminar
    nuevo_historial = [reg for reg in historial_data if reg.get("id") != registro_id]
    
    with open(historial_file, "w", encoding="utf-8") as f:
        json.dump(nuevo_historial, f, indent=4)
        
    return {"message": "Registro eliminado con éxito"}
    

