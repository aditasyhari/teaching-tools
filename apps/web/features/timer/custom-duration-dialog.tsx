'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
} from '@walikelas/ui';

export interface CustomDurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (totalSeconds: number) => void;
  currentDurationSeconds?: number;
}

export function CustomDurationDialog({
  open,
  onOpenChange,
  onApply,
  currentDurationSeconds = 300,
}: CustomDurationDialogProps): React.JSX.Element {
  const [minutes, setMinutes] = useState('5');
  const [seconds, setSeconds] = useState('0');
  const [errorMessage, setErrorMessage] = useState('');

  // Sync with current duration when modal opens
  useEffect(() => {
    if (open) {
      const mins = Math.floor(currentDurationSeconds / 60);
      const secs = currentDurationSeconds % 60;
      setMinutes(String(mins));
      setSeconds(String(secs));
      setErrorMessage('');
    }
  }, [open, currentDurationSeconds]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(minutes, 10) || 0;
    const secs = parseInt(seconds, 10) || 0;
    const total = mins * 60 + secs;

    if (total <= 0) {
      setErrorMessage('Durasi total harus lebih dari 0 detik.');
      return;
    }

    if (total > 180 * 60) {
      setErrorMessage('Maksimal durasi adalah 180 menit (3 jam).');
      return;
    }

    onApply(total);
    onOpenChange(false);
  };

  const handleQuickAddMinutes = (addedMinutes: number) => {
    const currentMins = parseInt(minutes, 10) || 0;
    const newMins = Math.min(180, currentMins + addedMinutes);
    setMinutes(String(newMins));
    setErrorMessage('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-lg border-[#e8e4dc]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-stone-900">
            Atur Durasi Kustom
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-600 mt-1">
            Tentukan durasi timer pembelajaran sesuai kebutuhan aktivitas kelas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <Input
                label="Menit (0–180)"
                type="number"
                min={0}
                max={180}
                value={minutes}
                onChange={(e) => {
                  setMinutes(e.target.value);
                  setErrorMessage('');
                }}
                className="h-12 text-center font-mono font-bold text-xl border-[#e8e4dc] focus-visible:ring-amber-500"
                required
                autoFocus
              />
            </div>
            <div>
              <Input
                label="Detik (0–59)"
                type="number"
                min={0}
                max={59}
                value={seconds}
                onChange={(e) => {
                  setSeconds(e.target.value);
                  setErrorMessage('');
                }}
                className="h-12 text-center font-mono font-bold text-xl border-[#e8e4dc] focus-visible:ring-amber-500"
                required
              />
            </div>
          </div>

          {/* Quick Adjustment Shortcuts */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
              Tambah Cepat
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 5, 10, 15, 30].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleQuickAddMinutes(mins)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                >
                  +{mins}m
                </button>
              ))}
            </div>
          </div>

          {errorMessage && (
            <p className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200" role="alert">
              {errorMessage}
            </p>
          )}

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="border-[#e8e4dc] text-stone-700"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold border-amber-600 shadow-xs"
            >
              Terapkan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

