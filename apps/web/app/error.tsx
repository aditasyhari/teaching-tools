'use client';

import React, { useEffect } from 'react';
import { Button, Text } from '@walikelas/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log client error
    console.error('App Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl">
        !
      </div>
      <Text as="h1" variant="h3">
        Terjadi Kendala
      </Text>
      <Text variant="muted" className="max-w-md">
        Halaman mengalami gangguan teknis yang tidak terduga. Silakan coba muat ulang.
      </Text>
      <Button variant="primary" onClick={() => reset()}>
        Coba Lagi
      </Button>
    </div>
  );
}
