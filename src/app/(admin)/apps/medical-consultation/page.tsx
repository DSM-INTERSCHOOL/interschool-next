import { Suspense } from 'react';
import MedicalConsultationClient from './MedicalConsultationClient';

export default function MedicalConsultationPage() {
  return (
    <Suspense fallback={<p>Cargando…</p>}>
      <MedicalConsultationClient />
    </Suspense>
  );
}
