'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const CREDENZIALI = {
  barista: { password: 'bar2024', ruolo: 'bar', redirect: '/staff/bar' },
  cassa:   { password: 'cassa2024', ruolo: 'cassa', redirect: '/staff/cassa' },
};

export default function StaffLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errore, setErrore] = useState('');

  function handleLogin() {
    setErrore('');
    const credenziale = CREDENZIALI[username.toLowerCase() as keyof typeof CREDENZIALI];

    if (!credenziale || credenziale.password !== password) {
      setErrore('Credenziali non corrette');
      return;
    }

    // Salva ruolo in sessionStorage
    sessionStorage.setItem('staff_ruolo', credenziale.ruolo);
    sessionStorage.setItem('staff_username', username.toLowerCase());
    router.push(credenziale.redirect);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: '#0a0a0a' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/Logo_del_Lido_Arcobaleno.png"
            alt="Lido Arcobaleno Gate 1"
            width={160}
            height={100}
            style={{ objectFit: 'contain' }}
          />
        </div>

        <div className="rounded-2xl p-6 space-y-4"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>

          <div className="text-center mb-2">
            <h1 className="text-xl font-black" style={{ color: '#c9a84c' }}>
              Accesso Staff
            </h1>
            <p style={{ color: '#666', fontSize: '0.8rem' }}>
              Inserisci le tue credenziali
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1.5" style={{ color: '#888' }}>
              Username
            </label>
            <input
              type="text"
              placeholder="barista / cassa"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 rounded-xl"
              style={{ backgroundColor: '#2a2a2a', border: '1px solid #333', color: '#e8e8e8' }}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1.5" style={{ color: '#888' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 rounded-xl"
              style={{ backgroundColor: '#2a2a2a', border: '1px solid #333', color: '#e8e8e8' }}
            />
          </div>

          {errore && (
            <div className="p-3 rounded-xl text-sm text-center"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
              ⚠️ {errore}
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-2xl font-bold text-base"
            style={{ backgroundColor: '#c9a84c', color: '#0a0a0a' }}
          >
            Accedi
          </button>
        </div>

        {/* Credenziali di esempio */}
        <div className="mt-4 p-4 rounded-xl text-center"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <p style={{ color: '#555', fontSize: '0.72rem' }}>
            👨‍🍳 barista / bar2024 &nbsp;|&nbsp; 💰 cassa / cassa2024
          </p>
        </div>

      </div>
    </div>
  );
}