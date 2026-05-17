import os
import shutil
import urllib.parse
import gc
import time
import json
import pandas as pd
from fastapi import APIRouter, File, UploadFile, Form, Query, Body
from fastapi.responses import FileResponse, JSONResponse

router = APIRouter()
EXCEL_FOLDER = "excels"
os.makedirs(EXCEL_FOLDER, exist_ok=True)

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...), 
    autor: str = Form(...),
    visibilidad: str = Form("personal"), 
    curso: str = Form(None)
):
    if visibilidad == "privado" and curso:
        safe_curso = urllib.parse.quote(curso)
        target_folder = os.path.join(EXCEL_FOLDER, "_cursos", safe_curso)
    else:
        safe_author = urllib.parse.quote(autor)
        target_folder = os.path.join(EXCEL_FOLDER, safe_author)

    os.makedirs(target_folder, exist_ok=True)
    file_path = os.path.join(target_folder, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"message": f"Archivo subido correctamente a {target_folder}"}

@router.get("/files")
def list_files(autor: str = Query(None), visibilidad: str = Query("personal"), curso: str = Query(None)):
    files_list = []
    if visibilidad == "privado" and curso:
        safe_curso = urllib.parse.quote(curso)
        target_folder = os.path.join(EXCEL_FOLDER, "_cursos", safe_curso)
    else:
        if not autor: return {"files": []}
        safe_author = urllib.parse.quote(autor)
        target_folder = os.path.join(EXCEL_FOLDER, safe_author)
    
    if os.path.exists(target_folder):
        for fname in os.listdir(target_folder):
            if fname.endswith(".xlsx") or fname.endswith(".xls"):
                files_list.append({
                    "filename": fname, 
                    "autor": autor, 
                    "es_curso": visibilidad == "privado"
                })
    return {"files": files_list}

@router.get("/view/{filename}")
async def view_excel(filename: str, hoja: int = 0, autor: str = Query(None), curso: str = Query(None)):
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
        with pd.ExcelFile(file_path) as xls:
            df = pd.read_excel(xls, sheet_name=hoja)
            df = df.dropna(how="all")
            if df.empty:
                return {"error": "Archivo sin datos detectables"}
            df.columns = [str(c) for c in df.columns]
            df = df.fillna("")
            json_data = df.to_dict(orient="records")
        return JSONResponse(content=json_data)
    except Exception as e:
        return {"error": f"Error al leer el Excel: {str(e)}"}

@router.get("/sheets/{filename}")
async def get_sheets(filename: str, autor: str = Query(None), curso: str = Query(None)):
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
        xls = pd.ExcelFile(file_path)
        return {"sheets": xls.sheet_names}
    except Exception as e:
        return {"error": f"Error al leer hojas: {str(e)}"}

@router.get("/files/{filename}")
async def download_file(filename: str, autor: str = Query(None)):
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

@router.delete("/files/{filename}")
async def delete_file(filename: str, autor: str = Query(...)):
    safe_author = urllib.parse.quote(autor)
    file_path = os.path.join(EXCEL_FOLDER, safe_author, filename)

    if not os.path.exists(file_path):
        return JSONResponse(status_code=404, content={"error": "Archivo no encontrado"})

    gc.collect()
    for _ in range(3):
        try:
            os.remove(file_path)
            meta_path = file_path + ".meta"
            if os.path.exists(meta_path):
                os.remove(meta_path)
            return {"message": f"Archivo {filename} eliminado correctamente"}
        except PermissionError:
            time.sleep(0.3)
        except Exception as e:
            return JSONResponse(status_code=500, content={"error": str(e)})

    return JSONResponse(status_code=500, content={"error": "Archivo en uso. Intente de nuevo."})

@router.post("/save_table_hojas")
async def save_table_hojas(body: dict = Body(...)):
    try:
        nombre = body.get("nombre", "Ejemplo")
        autor  = body.get("autor", "Desconocido")
        hojas  = body.get("hojas", [])

        if not hojas:
            return {"error": "No se recibieron hojas para guardar"}

        safe_author = urllib.parse.quote(autor)
        user_folder = os.path.join(EXCEL_FOLDER, safe_author)
        os.makedirs(user_folder, exist_ok=True)

        filepath = os.path.join(user_folder, f"{nombre}.xlsx")
        contador = 1
        while os.path.exists(filepath):
            contador += 1
            filepath = os.path.join(user_folder, f"{nombre}_{contador}.xlsx")

        with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
            for hoja in hojas:
                nombre_hoja = hoja.get("nombre", "Hoja")[:31]
                datos       = hoja.get("datos", [])
                columnas    = hoja.get("columnas", [])

                if datos:
                    df = pd.DataFrame(datos)
                elif columnas:
                    df = pd.DataFrame(columns=columnas)
                else:
                    df = pd.DataFrame()

                df.to_excel(writer, sheet_name=nombre_hoja, index=False)

        meta_path = filepath + ".meta"
        meta_data = {"filename": os.path.basename(filepath), "author": autor}
        with open(meta_path, "w") as f:
            json.dump(meta_data, f)

        return {"filename": os.path.basename(filepath), "hojas": len(hojas)}
    except Exception as e:
        return {"error": str(e)}

@router.post("/create_table")
async def create_table(nombre: str = Query(None), num_columnas: int = 1, num_filas: int = 1, autor: str = Query(None)):
    if not nombre:
        existing_files = [f for f in os.listdir(EXCEL_FOLDER) if f.endswith(".xlsx")]
        nombre = f"Ejemplo {len(existing_files)+1}"

    cols = [f"Col {i+1}" for i in range(num_columnas)]
    df = pd.DataFrame([[0]*num_columnas for _ in range(num_filas)], columns=cols)
    filename = f"{nombre}.xlsx"
    
    if autor:
        safe_author = urllib.parse.quote(autor)
        user_folder = os.path.join(EXCEL_FOLDER, safe_author)
        os.makedirs(user_folder, exist_ok=True)
        file_path = os.path.join(user_folder, filename)
    else:
        file_path = os.path.join(EXCEL_FOLDER, filename)
        
    df.to_excel(file_path, index=False, header=False)
    return {"message": "Tabla creada correctamente", "filename": filename}

@router.post("/save_table")
async def save_table(body: dict = Body(...)):
    try:
        nombre = body.get("nombre", "Ejemplo")
        tabla = body.get("tabla", [])
        autor = body.get("autor", "Desconocido")

        if not tabla:
            return {"error": "No se recibieron datos para la tabla"}

        df = pd.DataFrame(tabla)
        safe_author = urllib.parse.quote(autor) 
        user_folder = os.path.join(EXCEL_FOLDER, safe_author)
        os.makedirs(user_folder, exist_ok=True)

        filepath = os.path.join(user_folder, f"{nombre}.xlsx")
        contador = 1
        while os.path.exists(filepath):
            contador += 1
            filepath = os.path.join(user_folder, f"{nombre}_{contador}.xlsx")

        df.to_excel(filepath, index=False, header=True)

        meta_path = filepath + ".meta"
        meta_data = {"filename": os.path.basename(filepath), "author": autor}
        with open(meta_path, "w") as f:
            json.dump(meta_data, f)

        return {"filename": os.path.basename(filepath)}
    except Exception as e:
        return {"error": str(e)}

@router.post("/update_excel")
async def update_excel(body: dict = Body(...)):
    try:
        filename = body.get("filename")
        hoja_index = body.get("hoja_index", 0)
        datos = body.get("datos", [])
        autor = body.get("autor")

        if autor:
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