import React, { useEffect, useState } from 'react';

const SPLASH_PIES = [
  { id: 1,  size: 52, top: '5%',  left: '5%',  opacity: 0.35, duration: 6,   delay: 0    },
  { id: 2,  size: 38, top: '10%', left: '80%', opacity: 0.30, duration: 8,   delay: 0.8  },
  { id: 3,  size: 60, top: '78%', left: '7%',  opacity: 0.28, duration: 9,   delay: 0.3  },
  { id: 4,  size: 44, top: '82%', left: '80%', opacity: 0.32, duration: 7.5, delay: 1.5  },
  { id: 5,  size: 30, top: '42%', left: '92%', opacity: 0.26, duration: 10,  delay: 0.6  },
  { id: 6,  size: 26, top: '60%', left: '3%',  opacity: 0.25, duration: 11,  delay: 2.0  },
  { id: 7,  size: 48, top: '20%', left: '50%', opacity: 0.20, duration: 8.5, delay: 1.2  },
  { id: 8,  size: 34, top: '70%', left: '45%', opacity: 0.22, duration: 7,   delay: 3.0  },
  { id: 9,  size: 22, top: '88%', left: '25%', opacity: 0.28, duration: 9.5, delay: 0.5  },
  { id: 10, size: 42, top: '3%',  left: '35%', opacity: 0.24, duration: 6.5, delay: 2.5  },
  { id: 11, size: 28, top: '50%', left: '18%', opacity: 0.20, duration: 12,  delay: 1.8  },
  { id: 12, size: 36, top: '35%', left: '70%', opacity: 0.22, duration: 8,   delay: 4.0  },
];

const SplashScreen = ({ onFinish }) => {
  const [phase, setPhase] = useState('enter');

  useEffect(() => {
    const idleTimer = setTimeout(() => setPhase('exit'), 2200);
    const finishTimer = setTimeout(() => onFinish(), 2900);
    return () => { clearTimeout(idleTimer); clearTimeout(finishTimer); };
  }, [onFinish]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #fff4e7 0%, #f8cee8 30%, #beeaff 70%, #fcf0c0 100%)',
      transition: 'opacity 0.7s ease, transform 0.7s ease',
      opacity: phase === 'exit' ? 0 : 1,
      transform: phase === 'exit' ? 'scale(1.04)' : 'scale(1)',
      pointerEvents: phase === 'exit' ? 'none' : 'all',
      overflow: 'hidden',
    }}>
      {/* Blobs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(248,206,232,0.5) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none', animation: 'pulse-blob 3s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(190,234,255,0.5) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none', animation: 'pulse-blob 3s ease-in-out infinite 1s' }} />
      <div style={{ position: 'absolute', top: '40%', right: '15%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(252,240,192,0.6) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none', animation: 'pulse-blob 3s ease-in-out infinite 0.5s' }} />

      {/* 🥧 Floating pie emojis */}
      {SPLASH_PIES.map((pie) => (
        <div key={pie.id} style={{
          position: 'absolute', top: pie.top, left: pie.left,
          fontSize: pie.size, lineHeight: 1,
          opacity: pie.opacity, userSelect: 'none', pointerEvents: 'none',
          animation: `splash-pie-${pie.id} ${pie.duration}s ease-in-out infinite ${pie.delay}s`,
          display: 'inline-block',
        }}>
          🥧
        </div>
      ))}

      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, animation: 'pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards', position: 'relative', zIndex: 2 }}>
        {/* Pie with rings */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: -14, borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#f0a3d0', borderRightColor: 'rgba(240,163,208,0.3)', animation: 'spin 1.2s linear infinite' }} />
          <div style={{ position: 'absolute', inset: -22, borderRadius: '50%', border: '2px solid transparent', borderBottomColor: '#7dcef5', borderLeftColor: 'rgba(125,206,245,0.3)', animation: 'spin 2s linear infinite reverse' }} />
          <div style={{ position: 'absolute', inset: -30, borderRadius: '50%', border: '1.5px solid transparent', borderTopColor: '#f5d96b', animation: 'spin 3s linear infinite 0.5s' }} />
          <div style={{
            width: 140, height: 140, borderRadius: '50%', overflow: 'hidden',
            background: 'white', border: '3px solid rgba(248,206,232,0.6)',
            boxShadow: '0 0 40px rgba(248,206,232,0.4), 0 20px 50px rgba(0,0,0,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'bounce-pie 2.5s ease-in-out infinite',
          }}>
            <img src="/cute-pie.jpg" alt="Boenda Pie" style={{ width: '88%', height: '88%', objectFit: 'contain' }} />
          </div>
        </div>

        {/* Text */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: 38, fontWeight: 900, letterSpacing: '-1px',
            background: 'linear-gradient(90deg, #a0336e, #1a6fa0, #8a6000, #a0336e)',
            backgroundSize: '300% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            margin: 0, animation: 'shimmer 3s linear infinite',
            fontFamily: 'system-ui, sans-serif',
          }}>BOENDA PIE</h1>
          <p style={{ color: '#9b8b7c', fontSize: 11, fontWeight: 700, letterSpacing: 5, textTransform: 'uppercase', margin: '6px 0 0', fontFamily: 'system-ui, sans-serif' }}>
            Purwokerto ✦ Sejak 2005
          </p>
        </div>

        {/* Loading dots */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[['#f0a3d0', 0], ['#7dcef5', 0.2], ['#f5d96b', 0.4]].map(([color, delay], i) => (
            <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: color, animation: `dot-bounce 1s ease-in-out infinite ${delay}s` }} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pop-in { from { opacity: 0; transform: scale(0.75); } to { opacity: 1; transform: scale(1); } }
        @keyframes bounce-pie { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes shimmer { to { background-position: 300% center; } }
        @keyframes dot-bounce { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1.3); opacity: 1; } }
        @keyframes pulse-blob { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
        ${SPLASH_PIES.map(pie => `
          @keyframes splash-pie-${pie.id} {
            0%   { transform: rotate(0deg)  translateY(0px)   scale(1); }
            40%  { transform: rotate(10deg) translateY(-20px) scale(1.1); }
            70%  { transform: rotate(-6deg) translateY(-8px)  scale(0.95); }
            100% { transform: rotate(0deg)  translateY(0px)   scale(1); }
          }
        `).join('')}
      `}</style>
    </div>
  );
};

export default SplashScreen;
