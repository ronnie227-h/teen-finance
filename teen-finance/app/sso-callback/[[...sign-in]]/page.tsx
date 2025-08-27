'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function SSOCallback() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) router.replace('/lessons');
  }, [isSignedIn, router]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <p>Signing you in…</p>
    </main>
  );
}


