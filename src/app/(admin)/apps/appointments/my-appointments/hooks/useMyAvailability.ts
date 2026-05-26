"use client";

import { useState, useEffect, useCallback } from "react";
import {
  IPersonAvailabilityRead,
  IAvailabilityRuleRead,
  IAvailabilityExceptionRead,
  AvailabilityType,
  ExceptionType,
} from "@/interfaces/IAppointment";
import * as appointmentService from "@/services/appointment.service";
import { getOrgConfig } from "@/lib/orgConfig";

export interface SettingsFormData {
  availability_type: AvailabilityType;
  slot_duration_minutes: number;
  timezone: string;
  active: boolean;
}

export interface RuleFormData {
  days_of_week: number[];
  start_time: string;
  end_time: string;
  valid_from: string;
  valid_until: string;
  active: boolean;
}

export interface ExceptionFormData {
  exception_type: ExceptionType;
  start_datetime: string;
  end_datetime: string;
  reason: string;
}

const DEFAULT_SETTINGS: SettingsFormData = {
  availability_type: "SPECIFIC",
  slot_duration_minutes: 30,
  timezone: "America/Mexico_City",
  active: true,
};

const DEFAULT_RULE: RuleFormData = {
  days_of_week: [0, 1, 2, 3, 4],
  start_time: "09:00",
  end_time: "17:00",
  valid_from: "",
  valid_until: "",
  active: true,
};

const DEFAULT_EXCEPTION: ExceptionFormData = {
  exception_type: "UNAVAILABLE",
  start_datetime: "",
  end_datetime: "",
  reason: "",
};

