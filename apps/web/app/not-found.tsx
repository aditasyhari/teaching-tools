import React from 'react';
import Link from 'next/link';
import { Button, Text } from '@walikelas/ui';

export default function NotFound() {
  return (
    <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center p-6 text-center gap-4">
      <Text as="h1" variant="h1" className="text-blue-600">
        404
      </Text>
      <Text as="h2" variant="h3">
        Halaman Tidak Ditemukan
      </Text>
      <Text variant="muted" className="max-w-md">
        Alamat yang Anda tuju tidak tersedia atau telah dipindahkan.
      </Text>
      <Link href="/" className="inline-flex">
        <Button variant="primary">Kembali ke Beranda</Button>
      </Link>
    </div>
  );
}
