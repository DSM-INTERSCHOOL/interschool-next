"use client";

import { useState, useCallback } from "react";
import { IGlobalBlockRead } from "@/interfaces/IAppointment";
import * as appointmentService from "@/services/appointment.service";
import { getOrgConfig } from "@/lib/orgConfig";
import { useAuthStore } from "@/store/useAuthStore";

export interface GlobalBlockFormData {
  name: string;
  block_type: string;
  start_date: string;
  end_date: string;
  applies_to_all: boolean;
  recurring: boolean;
  active: boolean;
  person_ids: string[];
}

const EMPTY_FORM: GlobalBlockFormData = {
  name: "",
  block_type: "HOLIDAY",
  start_date: "",
  end_date: "",
  applies_to_all: true,
  recurring: false,
  active: true,
  person_ids: [],
};

const toLocalInput = (iso: string): string => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const useGlobalBlocks = () => {
  const personId = useAuthStore((state) => state.personId);

  const [blocks, setBlocks] = useState<IGlobalBlockRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<IGlobalBlockRead | null>(null);
  const [formData, setFormData] = useState<GlobalBlockFormData>(EMPTY_FORM);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadBlocks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const data = await appointmentService.getGlobalBlocks({ schoolId });
      setBlocks(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar los bloqueos globales");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateField = <K extends keyof GlobalBlockFormData>(
    field: K,
    value: GlobalBlockFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const openCreate = () => {
    setEditingBlock(null);
    setFormData(EMPTY_FORM);
    setSaveError(null);
    setModalOpen(true);
  };

  const openEdit = (block: IGlobalBlockRead) => {
    setEditingBlock(block);
    setFormData({
      name: block.name,
      block_type: block.block_type,
      start_date: block.start_date ? toLocalInput(block.start_date) : "",
      end_date: block.end_date ? toLocalInput(block.end_date) : "",
      applies_to_all: block.applies_to_all,
      recurring: block.recurring,
      active: block.active,
      person_ids: block.persons.map((p) => p.id),
    });
    setSaveError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingBlock(null);
    setSaveError(null);
  };

  const handleSave = async (): Promise<boolean> => {
    if (!formData.name.trim()) {
      setSaveError("El nombre es obligatorio");
      return false;
    }
    if (!formData.start_date) {
      setSaveError("La fecha de inicio es obligatoria");
      return false;
    }
    if (!formData.end_date) {
      setSaveError("La fecha de fin es obligatoria");
      return false;
    }
    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      setSaveError("La fecha de fin debe ser posterior a la de inicio");
      return false;
    }

    try {
      setSaveLoading(true);
      setSaveError(null);
      const { schoolId } = getOrgConfig();

      if (editingBlock) {
        const updated = await appointmentService.updateGlobalBlock({
          schoolId,
          blockId: editingBlock.id,
          dto: {
            name: formData.name.trim(),
            block_type: formData.block_type,
            start_date: new Date(formData.start_date).toISOString(),
            end_date: new Date(formData.end_date).toISOString(),
            applies_to_all: formData.applies_to_all,
            recurring: formData.recurring,
            active: formData.active,
            person_ids: formData.applies_to_all ? [] : formData.person_ids,
          },
        });
        setBlocks((prev) =>
          prev.map((b) => (b.id === updated.id ? updated : b))
        );
      } else {
        const created = await appointmentService.createGlobalBlock({
          schoolId,
          dto: {
            name: formData.name.trim(),
            block_type: formData.block_type,
            start_date: new Date(formData.start_date).toISOString(),
            end_date: new Date(formData.end_date).toISOString(),
            applies_to_all: formData.applies_to_all,
            recurring: formData.recurring,
            active: formData.active,
            created_by: String(personId),
            person_ids: formData.applies_to_all ? [] : formData.person_ids,
          },
        });
        setBlocks((prev) => [created, ...prev]);
      }

      closeModal();
      return true;
    } catch (err: any) {
      setSaveError(err.response?.data?.message || err.message || "Error al guardar");
      return false;
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (blockId: string) => {
    try {
      setDeleteLoading(true);
      const { schoolId } = getOrgConfig();
      await appointmentService.deleteGlobalBlock({ schoolId, blockId });
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      setDeleteConfirmId(null);
    } catch (err: any) {
      setError(err.message || "Error al eliminar el bloqueo");
    } finally {
      setDeleteLoading(false);
    }
  };

  return {
    blocks,
    loading,
    error,
    modalOpen,
    editingBlock,
    formData,
    saveLoading,
    saveError,
    deleteConfirmId,
    deleteLoading,
    loadBlocks,
    updateField,
    openCreate,
    openEdit,
    closeModal,
    handleSave,
    setDeleteConfirmId,
    handleDelete,
  };
};
