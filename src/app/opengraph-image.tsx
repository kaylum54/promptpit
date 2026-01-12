import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'PromptPit - AI Model Debate Arena';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://promptpit.com/logo.jpeg"
          alt="PromptPit"
          width={400}
          height={133}
          style={{
            borderRadius: '12px',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
