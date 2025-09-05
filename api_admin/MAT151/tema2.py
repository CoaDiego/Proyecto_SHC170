import statistics

# ================================
# Funciones Tema 2 (Distribución de Frecuencias)
# ================================

def calcular_media(datos):
    return {"resultado": statistics.mean(datos)}

def calcular_mediana(datos):
    return {"resultado": statistics.median(datos)}

def calcular_moda(datos):
    return {"resultado": statistics.mode(datos)}

def calcular_varianza(datos):
    return {"resultado": statistics.variance(datos)}

def calcular_desviacion(datos):
    return {"resultado": statistics.stdev(datos)}

def calcular_frecuencia_absoluta(datos):
    tabla = {}
    for x in datos:
        tabla[x] = tabla.get(x, 0) + 1
    return {"resultado": [{"valor": k, "f": v} for k, v in sorted(tabla.items())]}

def calcular_frecuencia_relativa(datos):
    tabla = {}
    for x in datos:
        tabla[x] = tabla.get(x, 0) + 1
    n = len(datos)
    return {"resultado": [{"valor": k, "h": v / n} for k, v in sorted(tabla.items())]}

def calcular_frecuencia_acumulada(datos):
    tabla = {}
    for x in datos:
        tabla[x] = tabla.get(x, 0) + 1
    acumulada = 0
    resultado = []
    for k, v in sorted(tabla.items()):
        acumulada += v
        resultado.append({"valor": k, "F": acumulada})
    return {"resultado": resultado}

def calcular_frecuencia_acumulada_relativa(datos):
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
