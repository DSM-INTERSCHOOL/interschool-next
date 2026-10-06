import { useMemo, useState } from "react";

export interface CartLine {
  key: string; // `${productId}:${colorId ?? ""}:${sizeId ?? ""}` -- distinct variants of the same product are separate lines
  productId: number;
  title: string;
  thumbnail: string | null;
  colorId: number | null;
  colorLabel: string | null;
  sizeId: number | null;
  sizeLabel: string | null;
  unitPrice: number;
  quantity: number;
}

export const cartLineKey = (productId: number, colorId: number | null, sizeId: number | null) =>
  `${productId}:${colorId ?? ""}:${sizeId ?? ""}`;

export const useCart = () => {
  const [lines, setLines] = useState<CartLine[]>([]);

  const addLine = (line: Omit<CartLine, "quantity">, quantity: number) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.key === line.key);
      if (existing) {
        return prev.map((l) => (l.key === line.key ? { ...l, quantity: l.quantity + quantity } : l));
      }
      return [...prev, { ...line, quantity }];
    });
  };

  const updateQuantity = (key: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, quantity } : l))
    );
  };

  const removeLine = (key: string) => setLines((prev) => prev.filter((l) => l.key !== key));

  const clear = () => setLines([]);

  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);
  const total = useMemo(() => lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0), [lines]);

  return { lines, addLine, updateQuantity, removeLine, clear, itemCount, total };
};
