import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';

const EMOTIONS = [
  { label: 'Happy', emoji: '😊' },
  { label: 'Calm', emoji: '😌' },
  { label: 'Excited', emoji: '🤩' },
  { label: 'Anxious', emoji: '😟' },
  { label: 'Sad', emoji: '😢' },
  { label: 'Tired', emoji: '😴' },
  { label: 'Angry', emoji: '😠' },
  { label: 'Neutral', emoji: '😐' },
];

export default function Journal() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(6);
  const [energy, setEnergy] = useState(6);
  const [emotion, setEmotion] = useState('Neutral');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [recentEntries, setRecentEntries] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPrompt();
    loadRecentEntries();
  }, []);

  async function loadPrompt() {
    try {
      const res = await api.get('/journal/prompt');
      setPrompt(res.data.prompt);
    } catch (err) {
      setPrompt('What is on your mind today?');
    }
  }

  async function shufflePrompt() {
    try {
      const res = await api.get('/journal/prompt/random');
      setPrompt(res.data.prompt);
    } catch (err) {
      // silently ignore
    }
  }

  async function loadRecentEntries() {
    try {
      const res = await api.get('/journal?limit=3');
      setRecentEntries(res.data);
    } catch (err) {
      // silently ignore
    }
  }

  async function handleSave() {
    if (!content.trim()) {
      setError('Write a little something before saving 🌿');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await api.post('/journal', { content, mood, energy, emotion, prompt });
      setContent('');
      setSaved(true);
      loadRecentEntries();
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save entry');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="top-bar">
        <div>
          <h2 style={{ fontSize: 20 }}>Hi {user?.name?.split(' ')[0] || 'there'} 👋</h2>
          <p className="text-muted">How are you feeling today?</p>
        </div>
        {user?.isPremium && <span className="badge-premium">✦ Premium</span>}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <p style={{ fontSize: 15, fontWeight: 500, flex: 1 }}>{prompt}</p>
          <button className="icon-btn" onClick={shufflePrompt} title="New prompt" style={{ marginLeft: 10, flexShrink: 0 }}>
            🔀
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <textarea
          className="input-field"
          placeholder="Let it out, gently..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <label className="label">Mood: {mood}/10</label>
        <input
          type="range"
          min="1"
          max="10"
          value={mood}
          onChange={(e) => setMood(Number(e.target.value))}
          style={{ width: '100%', marginBottom: 16, accentColor: 'var(--accent)' }}
        />

        <label className="label">Energy: {energy}/10</label>
        <input
          type="range"
          min="1"
          max="10"
          value={energy}
          onChange={(e) => setEnergy(Number(e.target.value))}
          style={{ width: '100%', marginBottom: 16, accentColor: 'var(--accent)' }}
        />

        <label className="label">How would you describe it?</label>
        <div className="scroll-x" style={{ marginBottom: 16 }}>
          {EMOTIONS.map((em) => (
            <button
              key={em.label}
              onClick={() => setEmotion(em.label)}
              style={{
                flexShrink: 0,
                padding: '10px 14px',
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 500,
                backgroundColor: emotion === em.label ? 'var(--accent)' : 'var(--bg-tertiary)',
                color: emotion === em.label ? '#fff' : 'var(--text-primary)',
                transition: 'background-color 0.2s ease',
              }}
            >
              {em.emoji} {em.label}
            </button>
          ))}
        </div>

        {error && <p className="error-text">{error}</p>}

        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : '🔒 Save Privately'}
        </button>

        <AnimatePresence>
          {saved && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ color: 'var(--accent-deep)', fontSize: 13, marginTop: 10, textAlign: 'center' }}
            >
              ✓ Saved & encrypted
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {recentEntries.length > 0 && (
        <div>
          <h3 style={{ fontSize: 16, marginBottom: 12, color: 'var(--text-secondary)' }}>Recent entries</h3>
          {recentEntries.map((entry) => (
            <div key={entry._id} className="card" style={{ marginBottom: 10, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <span style={{ fontSize: 12 }}>
                  {EMOTIONS.find((e) => e.label === entry.emotion)?.emoji || '😐'} Mood {entry.mood}/10
                </span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {entry.content}
              </p>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