const toLocalInput = (iso: string): string => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const useMyAvailability = (personId: string | null) => {
  const [availability, setAvailability] = useState<IPersonAvailabilityRead | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [settingsForm, setSettingsForm] = useState<SettingsFormData>(DEFAULT_SETTINGS);
  const [settingsSaveLoading, setSettingsSaveLoading] = useState(false);
  const [settingsSaveError, setSettingsSaveError] = useState<string | null>(null);

  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<IAvailabilityRuleRead | null>(null);
  const [ruleForm, setRuleForm] = useState<RuleFormData>(DEFAULT_RULE);
  const [ruleSaveLoading, setRuleSaveLoading] = useState(false);
  const [ruleSaveError, setRuleSaveError] = useState<string | null>(null);
  const [deleteRuleId, setDeleteRuleId] = useState<string | null>(null);
  const [deleteRuleLoading, setDeleteRuleLoading] = useState(false);

  const [exceptionModalOpen, setExceptionModalOpen] = useState(false);
  const [editingException, setEditingException] = useState<IAvailabilityExceptionRead | null>(null);
  const [exceptionForm, setExceptionForm] = useState<ExceptionFormData>(DEFAULT_EXCEPTION);
  const [exceptionSaveLoading, setExceptionSaveLoading] = useState(false);
  const [exceptionSaveError, setExceptionSaveError] = useState<string | null>(null);
  const [deleteExceptionId, setDeleteExceptionId] = useState<string | null>(null);
  const [deleteExceptionLoading, setDeleteExceptionLoading] = useState(false);

  const loadAvailability = useCallback(async () => {
    if (!personId) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const { schoolId } = getOrgConfig();
      const data = await appointmentService.getPersonAvailability({ schoolId, personId });
      setAvailability(data);
      setSettingsForm({
        availability_type: data.availability_type,
        slot_duration_minutes: data.slot_duration_minutes,
        timezone: data.timezone,
        active: data.active,
      });
    } catch (err: any) {
      if (err.response?.status === 404) {
        setNotFound(true);
        setSettingsForm(DEFAULT_SETTINGS);
      } else {
        setError(err.message || "Error al cargar disponibilidad");
      }
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  // ── Settings ────────────────────────────────────────────────────────────────

  const updateSettingsField = <K extends keyof SettingsFormData>(field: K, value: SettingsFormData[K]) =>
    setSettingsForm((prev) => ({ ...prev, [field]: value }));

  const handleSaveSettings = async () => {
    if (!personId) return;
    try {
      setSettingsSaveLoading(true);
      setSettingsSaveError(null);
      const { schoolId } = getOrgConfig();
      let updated: IPersonAvailabilityRead;
      if (notFound) {
        updated = await appointmentService.createPersonAvailability({
          schoolId,
          personId,
          dto: settingsForm,
        });
        setNotFound(false);
      } else {
        updated = await appointmentService.updatePersonAvailability({
          schoolId,
          personId,
          dto: settingsForm,
        });
      }
      setAvailability(updated);
      setSettingsForm({
        availability_type: updated.availability_type,
        slot_duration_minutes: updated.slot_duration_minutes,
        timezone: updated.timezone,
        active: updated.active,
      });
    } catch (err: any) {
      setSettingsSaveError(err.response?.data?.message || err.message || "Error al guardar");
    } finally {
      setSettingsSaveLoading(false);
    }
  };

  // ── Rules ────────────────────────────────────────────────────────────────────

  const updateRuleField = <K extends keyof RuleFormData>(field: K, value: RuleFormData[K]) =>
    setRuleForm((prev) => ({ ...prev, [field]: value }));

  const openAddRule = () => {
    setEditingRule(null);
    setRuleForm(DEFAULT_RULE);
    setRuleSaveError(null);
    setRuleModalOpen(true);
  };

  const openEditRule = (rule: IAvailabilityRuleRead) => {
    setEditingRule(rule);
    setRuleForm({
      days_of_week: rule.days_of_week,
      start_time: rule.start_time.slice(0, 5),
      end_time: rule.end_time.slice(0, 5),
      valid_from: rule.valid_from ?? "",
      valid_until: rule.valid_until ?? "",
      active: rule.active,
    });
    setRuleSaveError(null);
    setRuleModalOpen(true);
  };

  const closeRuleModal = () => {
    setRuleModalOpen(false);
    setEditingRule(null);
    setRuleSaveError(null);
  };

  const handleSaveRule = async () => {
    if (!personId || !availability) return;
    if (ruleForm.days_of_week.length === 0) { setRuleSaveError("Selecciona al menos un día"); return; }
    if (!ruleForm.start_time || !ruleForm.end_time) { setRuleSaveError("Los horarios son obligatorios"); return; }
    try {
      setRuleSaveLoading(true);
      setRuleSaveError(null);
      const { schoolId } = getOrgConfig();
      const dto = {
        days_of_week: ruleForm.days_of_week,
        start_time: ruleForm.start_time + ":00",
        end_time: ruleForm.end_time + ":00",
        valid_from: ruleForm.valid_from || null,
        valid_until: ruleForm.valid_until || null,
        active: ruleForm.active,
      };
      if (editingRule) {
        const updated = await appointmentService.updateRule({ schoolId, personId, ruleId: editingRule.id, dto });
        setAvailability((prev) => prev ? { ...prev, rules: prev.rules.map((r) => r.id === updated.id ? updated : r) } : prev);
      } else {
        const created = await appointmentService.createRule({ schoolId, personId, dto });
        setAvailability((prev) => prev ? { ...prev, rules: [...prev.rules, created] } : prev);
      }
      closeRuleModal();
    } catch (err: any) {
      setRuleSaveError(err.response?.data?.message || err.message || "Error al guardar regla");
    } finally {
      setRuleSaveLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!personId) return;
    try {
      setDeleteRuleLoading(true);
      const { schoolId } = getOrgConfig();
      await appointmentService.deleteRule({ schoolId, personId, ruleId });
      setAvailability((prev) => prev ? { ...prev, rules: prev.rules.filter((r) => r.id !== ruleId) } : prev);
      setDeleteRuleId(null);
    } catch (err: any) {
      setError(err.message || "Error al eliminar regla");
    } finally {
      setDeleteRuleLoading(false);
    }
  };

  // ── Exceptions ───────────────────────────────────────────────────────────────

  const updateExceptionField = <K extends keyof ExceptionFormData>(field: K, value: ExceptionFormData[K]) =>
    setExceptionForm((prev) => ({ ...prev, [field]: value }));

  const openAddException = () => {
    setEditingException(null);
    setExceptionForm(DEFAULT_EXCEPTION);
    setExceptionSaveError(null);
    setExceptionModalOpen(true);
  };

  const openEditException = (exc: IAvailabilityExceptionRead) => {
    setEditingException(exc);
    setExceptionForm({
      exception_type: exc.exception_type,
      start_datetime: toLocalInput(exc.start_datetime),
      end_datetime: toLocalInput(exc.end_datetime),
      reason: exc.reason ?? "",
    });
    setExceptionSaveError(null);
    setExceptionModalOpen(true);
  };

  const closeExceptionModal = () => {
    setExceptionModalOpen(false);
    setEditingException(null);
    setExceptionSaveError(null);
  };

  const handleSaveException = async () => {
    if (!personId) return;
    if (!exceptionForm.start_datetime || !exceptionForm.end_datetime) {
      setExceptionSaveError("Las fechas son obligatorias");
      return;
    }
    try {
      setExceptionSaveLoading(true);
      setExceptionSaveError(null);
      const { schoolId } = getOrgConfig();
      const dto = {
        exception_type: exceptionForm.exception_type,
        start_datetime: new Date(exceptionForm.start_datetime).toISOString(),
        end_datetime: new Date(exceptionForm.end_datetime).toISOString(),
        reason: exceptionForm.reason.trim() || null,
      };
      if (editingException) {
        const updated = await appointmentService.updateException({
          schoolId, personId, exceptionId: editingException.id, dto,
        });
        setAvailability((prev) => prev ? {
          ...prev,
          exceptions: prev.exceptions.map((e) => e.id === updated.id ? updated : e),
        } : prev);
      } else {
        const created = await appointmentService.createException({ schoolId, personId, dto });
        setAvailability((prev) => prev ? { ...prev, exceptions: [...prev.exceptions, created] } : prev);
      }
      closeExceptionModal();
    } catch (err: any) {
      setExceptionSaveError(err.response?.data?.message || err.message || "Error al guardar excepción");
    } finally {
      setExceptionSaveLoading(false);
    }
  };

  const handleDeleteException = async (exceptionId: string) => {
    if (!personId) return;
    try {
      setDeleteExceptionLoading(true);
      const { schoolId } = getOrgConfig();
      await appointmentService.deleteException({ schoolId, personId, exceptionId });
      setAvailability((prev) => prev ? {
        ...prev,
        exceptions: prev.exceptions.filter((e) => e.id !== exceptionId),
      } : prev);
      setDeleteExceptionId(null);
    } catch (err: any) {
      setError(err.message || "Error al eliminar excepción");
    } finally {
      setDeleteExceptionLoading(false);
    }
  };

  return {
    availability, loading, error, notFound,
    settingsForm, settingsSaveLoading, settingsSaveError,
    updateSettingsField, handleSaveSettings,
    ruleModalOpen, editingRule, ruleForm, ruleSaveLoading, ruleSaveError,
    updateRuleField, openAddRule, openEditRule, closeRuleModal, handleSaveRule,
    deleteRuleId, deleteRuleLoading, setDeleteRuleId, handleDeleteRule,
    exceptionModalOpen, editingException, exceptionForm, exceptionSaveLoading, exceptionSaveError,
    updateExceptionField, openAddException, openEditException, closeExceptionModal, handleSaveException,
    deleteExceptionId, deleteExceptionLoading, setDeleteExceptionId, handleDeleteException,
  };
};
