'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchPoll } from '@walikelas/api-client';
import type { Poll } from '@walikelas/types';
import { PollEditorView } from '../../../../../features/poll/poll-editor-view';
import { apiClient } from '../../../../../lib/api';
import { EmptyState, Button } from '@walikelas/ui';
import { ArrowLeft } from 'lucide-react';

export default function EditPollPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const pollId = params?.id as string;

  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pollId) return;
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const data = await fetchPoll(apiClient, pollId);
        if (mounted) {
          setPoll(data);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Polling tidak ditemukan');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [pollId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Memuat data polling...</p>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <EmptyState
          title="Polling Tidak Ditemukan"
          description={
            error || 'Polling yang ingin Anda edit tidak ditemukan atau Anda tidak memiliki akses.'
          }
          action={
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => router.push('/teacher/polls')}
            >
              Kembali ke Daftar Polling
            </Button>
          }
        />
      </div>
    );
  }

  return <PollEditorView initialPoll={poll} isEditing={true} />;
}
