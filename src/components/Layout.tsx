import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { C } from '../theme';

const Layout: React.FC = () => (
  <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', backgroundColor: C.bg, color: C.text }}>
    <div style={{
      width: '240px', backgroundColor: C.sidebar,
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, height: '100vh', flexShrink: 0,
      borderRight: `1px solid ${C.border}`,
    }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div style={{
          padding: '22px 20px',
          fontSize: '1.05em', fontWeight: 700, letterSpacing: '0.6px',
          borderBottom: `1px solid ${C.border}`,
          textAlign: 'center', color: C.text,
          transition: 'color 0.15s',
        }}>
          OSS ASSET MANAGER
        </div>
      </Link>
      <nav style={{ flex: 1, padding: '14px 10px' }}>
        <NavLink to="/assets" style={navStyle}>📋 Ewidencja sprzętu</NavLink>
        <NavLink to="/stats"  style={navStyle}>📊 Statystyki stref</NavLink>
      </nav>
      <div style={{ padding: '18px', fontSize: '0.75em', color: C.textMuted, textAlign: 'center' }}>
        v1.0-inżynierska
      </div>
    </div>
    <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
      <Outlet />
    </div>
  </div>
);

const navStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
  display: 'block',
  padding: '10px 14px',
  borderRadius: '8px',
  color: isActive ? '#fff' : C.textSub,
  textDecoration: 'none',
  marginBottom: '4px',
  backgroundColor: isActive ? C.accent : 'transparent',
  fontSize: '0.88em',
  fontWeight: isActive ? 600 : 400,
  transition: 'all 0.15s',
});

export default Layout;
