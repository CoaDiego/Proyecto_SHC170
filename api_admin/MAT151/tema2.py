import statistics
import math

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

# ================================
# Intervalos de clase y marcas
# ================================

""" def calcular_numero_clases(datos, metodo="sturges"):
    n = len(datos)
    if metodo == "sturges":
        k = 1 + 3.322 * math.log10(n)
    elif metodo == "raiz":
        k = math.sqrt(n)
    else:
        k = 1 + 3.322 * math.log10(n)  # por defecto Sturges
    return math.ceil(k)

def calcular_tabla_frecuencias(datos, metodo="sturges"):
    n = len(datos)
    min_val, max_val = min(datos), max(datos)
    k = calcular_numero_clases(datos, metodo)
    rango = max_val - min_val
    ancho = math.ceil(rango / k)

    # Construcción de intervalos
    intervalos = []
    li = min_val
    for i in range(k):
        ls = li + ancho
        intervalos.append((li, ls))
        li = ls

    # Contar frecuencias
    frecuencias = []
    acumulada = 0
    for li, ls in intervalos:
        f = sum(1 for x in datos if li <= x < ls or (i == k-1 and x == ls))
        acumulada += f
        fr = f / n
        # Marca de clase
        xi = (li + ls) / 2
        frecuencias.append({
            "intervalo": f"{li}-{ls}",
            "xi": xi,
            "f": f,
            "fr": round(fr, 4),
            "F": acumulada,
            "Fr": round(acumulada / n, 4)
        })

    return {"resultado": frecuencias} """

def numero_clases_sturges(n: int) -> int:
    if n <= 1:
        return 1
    return math.ceil(1 + 3.322 * math.log10(n))

def tabla_por_clases(datos: list[float], k: int | None = None):
    if not datos:
        return []

    datos_orden = sorted(datos)
    n = len(datos_orden)
    xmin, xmax = datos_orden[0], datos_orden[-1]
    R = xmax - xmin

    # número de clases
    k = k or numero_clases_sturges(n)
    k = max(1, k)

    # ancho entero
    h = max(1, math.ceil(R / k)) if k > 0 else 1

    # bordes
    edges = [xmin + i * h for i in range(k)]
    edges.append(edges[-1] + h)

    # contar
    f = [0] * k
    for x in datos_orden:
        for i in range(k):
            Li, Ls = edges[i], edges[i + 1]
            if i < k - 1:
                dentro = (x >= Li) and (x < Ls)
            else:
                dentro = (x >= Li) and (x <= xmax)
            if dentro:
                f[i] += 1
                break

    fr = [fi / n for fi in f]

    F = []
    acc = 0
    for fi in f:
        acc += fi
        F.append(acc)

    Fr = [Fi / n for Fi in F]

    filas = []
    for i in range(k):
        Li, Ls = edges[i], edges[i + 1]
        xi = (Li + Ls) / 2
        filas.append({
            "intervalo": f"{Li}-{Ls}",
            "xi": round(xi, 4),
            "f": f[i],
            "fr": round(fr[i], 4),
            "F": F[i],
            "Fr": round(Fr[i], 4),
        })

    return filas