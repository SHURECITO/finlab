import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SimulatorPageContent } from './SimulatorPageContent';

export const metadata: Metadata = {
  title: 'Simulador Financiero | FinLab',
  description: 'Calcula la viabilidad financiera de tu emprendimiento',
};

export default function SimulatorPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#0A0A0A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#666', fontSize: '16px' }}>Cargando...</p>
      </div>
    }>
      <SimulatorPageContent />
    </Suspense>
  );
}
