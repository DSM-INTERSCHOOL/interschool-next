// app/page.tsx
import { Suspense } from 'react';
import PageClient from './PageClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Servicio Médico",
};

export default function Page() {
  return (
      <Suspense fallback={<p>Cargando…</p>}>
        <PageClient />
      </Suspense>
  );
}
