'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth }       from '../hooks/useAuth';
import { useEvents }     from '../hooks/useEvents';
import { useToast }      from '../hooks/useToast';
import Navbar            from './layout/Navbar';
import LoginModal        from './modals/LoginModal';
import Toast             from './ui/Toast';
import HeroCarousel      from './ui/HeroCarousel';
import EventCalendar     from './ui/EventCalendar';
import StudentDash       from './dashboard/StudentDash';
import AdminDash         from './dashboard/AdminDash';
import ManagerDash       from './dashboard/ManagerDash';
import SuperDash         from './dashboard/SuperDash';

type Page = 'landing' | 'calendar' | 'student' | 'manager' | 'admin' | 'super' | 'event-detail';

export default function CustomerApp() {
  const { user, error, login, logout, clearError } = useAuth();
  const { events, allEvents, loading, filter, setFilter, reload } = useEvents();
  const { toasts, removeToast, toast } = useToast();

  const [page,      setPage]      = useState<Page>('landing');
  const [loginOpen, setLoginOpen] = useState(false);
  const [selEvent,  setSelEvent]  = useState<typeof events[0]|null>(null);

  // Khi login thành công → tự chuyển trang
  useEffect(() => {
    if (user) {
      if (user.role === 'super')    setPage('super');
      else if (user.role === 'admin')   setPage('admin');
      else if (user.role === 'manager') setPage('manager');
      else setPage('student');
    }
  }, [user]);

  const goHome     = useCallback(() => { setPage('landing'); setSelEvent(null); }, []);
  const goCalendar = useCallback(() => setPage('calendar'), []);
  const goToDash   = useCallback(() => {
    if (!user) { setLoginOpen(true); return; }
    if (user.role === 'super')    setPage('super');
    else if (user.role === 'admin')   setPage('admin');
    else if (user.role === 'manager') setPage('manager');
    else setPage('student');
  }, [user]);
  const goSection  = useCallback((id: string) => {
    setPage('landing');
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' }), 80);
  }, []);
  const handleLogout = useCallback(() => {
    logout(); setPage('landing');
    toast.info('Đã đăng xuất. Hẹn gặp lại!');
  }, [logout, toast]);

  const handleLogin = useCallback(async (emailOrUser: string, password: string) => {
    const ok = await login(emailOrUser, password);
    if (ok) { setLoginOpen(false); toast.success('Đăng nhập thành công!'); }
    return ok;
  }, [login, toast]);

  const toastFn = useCallback(
    (msg: string, t?: 'success'|'error'|'info') => t ? toast[t](msg) : toast.info(msg), [toast]
  );

  const navProps = {
    user, onLogin: () => setLoginOpen(true), onLogout: handleLogout,
    onGoHome: goHome, onGoDash: goToDash,
    onGoSection: goSection, onGoCalendar: goCalendar, currentPage: page,
  };
  const dashProps = { onHome: goHome, onLogout: handleLogout, onToast: toastFn };

  // ── Dashboard pages ──────────────────────────────────────
  if (user && page !== 'landing' && page !== 'calendar') {
    return (
      <>
        <Navbar {...navProps} />
        {page === 'student' && <StudentDash user={user} {...dashProps} />}
        {page === 'manager' && <ManagerDash user={user} {...dashProps} />}
        {page === 'admin'   && <AdminDash   user={user} {...dashProps} />}
        {page === 'super'   && <SuperDash   user={user} {...dashProps} />}
        <LoginModal isOpen={loginOpen} onClose={() => { setLoginOpen(false); clearError(); }} onLogin={handleLogin} error={error} />
        <Toast toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  // ── Event Detail page ────────────────────────────────────
  if (page === 'event-detail' && selEvent) {
    const ev = selEvent;
    const STATUS_LABEL_D = { open:'Đang mở đăng ký', soon:'Sắp diễn ra', ended:'Đã kết thúc' };
    const STATUS_BG_D    = { open:'#DCFCE7', soon:'#FEF3C7', ended:'#F1F5F9' };
    const STATUS_CLR_D   = { open:'#166534', soon:'#92400E', ended:'#475569' };
    return (
      <>
        <Navbar {...navProps} />
        <div style={{ paddingTop:100, minHeight:'100vh', background:'#f9fafb' }}>
          {/* Back button */}
          <div style={{ maxWidth:900, margin:'0 auto', padding:'20px 24px 0' }}>
            <button onClick={goHome} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'#6B7280', fontSize:14, fontWeight:600, fontFamily:'inherit' }}>
              ← Quay lại danh sách
            </button>
          </div>
          {/* Hero image */}
          <div style={{ maxWidth:900, margin:'16px auto 0', padding:'0 24px' }}>
            <div style={{ borderRadius:20, overflow:'hidden', height:320, background:`linear-gradient(135deg,${ev.bg},#000)`, position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {ev.imageUrl
                ? <img src={ev.imageUrl} alt={ev.title} style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0 }} onError={e=>{(e.target as HTMLImageElement).style.display='none';}} />
                : <span style={{ fontSize:96, filter:'drop-shadow(0 4px 12px rgba(0,0,0,.5))' }}>{ev.em}</span>
              }
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 50%)' }} />
              <div style={{ position:'absolute', top:20, left:20, background:STATUS_BG_D[ev.status], color:STATUS_CLR_D[ev.status], fontSize:12, fontWeight:700, padding:'5px 14px', borderRadius:100 }}>
                {STATUS_LABEL_D[ev.status]}
              </div>
              <div style={{ position:'absolute', bottom:24, left:24, right:24 }}>
                <h1 style={{ fontSize:'clamp(20px,3vw,32px)', fontWeight:900, color:'white', textShadow:'0 2px 8px rgba(0,0,0,.5)', lineHeight:1.2 }}>{ev.title}</h1>
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ maxWidth:900, margin:'24px auto', padding:'0 24px', display:'grid', gridTemplateColumns:'minmax(0,1fr) 280px', gap:24 }}>
            {/* Left: Info */}
            <div style={{ background:'white', borderRadius:16, padding:28, border:'1px solid #E5E7EB', boxShadow:'0 2px 12px rgba(0,0,0,.06)' }}>
              <h2 style={{ fontSize:18, fontWeight:800, marginBottom:16, color:'#111' }}>📋 Thông tin sự kiện</h2>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[
                  { icon:'📅', label:'Ngày tổ chức', val:`${ev.date}` },
                  { icon:'🕐', label:'Thời gian', val:ev.time },
                  { icon:'📍', label:'Địa điểm', val:ev.loc },
                  { icon:'⭐', label:'Điểm rèn luyện', val:`+${ev.pts} điểm` },
                ].map(item => (
                  <div key={item.label} style={{ display:'flex', gap:14, alignItems:'flex-start', paddingBottom:14, borderBottom:'1px solid #F3F4F6' }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:'#FFF5F5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize:11, color:'#9CA3AF', fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em' }}>{item.label}</div>
                      <div style={{ fontSize:15, fontWeight:700, color:'#111', marginTop:2 }}>{item.val}</div>
                    </div>
                  </div>
                ))}
              </div>
              {ev.description && (
                <div style={{ marginTop:20 }}>
                  <h3 style={{ fontSize:15, fontWeight:800, marginBottom:10, color:'#111' }}>📝 Mô tả sự kiện</h3>
                  <p style={{ fontSize:14, color:'#4B5563', lineHeight:1.8 }}>{ev.description}</p>
                </div>
              )}
            </div>

            {/* Right: Action card */}
            <div>
              <div style={{ background:'white', borderRadius:16, padding:24, border:'1px solid #E5E7EB', boxShadow:'0 2px 12px rgba(0,0,0,.06)', position:'sticky', top:90 }}>
                <div style={{ fontSize:28, fontWeight:900, color:'#C8102E', marginBottom:4 }}>+{ev.pts} điểm</div>
                <div style={{ fontSize:12, color:'#6B7280', marginBottom:20 }}>Điểm rèn luyện khi tham gia</div>

                {ev.status === 'open' && (
                  <button
                    onClick={() => {
                      if (!user) { setLoginOpen(true); return; }
                      import('../lib/apiClient').then(({ api }) => {
                        api.post(`/registrations/events/${ev.id}/register`, {})
                          .then(() => { toastFn(`✅ Đã đăng ký: ${ev.title}`, 'success'); reload(); })
                          .catch((e: any) => toastFn(e instanceof Error ? e.message : 'Lỗi đăng ký', 'error'));
                      });
                    }}
                    style={{ width:'100%', padding:'14px', background:'#C8102E', color:'white', border:'none', borderRadius:12, fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:'inherit', marginBottom:10 }}>
                    🎯 Đăng ký ngay
                  </button>
                )}
                {ev.status === 'soon' && (
                  <button style={{ width:'100%', padding:'14px', background:'#FEF3C7', color:'#92400E', border:'2px solid #FDE68A', borderRadius:12, fontSize:15, fontWeight:800, cursor:'not-allowed', fontFamily:'inherit', marginBottom:10 }}>
                    ⏳ Sắp mở đăng ký
                  </button>
                )}
                {ev.status === 'ended' && (
                  <button style={{ width:'100%', padding:'14px', background:'#F1F5F9', color:'#64748B', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:'not-allowed', fontFamily:'inherit', marginBottom:10 }}>
                    ✓ Sự kiện đã kết thúc
                  </button>
                )}

                {!user && ev.status === 'open' && (
                  <p style={{ fontSize:12, color:'#9CA3AF', textAlign:'center', marginTop:8 }}>
                    Bạn cần <button onClick={() => setLoginOpen(true)} style={{ background:'none', border:'none', color:'#C8102E', fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:12 }}>đăng nhập</button> để đăng ký
                  </p>
                )}

                <div style={{ marginTop:20, padding:'14px', background:'#F9FAFB', borderRadius:10 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'#374151', marginBottom:8 }}>📌 Lưu ý</div>
                  <ul style={{ fontSize:12, color:'#6B7280', lineHeight:1.8, paddingLeft:16 }}>
                    <li>Mang theo CMND/CCCD khi tham dự</li>
                    <li>Check-in đúng giờ để được tính điểm</li>
                    <li>Xuất trình mã QR tại cổng vào</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <LoginModal isOpen={loginOpen} onClose={() => { setLoginOpen(false); clearError(); }} onLogin={handleLogin} error={error} />
        <Toast toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  // ── Calendar page ────────────────────────────────────────
  if (page === 'calendar') {
    return (
      <>
        <Navbar {...navProps} />
        <div style={{ minHeight:'100vh', background:'#fff' }}><EventCalendar /></div>
        <LoginModal isOpen={loginOpen} onClose={() => { setLoginOpen(false); clearError(); }} onLogin={handleLogin} error={error} />
        <Toast toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  // ── Landing page ─────────────────────────────────────────
  const STATUS_LABEL = { open:'Đang mở', soon:'Sắp diễn ra', ended:'Đã kết thúc' };
  const STATUS_BG    = { open:'#DCFCE7', soon:'#FEF3C7', ended:'#F1F5F9' };
  const STATUS_CLR   = { open:'#166534', soon:'#92400E', ended:'#475569' };

  return (
    <>
      <Navbar {...navProps} />

      {/* HERO CAROUSEL */}
      <HeroCarousel onLogin={() => setLoginOpen(true)} user={user} />

      {/* EVENT GRID */}
      <section id="events" style={{ padding:'60px 2rem', background:'#fff' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:36 }}>
            <h2 style={{ fontSize:'clamp(22px,3vw,34px)', fontWeight:900, color:'#0D0D0D', letterSpacing:'-0.02em' }}>
              Sự Kiện <span style={{ color:'#C8102E' }}>Nổi Bật</span>
            </h2>
            <div style={{ width:32, height:3, background:'#C8102E', margin:'10px auto 14px', borderRadius:2 }} />
            <p style={{ color:'#888', fontSize:14 }}>Đăng ký ngay để tích lũy điểm rèn luyện</p>
          </div>

          {/* Filter */}
          <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:28, flexWrap:'wrap' }}>
            {([['all','Tất cả'],['open','Đang mở'],['soon','Sắp diễn ra'],['ended','Đã kết thúc']] as const).map(([v,l]) => (
              <button key={v} onClick={() => setFilter(v)} style={{
                padding:'8px 20px', borderRadius:100,
                border: filter===v ? 'none' : '1.5px solid #E5E7EB',
                background: filter===v ? '#C8102E' : 'white',
                color: filter===v ? 'white' : '#333',
                fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
              }}>{l}</button>
            ))}
          </div>

          {loading && <div style={{ textAlign:'center', padding:40, color:'#6B7280' }}>⏳ Đang tải sự kiện...</div>}

          {!loading && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
              {events.map((ev, i) => {
                const sLabel = STATUS_LABEL[ev.status];
                const sBg    = STATUS_BG[ev.status];
                const sClr   = STATUS_CLR[ev.status];
                const btnLbl = ev.status==='open'?'Đăng ký':ev.status==='ended'?'Đã kết thúc':'Theo dõi';
                return (
                  <div key={ev.id} style={{ background:'white', borderRadius:16, overflow:'hidden', border:'1px solid #ebebeb', transition:'transform .25s, box-shadow .25s, border-color .25s', cursor:'pointer' }}
                    onClick={() => { setSelEvent(ev); setPage('event-detail'); }}
                    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 16px 40px rgba(0,0,0,.1)';}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
                    {/* Image area */}
                    <div style={{ height:160, background:`linear-gradient(135deg,${ev.bg},#000)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:48, position:'relative', overflow:'hidden' }}>
                      {ev.imageUrl
                        ? <img src={ev.imageUrl} alt={ev.title} style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0 }} onError={e=>{(e.target as HTMLImageElement).style.display='none';}} />
                        : <span style={{ position:'relative', zIndex:1 }}>{ev.em}</span>
                      }
                      <div style={{ position:'absolute', top:10, left:10, background:sBg, color:sClr, fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:100, zIndex:2 }}>{sLabel}</div>
                    </div>
                    <div style={{ padding:'16px 18px' }}>
                      <div style={{ display:'flex', gap:12, marginBottom:8 }}>
                        <span style={{ fontSize:12, color:'#888' }}>📅 {ev.date}</span>
                        <span style={{ fontSize:12, color:'#888' }}>🕐 {ev.time}</span>
                      </div>
                      <div style={{ fontWeight:700, fontSize:14, color:'#111', marginBottom:6, lineHeight:1.4 }}>{ev.title}</div>
                      <div style={{ fontSize:12, color:'#888', marginBottom:14 }}>📍 {ev.loc}</div>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid #f0f0f0', paddingTop:12 }}>
                        <span style={{ fontSize:12, color:'#C8102E', fontWeight:700 }}>⭐ +{ev.pts} điểm</span>
                        <button
                          disabled={ev.status==='ended'}
                          onClick={(e) => { e.stopPropagation();
                            if (!user) { setLoginOpen(true); return; }
                            if (ev.status === 'open') {
                              // Đăng ký trực tiếp
                              import('../lib/apiClient').then(({ api }) => {
                                api.post(`/registrations/events/${ev.id}/register`, {})
                                  .then(() => { toast.success(`✅ Đã đăng ký: ${ev.title}`); reload(); })
                                  .catch((e: any) => toast.error(e instanceof Error ? e.message : 'Lỗi đăng ký'));
                              });
                            } else {
                              toast.info(`Sự kiện "${ev.title}" sắp mở đăng ký`);
                            }
                          }}
                          style={{ padding:'7px 16px', background:ev.status==='ended'?'#CBD5E1':'#C8102E', color:'white', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:ev.status==='ended'?'not-allowed':'pointer', fontFamily:'inherit' }}>
                          {btnLbl}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {events.length === 0 && !loading && (
                <div style={{ gridColumn:'1/-1', textAlign:'center', padding:48, color:'#6B7280' }}>
                  {allEvents.length === 0 ? '📭 Chưa có sự kiện nào. Admin hãy tạo sự kiện đầu tiên!' : 'Không có sự kiện theo bộ lọc này'}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:'#1a1a1a', color:'rgba(255,255,255,.6)', padding:'48px 2rem 28px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:32, marginBottom:36 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
              <div style={{ width:36, height:36, background:'#C8102E', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <div style={{ fontWeight:800, fontSize:15, color:'white' }}>Văn Lang University</div>
            </div>
            <p style={{ fontSize:13, lineHeight:1.7, maxWidth:260 }}>Hệ thống quản lý ngày rèn luyện sinh viên – minh bạch, hiện đại, dễ sử dụng.</p>
          </div>
          {[
            { title:'Hệ thống', links:['Trang chủ','Sự kiện','Lịch sự kiện','Sự kiện của tôi'] },
            { title:'Liên hệ',  links:['028 7109 9218 (3310)','028 7109 9218 (3311)','ctsv@vanlanguni.edu.vn'] },
            { title:'Địa chỉ',  links:['CS3: 69/68 Đặng Thùy Trâm','CS1: 45 Nguyễn Khắc Nhu','CS2: 233A Phan Văn Trị'] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize:12, fontWeight:700, color:'white', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:14 }}>{col.title}</div>
              <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:8 }}>
                {col.links.map(l => <li key={l}><a href="#" style={{ color:'rgba(255,255,255,.5)', fontSize:13, textDecoration:'none' }}>{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', justifyContent:'space-between', paddingTop:20, borderTop:'1px solid rgba(255,255,255,.08)', fontSize:12 }}>
          <span>© 2026 Văn Lang University – Hệ thống Quản lý Ngày Rèn Luyện</span>
          <span>Trung tâm Hỗ trợ Sinh viên</span>
        </div>
      </footer>

      <LoginModal isOpen={loginOpen} onClose={() => { setLoginOpen(false); clearError(); }} onLogin={handleLogin} error={error} />
      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
