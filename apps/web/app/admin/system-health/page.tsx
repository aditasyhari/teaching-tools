'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, RefreshCw, Server, Database, Radio, Cpu } from 'lucide-react';
import { PageHeaderSection, Button, Badge } from '@walikelas/ui';

interface HealthResponse {
  status: string;
  timestamp: string;
  uptime?: number;
  environment?: string;
}

export default function AdminSystemHealthPage(): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      // Backend API runs on port 4006 (DEFAULT_API_PORT)
      const res = await fetch('http://localhost:4006/api/v1/health', {
        headers: { Accept: 'application/json' },
      });
      const end = performance.now();
      setLatency(Math.round(end - start));
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setHealthData(data);
    } catch (err: any) {
      setError(err.message || 'Gagal menghubungi server API');
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeaderSection
        title="Kesehatan &amp; Status Sistem"
        description="Pemeriksaan konektivitas runtime backend NestJS API (port 4006) dan infrastruktur pendukung."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Kesehatan Sistem', current: true },
        ]}
        actions={
          <Button
            variant="primary"
            size="md"
            isLoading={loading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={checkHealth}
          >
            Periksa Ulang (Ping)
          </Button>
        }
      />

      {/* Main Status Hero */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${
              healthData
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-amber-50 text-amber-600 border border-amber-200'
            }`}
          >
            {healthData ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg text-slate-900">
                {healthData ? 'Semua Layanan Beroperasi Normal' : 'API Belum Terhubung'}
              </h2>
              <Badge variant={healthData ? 'success' : 'neutral'} size="sm">
                {healthData ? 'HEALTHY' : 'STANDBY'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {healthData
                ? `Terakhir dicek: ${new Date(healthData.timestamp).toLocaleTimeString()}`
                : error || 'Menunggu respons dari server...'}
            </p>
          </div>
        </div>

        {latency !== null && (
          <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 text-center sm:text-right">
            <span className="text-xs text-slate-500 block">Latensi Ping</span>
            <span className="text-base font-bold font-mono text-slate-900">{latency} ms</span>
          </div>
        )}
      </div>

      {/* Component Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">NestJS Core API</span>
            <Server className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">Port 4006</div>
          <Badge variant={healthData ? 'success' : 'neutral'} size="sm">
            {healthData ? 'Running' : 'Offline'}
          </Badge>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Database Engine</span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">PostgreSQL / Prisma</div>
          <Badge variant="neutral" size="sm">
            Configured
          </Badge>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Realtime Engine</span>
            <Radio className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">WebSocket Session</div>
          <Badge variant="neutral" size="sm">
            Phase 3 Ready
          </Badge>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Next.js Web Client</span>
            <Cpu className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">Port 3006</div>
          <Badge variant="success" size="sm">
            Active
          </Badge>
        </div>
      </div>
    </div>
  );
}
