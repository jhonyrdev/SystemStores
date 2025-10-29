import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

interface CatalogoContextProps {
  subcatsSeleccionadas: number[];
  toggleSubcategoria: (id: number) => void;
  resetSubcategorias: () => void;
}

const CatalogoContext = createContext<CatalogoContextProps | undefined>(
  undefined
);

export const useCatalogoContext = (): CatalogoContextProps => {
  const ctx = useContext(CatalogoContext);
  if (!ctx) {
    throw new Error(
      "useCatalogoContext must be used within a CatalogoProvider"
    );
  }
  return ctx;
};

interface CatalogoProviderProps {
  children: ReactNode;
}

export const CatalogoProvider = ({ children }: CatalogoProviderProps) => {
  const [subcatsSeleccionadas, setSubcatsSeleccionadas] = useState<number[]>(
    []
  );

  const toggleSubcategoria = (id: number) => {
    setSubcatsSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const resetSubcategorias = useCallback(() => {
    setSubcatsSeleccionadas([]);
  }, []);

  return (
    <CatalogoContext.Provider
      value={{ subcatsSeleccionadas, toggleSubcategoria, resetSubcategorias }}
    >
      {children}
    </CatalogoContext.Provider>
  );
};
