import React, { useEffect, useState } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const EMOTION_COLORS = {
  Happy: '#E0B86B',
  Calm: '#7C9885',
  Excited: '#E08F6B',
  Anxious: '#C77B9E',
  Sad: '#6B8FB8',
  Tired: '#9C8FB8',
  Angry: '#D88C7A',
  Neutral: '#A8A8A8',
};

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const { theme } = useTheme();
  const [moodData, setMoodData] = useState([]);
  const [emotionData, setEmotionData] = useState([]);
  const [summary, setSummary] = useState({ avgMood: 0, avgEnergy: 0, totalEntries: 0 });
  const [isPremiumView, setIsPremiumView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [moodRes, emotionRes, summaryRes] = await Promise.all([
        api.get('/analytics/mood-over-time'),
        api.get('/analytics/emotions'),
        api.get('/analytics/summary'),
      ]);
      setMoodData(moodRes.data.data);
      setIsPremiumView(moodRes.data.isPremium);
      setEmotionData(emotionRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      await api.post('/user/upgrade');
      await refreshUser();
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setUpgrading(false);
    }
  }

  const textColor = theme === 'dark' ? '#E8EDE9' : '#2D3B36';
  const gridColor = theme === 'dark' ? '#354039' : '#E5DFD5';

  const lineChartData = {
    labels: moodData.map((d) => new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Mood',
        data: moodData.map((d) => d.mood),
        borderColor: '#7C9885',
        backgroundColor: 'rgba(124, 152, 133, 0.15)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#7C9885',
      },
      {
        label: 'Energy',
        data: moodData.map((d) => d.energy),
        borderColor: '#E0B86B',
        backgroundColor: 'rgba(224, 184, 107, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#E0B86B',
      },
    ],
  };

  const pieChartData = {
    labels: emotionData.map((d) => d.emotion),
    datasets: [
      {
        data: emotionData.map((d) => d.count),
        backgroundColor: emotionData.map((d) => EMOTION_COLORS[d.emotion] || '#A8A8A8'),
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="page">
      <div className="top-bar">
        <div>
          <h2 style={{ fontSize: 20 }}>Your Insights</h2>
          <p className="text-muted">Patterns over time</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div className="card" style={{ flex: 1, textAlign: 'center', padding: 16 }}>
          <p style={{ fontSize: 22, fontWeight: 600, color: 'var(--accent-deep)' }}>
            {summary.avgMood ? summary.avgMood.toFixed(1) : '–'}
          </p>
          <p className="text-muted" style={{ fontSize: 12 }}>Avg Mood</p>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center', padding: 16 }}>
          <p style={{ fontSize: 22, fontWeight: 600, color: 'var(--warning)' }}>
            {summary.avgEnergy ? summary.avgEnergy.toFixed(1) : '–'}
          </p>
          <p className="text-muted" style={{ fontSize: 12 }}>Avg Energy</p>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center', padding: 16 }}>
          <p style={{ fontSize: 22, fontWeight: 600 }}>{summary.totalEntries || 0}</p>
          <p className="text-muted" style={{ fontSize: 12 }}>Entries</p>
        </div>
      </div>

      {!loading && moodData.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🌱</p>
          <p className="text-muted">Write your first journal entry to start seeing your trends here.</p>
        </div>
      )}

      {moodData.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, marginBottom: 4 }}>Mood over Time</h3>
          {!isPremiumView && (
            <p className="text-muted" style={{ fontSize: 12, marginBottom: 10 }}>
              Showing last 7 days — <span style={{ color: 'var(--accent-deep)', fontWeight: 600 }}>upgrade for full history</span>
            </p>
          )}
          <Line
            data={lineChartData}
            options={{
              responsive: true,
              plugins: { legend: { labels: { color: textColor } } },
              scales: {
                x: { ticks: { color: textColor }, grid: { color: gridColor } },
                y: { min: 0, max: 10, ticks: { color: textColor }, grid: { color: gridColor } },
              },
            }}
          />
        </div>
      )}

      {emotionData.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>Most Common Emotions</h3>
          <Pie
            data={pieChartData}
            options={{
              responsive: true,
              plugins: { legend: { position: 'bottom', labels: { color: textColor, padding: 12 } } },
            }}
          />
        </div>
      )}

      {!user?.isPremium && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, var(--accent-soft), var(--accent))',
            color: '#fff',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 28, marginBottom: 6 }}>✦</p>
          <h3 style={{ color: '#fff', marginBottom: 6 }}>Unlock Premium</h3>
          <p style={{ fontSize: 13, opacity: 0.9, marginBottom: 16 }}>
            Get full mood history, weekly averages, and unlimited search across all your entries.
          </p>
          <button
            onClick={handleUpgrade}
            disabled={upgrading}
            style={{
              backgroundColor: '#fff',
              color: 'var(--accent-deep)',
              padding: '12px 24px',
              borderRadius: 12,
              fontWeight: 600,
              width: '100%',
            }}
          >
            {upgrading ? 'Upgrading...' : 'Upgrade Now (Demo)'}
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
