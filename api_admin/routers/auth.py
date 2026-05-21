import urllib.parse
from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

# Importamos lo que creamos en los pasos anteriores
from database import get_db
from models import Usuario

router = APIRouter()

class UsuarioRegistro(BaseModel):
    nombre: str
    email: str
    password: str

class UsuarioLogin(BaseModel):
    email: str
    password: str

@router.post("/lti/launch")
async def lti_launch(request: Request):
    # Esto se queda exactamente igual, no afecta la base de datos
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
    
    # 3. Devolvemos los datos al frontend (tu App.jsx no notará la diferencia)
    return {
        "id": user_info.email,
        "nombre": user_info.nombre,
        "rol": user_info.rol,
        "email": user_info.email,
        "perfil": user_info.perfil,
        "institucion": user_info.institucion
    }

class CambiarRol(BaseModel):
    email: str
    nuevo_rol: str # Puede ser "Docente" o "Administrador"

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
    # Traemos todos los usuarios de la base de datos
    usuarios = db.query(Usuario).all()
    # Devolvemos solo lo necesario (ocultamos las contraseñas por seguridad)
    return [{"email": u.email, "nombre": u.nombre, "rol": u.rol} for u in usuarios]