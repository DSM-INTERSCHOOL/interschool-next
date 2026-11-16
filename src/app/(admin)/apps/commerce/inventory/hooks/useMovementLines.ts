import { useState } from "react";
import { CostedLine } from "@/interfaces/IInventory";

export interface MovementLine {
  product_id: number | "";
  color_id: number | "";
  size_id: number | "";
  quantity: string;
  costo: string;
}

const emptyLine: MovementLine = { product_id: "", color_id: "", size_id: "", quantity: "1", costo: "" };

// Shared by Entrada/Salida/Transferencia -- all three take the same
// {product_id, color_id?, size_id?, quantity, costo} line shape, just with
// a different warehouse envelope around them.
export const useMovementLines = () => {
  const [lines, setLines] = useState<MovementLine[]>([{ ...emptyLine }]);

  const addLine = () => setLines((prev) => [...prev, { ...emptyLine }]);

  const removeLine = (index: number) =>
    setLines((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  const updateLine = (index: number, field: keyof MovementLine, value: string) =>
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)));

  const reset = () => setLines([{ ...emptyLine }]);

  const validate = (): string | null => {
    for (const line of lines) {
      if (line.product_id === "") return "Selecciona un producto en todas las líneas";
      if (!line.quantity || Number(line.quantity) <= 0) {
        return "La cantidad debe ser mayor a cero en todas las líneas";
      }
      if (line.costo === "" || Number(line.costo) < 0) {
        return "El costo es requerido (y no puede ser negativo) en todas las líneas";
      }
    }
    return null;
  };

  const toPayload = (): CostedLine[] =>
    lines.map((line) => ({
      product_id: Number(line.product_id),
      color_id: line.color_id !== "" ? Number(line.color_id) : undefined,
      size_id: line.size_id !== "" ? Number(line.size_id) : undefined,
      quantity: Number(line.quantity),
      costo: Number(line.costo),
    }));

  return { lines, addLine, removeLine, updateLine, reset, validate, toPayload };
};
