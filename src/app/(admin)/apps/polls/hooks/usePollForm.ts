import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getOrgConfig } from "@/lib/orgConfig";
import { useAuthStore } from "@/store/useAuthStore";
import {
  PollQuestionType,
  PollQuestionCreate,
} from "@/interfaces/IPoll";
import {
  createPoll,
  getPollById,
  updatePoll,
  getQuestionTypes,
  createPollQuestion,
  updatePollQuestion,
  deletePollQuestion,
} from "@/services/poll.service";

const toLocalInput = (iso: string): string => {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

export const BOOLEAN_OPTIONS = [
  { text: "Sí", order: 0 },
  { text: "No", order: 1 },
];

export const LIKERT_OPTIONS = [
  { text: "Totalmente en desacuerdo", order: 0 },
  { text: "En desacuerdo", order: 1 },
  { text: "Neutral", order: 2 },
  { text: "De acuerdo", order: 3 },
  { text: "Totalmente de acuerdo", order: 4 },
];

export interface LocalQuestion {
  _localId: string;
  _isNew: boolean;
  _isDeleted: boolean;
  id?: string;
  question_type_id: number;
  question_type_code: string;
  text: string;
  description: string;
  required: boolean;
  order: number;
  min_value: number | null;
  max_value: number | null;
  max_length: number | null;
  options: { text: string; order: number }[];
}

export interface PollFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  anonymous: boolean;
  status: string;
  authorized: boolean;
}

let localIdCounter = 0;
export const newLocalId = () => `local_${++localIdCounter}_${Date.now()}`;

