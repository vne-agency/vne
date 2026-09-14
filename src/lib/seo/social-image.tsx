import { ImageResponse } from 'next/og'

export const socialImageSize = { width: 1200, height: 630 }

export function socialImage(label: 'vne.home' | 'vne.lab') {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        padding: 64,
        background: '#f4f3ee',
        color: '#22231f',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 24,
          borderBottom: '1px solid #22231f',
          paddingBottom: 24,
        }}
      >
        <span>VNE / DESIGN STUDIO</span>
        <span>vne.agency</span>
      </div>
      <div style={{ display: 'flex', fontSize: 148, letterSpacing: '-0.07em', lineHeight: 1 }}>
        {label}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 24,
          borderTop: '1px solid #22231f',
          paddingTop: 24,
        }}
      >
        <span>
          {label === 'vne.home' ? 'STRATEGY / DESIGN / DEVELOPMENT' : 'FORM / SYMBOLS / MOTION'}
        </span>
        <span>↗</span>
      </div>
    </div>,
    socialImageSize,
  )
}
