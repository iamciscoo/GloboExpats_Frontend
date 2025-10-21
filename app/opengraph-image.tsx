import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = 'Globoexpats - Expat Marketplace in Tanzania'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          color: 'white',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '80px 100px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              marginBottom: '24px',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            Globoexpats
          </h1>
          <p
            style={{
              fontSize: '36px',
              marginBottom: '16px',
              opacity: 0.95,
              textAlign: 'center',
            }}
          >
            Expat Marketplace in Tanzania
          </p>
          <p
            style={{
              fontSize: '28px',
              opacity: 0.85,
              textAlign: 'center',
              maxWidth: '800px',
            }}
          >
            Buy & Sell Quality Items in Dar es Salaam
          </p>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '48px',
              fontSize: '20px',
              opacity: 0.9,
            }}
          >
            <span>🌍 Global Community</span>
            <span>•</span>
            <span>✅ Verified Sellers</span>
            <span>•</span>
            <span>🛡️ Secure Transactions</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
