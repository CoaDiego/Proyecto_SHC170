import React, { createContext, useContext } from 'react';
import { useSimuladorLogic } from '../../hooks/usedatos';

const DataContext = createContext(null);

// 🆕 1. Recibimos 'usuario' como prop, además de los children
export const DataProvider = ({ children, usuario }) => {
    
    // 🆕 2. Le inyectamos el usuario al hook que maneja toda tu lógica
    const pDatos = useSimuladorLogic(usuario);

    return (
        <DataContext.Provider value={pDatos}>
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