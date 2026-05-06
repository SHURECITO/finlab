import type { Metadata } from 'next';
import { SimulatorPageContent } from './SimulatorPageContent';

export const metadata: Metadata = {
  title: 'Simulador Financiero | FinLab',
  description: 'Calcula la viabilidad financiera de tu emprendimiento',
};

export default function SimulatorPage() {
  return <SimulatorPageContent />;
}