export const usePollForm = (pollId?: string) => {
  const router = useRouter();
  const personId = useAuthStore((state) => state.personId);

  const [formData, setFormData] = useState<PollFormData>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    anonymous: false,
    status: "DRAFT",
    authorized: true,
  });
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);
  const [questionTypes, setQuestionTypes] = useState<PollQuestionType[]>([]);
  const [loadedPoll, setLoadedPoll] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const { schoolId } = getOrgConfig();
    getQuestionTypes({ schoolId })
      .then(setQuestionTypes)
      .catch((err) => console.error("Error loading question types:", err));
  }, []);

  useEffect(() => {
    if (!pollId) return;
    const load = async () => {
      try {
        setLoading(true);
        const { schoolId } = getOrgConfig();
        const poll = await getPollById({ schoolId, pollId });
        setLoadedPoll(poll);
        setFormData({
          title: poll.title || "",
          description: poll.description || "",
          startDate: poll.start_date ? toLocalInput(poll.start_date) : "",
          endDate: poll.end_date ? toLocalInput(poll.end_date) : "",
          anonymous: poll.anonymous ?? false,
          status: poll.status || "DRAFT",
          authorized: poll.authorized ?? true,
        });
        const loaded: LocalQuestion[] = (poll.questions || [])
          .sort((a: any, b: any) => a.order - b.order)
          .map((q: any) => ({
            _localId: q.id,
            _isNew: false,
            _isDeleted: false,
            id: q.id,
            question_type_id: q.question_type_id,
            question_type_code: q.question_type?.code || "",
            text: q.text || "",
            description: q.description || "",
            required: q.required ?? false,
            order: q.order ?? 0,
            min_value: q.min_value ?? null,
            max_value: q.max_value ?? null,
            max_length: q.max_length ?? null,
            options: (q.options || [])
              .sort((a: any, b: any) => a.order - b.order)
              .map((o: any) => ({ text: o.text, order: o.order })),
          }));
        setQuestions(loaded);
      } catch (err: any) {
        setError(err.message || "Error al cargar la encuesta");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pollId]);

  const updateFormField = <K extends keyof PollFormData>(
    field: K,
    value: PollFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addQuestion = (q: Omit<LocalQuestion, "_localId" | "_isNew" | "_isDeleted" | "order">) => {
    setQuestions((prev) => {
      const active = prev.filter((x) => !x._isDeleted);
      return [
        ...prev,
        { ...q, _localId: newLocalId(), _isNew: true, _isDeleted: false, order: active.length },
      ];
    });
  };

  const updateQuestion = (localId: string, changes: Partial<LocalQuestion>) => {
    setQuestions((prev) =>
      prev.map((q) => (q._localId === localId ? { ...q, ...changes } : q))
    );
  };

  const deleteQuestion = (localId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q._localId !== localId) return q;
        if (q.id) setDeletedQuestionIds((ids) => [...ids, q.id!]);
        return { ...q, _isDeleted: true };
      })
    );
  };

  const moveQuestion = (localId: string, direction: "up" | "down") => {
    setQuestions((prev) => {
      const active = prev.filter((q) => !q._isDeleted);
      const idx = active.findIndex((q) => q._localId === localId);
      if (idx < 0) return prev;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= active.length) return prev;
      const result = active.map((q, i) => {
        if (i === idx) return { ...q, order: swapIdx };
        if (i === swapIdx) return { ...q, order: idx };
        return q;
      });
      const deleted = prev.filter((q) => q._isDeleted);
      return [...result, ...deleted];
    });
  };

  const buildQuestionPayload = (q: LocalQuestion): PollQuestionCreate => {
    const payload: PollQuestionCreate = {
      question_type_id: q.question_type_id,
      text: q.text.trim(),
      description: q.description.trim() || undefined,
      required: q.required,
      order: q.order,
    };
    if (q.question_type_code === "TEXT" && q.max_length !== null) {
      payload.max_length = q.max_length;
    }
    if (q.question_type_code === "RATING") {
      if (q.min_value !== null) payload.min_value = q.min_value;
      if (q.max_value !== null) payload.max_value = q.max_value;
    }
    const typeObj = questionTypes.find((t) => t.id === q.question_type_id);
    if (typeObj?.has_options && q.options.length > 0) {
      payload.options = q.options.map((o, i) => ({ text: o.text, order: i }));
    }
    return payload;
  };

  const validate = (selectedRecipients: Set<number>): boolean => {
    if (!formData.title.trim()) {
      setSaveError("El título es requerido");
      return false;
    }
    if (!pollId && selectedRecipients.size === 0) {
      setSaveError("Debe seleccionar al menos un destinatario");
      return false;
    }
    if (!personId) {
      setSaveError("No se pudo obtener la información del usuario");
      return false;
    }
    const active = questions.filter((q) => !q._isDeleted);
    if (active.length === 0) {
      setSaveError("La encuesta debe tener al menos una pregunta");
      return false;
    }
    for (const q of active) {
      if (!q.text.trim()) {
        setSaveError("Todas las preguntas deben tener un texto");
        return false;
      }
      const typeObj = questionTypes.find((t) => t.id === q.question_type_id);
      if (typeObj?.has_options && q.options.length === 0) {
        setSaveError(`La pregunta "${q.text}" requiere al menos una opción`);
        return false;
      }
    }
    return true;
  };

  const handleSave = async (
    selectedRecipients: Set<number>,
    academicSelections: {
      academicYears: Set<number>;
      academicStages: Set<number>;
      academicPrograms: Set<number>;
      programYears: Set<number>;
      academicGroups: Set<number>;
    },
    publish: boolean = false
  ) => {
    try {
      setSaveLoading(true);
      setSaveError(null);

      if (!validate(selectedRecipients)) return;

      const { schoolId } = getOrgConfig();
      const active = questions
        .filter((q) => !q._isDeleted)
        .sort((a, b) => a.order - b.order);

      const resolvedStatus = publish ? 'PUBLISHED' : formData.status;

      if (pollId) {
        // Edit mode: update poll metadata
        await updatePoll({
          schoolId,
          pollId,
          dto: {
            title: formData.title.trim(),
            description: formData.description.trim() || undefined,
            start_date: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
            end_date: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
            anonymous: formData.anonymous,
            status: resolvedStatus,
            authorized: formData.authorized,
          },
        });

        // Delete removed questions
        for (const qId of deletedQuestionIds) {
          await deletePollQuestion({ schoolId, pollId, questionId: qId });
        }

        // Create new / update existing questions
        for (const q of active) {
          const payload = buildQuestionPayload(q);
          if (q._isNew) {
            await createPollQuestion({ schoolId, pollId, dto: payload });
          } else if (q.id) {
            await updatePollQuestion({ schoolId, pollId, questionId: q.id, dto: payload });
          }
        }

        router.push(`/apps/polls?highlightId=${pollId}`);
      } else {
        // Create mode: single POST with everything
        const result = await createPoll({
          schoolId,
          dto: {
            publisher_person_id: personId!.toString(),
            persons: Array.from(selectedRecipients).map(String),
            title: formData.title.trim(),
            description: formData.description.trim() || undefined,
            start_date: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
            end_date: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
            anonymous: formData.anonymous,
            status: resolvedStatus,
            authorized: formData.authorized,
            questions: active.map(buildQuestionPayload),
            ...(academicSelections.academicYears.size > 0 && {
              academic_years: Array.from(academicSelections.academicYears).map(String),
            }),
            ...(academicSelections.academicStages.size > 0 && {
              academic_stages: Array.from(academicSelections.academicStages).map(String),
            }),
            ...(academicSelections.academicPrograms.size > 0 && {
              academic_programs: Array.from(academicSelections.academicPrograms).map(String),
            }),
            ...(academicSelections.programYears.size > 0 && {
              academic_program_years: Array.from(academicSelections.programYears).map(String),
            }),
            ...(academicSelections.academicGroups.size > 0 && {
              academic_groups: Array.from(academicSelections.academicGroups).map(String),
            }),
          },
        });
        router.push(`/apps/polls?highlightId=${result.id}`);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Error al guardar la encuesta";
      setSaveError(msg);
    } finally {
      setSaveLoading(false);
    }
  };

  return {
    formData,
    updateFormField,
    questions,
    questionTypes,
    loadedPoll,
    loading,
    saveLoading,
    error,
    saveError,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    moveQuestion,
    handleSave,
  };
};
