'use client';
import React, { useState } from 'react';
import { AuthUser } from '../../hooks/useAuth';

const ROLE_COLOR: Record<string, string> = {
  student: '#C8102E', manager: '#E8A020', admin: '#2563EB', super: '#7C3AED',
};
const ROLE_LABEL: Record<string, string> = {
  student: 'Sinh viên', manager: 'Ban tổ chức', admin: 'Admin', super: 'Super Admin',
};

interface Props {
  user:         AuthUser | null;
  onLogin:      () => void;
  onLogout:     () => void;
  onGoHome:     () => void;
  onGoDash:     () => void;
  onGoSection:  (id: string) => void;
  onGoCalendar: () => void;
  currentPage:  string;
}

export default function Navbar({ user, onLogin, onLogout, onGoHome, onGoDash, onGoSection, onGoCalendar, currentPage }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const init  = user ? (user.name.split(' ').pop() ?? user.name)[0]?.toUpperCase() : '';
  const color = user ? ROLE_COLOR[user.role] : '#C8102E';

  const link = (label: string, active: boolean, onClick: () => void) => (
    <a onClick={() => { onClick(); setMenuOpen(false); }} style={{
      fontSize: 14, fontWeight: 600,
      color: active ? '#C8102E' : '#111',
      cursor: 'pointer', textDecoration: 'none',
      paddingBottom: 3,
      borderBottom: active ? '2px solid #C8102E' : '2px solid transparent',
      transition: 'color .2s, border-color .2s',
      whiteSpace: 'nowrap' as const,
    }}
    onMouseEnter={e => { if (!active) (e.target as HTMLElement).style.color = '#C8102E'; }}
    onMouseLeave={e => { if (!active) (e.target as HTMLElement).style.color = '#111'; }}>
      {label}
    </a>
  );

  return (
    <>
      {/* ── TOP BAR ── */}
      <div style={{
        background: '#C8102E', color: 'rgba(255,255,255,.9)',
        padding: '7px 2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 12,
      }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <span>📞 028 7109 9218 (Ext: 3310/3311)</span>
          <span style={{ opacity: .7 }}>|</span>
          <span>✉️ ctsv@vanlanguni.edu.vn</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {user ? (
            <>
              <span style={{ fontWeight: 600 }}>Xin chào, {user.name}</span>
              <span style={{ opacity: .5 }}>|</span>
              <button onClick={onLogout} style={{
                background: 'rgba(255,255,255,.2)', color: 'white',
                border: '1px solid rgba(255,255,255,.4)',
                padding: '3px 12px', borderRadius: 5,
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>Đăng xuất</button>
            </>
          ) : (
            <button onClick={onLogin} style={{
              background: 'white', color: '#C8102E',
              border: 'none', padding: '4px 14px', borderRadius: 5,
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>Đăng nhập</button>
          )}
        </div>
      </div>

      {/* ── MAIN NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'white', borderBottom: '1px solid #E5E7EB',
        boxShadow: '0 2px 12px rgba(0,0,0,.07)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '0 2rem', height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <div onClick={onGoHome} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }}>
            <div style={{
              width: 38, height: 38, background: '#C8102E', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 15, color: '#C8102E', letterSpacing: '.06em', lineHeight: 1 }}>VANLANG</div>
              <div style={{ fontWeight: 400, fontSize: 9, color: '#9CA3AF', letterSpacing: '.15em', textTransform: 'uppercase' }}>UNIVERSITY</div>
            </div>
          </div>

          {/* Nav links - desktop */}
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}
            className="nav-desktop-links">
            {link('Trang chủ',          currentPage === 'landing',  onGoHome)}
            {link('Hội nghị – Sự kiện', false,                     () => onGoSection('events'))}
            {link('Lịch sự kiện',        currentPage === 'calendar', onGoCalendar)}
            {link('Sự kiện của tôi',    false,                     onGoDash)}
            {link('Thông tin cá nhân',  false,                     onGoDash)}
          </div>

          {/* Right: user chip or login */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {user ? (
              <div onClick={onGoDash} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#F9FAFB', padding: '6px 14px 6px 7px',
                borderRadius: 100, border: '1px solid #E5E7EB',
                cursor: 'pointer', transition: 'background .2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F3F4F6')}
              onMouseLeave={e => (e.currentTarget.style.background = '#F9FAFB')}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', background: color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 900, color: 'white', flexShrink: 0,
                }}>{init}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111', lineHeight: 1.2 }}>{user.name}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color, lineHeight: 1 }}>{ROLE_LABEL[user.role]}</div>
                </div>
              </div>
            ) : (
              <button onClick={onLogin} style={{
                background: '#C8102E', color: 'white',
                border: 'none', padding: '8px 20px', borderRadius: 8,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(200,16,46,.3)',
              }}>Đăng nhập</button>
            )}

            {/* Hamburger - mobile */}
            <button onClick={() => setMenuOpen(!menuOpen)} style={{
              display: 'none', background: 'none', border: 'none',
              cursor: 'pointer', padding: 4, fontSize: 22,
            }} className="nav-hamburger">☰</button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{
            borderTop: '1px solid #E5E7EB', background: 'white',
            padding: '12px 2rem 16px',
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            {link('Trang chủ',          currentPage === 'landing',  onGoHome)}
            {link('Hội nghị – Sự kiện', false,                     () => onGoSection('events'))}
            {link('Lịch sự kiện',        currentPage === 'calendar', onGoCalendar)}
            {link('Sự kiện của tôi',    false,                     onGoDash)}
            {link('Thông tin cá nhân',  false,                     onGoDash)}
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop-links { display: none !important; }
          .nav-hamburger { display: block !important; }
        }
      `}</style>
    </>
  );
}
