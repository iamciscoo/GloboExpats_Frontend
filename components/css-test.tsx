/**
 * CSS Loading Test Component
 * Use this to verify that CSS is loading correctly in production
 */

export default function CSSTest() {
  return (
    <div className="css-test-container" style={{ display: 'none' }}>
      <div className="bg-blue-500 text-white p-4 rounded">CSS Test - Tailwind Classes</div>
      <div
        style={{
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
          padding: '1rem',
        }}
      >
        CSS Test - CSS Variables
      </div>
    </div>
  )
}
