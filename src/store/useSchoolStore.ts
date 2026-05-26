// store/useSchoolStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ISchool } from '@/interfaces/ISchool';

interface SchoolState {
  school: ISchool | null;
  schoolName: string | null;
  schoolImage: string | null;

  setSchool: (school: ISchool) => void;
  setSchoolInfo: (schoolName: string, schoolImage: string) => void;
  clearSchoolInfo: () => void;
}

export const useSchoolStore = create<SchoolState>()(
  persist(
    (set) => ({
      school: null,
      schoolName: null,
      schoolImage: null,

      setSchool: (school) => set({
        school,
        schoolName: school.name,
        schoolImage: school.logo_path,
      }),

      setSchoolInfo: (schoolName, schoolImage) => set({
        schoolName,
        schoolImage,
      }),

      clearSchoolInfo: () => set({
        school: null,
        schoolName: null,
        schoolImage: null,
      }),
    }),
    {
      name: 'school-storage',
    }
  )
);
