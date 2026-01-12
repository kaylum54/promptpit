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
          background: 'linear-gradient(135deg, #0f0f14 0%, #1a1a24 50%, #0f0f14 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Subtle grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.03) 0%, transparent 50%)',
            display: 'flex',
          }}
        />

        {/* Logo/Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          <span
            style={{
              fontSize: '72px',
            }}
          >
            &#x1F3DF;
          </span>
          <h1
            style={{
              fontSize: '80px',
              fontWeight: 700,
              color: '#ffffff',
              margin: 0,
              letterSpacing: '-2px',
            }}
          >
            PromptPit
          </h1>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: '32px',
            color: '#a0a0a0',
            margin: '0 0 48px 0',
            fontWeight: 500,
          }}
        >
          AI Model Debate Arena
        </p>

        {/* Model badges */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            alignItems: 'center',
          }}
        >
          {/* Claude */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
            <span style={{ color: '#ffffff', fontSize: '20px', fontWeight: 600 }}>Claude</span>
          </div>

          <span style={{ color: '#4a4a4a', fontSize: '32px', fontWeight: 700 }}>vs</span>

          {/* GPT-4o */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
            <span style={{ color: '#ffffff', fontSize: '20px', fontWeight: 600 }}>GPT-4o</span>
          </div>

          <span style={{ color: '#4a4a4a', fontSize: '32px', fontWeight: 700 }}>vs</span>

          {/* Gemini */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#8b5cf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
            <span style={{ color: '#ffffff', fontSize: '20px', fontWeight: 600 }}>Gemini</span>
          </div>

          <span style={{ color: '#4a4a4a', fontSize: '32px', fontWeight: 700 }}>vs</span>

          {/* Llama */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#06b6d4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
            <span style={{ color: '#ffffff', fontSize: '20px', fontWeight: 600 }}>Llama</span>
          </div>
        </div>

        {/* Bottom tagline */}
        <p
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '22px',
            color: '#6b7280',
            margin: 0,
          }}
        >
          4 AI models compete. 1 AI judges. You decide the prompt.
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
