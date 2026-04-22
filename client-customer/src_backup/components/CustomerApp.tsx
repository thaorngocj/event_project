'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { api, tokenStorage } from '../lib/apiClient';
import { backendRoleToFrontend, backendEventToFrontend } from '../lib/mappers';
import { BackendEvent, Event, UserRole, Registration } from '../types';
import { EVENTS as STATIC_EVENTS, ROLE_LABEL, ROLE_COLOR } from '../lib/constants';

// ─── Types ───────────────────────────────────────────────────
interface AuthUser { id: number; email: string; username: string; role: string; }
interface ToastState { msg: string; type: 'success'|'error'|'info'; id: number; }

// ─── Toast ────────────────────────────────────────────────────
function Toast({ toasts }: { toasts: ToastState[] }) {
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:8 }}>
      {toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}
    </div>
  );
}

// ─── LOGIN MODAL ──────────────────────────────────────────────
function LoginModal({ onClose, onLogin, error }: { onClose: () => void; onLogin: (email: string, pass: string) => Promise<void>; error: string }) {
  const [email, setEmail] = useState('');
  const [pass, setPass]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const handle = async () => {
    setLoading(true);
    await onLogin(email, pass);
    setLoading(false);
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:'white', borderRadius:20, width:400, maxWidth:'calc(100vw - 32px)', overflow:'hidden', boxShadow:'0 24px 60px rgba(0,0,0,.25)' }}>
        <div style={{ background:'linear-gradient(135deg,#27AE60,#1E8449)', padding:'28px 28px 22px', position:'relative' }}>
          <div style={{ fontSize:28, marginBottom:10 }}>🎓</div>
          <h2 style={{ color:'white', fontWeight:800, fontSize:22, margin:0 }}>Đăng nhập VLU Rèn Luyện</h2>
          <p style={{ color:'rgba(255,255,255,.65)', fontSize:13, marginTop:4 }}>Sinh viên · Ban tổ chức · Admin</p>
          <button onClick={onClose} style={{ position:'absolute', top:12, right:12, width:28, height:28, borderRadius:'50%', background:'rgba(0,0,0,.2)', border:'none', cursor:'pointer', color:'white', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        <div style={{ padding:'22px 28px 28px' }}>
          {error && <div style={{ background:'#FEE2E2', border:'1px solid #FCA5A5', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#991B1B', marginBottom:14 }}>{error}</div>}
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:5 }}>Email hoặc tên tài khoản</label>
            <input className="fin" type="text" placeholder="student@vlu.edu.vn" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key==='Enter' && handle()} autoFocus />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:5 }}>Mật khẩu</label>
            <div style={{ position:'relative' }}>
              <input className="fin" type={showPw ? 'text' : 'password'} placeholder="••••••" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key==='Enter' && handle()} />
              <button onClick={() => setShowPw(v => !v)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', border:'none', background:'transparent', cursor:'pointer', fontSize:16, color:'#94A3B8' }}>{showPw ? '👁' : '🙈'}</button>
            </div>
          </div>
          <button className="blogin" onClick={handle} disabled={loading || !email || !pass}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
          <div style={{ background:'#FEF3C7', borderRadius:8, padding:'10px 12px', fontSize:12, color:'#92400E', marginTop:14, lineHeight:1.7 }}>
            💡 <b>Tài khoản mặc định:</b><br />
            🎓 <b>sv01</b> / 123456 · ⚙️ <b>admin</b> / admin123 · 🛡️ <b>superadmin1</b> / super123
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────
function Navbar({ user, onLogin, onLogout, onDash }: { user: AuthUser | null; onLogin: () => void; onLogout: () => void; onDash: () => void }) {
  const role = user ? backendRoleToFrontend(user.role as any) : null;
  return (
    <nav>
      <a className="nav-logo" onClick={onDash} style={{ cursor:'pointer' }}>
        <div className="nav-logo-icon"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>
        <div className="nav-logo-text">VLU Rèn Luyện<span>Văn Lang University</span></div>
      </a>
      <ul className="nav-links">
        <li><a onClick={onDash}>Trang chủ</a></li>
        <li><a href="#events">Sự kiện</a></li>
        <li><a href="#how">Hướng dẫn</a></li>
      </ul>
      <div className="nav-right">
        {user ? (
          <>
            <div className="user-chip" onClick={onDash}>
              <div className="user-avatar" style={{ background: role ? ROLE_COLOR[role] : '#888' }}>{user.username[0]?.toUpperCase()}</div>
              <div>
                <div className="user-name">{user.username}</div>
                <div className="user-role-tag" style={{ background: role ? ROLE_COLOR[role]+'22' : '#eee', color: role ? ROLE_COLOR[role] : '#888' }}>{role ? ROLE_LABEL[role] : user.role}</div>
              </div>
            </div>
            <button className="btn-outline" onClick={onLogout}>Đăng xuất</button>
          </>
        ) : (
          <button className="btn-outline" onClick={onLogin}>Đăng nhập</button>
        )}
      </div>
    </nav>
  );
}

// ─── LANDING PAGE (VLU Style) ────────────────────────────────
function LandingPage({ events, onLogin, onRegister }: { events: Event[]; onLogin: () => void; onRegister: (ev: Event) => void }) {
  const [filter, setFilter] = useState<'all'|'open'|'soon'|'ended'>('all');
  const [heroIdx, setHeroIdx] = useState(0);
  const featured = events.filter(e => e.status === 'open' || e.status === 'soon').slice(0, 1);
  const heroEv = featured[0] || events[0];
  const filtered = filter === 'all' ? events : events.filter(e => e.status === filter);

  const CATEGORIES = [
    { icon: '🎓', name: 'Học thuật', count: '12 sự kiện' },
    { icon: '⚽', name: 'Thể thao', count: '8 sự kiện' },
    { icon: '🎨', name: 'Văn hoá', count: '10 sự kiện' },
    { icon: '💼', name: 'Nghề nghiệp', count: '6 sự kiện' },
  ];

  const badgeCls: Record<Event['status'], string> = { open: 'badge-open', soon: 'badge-soon', ended: 'badge-ended' };
  const badgeTxt: Record<Event['status'], string> = { open: '● Đang mở', soon: '⏰ Sắp diễn ra', ended: '✓ Đã kết thúc' };
  const GRAD: Record<Event['status'], string> = {
    open:  'linear-gradient(160deg,#0f2d1f 0%,#14532D 40%,#166534 100%)',
    soon:  'linear-gradient(160deg,#1a1200 0%,#451a03 40%,#78350f 100%)',
    ended: 'linear-gradient(160deg,#0f172a 0%,#1e293b 40%,#334155 100%)',
  };

  return (
    <>
      {/* ── TOP INFO BAR ── */}
      <div style={{ background: '#C8102E', color: 'white', fontSize: 13, fontWeight: 500, textAlign: 'center', padding: '7px 20px', marginTop: 70 }}>
        <span style={{ opacity: .85 }}>Trung tâm Hỗ trợ Sinh viên</span>
        <span style={{ margin: '0 16px', opacity: .4 }}>|</span>
        <span style={{ opacity: .85 }}>Điện thoại: 028 7109 9218 (Ext: 3310/3311)</span>
        <button onClick={onLogin} style={{ marginLeft: 20, background: 'white', color: '#C8102E', border: 'none', borderRadius: 5, padding: '3px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Đăng nhập</button>
      </div>

      {/* ── HERO BANNER ── */}
      {heroEv ? (
        <div className="hero-banner" style={{ marginTop: 0 }}>
          <div className="hero-banner-img" style={{ background: GRAD[heroEv.status] }} />
          <div className="hero-banner-overlay" />
          <div style={{ maxWidth: 1200, margin: '0 auto', height: '100%' }}>
            <div className="hero-banner-content">
              <div className="hero-banner-badge">🔥 Sự kiện nổi bật</div>
              <h1 className="hero-banner-title">{heroEv.title}</h1>
              <p className="hero-banner-sub">{heroEv.description || 'Tham gia và tích lũy điểm rèn luyện'}</p>
              <div className="hero-banner-meta">
                <span className="hero-meta-item">🕐 {heroEv.time} – {heroEv.date}</span>
                <span className="hero-meta-item">📍 {heroEv.loc}</span>
                <span className="hero-meta-item">⭐ +{heroEv.pts} điểm rèn luyện</span>
              </div>
              <div style={{ marginTop: 24 }}>
                <button className="hero-banner-btn" onClick={() => onRegister(heroEv)}>Xem chi tiết sự kiện →</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="hero-banner" style={{ marginTop: 0, background: 'linear-gradient(135deg,#C8102E,#8B0E1E)' }}>
          <div className="hero-banner-overlay" />
          <div style={{ maxWidth: 1200, margin: '0 auto', height: '100%' }}>
            <div className="hero-banner-content">
              <div className="hero-banner-badge">🎓 VLU Rèn Luyện</div>
              <h1 className="hero-banner-title">Hệ thống quản lý<br />Điểm Rèn Luyện Sinh Viên</h1>
              <p className="hero-banner-sub">Tham gia sự kiện, tích lũy điểm rèn luyện, phát triển toàn diện cùng Đại học Văn Lang.</p>
              <div style={{ marginTop: 24 }}>
                <button className="hero-banner-btn" onClick={onLogin}>Đăng nhập để bắt đầu →</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FEATURED EVENTS GRID ── */}
      {events.filter(e => e.status !== 'ended').length > 0 && (
        <div style={{ background: 'white', padding: '48px 0', borderBottom: '1px solid #E5E7EB' }}>
          <div className="main-wrap">
            <div className="section-header">
              <div className="section-label">Sự kiện nổi bật</div>
              <h2 className="section-title">Sự Kiện <em>Đang Diễn Ra</em></h2>
              <p className="section-sub">Hãy đến và tham gia với chúng tôi!</p>
            </div>

            {(() => {
              const active = events.filter(e => e.status !== 'ended');
              if (active.length === 0) return null;
              const main = active[0];
              const rest = active.slice(1, 3);
              return (
                <div className="featured-grid">
                  {/* Main featured - chiều cao cố định 420px */}
                  <div className="ev-card" style={{ cursor:'pointer' }} onClick={() => onRegister(main)}>
                    <div className="ev-card-img-placeholder" style={{ flex: 1, minHeight: 0, background: GRAD[main.status], position:'relative' }}>
                      {main.imageUrl && <img src={main.imageUrl} alt={main.title} style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0, zIndex:1 }} onError={e=>{(e.target as HTMLImageElement).style.display='none'}} />}
                      {!main.imageUrl && <div style={{ fontSize: 72, position: 'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:1 }}>{main.em}</div>}
                      <span className={`ev-card-badge ${badgeCls[main.status]}`} style={{ position: 'absolute', top: 14, left: 14, zIndex: 2 }}>{badgeTxt[main.status]}</span>
                    </div>
                    <div className="ev-card-body-lg" style={{ flexShrink: 0 }}>
                      <div className="ev-card-title ev-card-title-lg">{main.title}</div>
                      <div className="ev-card-meta">
                        <span>🕐 {main.time} – {main.date}</span>
                        <span>📍 {main.loc}</span>
                      </div>
                      <div className="ev-card-footer">
                        <span className="ev-pts">+{main.pts} điểm rèn luyện</span>
                        <button className="btn-reg" onClick={e => { e.stopPropagation(); onRegister(main); }}>Xem chi tiết sự kiện</button>
                      </div>
                    </div>
                  </div>
                  {/* Side cards - luôn đủ 2 items = 420px */}
                  <div className="featured-grid-right">
                    {(() => {
                      const PLACEHOLDER_1 = {id:-1,em:'📅',title:'Sắp có sự kiện mới',status:'soon' as const,date:'--',time:'--',loc:'--',pts:0,description:'',imageUrl:undefined,startDate:undefined,endDate:undefined,maxParticipants:undefined};
                      const PLACEHOLDER_2 = {id:-2,em:'🎯',title:'Theo dõi để cập nhật',status:'soon' as const,date:'--',time:'--',loc:'--',pts:0,description:'',imageUrl:undefined,startDate:undefined,endDate:undefined,maxParticipants:undefined};
                      // Luôn đảm bảo đúng 2 items
                      const items = [
                        rest[0] ?? PLACEHOLDER_1,
                        rest[1] ?? PLACEHOLDER_2,
                      ];
                      return items;
                    })().map((ev) => (
                      <div key={ev.id} className="ev-card" style={{ cursor: ev.id < 0 ?'default':'pointer' }} onClick={() => ev.id >= 0 && onRegister(ev as any)}>
                        <div style={{ flex: 1, minHeight: 0, background: ev.id < 0 ? 'linear-gradient(135deg,#1e293b,#334155)' : (GRAD[ev.status as import('../types').EventStatus] ?? GRAD.soon), position:'relative', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                          {(ev as any).imageUrl
                            ? <img src={(ev as any).imageUrl} alt={ev.title} style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0 }} onError={e=>{(e.target as HTMLImageElement).style.display='none'}} />
                            : <div style={{ fontSize: 40 }}>{ev.em}</div>
                          }
                          {ev.id >= 0 && <span className={`ev-card-badge ${badgeCls[ev.status as import('../types').EventStatus] ?? 'badge-soon'}`} style={{ position:'absolute', top:10, left:10 }}>{badgeTxt[ev.status as import('../types').EventStatus] ?? ''}</span>}
                        </div>
                        <div className="ev-card-body" style={{ flexShrink: 0 }}>
                          <div className="ev-card-title" style={{ fontSize: 14 }}>{ev.title}</div>
                          {ev.id >= 0 && <>
                            <div style={{ fontSize: 12, color: 'var(--mid)', marginTop: 4 }}>🕐 {ev.time} – {ev.date}</div>
                            <div style={{ fontSize: 12, color: 'var(--mid)' }}>📍 {ev.loc}</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', marginTop: 6 }}>+{ev.pts} điểm rèn luyện</div>
                          </>}
                          {ev.id < 0 && <div style={{ fontSize: 12, color: 'var(--mid)', marginTop: 4 }}>Sự kiện mới sắp ra mắt...</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── ALL EVENTS ── */}
      <div className="section" id="events" style={{ background: '#F9FAFB' }}>
        <div className="main-wrap">
          <div className="section-header">
            <div className="section-label">Danh Mục Sự Kiện</div>
            <h2 className="section-title">Hãy đến với trường đại học Văn Lang để <em>tận hưởng</em> những giây phút vui vẻ nhất!</h2>
          </div>

          <div className="cat-grid">
            {CATEGORIES.map(cat => (
              <div key={cat.name} className="cat-card">
                <div className="cat-icon">{cat.icon}</div>
                <div className="cat-name">{cat.name}</div>
                <div className="cat-count">{cat.count}</div>
              </div>
            ))}
          </div>

          <div className="section-header">
            <div className="section-label">Sự Kiện Đề Xuất</div>
            <h2 className="section-title">Các sự kiện <em>hay cần xem</em></h2>
          </div>

          <div className="filter-bar">
            {([['all','Tất cả'],['open','Đang mở'],['soon','Sắp diễn ra'],['ended','Đã kết thúc']] as const).map(([v, l]) => (
              <button key={v} className={`filter-btn${filter === v ? ' active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
            ))}
          </div>

          <div className="events-list-grid">
            {filtered.map(ev => (
              <div key={ev.id} className="ev-card" onClick={() => onRegister(ev)}>
                <div className="ev-card-img-placeholder" style={{ height: 180, background: GRAD[ev.status] }}>
                  {ev.imageUrl && <img src={ev.imageUrl} alt={ev.title} style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0, zIndex:1 }} onError={e=>{(e.target as HTMLImageElement).style.display='none'}} />}
                  {!ev.imageUrl && <div style={{ fontSize: 48, position: 'relative', zIndex: 1 }}>{ev.em}</div>}
                  <span className={`ev-card-badge ${badgeCls[ev.status]}`} style={{ position: 'absolute', top: 12, left: 12, zIndex: 2 }}>{badgeTxt[ev.status]}</span>
                </div>
                <div className="ev-card-body">
                  <div className="ev-card-title">{ev.title}</div>
                  <div className="ev-card-meta">
                    <span>🕐 {ev.time} – {ev.date}</span>
                    <span>📍 {ev.loc}</span>
                  </div>
                  <div className="ev-card-footer">
                    <span className="ev-pts">+{ev.pts} điểm rèn luyện</span>
                    {ev.status !== 'ended' && (
                      <button className="btn-reg btn-reg-sm" onClick={e => { e.stopPropagation(); onRegister(ev); }}>
                        {ev.status === 'open' ? 'Đăng ký' : 'Chi tiết'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 48, color: 'var(--mid)' }}>Không có sự kiện nào</div>
            )}
          </div>
        </div>
      </div>

      {/* ── BANNER JOIN ── */}
      <div className="main-wrap">
        <div className="banner-join">
          <div className="banner-join-text">
            <h2>Nhập Mã Sự Kiện Để Tham Gia</h2>
            <p>Đặt Câu Hỏi & Bầu Chọn tại sự kiện của bạn</p>
          </div>
          <div style={{ display: 'flex', gap: 12, zIndex: 1 }}>
            <input style={{ padding: '12px 18px', borderRadius: 8, border: 'none', fontSize: 14, fontFamily: 'inherit', width: 200 }} placeholder="Nhập mã sự kiện..." />
            <button className="banner-join-btn" onClick={onLogin}>Tham Gia</button>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-top">
          <div>
            <div className="footer-brand-name">VLU Rèn Luyện</div>
            <div className="footer-brand-desc">Hệ thống quản lý điểm rèn luyện sinh viên Đại học Văn Lang – Chính xác, Minh bạch, Hiệu quả.</div>
            <div className="footer-socials">
              {[['f','Facebook'],['in','LinkedIn'],['▶','YouTube'],['t','TikTok']].map(([icon, label]) => (
                <a key={label} href="#" className="footer-social" title={label}>{icon}</a>
              ))}
            </div>
          </div>
          <div>
            <div className="footer-col-title">Địa chỉ</div>
            <ul className="footer-links">
              <li><a href="#">🏫 Cơ sở Chính (CS3): 69/68 Đặng Thùy Trâm, P.Bình Lợi Trung, TP.HCM</a></li>
              <li><a href="#">🏫 Cơ sở Phụ: 80/68 Dương Quảng Hàm, P.An Nhơn, TP.HCM</a></li>
              <li><a href="#">🏫 Cơ sở 1: 45 Nguyễn Khắc Nhu, P.Cầu Ông Lãnh</a></li>
              <li><a href="#">🏫 Cơ sở 2: 233A Phan Văn Trị, P.Bình Lợi Trung</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Liên hệ</div>
            <ul className="footer-links">
              <li><a href="#">📞 028 7109 9218 (Ext: 3310)</a></li>
              <li><a href="#">📞 028 7109 9218 (Ext: 3311)</a></li>
              <li><a href="#">✉️ sukien@vanlangunl.edu.vn</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Theo dõi chúng tôi</div>
            <div className="footer-socials" style={{ flexDirection: 'column', gap: 10 }}>
              <a href="#" className="footer-social" style={{ width: 'auto', padding: '0 14px', justifyContent: 'flex-start', gap: 8, borderRadius: 8 }}>
                <span>f</span><span style={{ fontSize: 12 }}>Facebook VLU</span>
              </a>
              <a href="#" className="footer-social" style={{ width: 'auto', padding: '0 14px', justifyContent: 'flex-start', gap: 8, borderRadius: 8 }}>
                <span>▶</span><span style={{ fontSize: 12 }}>YouTube VLU</span>
              </a>
              <a href="#" className="footer-social" style={{ width: 'auto', padding: '0 14px', justifyContent: 'flex-start', gap: 8, borderRadius: 8 }}>
                <span>t</span><span style={{ fontSize: 12 }}>TikTok VLU</span>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Đại học Văn Lang. All rights reserved.</p>
          <p>Powered by NestJS + Next.js</p>
        </div>
      </footer>
    </>
  );
}

// ─── STUDENT DASHBOARD ────────────────────────────────────────
function StudentDash({ user, onHome, onLogout, toast }: { user: AuthUser; onHome: () => void; onLogout: () => void; toast: (m: string, t?: 'success'|'error'|'info') => void }) {
  const [events,  setEvents]  = useState<Event[]>(STATIC_EVENTS);
  const [myRegs,  setMyRegs]  = useState<Registration[]>([]);
  const [regIds,  setRegIds]  = useState<number[]>([]);
  const [regBusy, setRegBusy] = useState<number | null>(null);
  const [qrItem,  setQrItem]  = useState<{ name: string; code?: string } | null>(null);

  useEffect(() => {
    api.get<BackendEvent[]>('/events', false).then(data => {
      if (data.length) setEvents(data.map((e, i) => backendEventToFrontend(e, i)));
    }).catch(() => {});
    api.get<Registration[]>('/registrations/my-events').then(regs => {
      setMyRegs(regs); setRegIds(regs.map(r => r.eventId));
    }).catch(() => {});
  }, []);

  const doRegister = async (ev: Event) => {
    if (regIds.includes(ev.id)) { toast('Bạn đã đăng ký sự kiện này!', 'info'); return; }
    setRegBusy(ev.id);
    try {
      const reg = await api.post<Registration>(`/registrations/events/${ev.id}/register`, {});
      setRegIds(p => [...p, ev.id]); setMyRegs(p => [...p, reg]);
      toast(`✅ Đăng ký thành công: ${ev.title}`, 'success');
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Lỗi đăng ký', 'error');
    } finally { setRegBusy(null); }
  };

  const upcoming = events.filter(e => e.status === 'soon').slice(0, 4);
  const HISTORY = [
    { title:'Career Day 2026', date:'08/04', pts:5 },
    { title:'Workshop Game Industry', date:'03/03', pts:3 },
    { title:'Hiến Máu Xuân', date:'19/01', pts:4 },
  ];
  const totalPts = HISTORY.reduce((s, h) => s + h.pts, 0);

  return (
    <div className="dash">
      <div className="dash-hdr"><div className="dash-hi">
        <div><div className="dash-ttl">👋 Chào, {user.username}!</div><div className="dash-st">Sinh viên · {user.email} · Học kỳ 2 – 2025/2026</div></div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="ab" onClick={onHome}>← Trang chủ</button>
          <button className="ab dan" onClick={onLogout}>Đăng xuất</button>
        </div>
      </div></div>

      <div className="dash-body">
        {/* Profile */}
        <div className="pcard">
          <div className="pav">{user.username[0]?.toUpperCase()}</div>
          <div className="pn">{user.username}</div>
          <div className="pi">{user.email} · K27 · CS3</div>
          <div className="pst">
            <div><div className="pst-n">{totalPts}</div><div className="pst-l">Điểm RL</div></div>
            <div><div className="pst-n">{HISTORY.length}</div><div className="pst-l">Đã tham gia</div></div>
            <div><div className="pst-n">{myRegs.length}</div><div className="pst-l">Đã đăng ký</div></div>
            <div><div className="pst-n" style={{ fontSize:16, marginTop:3 }}>Tốt</div><div className="pst-l">Xếp loại</div></div>
          </div>
          <div style={{ marginTop:18, position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontSize:13, color:'rgba(255,255,255,.6)' }}>Tiến độ điểm rèn luyện</span>
              <span style={{ fontSize:13, fontWeight:700, color:'white' }}>{totalPts} / 25</span>
            </div>
            <div style={{ background:'rgba(255,255,255,.15)', borderRadius:100, height:8, overflow:'hidden' }}>
              <div style={{ background:'var(--red)', height:'100%', borderRadius:100, width:`${Math.min((totalPts/25)*100,100)}%`, transition:'width .5s' }} />
            </div>
          </div>
        </div>

        <div className="kgrid">
          <div className="kcard"><div className="klbl">Điểm rèn luyện</div><div className="kval">{totalPts}<span>/25</span></div><div className="ksub">HK2 – 2025/2026</div></div>
          <div className="kcard"><div className="klbl">Đã tham gia</div><div className="kval" style={{ color:'var(--red)' }}>{HISTORY.length}</div><div className="ksub">Sự kiện</div></div>
          <div className="kcard"><div className="klbl">Đã đăng ký</div><div className="kval" style={{ color:'#E8A020' }}>{myRegs.length}</div><div className="ksub">Chờ check-in</div></div>
          <div className="kcard"><div className="klbl">Xếp loại</div><div className="kval" style={{ fontSize:18 }}>Tốt</div><div className="ksub">Dựa trên điểm RL</div></div>
        </div>

        <div className="two">
          <div>
            <div className="dttl">📋 Lịch sử tham gia</div>
            <div className="dcard">
              <table className="dt">
                <thead><tr><th>Sự kiện</th><th>Ngày</th><th>Điểm</th><th>TT</th></tr></thead>
                <tbody>
                  {HISTORY.map((h, i) => (
                    <tr key={i}><td><b>{h.title}</b></td><td>{h.date}</td><td style={{ color:'var(--red)', fontWeight:700 }}>+{h.pts}</td><td><span className="pill pc">Check-in</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="dttl" style={{ marginTop:20 }}>⏳ Đã đăng ký – Chờ tham gia</div>
            <div className="dcard">
              <table className="dt">
                <thead><tr><th>Sự kiện</th><th>TT</th><th>QR</th></tr></thead>
                <tbody>
                  {myRegs.length === 0
                    ? <tr><td colSpan={3} style={{ textAlign:'center', color:'var(--mid)', fontSize:13 }}>Chưa có đăng ký</td></tr>
                    : myRegs.map(r => (
                      <tr key={r.id}>
                        <td><b>Sự kiện #{r.eventId}</b></td>
                        <td><span className="pill pq">{r.status === 'CHECKED_IN' ? 'Checked-in' : 'Chờ check-in'}</span></td>
                        <td><button className="ab pri" onClick={() => setQrItem({ name:`Sự kiện #${r.eventId}`, code: r.qrCode })}>QR</button></td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="dttl">🎯 Sự kiện sắp diễn ra</div>
            <div className="dcard">
              <table className="dt">
                <thead><tr><th>Sự kiện</th><th>Ngày</th><th>Điểm</th><th></th></tr></thead>
                <tbody>
                  {upcoming.map(ev => (
                    <tr key={ev.id}>
                      <td><b>{ev.em} {ev.title}</b><br /><small style={{ color:'var(--mid)' }}>{ev.loc}</small></td>
                      <td style={{ fontSize:13 }}>{ev.date.slice(0,5)}</td>
                      <td style={{ color:'var(--red)', fontWeight:700 }}>+{ev.pts}</td>
                      <td>
                        {regIds.includes(ev.id)
                          ? <span className="pill po">Đã ĐK</span>
                          : <button className="ab pri" disabled={regBusy === ev.id} onClick={() => doRegister(ev)}>{regBusy === ev.id ? '...' : 'Đăng ký'}</button>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {qrItem && (
        <div className="moverlay show" onClick={e => { if ((e.target as HTMLElement).classList.contains('moverlay')) setQrItem(null); }}>
          <div className="modal" style={{ textAlign:'center', maxWidth:320 }}>
            <button className="mclose" onClick={() => setQrItem(null)}>✕</button>
            <h3 style={{ fontSize:16, fontWeight:800, marginBottom:4 }}>{qrItem.name}</h3>
            <p style={{ fontSize:13, color:'var(--mid)', marginBottom:16 }}>Xuất trình mã này tại sự kiện</p>
            <div className="qr-box">{qrItem.code ? <img src={qrItem.code} alt="QR" style={{ width:160, height:160, borderRadius:8 }} /> : <span style={{ fontSize:64 }}>📱</span>}</div>
            <div className="qr-info"><b>{user.username}</b><br />{user.email}</div>
            <button className="ab pri" style={{ width:'100%', marginTop:14 }} onClick={() => setQrItem(null)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MANAGER DASHBOARD ────────────────────────────────────────
function ManagerDash({ user, onHome, onLogout, toast }: { user: AuthUser; onHome: () => void; onLogout: () => void; toast: (m: string, t?: 'success'|'error'|'info') => void }) {
  const [events,     setEvents]     = useState<Event[]>(STATIC_EVENTS);
  const [selEvent,   setSelEvent]   = useState<number | null>(null);
  const [scanVal,    setScanVal]    = useState('');
  const [scanResult, setScanResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [checkinBusy, setCheckinBusy] = useState(false);
  const DEMO_LIST = [
    { id:'2274802010001', name:'Nguyễn Văn An',   major:'QTKD', status:'checked' as const },
    { id:'2274802010045', name:'Lê Thị Hoa',      major:'KS',   status:'checked' as const },
    { id:'2274802010089', name:'Trần Minh Khoa',  major:'CNTT', status:'pending' as const },
    { id:'2274802010112', name:'Phạm Thùy Dung',  major:'KT',   status:'pending' as const },
  ];
  const [list, setList] = useState(DEMO_LIST);

  useEffect(() => {
    api.get<BackendEvent[]>('/events', false).then(data => {
      if (data.length) { setEvents(data.map((e, i) => backendEventToFrontend(e, i))); setSelEvent(data[0]?.id ?? null); }
    }).catch(() => {});
  }, []);

  const doCheckin = async () => {
    const v = scanVal.trim(); if (!v) return;
    setCheckinBusy(true);
    if (selEvent) {
      try {
        await api.post(`/registrations/events/${selEvent}/checkin`, { qrData: v });
        setScanResult({ ok:true, msg:`✅ Check-in thành công qua API!` });
        toast('✅ Check-in thành công!', 'success');
        setScanVal(''); setCheckinBusy(false);
        setTimeout(() => setScanResult(null), 3000); return;
      } catch (_) {}
    }
    const found = list.find(s => s.id === v);
    if (found) {
      if (found.status === 'checked') { setScanResult({ ok:false, msg:`⚠️ ${found.name} đã check-in rồi!` }); toast('Đã check-in rồi', 'error'); }
      else { setList(p => p.map(s => s.id === found.id ? { ...s, status:'checked' as const } : s)); setScanResult({ ok:true, msg:`✅ ${found.name} – Check-in thành công!` }); toast(`✅ ${found.name} check-in!`, 'success'); }
    } else {
      setScanResult({ ok:false, msg:`❌ Không tìm thấy: ${v}` }); toast(`Không tìm thấy: ${v}`, 'error');
    }
    setScanVal(''); setCheckinBusy(false);
    setTimeout(() => setScanResult(null), 3000);
  };

  const activeEvents = events.filter(e => e.status === 'open' || e.status === 'soon');

  return (
    <div className="dash">
      <div className="dash-hdr"><div className="dash-hi">
        <div><div className="dash-ttl">👥 Ban Tổ Chức</div><div className="dash-st">{user.username} · {user.email}</div></div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="ab" onClick={onHome}>← Trang chủ</button>
          <button className="ab dan" onClick={onLogout}>Đăng xuất</button>
        </div>
      </div></div>

      <div className="dash-body">
        <div className="kgrid">
          <div className="kcard"><div className="klbl">Sự kiện quản lý</div><div className="kval" style={{ color:'var(--red)' }}>{activeEvents.length}</div></div>
          <div className="kcard"><div className="klbl">Đã check-in</div><div className="kval">{list.filter(s => s.status === 'checked').length}</div></div>
          <div className="kcard"><div className="klbl">Chờ check-in</div><div className="kval" style={{ color:'#E8A020' }}>{list.filter(s => s.status === 'pending').length}</div></div>
          <div className="kcard"><div className="klbl">Tổng đăng ký</div><div className="kval">{list.length}</div></div>
        </div>

        {activeEvents.length > 0 && (
          <div className="dcard" style={{ padding:'14px 20px' }}>
            <label className="flbl">📅 Chọn sự kiện đang quản lý:</label>
            <select className="fin" value={selEvent ?? ''} onChange={e => setSelEvent(Number(e.target.value))} style={{ marginTop:6 }}>
              {activeEvents.map(ev => <option key={ev.id} value={ev.id}>{ev.em} {ev.title}</option>)}
            </select>
          </div>
        )}

        <div className="scan-zone">
          <div className="scan-ic">📷</div>
          <div className="scan-t">Điểm danh sinh viên</div>
          <div className="scan-d">Nhập mã SV hoặc dữ liệu QR để xác nhận tham gia</div>
          <div className="scan-row">
            <input className="scan-in" placeholder="Nhập mã SV hoặc nội dung QR..." value={scanVal} onChange={e => setScanVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && doCheckin()} />
            <button className="bsc" onClick={doCheckin} disabled={checkinBusy || !scanVal.trim()}>✓ Check-in</button>
          </div>
          {scanResult && <div style={{ marginTop:12, fontSize:14, fontWeight:700, color: scanResult.ok ? '#DCFCE7' : '#FCA5A5' }}>{scanResult.msg}</div>}
        </div>

        <div className="dttl">📋 Danh sách sinh viên đã đăng ký</div>
        <div className="dcard">
          <div className="dcard-h">
            <h3>{list.length} sinh viên</h3>
            <div style={{ display:'flex', gap:8 }}>
              <button className="ab pri" onClick={() => toast('Đang xuất Excel...', 'info')}>Xuất Excel</button>
              <button className="ab" onClick={() => toast('Đã gửi email xác nhận', 'success')}>Gửi email</button>
            </div>
          </div>
          <table className="dt">
            <thead><tr><th>Mã SV</th><th>Họ tên</th><th>Ngành</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {list.map(s => (
                <tr key={s.id}>
                  <td style={{ fontFamily:'monospace', fontSize:12 }}>{s.id}</td>
                  <td><b>{s.name}</b></td>
                  <td>{s.major}</td>
                  <td><span className={`pill ${s.status === 'checked' ? 'pc' : 'ps'}`}>{s.status === 'checked' ? '✓ Đã check-in' : 'Chờ check-in'}</span></td>
                  <td>
                    {s.status === 'pending'
                      ? <button className="ab pri" onClick={() => { setList(p => p.map(x => x.id === s.id ? { ...x, status:'checked' as const } : x)); toast(`✅ ${s.name} check-in!`, 'success'); }}>Check-in</button>
                      : <span style={{ fontSize:12, color:'var(--mid)' }}>✓ Hoàn thành</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────
function AdminDash({ user, onHome, onLogout, toast }: { user: AuthUser; onHome: () => void; onLogout: () => void; toast: (m: string, t?: 'success'|'error'|'info') => void }) {
  const [events,   setEvents]  = useState<Event[]>(STATIC_EVENTS);
  const [loading,  setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editEv,   setEditEv]  = useState<Event | null>(null);
  const [editId,   setEditId]  = useState<number | null>(null);
  const [form, setForm] = useState({ title:'', description:'', startDate:'', endDate:'', location:'', maxParticipants:'200', status:'UPCOMING', imageUrl:'' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<BackendEvent[]>('/events', false);
      if (data.length) setEvents(data.map((e, i) => backendEventToFrontend(e, i)));
    } catch (_) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.title || !form.startDate) { toast('Nhập đầy đủ thông tin', 'error'); return; }
    const payload = { title: form.title, description: form.description || form.title, startDate: new Date(form.startDate).toISOString(), endDate: new Date(form.endDate || form.startDate).toISOString(), location: form.location || 'TBD', maxParticipants: parseInt(form.maxParticipants) || 200, status: form.status, imageUrl: form.imageUrl || undefined };
    try {
      if (editId !== null) {
        await api.patch(`/events/${editId}`, payload);
        toast(`✅ Đã cập nhật: ${form.title}`, 'success');
        setEditId(null);
      } else {
        const created = await api.post<BackendEvent>('/events', payload);
        setEvents(p => [backendEventToFrontend(created, p.length), ...p]);
        toast(`✅ Đã tạo: ${form.title}`, 'success');
      }
      setShowForm(false); setForm({ title:'', description:'', startDate:'', endDate:'', location:'', maxParticipants:'200', status:'UPCOMING', imageUrl:'' });
      load();
    } catch (e: unknown) { toast(e instanceof Error ? e.message : 'Lỗi', 'error'); }
  };

  const handleStatusChange = async (id: number, status: 'UPCOMING'|'OPEN'|'CLOSED') => {
    const map: Record<string, Event['status']> = { UPCOMING:'soon', OPEN:'open', CLOSED:'ended' };
    try { await api.patch(`/events/${id}`, { status }); setEvents(p => p.map(e => e.id === id ? { ...e, status: map[status] } : e)); toast('Đã cập nhật', 'success'); }
    catch (_) { setEvents(p => p.map(e => e.id === id ? { ...e, status: map[status] } : e)); toast('Đã cập nhật (offline)', 'info'); }
  };

  const STATUS_PILL: Record<Event['status'], string> = { open:'po', soon:'ps', ended:'pe' };
  const STATUS_TXT: Record<Event['status'], string>  = { open:'Đang mở', soon:'Sắp diễn ra', ended:'Đã đóng' };

  return (
    <div className="dash">
      <div className="dash-hdr"><div className="dash-hi">
        <div><div className="dash-ttl">⚙️ Quản lý sự kiện</div><div className="dash-st">{user.username} · Admin · {user.email}</div></div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="ab" onClick={onHome}>← Trang chủ</button>
          <button className="ab dan" onClick={onLogout}>Đăng xuất</button>
        </div>
      </div></div>

      <div className="dash-body">
        <div className="kgrid">
          <div className="kcard"><div className="klbl">Tổng sự kiện</div><div className="kval" style={{ color:'var(--red)' }}>{events.length}</div></div>
          <div className="kcard"><div className="klbl">Đang mở</div><div className="kval">{events.filter(e => e.status === 'open').length}</div></div>
          <div className="kcard"><div className="klbl">Sắp diễn ra</div><div className="kval" style={{ color:'#E8A020' }}>{events.filter(e => e.status === 'soon').length}</div></div>
          <div className="kcard"><div className="klbl">Đã kết thúc</div><div className="kval" style={{ color:'var(--mid)' }}>{events.filter(e => e.status === 'ended').length}</div></div>
        </div>

        {showForm && (
          <div className="dcard" style={{ padding:24, marginBottom:24 }}>
            <div className="dttl">{editId !== null ? '✏️ Chỉnh sửa sự kiện' : '➕ Tạo sự kiện mới'}</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div style={{ gridColumn:'1/-1' }}><label className="flbl">Tên sự kiện *</label><input className="fin" placeholder="Career Day 2027..." value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div style={{ gridColumn:'1/-1' }}><label className="flbl">Mô tả</label><input className="fin" placeholder="Mô tả..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div><label className="flbl">Ngày bắt đầu *</label><input className="fin" type="datetime-local" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} /></div>
              <div><label className="flbl">Ngày kết thúc</label><input className="fin" type="datetime-local" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} /></div>
              <div><label className="flbl">Địa điểm</label><input className="fin" placeholder="Toà J, CS3..." value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
              <div><label className="flbl">Số lượng tối đa</label><input className="fin" type="number" value={form.maxParticipants} onChange={e => setForm(p => ({ ...p, maxParticipants: e.target.value }))} /></div>
              <div><label className="flbl">Trạng thái</label><select className="fin" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}><option value="UPCOMING">Sắp diễn ra</option><option value="OPEN">Mở đăng ký</option></select></div>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:16 }}>
              <button className="ab pri" onClick={handleCreate}>{editId !== null ? '💾 Lưu thay đổi' : '✅ Tạo sự kiện'}</button>
              <button className="ab" onClick={() => setShowForm(false)}>Hủy</button>
            </div>
          </div>
        )}

        <div className="dttl">📋 Danh sách tất cả sự kiện</div>
        <div className="dcard">
          <div className="dcard-h">
            <h3>Tất cả ({events.length}) {loading && <span style={{ fontSize:12, fontWeight:400, color:'var(--mid)', marginLeft:6 }}>Đang tải...</span>}</h3>
            <div style={{ display:'flex', gap:8 }}>
              <button className="ab pri" onClick={() => setShowForm(true)}>+ Tạo mới</button>
              <button className="ab" onClick={load}>🔄</button>
            </div>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table className="dt">
              <thead><tr><th>Sự kiện</th><th>Ngày</th><th>Địa điểm</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev.id}>
                    <td><b>{ev.em} {ev.title}</b></td>
                    <td style={{ fontSize:13 }}>{ev.date}</td>
                    <td style={{ fontSize:13, color:'var(--mid)' }}>{ev.loc}</td>
                    <td>
                      <select className="fin" value={ev.status === 'open' ? 'OPEN' : ev.status === 'ended' ? 'CLOSED' : 'UPCOMING'} style={{ width:130, padding:'5px 8px', fontSize:12 }}
                        onChange={e => handleStatusChange(ev.id, e.target.value as any)}>
                        <option value="UPCOMING">Sắp diễn ra</option>
                        <option value="OPEN">Đang mở</option>
                        <option value="CLOSED">Đã đóng</option>
                      </select>
                    </td>
                    <td style={{ display:'flex', gap:6 }}>
                      <button className="ab" style={{background:'#3B82F6',color:'white',border:'none'}} onClick={() => {
                          const toLocal = (iso: string) => { if (!iso) return ''; const d = new Date(iso); const p = (n: number) => String(n).padStart(2,'0'); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };
                          setEditId(ev.id);
                          setForm({ title:ev.title, description:ev.em||'', startDate:toLocal(ev.startDate||''), endDate:toLocal(ev.endDate||''), location:ev.loc, maxParticipants:String(ev.maxParticipants||200), status: ev.status==='open'?'OPEN':ev.status==='ended'?'CLOSED':'UPCOMING', imageUrl:ev.imageUrl||'' });
                          setShowForm(true);
                        }}>✏️ Sửa</button>
                      <button className="ab dan" onClick={() => { if (confirm(`Xóa "${ev.title}"?`)) { api.delete(`/events/${ev.id}`).then(() => { setEvents(p => p.filter(e => e.id !== ev.id)); toast('Đã xóa', 'info'); }).catch(() => { setEvents(p => p.filter(e => e.id !== ev.id)); toast('Đã xóa', 'info'); }); } }}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN CUSTOMER APP ────────────────────────────────────────
export default function CustomerApp() {
  const [user,     setUser]     = useState<AuthUser | null>(null);
  const [page,     setPage]     = useState<'landing'|'student'|'manager'|'admin'>('landing');
  const [showLogin, setShowLogin] = useState(false);
  const [loginErr, setLoginErr] = useState('');
  const [toasts,   setToasts]   = useState<ToastState[]>([]);
  const [landingEvents, setLandingEvents] = useState<Event[]>(STATIC_EVENTS);

  const toast = useCallback((msg: string, type: 'success'|'error'|'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { msg, type, id }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  useEffect(() => {
    api.get<BackendEvent[]>('/events', false).then(data => {
      if (data.length) setLandingEvents(data.map((e, i) => backendEventToFrontend(e, i)));
    }).catch(() => {});
  }, []);

  const doLogin = async (email: string, pass: string) => {
    setLoginErr('');
    const e = email.includes('@') ? email : `${email}@school.edu`;
    try {
      const data = await api.post<{ accessToken: string; refreshToken: string; role: string; email: string }>('/auth/login', { email: e, password: pass }, false);
      tokenStorage.setTokens(data.accessToken, data.refreshToken);
      const me = await api.get<AuthUser>('/users/me');
      setUser(me);
      const role = me.role;
      if (role === 'STUDENT')       setPage('student');
      else if (role === 'EVENT_MANAGER') setPage('manager');
      else if (role === 'ADMIN' || role === 'SUPER_ADMIN') setPage('admin');
      setShowLogin(false);
      toast(`✅ Xin chào, ${me.username}!`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      setLoginErr(msg.includes('401') || msg.includes('not found') || msg.includes('Invalid') ? '❌ Sai tài khoản hoặc mật khẩu!' : msg);
    }
  };

  const logout = () => { tokenStorage.clearTokens(); setUser(null); setPage('landing'); toast('Đã đăng xuất', 'info'); };

  const handleRegisterEvent = (ev: Event) => {
    if (!user) { setShowLogin(true); return; }
    if (page === 'student') toast('Mở dashboard để đăng ký sự kiện', 'info');
  };

  return (
    <>
      <Navbar user={user} onLogin={() => setShowLogin(true)} onLogout={logout} onDash={() => { if (user) { const r = user.role; setPage(r === 'STUDENT' ? 'student' : r === 'EVENT_MANAGER' ? 'manager' : 'admin'); } else setPage('landing'); }} />
      <div style={{ paddingTop: page === 'landing' ? 0 : 0 }}>
        {page === 'landing' && <LandingPage events={landingEvents} onLogin={() => setShowLogin(true)} onRegister={handleRegisterEvent} />}
        {page === 'student' && user && <StudentDash user={user} onHome={() => setPage('landing')} onLogout={logout} toast={toast} />}
        {page === 'manager' && user && <ManagerDash user={user} onHome={() => setPage('landing')} onLogout={logout} toast={toast} />}
        {page === 'admin'   && user && <AdminDash   user={user} onHome={() => setPage('landing')} onLogout={logout} toast={toast} />}
      </div>
      {showLogin && <LoginModal onClose={() => { setShowLogin(false); setLoginErr(''); }} onLogin={doLogin} error={loginErr} />}
      <Toast toasts={toasts} />
    </>
  );
}
