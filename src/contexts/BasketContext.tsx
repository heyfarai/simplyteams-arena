"use client";

import React, { createContext, useContext, useState } from "react";

type BasketItem = {
  id: string;
  type: "rental" | "program";
  facilityId?: string;
  facilityName?: string;
  programId?: string;
  programName?: string;
  start: string;
  end: string;
  price: number;
};

type BasketContextType = {
  items: BasketItem[];
  addItem: (item: BasketItem) => void;
  removeItem: (itemId: string) => void;
  clearBasket: () => void;
  getTotal: () => number;
};

const BasketContext = createContext<BasketContextType | undefined>(undefined);

export function BasketProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([]);

  const addItem = (item: BasketItem) => {
    setItems((prev) => [...prev, item]);
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearBasket = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((sum, item) => sum + item.price, 0);
  };

  return (
    <BasketContext.Provider
      value={{ items, addItem, removeItem, clearBasket, getTotal }}
    >
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const context = useContext(BasketContext);
  if (context === undefined) {
    throw new Error("useBasket must be used within a BasketProvider");
  }
  return context;
}
