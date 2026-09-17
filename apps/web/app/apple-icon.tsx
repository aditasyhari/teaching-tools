import { ImageResponse } from 'next/og';
import { WALIKELAS_LOGO_DATA_URI_180 } from '@/lib/walikelas-logo-data';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '40px',
        }}
      >
        <img
          src={WALIKELAS_LOGO_DATA_URI_180}
          width="150"
          height="150"
          style={{
            objectFit: 'contain',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}

