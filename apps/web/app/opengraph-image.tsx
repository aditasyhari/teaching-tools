import { ImageResponse } from 'next/og';
import { WALIKELAS_LOGO_DATA_URI } from '@/lib/walikelas-logo-data';

export const alt = 'WaliKelas Teaching Tools — Pembelajaran Interaktif di Kelas';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 70px',
          backgroundColor: '#0f172a',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img
              src={WALIKELAS_LOGO_DATA_URI}
              width="60"
              height="60"
              style={{ objectFit: 'contain' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '30px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>
                WaliKelas
              </span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#94a3b8' }}>
                Teaching Tools
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '9999px',
              padding: '10px 24px',
              color: '#38bdf8',
              fontSize: '17px',
              fontWeight: 700,
            }}
          >
            tools.walikelas.id
          </div>
        </div>

        {/* Center: Headline & Subheading */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1000px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#f59e0b',
              fontSize: '17px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
            }}
          >
            Platform Perkakas Pembelajaran Guru Indonesia
          </div>
          <h1
            style={{
              fontSize: '52px',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.18,
              letterSpacing: '-1.5px',
              margin: 0,
            }}
          >
            Buat Kelas Lebih Aktif, Seru, dan Interaktif dalam Hitungan Detik.
          </h1>
          <p
            style={{
              fontSize: '22px',
              color: '#94a3b8',
              lineHeight: 1.45,
              margin: 0,
            }}
          >
            Kuis Langsung, Polling Siswa, Timer Kelas, Random Picker, dan Mode Proyektor Layar tanpa instalasi rumit.
          </p>
        </div>

        {/* Bottom Feature Badges */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            'Live Quiz',
            'Live Poll',
            'Classroom Timer',
            'Random Picker',
            'Group Maker',
            'Papan Skor',
            'Mode Proyektor',
            '100% Gratis',
          ].map((tag) => (
            <div
              key={tag}
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '10px 18px',
                color: '#e2e8f0',
                fontSize: '15px',
                fontWeight: 700,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

