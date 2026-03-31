import React, { createContext, useContext } from 'react';
import { useSimuladorLogic } from '../../hooks/usedatos';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
    const pDatos = useSimuladorLogic();

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