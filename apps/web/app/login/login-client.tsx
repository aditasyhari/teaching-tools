'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { TeacherLoginView } from '@/components/auth/teacher-login-view';
import { Spinner } from '@walikelas/ui';

export function LoginPageClient(): React.JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/teacher');
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-stone-500 font-medium">Memeriksa status akun...</p>
        </div>
      </div>
    );
  }

  return <TeacherLoginView />;
}

