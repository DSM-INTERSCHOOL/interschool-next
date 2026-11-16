import { useState } from "react";
import { useAppRouter as useRouter } from "@/hooks/useAppRouter";
import { getOrgConfig } from "@/lib/orgConfig";
import { createSalida } from "@/services/inventory.service";
import { useMovementLines } from "./useMovementLines";

export const useSalidaForm = () => {
  const router = useRouter();
  const movementLines = useMovementLines();

  const [warehouseId, setWarehouseId] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      setSaveError(null);

      if (warehouseId === "") {
        setSaveError("Selecciona un almacén");
        return;
      }
      const lineError = movementLines.validate();
      if (lineError) {
        setSaveError(lineError);
        return;
      }

      const { schoolId } = getOrgConfig();
      await createSalida({
        schoolId,
        dto: {
          warehouse_id: Number(warehouseId),
          lines: movementLines.toPayload(),
          notes: notes.trim() || undefined,
        },
      });
      router.push("/apps/commerce/inventory");
    } catch (err: any) {
      setSaveError(err.response?.data?.detail || err.message || "Error al registrar la salida");
    } finally {
      setSaveLoading(false);
    }
  };

  return { warehouseId, setWarehouseId, notes, setNotes, saveLoading, saveError, handleSave, ...movementLines };
};
