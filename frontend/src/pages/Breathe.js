import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import BottomNav from '../components/BottomNav';

// 4-7-8 breathing pattern: Inhale 4s, Hold 7s, Exhale 8s
const PHASES = [
  { label: 'Inhale', duration: 4, scale: 1.5 },
  { label: 'Hold', duration: 7, scale: 1.5 },
  { label: 'Exhale', duration: 8, scale: 1 },
];

export default function Breathe() {
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].duration);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isActive) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isActive]);

  // When the countdown for the current phase hits 0, advance to the next phase.
  useEffect(() => {
    if (!isActive || secondsLeft !== 0) return;

    const next = (phaseIndex + 1) % PHASES.length;
    if (next === 0) setCyclesCompleted((c) => c + 1);
    setPhaseIndex(next);
    setSecondsLeft(PHASES[next].duration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, isActive]);

  function startSession() {
    setPhaseIndex(0);
    setSecondsLeft(PHASES[0].duration);
    setCyclesCompleted(0);
    setIsActive(true);
  }

  function stopSession() {
    setIsActive(false);
  }

  const currentPhase = PHASES[phaseIndex];

  return (
    <div className="page">
      <div className="top-bar">
        <div>
          <h2 style={{ fontSize: 20 }}>Breathing Space</h2>
          <p className="text-muted">4-7-8 technique to calm your mind</p>
        </div>
      </div>

      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '50px 20px',
          minHeight: 420,
        }}
      >
        <div style={{ position: 'relative', width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 36 }}>
          {/* Outer glow ring */}
          <motion.div
            animate={{
              scale: isActive ? currentPhase.scale : 1,
            }}
            transition={{ duration: isActive ? currentPhase.duration : 0.6, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              width: 140,
              height: 140,
              borderRadius: '50%',
              backgroundColor: 'var(--accent-soft)',
              opacity: 0.35,
            }}
          />
          {/* Main breathing circle */}
          <motion.div
            animate={{
              scale: isActive ? currentPhase.scale : 1,
            }}
            transition={{ duration: isActive ? currentPhase.duration : 0.6, ease: 'easeInOut' }}
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              backgroundColor: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 30px rgba(124, 152, 133, 0.4)',
              zIndex: 2,
            }}
          >
            <div style={{ textAlign: 'center', color: '#fff' }}>
              <p style={{ fontSize: 16, fontWeight: 600 }}>{isActive ? currentPhase.label : 'Ready?'}</p>
              {isActive && <p style={{ fontSize: 22, fontWeight: 300 }}>{secondsLeft}</p>}
            </div>
          </motion.div>
        </div>

        {isActive && (
          <p className="text-muted" style={{ marginBottom: 20 }}>
            Cycles completed: {cyclesCompleted}
          </p>
        )}

        {!isActive ? (
          <button className="btn-primary" onClick={startSession} style={{ maxWidth: 220 }}>
            Begin Breathing
          </button>
        ) : (
          <button className="btn-secondary" onClick={stopSession} style={{ maxWidth: 220 }}>
            Stop
          </button>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: 14, marginBottom: 10, color: 'var(--text-secondary)' }}>How it works</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Inhale slowly for 4 seconds as the circle expands, hold gently for 7 seconds,
          then exhale for 8 seconds as it contracts. Repeat for a few cycles to settle your
          nervous system.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
