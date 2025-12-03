// store/useSchoolStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SchoolState {
  schoolName: string | null;
  schoolImage: string | null;

  // Acciones
  setSchoolInfo: (schoolName: string, schoolImage: string) => void;
  clearSchoolInfo: () => void;
}

export const useSchoolStore = create<SchoolState>()(
  persist(
    (set) => ({
      // Estado inicial
      schoolName: null,
      schoolImage: null,

      // Acciones
      setSchoolInfo: (schoolName, schoolImage) => set({
        schoolName,
        schoolImage
      }),

      clearSchoolInfo: () => set({
        schoolName: null,
        schoolImage: null
      }),
    }),
    {
      name: 'school-storage', // localStorage key separada
    }
  )
);
