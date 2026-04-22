'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StaffPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/staff/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#0a0a0a' }}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: '#c9a84c', borderTopColor: 'transparent' }} />
    </div>
  );
}