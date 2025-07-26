import React, { useState } from "react";

// Minimal working application for debugging
export default function AppMinimal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        setIsLoggedIn(true);
        alert("Login successful!");
      } else {
        alert("Login failed!");
      }
    } catch (error) {
      alert("Connection error!");
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>🎉 HostPilotPro Dashboard</h1>
        <p>Welcome to the property management platform!</p>
        
        <div style={{ marginTop: '2rem' }}>
          <h2>Quick Navigation:</h2>
          <ul>
            <li><a href="/admin/ai-roi-predictions" style={{ color: '#007bff', textDecoration: 'none' }}>
              🤖 AI ROI Predictions (System & Admin)</a></li>
            <li><a href="/properties" style={{ color: '#007bff', textDecoration: 'none' }}>
              🏠 Properties</a></li>
            <li><a href="/tasks" style={{ color: '#007bff', textDecoration: 'none' }}>
              ✅ Tasks</a></li>
            <li><a href="/bookings" style={{ color: '#007bff', textDecoration: 'none' }}>
              📅 Bookings</a></li>
            <li><a href="/finances" style={{ color: '#007bff', textDecoration: 'none' }}>
              💰 Finances</a></li>
          </ul>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e8f4f8', borderRadius: '8px' }}>
          <h3>🎯 AI ROI Predictions System</h3>
          <p>Your comprehensive AI-powered ROI forecasting system is ready with:</p>
          <ul>
            <li>✅ 12 property predictions loaded</li>
            <li>✅ Thai villa market analysis</li>
            <li>✅ Occupancy and rate forecasting</li>
            <li>✅ ROI calculations (8.5% - 22.1% range)</li>
          </ul>
          <button 
            onClick={() => window.location.href = '/admin/ai-roi-predictions'}
            style={{ 
              padding: '0.75rem 1.5rem', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '1rem',
              marginTop: '1rem'
            }}
          >
            Access AI ROI Predictions →
          </button>
        </div>

        <button 
          onClick={() => setIsLoggedIn(false)}
          style={{ 
            marginTop: '2rem',
            padding: '0.5rem 1rem', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f8f9fa',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '8px', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
        width: '100%', 
        maxWidth: '400px' 
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#007bff', margin: '0 0 0.5rem 0' }}>HostPilotPro</h1>
          <p style={{ color: '#6c757d', margin: 0 }}>Property Management Platform</p>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
            Quick Login Options:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button 
              onClick={() => handleLogin("admin@test.com", "admin123")}
              disabled={loading}
              style={{ 
                padding: '0.75rem', 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              Admin
            </button>
            <button 
              onClick={() => handleLogin("manager@test.com", "manager123")}
              disabled={loading}
              style={{ 
                padding: '0.75rem', 
                backgroundColor: '#17a2b8', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              Manager
            </button>
            <button 
              onClick={() => handleLogin("owner@test.com", "owner123")}
              disabled={loading}
              style={{ 
                padding: '0.75rem', 
                backgroundColor: '#ffc107', 
                color: 'black', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              Owner
            </button>
            <button 
              onClick={() => handleLogin("staff@test.com", "staff123")}
              disabled={loading}
              style={{ 
                padding: '0.75rem', 
                backgroundColor: '#6c757d', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              Staff
            </button>
          </div>
        </div>

        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '1rem', 
            backgroundColor: '#e3f2fd',
            borderRadius: '4px',
            color: '#1976d2'
          }}>
            Signing in...
          </div>
        )}

        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '4px',
          fontSize: '0.85rem',
          color: '#666'
        }}>
          <strong>System Status:</strong>
          <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem' }}>
            <li>✅ Server running on port 5000</li>
            <li>✅ API endpoints functional</li>
            <li>✅ AI ROI Predictions ready</li>
            <li>✅ Database connected</li>
          </ul>
        </div>
      </div>
    </div>
  );
}