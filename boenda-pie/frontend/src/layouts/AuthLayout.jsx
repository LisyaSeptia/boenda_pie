import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FLOAT_PIES = [
  { id: 1,  size: 52, top: '5%',  left: '5%',  opacity: 0.30, duration: 6,   delay: 0    },
  { id: 2,  size: 38, top: '10%', left: '80%', opacity: 0.25, duration: 8,   delay: 0.8  },
  { id: 3,  size: 60, top: '78%', left: '7%',  opacity: 0.22, duration: 9,   delay: 0.3  },
  { id: 4,  size: 44, top: '82%', left: '80%', opacity: 0.28, duration: 7.5, delay: 1.5  },
  { id: 5,  size: 30, top: '42%', left: '92%', opacity: 0.22, duration: 10,  delay: 0.6  },
  { id: 6,  size: 26, top: '60%', left: '2%',  opacity: 0.20, duration: 11,  delay: 2.0  },
  { id: 7,  size: 48, top: '18%', left: '50%', opacity: 0.16, duration: 8.5, delay: 1.2  },
  { id: 8,  size: 34, top: '68%', left: '42%', opacity: 0.18, duration: 7,   delay: 3.0  },
  { id: 9,  size: 22, top: '88%', left: '25%', opacity: 0.22, duration: 9.5, delay: 0.5  },
  { id: 10, size: 42, top: '3%',  left: '35%', opacity: 0.20, duration: 6.5, delay: 2.5  },
  { id: 11, size: 28, top: '50%', left: '18%', opacity: 0.16, duration: 12,  delay: 1.8  },
  { id: 12, size: 36, top: '33%', left: '68%', opacity: 0.18, duration: 8,   delay: 4.0  },
];

const AuthLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff4e7 0%, #f8cee8 30%, #beeaff 70%, #fcf0c0 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, position: 'relative', overflow: 'hidden'
    }}>
      {/* Blobs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(248,206,232,0.5) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none', animation: 'pulse-blob 3s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(190,234,255,0.5) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none', animation: 'pulse-blob 3s ease-in-out infinite 1s' }} />
      <div style={{ position: 'absolute', top: '40%', right: '15%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(252,240,192,0.6) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none', animation: 'pulse-blob 3s ease-in-out infinite 0.5s' }} />

      {/* 🥧 Floating pies — sama kayak splash screen */}
      {FLOAT_PIES.map((pie) => (
        <div key={pie.id} style={{
          position: 'absolute', top: pie.top, left: pie.left,
          fontSize: pie.size, lineHeight: 1,
          opacity: pie.opacity, userSelect: 'none', pointerEvents: 'none',
          animation: `float-pie-${pie.id} ${pie.duration}s ease-in-out infinite ${pie.delay}s`,
          display: 'inline-block',
        }}>
          🥧
        </div>
      ))}

      <Outlet />

      <style>{`
        @keyframes pulse-blob {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        ${FLOAT_PIES.map(pie => `
          @keyframes float-pie-${pie.id} {
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

export default AuthLayout;
