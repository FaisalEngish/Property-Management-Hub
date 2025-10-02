export default function ConsolidatedSystemHub() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'red', 
      padding: '50px',
      zIndex: 9999,
      position: 'relative'
    }}>
      <h1 style={{ fontSize: '48px', color: 'white', fontWeight: 'bold' }}>
        SYSTEM HUB PAGE
      </h1>
      <p style={{ fontSize: '24px', color: 'yellow' }}>
        This page is rendering! If you see this, the route works.
      </p>
    </div>
  );
}
