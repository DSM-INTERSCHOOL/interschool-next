import { useState } from "react";
import { useAppRouter as useRouter } from "@/hooks/useAppRouter";
import { getOrgConfig } from "@/lib/orgConfig";
import { createTransferencia } from "@/services/inventory.service";
import { useMovementLines } from "./useMovementLines";

export const useTransferenciaForm = () => {
  const router = useRouter();
  const movementLines = useMovementLines();

  const [warehouseOrigenId, setWarehouseOrigenId] = useState<number | "">("");
  const [warehouseDestinoId, setWarehouseDestinoId] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      setSaveError(null);

      if (warehouseOrigenId === "" || warehouseDestinoId === "") {
        setSaveError("Selecciona el almacén de origen y el de destino");
        return;
      }
      if (warehouseOrigenId === warehouseDestinoId) {
        setSaveError("El almacén de origen y el de destino no pueden ser el mismo");
        return;
      }
      const lineError = movementLines.validate();
      if (lineError) {
        setSaveError(lineError);
        return;
      }

      const { schoolId } = getOrgConfig();
      await createTransferencia({
        schoolId,
        dto: {
          warehouse_origen_id: Number(warehouseOrigenId),
          warehouse_destino_id: Number(warehouseDestinoId),
          lines: movementLines.toPayload(),
          notes: notes.trim() || undefined,
        },
      });
      router.push("/apps/commerce/inventory");
    } catch (err: any) {
      setSaveError(err.response?.data?.detail || err.message || "Error al registrar la transferencia");
    } finally {
      setSaveLoading(false);
    }
  };

  return {
    warehouseOrigenId,
    setWarehouseOrigenId,
    warehouseDestinoId,
    setWarehouseDestinoId,
    notes,
    setNotes,
    saveLoading,
    saveError,
    handleSave,
    ...movementLines,
  };
};
