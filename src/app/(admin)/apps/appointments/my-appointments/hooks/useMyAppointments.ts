"use client";

import { useState, useEffect, useCallback } from "react";
import { IAppointmentRead } from "@/interfaces/IAppointment";
import { getAppointments } from "@/services/appointment.service";
import { getOrgConfig } from "@/lib/orgConfig";

const monthRangeUTC = (year: number, month: number) => {
  const startFrom = new Date(Date.UTC(year, month, 1, 0, 0, 0)).toISOString();
  const startUntil = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59)).toISOString();
  return { startFrom, startUntil };
};

export const useMyAppointments = (personId: string | null) => {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getUTCFullYear());
  const [viewMonth, setViewMonth] = useState(now.getUTCMonth());

  const [appointments, setAppointments] = useState<IAppointmentRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    if (!personId) return;
    setLoading(true);
    setError(null);
    try {
      const { schoolId } = getOrgConfig();
      const { startFrom, startUntil } = monthRangeUTC(viewYear, viewMonth);
      const data = await getAppointments({ schoolId, personId, startFrom, startUntil });
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar reuniones");
    } finally {
      setLoading(false);
    }
  }, [personId, viewYear, viewMonth]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  return {
    appointments, loading, error,
    viewYear, viewMonth,
    prevMonth, nextMonth,
    reload: loadAppointments,
  };
};
