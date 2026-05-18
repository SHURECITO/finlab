import { redirect } from 'next/navigation';

/**
 * @deprecated This simulator page has been replaced by the Comparador de Crédito.
 * Redirects all visitors to /dashboard/comparador-credito.
 */
export default function SimulatorPage() {
  redirect('/dashboard/comparador-alternativas');
}
