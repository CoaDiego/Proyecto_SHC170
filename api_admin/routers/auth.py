import urllib.parse
import random
from datetime import datetime
from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

# Importamos la base de datos y modelos
from database import get_db
from models import Usuario, Inscripcion, Archivo, HistorialCalculo, Clase

router = APIRouter()

# Configuración global de matriculación
FECHA_LIMITE_MATRICULACION = "2026-06-30"  # Formato YYYY-MM-DD
recovery_tokens = {}

class UsuarioRegistro(BaseModel):
    nombre: str
    email: str
    password: str

class UsuarioLogin(BaseModel):
    email: str
    password: str

class RecuperarPassword(BaseModel):
    email: str

class ResetearPassword(BaseModel):
    email: str
    token: str
    nuevo_password: str

class CambiarPasswordPerfil(BaseModel):
    email: str
    password_actual: str
    password_nuevo: str

@router.post("/lti/launch")
async def lti_launch(request: Request):
    try:
        form_data = await request.form()
        user_id = form_data.get("user_id", "ID_USFX_001")
        full_name = form_data.get("lis_person_name_full", "Estudiante de Prueba")
        roles = form_data.get("roles", "Learner")
        
        safe_name = urllib.parse.quote(full_name)
        safe_role = urllib.parse.quote(roles)
        
        target_url = f"http://localhost:5173/lti-tester?name={safe_name}&role={safe_role}&id={user_id}"
        return RedirectResponse(url=target_url, status_code=303)
    except Exception as e:
        return {"error": f"Fallo en la conexión LTI: {str(e)}"}

@router.get("/fecha_limite")
async def obtener_fecha_limite():
    return {"fecha_limite": FECHA_LIMITE_MATRICULACION}

@router.post("/registrar_usuario")
async def registrar_usuario(user_data: UsuarioRegistro, db: Session = Depends(get_db)):
    # 1. Buscamos si el correo ya existe en MySQL
    usuario_existente = db.query(Usuario).filter(Usuario.email == user_data.email).first()
    
    if usuario_existente:
        return JSONResponse(status_code=400, content={"error": "Este correo electrónico ya está registrado."})
    
    # 2. Creamos el nuevo usuario
    nuevo_usuario = Usuario(
        email=user_data.email,
        nombre=user_data.nombre,
        password=user_data.password,
        rol="Estudiante",
        perfil="Estudiante",
        institucion=""
    )
    
    # 3. Lo guardamos en la base de datos
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    
    return {"message": "Usuario registrado con éxito"}

@router.post("/login_local")
async def login_local(credentials: UsuarioLogin, db: Session = Depends(get_db)):
    # 1. Buscamos al usuario por su email
    user_info = db.query(Usuario).filter(Usuario.email == credentials.email).first()
    
    # 2. Verificamos que exista y que la contraseña coincida
    if not user_info or user_info.password != credentials.password:
        return JSONResponse(status_code=401, content={"error": "Correo o contraseña incorrectos"})
    
    # 3. Devolvemos los datos al frontend
    return {
        "id": user_info.email,
        "nombre": user_info.nombre,
        "rol": user_info.rol,
        "email": user_info.email,
        "perfil": user_info.perfil,
        "institucion": user_info.institucion
    }

@router.post("/recuperar_password")
async def recuperar_password(data: RecuperarPassword, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == data.email).first()
    if not usuario:
        return JSONResponse(status_code=404, content={"error": "No existe ningún usuario registrado con este correo."})
    
    # Generamos un token simple de 6 dígitos
    token = str(random.randint(100000, 999999))
    recovery_tokens[data.email] = token
    
    # Retornamos el token en la respuesta para facilitar la prueba en el frontend
    return {
        "message": "Token de recuperación generado con éxito.",
        "token": token
    }

@router.post("/resetear_password")
async def resetear_password(data: ResetearPassword, db: Session = Depends(get_db)):
    token_valido = recovery_tokens.get(data.email)
    if not token_valido or token_valido != data.token:
        return JSONResponse(status_code=400, content={"error": "Token de recuperación inválido o vencido."})
    
    usuario = db.query(Usuario).filter(Usuario.email == data.email).first()
    if not usuario:
        return JSONResponse(status_code=404, content={"error": "Usuario no encontrado."})
    
    usuario.password = data.nuevo_password
    db.commit()
    
    recovery_tokens.pop(data.email, None)
    return {"message": "Contraseña restablecida correctamente."}

@router.put("/cambiar_password_perfil")
async def cambiar_password_perfil(data: CambiarPasswordPerfil, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == data.email).first()
    if not usuario or usuario.password != data.password_actual:
        return JSONResponse(status_code=400, content={"error": "La contraseña actual es incorrecta."})
    
    usuario.password = data.password_nuevo
    db.commit()
    return {"message": "Contraseña cambiada exitosamente."}

@router.post("/eliminar_cuenta")
async def eliminar_cuenta(datos: UsuarioLogin, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == datos.email).first()
    if not usuario or usuario.password != datos.password:
        return JSONResponse(status_code=401, content={"error": "Contraseña de confirmación incorrecta"})
    
    # 1. Eliminar inscripciones de este estudiante
    db.query(Inscripcion).filter(Inscripcion.estudiante_id == usuario.id).delete(synchronize_session=False)
    
    # 2. Eliminar historial de cálculos de este usuario
    db.query(HistorialCalculo).filter(HistorialCalculo.usuario_id == usuario.id).delete(synchronize_session=False)
    
    # 3. Eliminar archivos subidos por este usuario
    db.query(Archivo).filter(Archivo.usuario_id == usuario.id).delete(synchronize_session=False)
    
    # 4. Manejar las clases que tiene si es docente
    clases_docente = db.query(Clase).filter(Clase.docente_id == usuario.id).all()
    for clase in clases_docente:
        # Borrar inscripciones de los alumnos a esta clase
        db.query(Inscripcion).filter(Inscripcion.clase_id == clase.id).delete(synchronize_session=False)
        # Borrar archivos de esta clase
        db.query(Archivo).filter(Archivo.clase_id == clase.id).delete(synchronize_session=False)
        # Borrar historial de cálculos vinculados a esta clase
        db.query(HistorialCalculo).filter(HistorialCalculo.clase_id == clase.id).delete(synchronize_session=False)
        db.delete(clase)
        
    # 5. Eliminar al usuario
    db.delete(usuario)
    db.commit()
    
    return {"message": "Cuenta eliminada con éxito"}

class CambiarRol(BaseModel):
    email: str
    nuevo_rol: str

@router.put("/cambiar_rol")
async def cambiar_rol(datos: CambiarRol, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == datos.email).first()
    if not usuario:
        return JSONResponse(status_code=404, content={"error": "Usuario no encontrado"})
    
    usuario.rol = datos.nuevo_rol
    usuario.perfil = datos.nuevo_rol
    db.commit()
    return {"message": f"El rol del usuario ha sido actualizado a {datos.nuevo_rol}"}

@router.get("/usuarios")
async def obtener_usuarios(db: Session = Depends(get_db)):
    usuarios = db.query(Usuario).all()
    return [{"email": u.email, "nombre": u.nombre, "rol": u.rol} for u in usuarios]