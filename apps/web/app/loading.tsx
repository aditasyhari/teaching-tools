import { Spinner, Text } from '@walikelas/ui';

export default function Loading() {
  return (
    <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <Spinner size="lg" className="text-blue-600" />
      <Text variant="muted">Memuat halaman...</Text>
    </div>
  );
}
