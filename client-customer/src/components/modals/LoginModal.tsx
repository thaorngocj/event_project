'use client';
import React, { useState, useEffect } from 'react';


interface Props {
  isOpen:  boolean;
  onClose: () => void;
  onLogin: (emailOrUser: string, password: string) => Promise<boolean>;
  error:   string | null;
}

export default function LoginModal({ isOpen, onClose, onLogin, error }: Props) {
  const [id,      setId]      = useState('');
  const [pw,      setPw]      = useState('');
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) { setId(''); setPw(''); setLoading(false); }
  }, [isOpen]);

  if (!isOpen) return null;

  const canSubmit = id.trim().length > 0 && pw.trim().length > 0;

  const handleLogin = async () => {
    if (!canSubmit) return;
    setLoading(true);
    const ok = await onLogin(id, pw);
    setLoading(false);
    if (ok) onClose();
  };

  const fieldStyle = (active: boolean): React.CSSProperties => ({
    display:'flex', alignItems:'center',
    border: `1.5px solid ${active ? '#27AE60' : '#E2E8F0'}`,
    borderRadius:12, background:'#FAFAFA', transition:'border-color .2s',
  });

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000,
      background:'rgba(0,0,0,.5)',
      display:'flex', alignItems:'center', justifyContent:'center',
      backdropFilter:'blur(4px)',
    }} onClick={e => { if (e.target===e.currentTarget) onClose(); }}>

      <div style={{
        background:'white', borderRadius:18, width:420,
        maxWidth:'calc(100vw - 32px)',
        boxShadow:'0 24px 60px rgba(0,0,0,.3)',
        overflow:'hidden', animation:'mIn .25s ease',
      }}>
        {/* Header */}
        <div style={{
          background:'linear-gradient(135deg,#27AE60,#1E8449)',
          padding:'26px 28px 22px', position:'relative',
          display:'flex', alignItems:'flex-start', justifyContent:'space-between',
        }}>
          <h2 style={{ color:'white', fontWeight:900, fontSize:28, margin:0 }}>Đăng nhập</h2>
          <div style={{
            width:60, height:60, background:'rgba(255,255,255,.18)',
            borderRadius:'50%', display:'flex', alignItems:'center',
            justifyContent:'center', fontSize:30,
          }}>🎓</div>
          <button onClick={onClose} style={{
            position:'absolute', top:12, right:12, width:28, height:28,
            borderRadius:'50%', background:'rgba(0,0,0,.25)',
            border:'none', cursor:'pointer', color:'white', fontSize:14,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding:'24px 28px 26px' }}>
          {error && (
            <div style={{
              background:'#FEE2E2', border:'1px solid #FCA5A5', borderRadius:10,
              padding:'10px 14px', fontSize:13, color:'#991B1B',
              marginBottom:16, lineHeight:1.5, whiteSpace:'pre-line',
            }}>{error}</div>
          )}

          {/* Account */}
          <div style={{ ...fieldStyle(!!id), marginBottom:12 }}>
            <input type="text" placeholder="Email hoặc tên đăng nhập (sv01, admin...)"
              value={id} onChange={e=>setId(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handleLogin()}
              autoFocus autoComplete="username"
              style={{ flex:1, padding:'13px 16px', border:'none', outline:'none',
                fontSize:14, background:'transparent', fontFamily:'inherit', color:'#0D0D0D' }} />
            <span style={{ padding:'0 14px', color:'#94A3B8', fontSize:16 }}>ⓘ</span>
          </div>

          {/* Password */}
          <div style={{ ...fieldStyle(!!pw), marginBottom:20 }}>
            <input type={showPw?'text':'password'} placeholder="Nhập mật khẩu"
              value={pw} onChange={e=>setPw(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handleLogin()}
              autoComplete="current-password"
              style={{ flex:1, padding:'13px 16px', border:'none', outline:'none',
                fontSize:14, background:'transparent', fontFamily:'inherit', color:'#0D0D0D' }} />
            <button onClick={()=>setShowPw(v=>!v)} style={{
              padding:'0 14px', border:'none', background:'transparent',
              cursor:'pointer', fontSize:18, color:'#94A3B8',
            }}>{showPw?'👁':'🙈'}</button>
          </div>

          {/* Submit */}
          <button onClick={handleLogin} disabled={loading||!canSubmit} style={{
            width:'100%', padding:'13px',
            background: canSubmit ? 'linear-gradient(135deg,#27AE60,#1E8449)' : '#CBD5E1',
            color:'white', border:'none', borderRadius:12,
            fontSize:15, fontWeight:700,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            fontFamily:'inherit', transition:'all .2s',
            boxShadow: canSubmit ? '0 4px 14px rgba(39,174,96,.35)' : 'none',
          }}>{loading ? 'Đang đăng nhập...' : 'Tiếp tục'}</button>

          {/* VLU Secure badge */}
          <div style={{
            marginTop:14, padding:'10px 14px',
            background:'#F0FDF4', border:'1px solid #BBF7D0',
            borderRadius:10, display:'flex', alignItems:'center', justifyContent:'space-between',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:24, height:24, borderRadius:'50%', background:'#27AE60',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'white', fontSize:13, fontWeight:700 }}>✓</div>
              <span style={{ fontSize:13, fontWeight:600, color:'#166534' }}>Thành công!</span>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:11, fontWeight:800, color:'#F6821F', letterSpacing:'.05em' }}>VLU SECURE</div>
              <div style={{ fontSize:10, color:'#94A3B8' }}>Quyền riêng tư · Giúp đỡ</div>
            </div>
          </div>

          {/* Links */}
          <div style={{ textAlign:'center', marginTop:16, lineHeight:2.2 }}>
            <a href="#" style={{ fontSize:13, color:'#64748B', textDecoration:'none', display:'block' }}>Quên mật khẩu?</a>
            <div style={{ fontSize:13, color:'#64748B' }}>
              Chưa có tài khoản?{' '}
              <a href="#" style={{ color:'#27AE60', fontWeight:700, textDecoration:'none' }}>Liên hệ phòng CTSV</a>
            </div>
          </div>

          <div style={{ textAlign:'center', margin:'14px 0', fontSize:13, color:'#94A3B8' }}>Hoặc</div>

          {/* Login by Student ID (thay Google) */}
          <button
            onClick={() => { if (!id) setId('sv'); }}
            style={{
              width:'100%', padding:'12px',
              background:'#1A56DB', color:'white',
              border:'none', borderRadius:12,
              fontSize:14, fontWeight:700, cursor:'pointer',
              fontFamily:'inherit',
              display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              transition:'background .2s',
            }}
            onMouseEnter={e=>(e.currentTarget.style.background='#1647C0')}
            onMouseLeave={e=>(e.currentTarget.style.background='#1A56DB')}
          >
            <span style={{
              width:24, height:24, background:'white', borderRadius:6,
              display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:14,
            }}>🎓</span>
            Đăng nhập bằng Mã Sinh Viên
          </button>

          {/* Demo hint */}
          <div style={{
            marginTop:14, padding:'9px 12px',
            background:'#FEF3C7', borderRadius:8,
            fontSize:11, color:'#92400E', lineHeight:1.6,
          }}>
            💡 <b>Tài khoản:</b> sv01@school.edu · admin@school.edu · superadmin1@school.edu<br/>Mật khẩu: <b>123456</b> / <b>admin123</b> / <b>super123</b>
          </div>

          <p style={{ fontSize:11, color:'#94A3B8', textAlign:'center', marginTop:12, lineHeight:1.6 }}>
            Bằng việc tiếp tục, bạn đã đọc và đồng ý với{' '}
            <a href="#" style={{ color:'#27AE60' }}>Điều khoản sử dụng</a> và{' '}
            <a href="#" style={{ color:'#27AE60' }}>Chính sách bảo mật</a> của Văn Lang University
          </p>
        </div>
      </div>
    </div>
  );
}
