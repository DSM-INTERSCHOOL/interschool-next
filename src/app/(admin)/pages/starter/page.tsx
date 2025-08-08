// app/page.tsx
import { Suspense } from 'react';
import PageClient from './PageClient';
import { Metadata } from 'next';
import { PageTitle } from '@/components/PageTitle';

export const metadata: Metadata = {
  title: "Servicio Médico",
};

export default function Page() {
  return (
      <Suspense fallback={<p>Cargando…</p>}>
        <PageTitle title="Servicio Médico" items={[{ label: "Components" }, { label: "Accordion", active: true }]} />
        <PageClient />
      </Suspense>
  );
}
