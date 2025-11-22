import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { CarritoItem } from "./carritoCore";
import { CarritoContext } from "./carritoCore";

export const CarritoProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CarritoItem[]>(() => {
    const saved = localStorage.getItem("carrito");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(items));
  }, [items]);

  const addItem = (
    item: Omit<CarritoItem, "quantity"> & { quantity?: number }
  ) => {
    setItems((prev) => {
      const existing = prev.find((i) => String(i.id) === String(item.id));
      if (existing) {
        return prev.map((i) =>
          String(i.id) === String(item.id)
            ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
            : i
        );
      }
      return [
        ...prev,
        {
          ...(item as Omit<CarritoItem, "quantity">),
          quantity: item.quantity ?? 1,
        },
      ];
    });
  };

  const removeItem = (id: string | number) => {
    setItems((prev) => prev.filter((item) => String(item.id) !== String(id)));
  };

  const updateQuantity = (id: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        String(item.id) === String(id) ? { ...item, quantity } : item
      )
    );
  };

  const clearCarrito = () => {
    setItems([]);
    localStorage.removeItem("carrito");
  };

  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CarritoContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCarrito,
        total,
        itemCount,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};

// NOTE: `useCarrito` hook is implemented in `src/hooks/useCarrito.ts` to avoid
// the `react-refresh/only-export-components` ESLint rule which requires files
// that export components to not export other functions/constants.
