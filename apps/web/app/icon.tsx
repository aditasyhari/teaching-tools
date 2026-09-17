import { ImageResponse } from 'next/og';
import { WALIKELAS_LOGO_DATA_URI_64 } from '@/lib/walikelas-logo-data';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <img
          src={WALIKELAS_LOGO_DATA_URI_64}
          width="32"
          height="32"
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

