import React, { createContext, useContext } from 'react';
import { useSimuladorLogic } from '../../hooks/usedatos';

const DataContext = createContext(null);

// 🆕 1. Ahora recibimos 'setUsuario' como prop también
export const DataProvider = ({ children, usuario, setUsuario }) => {
    
    // El hook sigue recibiendo al usuario normal
    const pDatos = useSimuladorLogic(usuario);

    // 🆕 2. Empaquetamos todo junto: los datos matemáticos + el control del usuario
    const contextoGlobal = {
        ...pDatos,
        usuario,
        setUsuario
    };

    return (
        <DataContext.Provider value={contextoGlobal}>
            {children}
        </DataContext.Provider>
    );
};

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        console.error("Error: useData debe estar dentro de DataProvider");
        return { variables: [] };
    }
    return context;
}