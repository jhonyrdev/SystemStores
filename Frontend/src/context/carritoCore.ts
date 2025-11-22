import { createContext } from "react";

export interface CarritoItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CarritoContextType {
  items: CarritoItem[];
  addItem: (
    item: Omit<CarritoItem, "quantity"> & { quantity?: number }
  ) => void;
  removeItem: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCarrito: () => void;
  total: number;
  itemCount: number;
}

export const CarritoContext = createContext<CarritoContextType | undefined>(
  undefined
);

export default CarritoContext;
