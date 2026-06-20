import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await api.get('/journal/export/json');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mindwell-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Could not export data. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="page">
      <div className="top-bar">
        <div>
          <h2 style={{ fontSize: 20 }}>Settings</h2>
          <p className="text-muted">Your account & privacy</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontWeight: 600, marginBottom: 2 }}>{user?.name}</p>
        <p className="text-muted" style={{ fontSize: 13 }}>{user?.email}</p>
        {user?.isPremium && <span className="badge-premium" style={{ marginTop: 10, display: 'inline-block' }}>✦ Premium Member</span>}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: 500 }}>Dark Mode</p>
            <p className="text-muted" style={{ fontSize: 12 }}>Easier on the eyes at night</p>
          </div>
          <button
            onClick={toggleTheme}
            style={{
              width: 52,
              height: 30,
              borderRadius: 20,
              backgroundColor: theme === 'dark' ? 'var(--accent)' : 'var(--bg-tertiary)',
              position: 'relative',
              transition: 'background-color 0.3s ease',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 3,
                left: theme === 'dark' ? 26 : 3,
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: '#fff',
                transition: 'left 0.3s ease',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            />
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontWeight: 500, marginBottom: 4 }}>🔒 Your Privacy</p>
        <p className="text-muted" style={{ fontSize: 13, lineHeight: 1.6 }}>
          Every journal entry is encrypted with AES-256 before it's stored. Even we
          can't read your entries in the database — only you, when logged in, can
          decrypt and view them.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontWeight: 500, marginBottom: 4 }}>Export Your Data</p>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 14 }}>
          Download all your journal entries as a JSON file, anytime (GDPR compliant).
        </p>
        <button className="btn-secondary" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Preparing export...' : '⬇️ Export My Data'}
        </button>
      </div>

      <button className="btn-secondary" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
        Log Out
      </button>

      <BottomNav />
    </div>
  );
}
