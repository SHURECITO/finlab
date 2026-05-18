'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) router.replace('/auth/login');
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px', flexShrink: 0, background: '#111',
        borderRight: '1px solid rgba(255,255,255,.08)',
        padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: '8px'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', textDecoration: 'none' }}>
          <span style={{ background: '#00FF87', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>📊</span>
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '18px', color: '#fff' }}>FinLab</span>
        </Link>

        {[
          { href: '/dashboard', label: '🏠 Inicio' },
          { href: '/dashboard/companies', label: '🏢 Mis empresas' },
          { href: '/dashboard/comparador-alternativas', label: '🔍 Comparador de Alternativas' },
          { href: '/dashboard/mis-simulaciones', label: '📋 Mis Simulaciones' },
          { href: '/dashboard/profile', label: '👤 Perfil' },
        ].map(item => (
          <Link key={item.href} href={item.href} style={{
            display: 'block', padding: '12px 16px', borderRadius: '10px',
            color: '#aaa', textDecoration: 'none', fontSize: '14px', fontWeight: 500,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.06)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#aaa'; }}
          >
            {item.label}
          </Link>
        ))}

        <div style={{ marginTop: 'auto' }}>
          <button
            onClick={() => { localStorage.removeItem('finlab_token'); window.location.href = '/'; }}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,.1)', color: '#666', fontSize: '14px', cursor: 'pointer', textAlign: 'left' }}
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
