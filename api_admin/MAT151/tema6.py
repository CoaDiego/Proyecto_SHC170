import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.metrics import r2_score

# ======================
# Regresión Lineal Simple
# ======================
def regresion_lineal(x, y):
    X = np.array(x).reshape(-1, 1)
    Y = np.array(y)

    modelo = LinearRegression()
    modelo.fit(X, Y)

    pendiente = modelo.coef_[0]
    intercepto = modelo.intercept_
    r2 = modelo.score(X, Y)

    return {
        "tipo": "regresion_lineal",
        "pendiente": float(pendiente),
        "intercepto": float(intercepto),
        "r2": float(r2)
    }

# ======================
# Regresión No Lineal (Polinómica grado 2)
# ======================
def regresion_no_lineal(x, y, grado=2):
    X = np.array(x).reshape(-1, 1)
    Y = np.array(y)

    poly = PolynomialFeatures(degree=grado)
    X_poly = poly.fit_transform(X)

    modelo = LinearRegression()
    modelo.fit(X_poly, Y)

    y_pred = modelo.predict(X_poly)
    r2 = r2_score(Y, y_pred)

    return {
        "tipo": f"regresion_polinomica_grado_{grado}",
        "coeficientes": modelo.coef_.tolist(),
        "intercepto": float(modelo.intercept_),
        "r2": float(r2)
    }

# ======================
# Regresión Multivariante
# ======================
def regresion_multivariante(x, y):
    """
    x debe ser una lista de listas con varias variables independientes.
    Ejemplo: x = [[1, 2], [2, 3], [3, 4]]
    """
    X = np.array(x)
    Y = np.array(y)

    modelo = LinearRegression()
    modelo.fit(X, Y)

    r2 = modelo.score(X, Y)

    return {
        "tipo": "regresion_multivariante",
        "coeficientes": modelo.coef_.tolist(),
        "intercepto": float(modelo.intercept_),
        "r2": float(r2)
    }
