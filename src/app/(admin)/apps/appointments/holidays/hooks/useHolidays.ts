"use client";

import { useState, useCallback } from "react";
import { IHolidayRead, HolidayType } from "@/interfaces/IAppointment";
import * as appointmentService from "@/services/appointment.service";
import { getOrgConfig } from "@/lib/orgConfig";

export interface HolidayFormData {
  name: string;
  holiday_type: HolidayType;
  month: number;
  day: number | "";
  nth: number | "";
  day_of_week: number | "";
  before_day: number | "";
  active: boolean;
}

export interface ApplyFormData {
  year: number;
  applies_to_all: boolean;
  block_type: string;
}

const EMPTY_FORM: HolidayFormData = {
  name: "",
  holiday_type: "FIXED",
  month: 1,
  day: 1,
  nth: "",
  day_of_week: "",
  before_day: "",
  active: true,
};

const EMPTY_APPLY: ApplyFormData = {
  year: new Date().getFullYear(),
  applies_to_all: true,
  block_type: "HOLIDAY",
};

export const useHolidays = () => {
  const [holidays, setHolidays] = useState<IHolidayRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<IHolidayRead | null>(null);
  const [formData, setFormData] = useState<HolidayFormData>(EMPTY_FORM);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Apply-to-year modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState<ApplyFormData>(EMPTY_APPLY);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applyResult, setApplyResult] = useState<number | null>(null);

  const loadHolidays = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const data = await appointmentService.getHolidays({ schoolId });
      setHolidays(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar los días festivos");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateField = <K extends keyof HolidayFormData>(
    field: K,
    value: HolidayFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const openCreate = () => {
    setEditingHoliday(null);
    setFormData(EMPTY_FORM);
    setSaveError(null);
    setModalOpen(true);
  };

  const openEdit = (holiday: IHolidayRead) => {
    setEditingHoliday(holiday);
    setFormData({
      name: holiday.name,
      holiday_type: holiday.holiday_type,
      month: holiday.month,
      day: holiday.day ?? "",
      nth: holiday.nth ?? "",
      day_of_week: holiday.day_of_week ?? "",
      before_day: holiday.before_day ?? "",
      active: holiday.active,
    });
    setSaveError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingHoliday(null);
    setSaveError(null);
  };

  const validate = (): string | null => {
    if (!formData.name.trim()) return "El nombre es obligatorio";
    if (!formData.month) return "El mes es obligatorio";
    if (formData.holiday_type === "FIXED") {
      if (formData.day === "" || formData.day === undefined) return "El día es obligatorio";
    }
    if (formData.holiday_type === "NTH_WEEKDAY") {
      if (formData.nth === "") return "El número de ocurrencia es obligatorio";
      if (formData.day_of_week === "") return "El día de la semana es obligatorio";
    }
    if (formData.holiday_type === "LAST_WEEKDAY_BEFORE") {
      if (formData.day_of_week === "") return "El día de la semana es obligatorio";
      if (formData.before_day === "") return "El día límite es obligatorio";
    }
    return null;
  };

  const buildDto = () => ({
    name: formData.name.trim(),
    holiday_type: formData.holiday_type,
    month: Number(formData.month),
    day: formData.holiday_type === "FIXED" ? Number(formData.day) : null,
    nth: formData.holiday_type === "NTH_WEEKDAY" ? Number(formData.nth) : null,
    day_of_week:
      formData.holiday_type !== "FIXED"
        ? Number(formData.day_of_week)
        : null,
    before_day:
      formData.holiday_type === "LAST_WEEKDAY_BEFORE"
        ? Number(formData.before_day)
        : null,
    active: formData.active,
  });

  const handleSave = async (): Promise<boolean> => {
    const validationError = validate();
    if (validationError) {
      setSaveError(validationError);
      return false;
    }

    try {
      setSaveLoading(true);
      setSaveError(null);
      const { schoolId } = getOrgConfig();

      if (editingHoliday) {
        const updated = await appointmentService.updateHoliday({
          schoolId,
          holidayId: editingHoliday.id,
          dto: buildDto(),
        });
        setHolidays((prev) =>
          prev.map((h) => (h.id === updated.id ? updated : h))
        );
      } else {
        const created = await appointmentService.createHoliday({
          schoolId,
          dto: buildDto(),
        });
        setHolidays((prev) => [created, ...prev]);
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

  const handleDelete = async (holidayId: string) => {
    try {
      setDeleteLoading(true);
      const { schoolId } = getOrgConfig();
      await appointmentService.deleteHoliday({ schoolId, holidayId });
      setHolidays((prev) => prev.filter((h) => h.id !== holidayId));
      setDeleteConfirmId(null);
    } catch (err: any) {
      setError(err.message || "Error al eliminar el día festivo");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openApplyModal = () => {
    setApplyForm(EMPTY_APPLY);
    setApplyError(null);
    setApplyResult(null);
    setApplyModalOpen(true);
  };

  const closeApplyModal = () => {
    setApplyModalOpen(false);
    setApplyError(null);
    setApplyResult(null);
  };

  const updateApplyField = <K extends keyof ApplyFormData>(
    field: K,
    value: ApplyFormData[K]
  ) => {
    setApplyForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleApply = async () => {
    try {
      setApplyLoading(true);
      setApplyError(null);
      setApplyResult(null);
      const { schoolId } = getOrgConfig();
      const result = await appointmentService.applyHolidays({
        schoolId,
        dto: {
          year: Number(applyForm.year),
          applies_to_all: applyForm.applies_to_all,
          block_type: applyForm.block_type || "HOLIDAY",
        },
      });
      setApplyResult(result.created);
    } catch (err: any) {
      setApplyError(err.response?.data?.message || err.message || "Error al aplicar días festivos");
    } finally {
      setApplyLoading(false);
    }
  };

  return {
    holidays,
    loading,
    error,
    modalOpen,
    editingHoliday,
    formData,
    saveLoading,
    saveError,
    deleteConfirmId,
    deleteLoading,
    applyModalOpen,
    applyForm,
    applyLoading,
    applyError,
    applyResult,
    loadHolidays,
    updateField,
    openCreate,
    openEdit,
    closeModal,
    handleSave,
    setDeleteConfirmId,
    handleDelete,
    openApplyModal,
    closeApplyModal,
    updateApplyField,
    handleApply,
  };
};
