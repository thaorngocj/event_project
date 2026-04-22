'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { AuthUser } from '../../hooks/useAuth';
import { api } from '../../lib/apiClient';

interface Props { user: AuthUser; onHome: () => void; onLogout: () => void; onToast: (m: string, t?: 'success'|'error'|'info') => void; }
type SaPage = 'users' | 'events' | 'stats';
interface SysUser { id: number; username: string; email: string; role: string; isActive: boolean; createdAt: string; }
interface Event    { id: number; title: string; startDate: string; location: string; status: string; }
interface Stats    { totalEvents: number; totalStudents: number; totalRegistrations: number; totalCheckins: number; checkinRate: number; }

const ROLE_LABEL: Record<string,string> = { STUDENT:'Sinh viên', EVENT_MANAGER:'Ban tổ chức', ADMIN:'Admin', SUPER_ADMIN:'Super Admin' };
const ROLE_CLR:   Record<string,string> = { STUDENT:'#EF4444', EVENT_MANAGER:'#F59E0B', ADMIN:'#3B82F6', SUPER_ADMIN:'#7C3AED' };

// ── EDIT USER MODAL ──────────────────────────────────────────
interface EditProps {
  u: SysUser;
  onClose: () => void;
  onSave:  (id: number, data: any) => Promise<void>;
}

function EditUserModal({ u, onClose, onSave }: EditProps) {
  const [form, setForm] = useState({
    username:    u.username,
    email:       u.email,
    role:        u.role,
    newPassword: '',
    confirmPw:   '',
  });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [busy,   setBusy]   = useState(false);
  const [showPw, setShowPw] = useState(false);

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.username.trim() || form.username.length < 3) e.username = 'Tối thiểu 3 ký tự';
    if (!form.email.includes('@'))                         e.email    = 'Email không hợp lệ';
    if (form.newPassword && form.newPassword.length < 6)   e.newPassword = 'Tối thiểu 6 ký tự';
    if (form.newPassword && form.newPassword !== form.confirmPw) e.confirmPw = 'Mật khẩu không khớp';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      const payload: any = {};
      if (form.username !== u.username) payload.username    = form.username;
      if (form.email    !== u.email)    payload.email       = form.email;
      if (form.role     !== u.role)     payload.role        = form.role;
      if (form.newPassword)             payload.newPassword = form.newPassword;
      await onSave(u.id, payload);
      onClose();
    } finally { setBusy(false); }
  };

  const F = ({ label, field, type='text', placeholder='', disabled=false }: any) => (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'.05em' }}>{label}</label>
      <input
        type={type} value={form[field as keyof typeof form]} placeholder={placeholder}
        disabled={disabled}
        onChange={e => { setForm(p => ({ ...p, [field]: e.target.value })); setErrors(p => ({ ...p, [field]: '' })); }}
        style={{ width:'100%', padding:'10px 14px', border:`1.5px solid ${errors[field] ? '#EF4444' : '#E5E7EB'}`, borderRadius:9, fontSize:14, fontFamily:'inherit', outline:'none', background: disabled ? '#F9FAFB' : 'white', color: disabled ? '#9CA3AF' : '#111', transition:'border .2s' }}
        onFocus={e => { if (!disabled) e.target.style.borderColor='#7C3AED'; }}
        onBlur={e  => { if (!disabled) e.target.style.borderColor = errors[field] ? '#EF4444' : '#E5E7EB'; }}
      />
      {errors[field] && <div style={{ fontSize:11, color:'#EF4444', marginTop:4 }}>⚠ {errors[field]}</div>}
    </div>
  );

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', backdropFilter:'blur(6px)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'white', borderRadius:20, width:480, maxWidth:'100%', maxHeight:'calc(100vh - 40px)', overflow:'auto', boxShadow:'0 32px 80px rgba(0,0,0,.3)', display:'flex', flexDirection:'column' }}>

        {/* Header */}
        <div style={{ padding:'22px 28px 0', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:'linear-gradient(135deg,#7C3AED,#4F46E5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>✏️</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:18, fontWeight:900, color:'#111' }}>Chỉnh sửa tài khoản</div>
            <div style={{ fontSize:13, color:'#6B7280', marginTop:2 }}>Cập nhật thông tin cho <b>{u.username}</b></div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', background:'#F3F4F6', border:'none', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding:'20px 28px' }}>

          {/* Section: Thông tin cơ bản */}
          <div style={{ fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:12 }}>📋 Thông tin cơ bản</div>

          <F label="Tên đăng nhập" field="username" placeholder="Nhập username..." />
          <F label="Email" field="email" type="email" placeholder="email@school.edu" />

          {/* Section: Vai trò */}
          <div style={{ fontSize:11, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'.08em', margin:'18px 0 12px' }}>🎭 Vai trò</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
            {(['STUDENT','EVENT_MANAGER','ADMIN','SUPER_ADMIN'] as const).map(role => (
              <label key={role} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, border:`2px solid ${form.role===role ? ROLE_CLR[role] : '#E5E7EB'}`, background: form.role===role ? `${ROLE_CLR[role]}12` : 'white', cursor: u.role==='SUPER_ADMIN' ? 'not-allowed' : 'pointer', transition:'all .2s', opacity: u.role==='SUPER_ADMIN' && role!=='SUPER_ADMIN' ? .5 : 1 }}>
                <input type="radio" name="role" value={role} checked={form.role===role} disabled={u.role==='SUPER_ADMIN'} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} style={{ accentColor: ROLE_CLR[role] }} />
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color: form.role===role ? ROLE_CLR[role] : '#374151' }}>{ROLE_LABEL[role]}</div>
                  <div style={{ fontSize:10, color:'#9CA3AF' }}>{role==='STUDENT'?'sv@school.edu':role==='EVENT_MANAGER'?'Quản lý sự kiện':role==='ADMIN'?'Toàn quyền SK':'Toàn bộ hệ thống'}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Section: Đặt lại mật khẩu */}
          <button onClick={() => setShowPw(!showPw)} style={{ display:'flex', alignItems:'center', gap:8, background:'#F9FAFB', border:'1.5px dashed #D1D5DB', borderRadius:10, padding:'10px 16px', cursor:'pointer', width:'100%', fontFamily:'inherit', fontSize:13, fontWeight:600, color:'#374151', marginBottom: showPw ? 14 : 0 }}>
            🔑 {showPw ? 'Ẩn phần đặt lại mật khẩu ▲' : 'Đặt lại mật khẩu (tuỳ chọn) ▼'}
          </button>

          {showPw && (
            <div style={{ background:'#FFFBEB', border:'1.5px solid #FDE68A', borderRadius:10, padding:'14px 16px' }}>
              <div style={{ fontSize:12, color:'#92400E', marginBottom:12 }}>⚠ Để trống nếu không muốn đổi mật khẩu</div>
              <F label="Mật khẩu mới" field="newPassword" type="password" placeholder="Tối thiểu 6 ký tự..." />
              <F label="Xác nhận mật khẩu" field="confirmPw" type="password" placeholder="Nhập lại mật khẩu mới..." />
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:'16px 28px 24px', borderTop:'1px solid #F3F4F6', display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ padding:'10px 20px', borderRadius:10, border:'1.5px solid #E5E7EB', background:'white', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'#374151' }}>Hủy</button>
          <button onClick={handleSave} disabled={busy || u.role==='SUPER_ADMIN'} style={{ padding:'10px 24px', borderRadius:10, border:'none', background: u.role==='SUPER_ADMIN' ? '#CBD5E1' : 'linear-gradient(135deg,#7C3AED,#4F46E5)', color:'white', fontSize:14, fontWeight:700, cursor: u.role==='SUPER_ADMIN' ? 'not-allowed' : 'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }}>
            {busy ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────
export default function SuperDash({ user, onHome, onLogout, onToast }: Props) {
  const [page,     setPage]     = useState<SaPage>('users');
  const [users,    setUsers]    = useState<SysUser[]>([]);
  const [total,    setTotal]    = useState(0);
  const [search,   setSearch]   = useState('');
  const [roleF,    setRoleF]    = useState('');
  const [events,   setEvents]   = useState<Event[]>([]);
  const [stats,    setStats]    = useState<Stats|null>(null);
  const [loading,  setLoading]  = useState(false);
  const [showAdd,  setShowAdd]  = useState(false);
  const [editUser, setEditUser] = useState<SysUser|null>(null);
  const [newU,     setNewU]     = useState({ username:'', email:'', password:'123456', role:'STUDENT' });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ limit:'100' });
      if (search) qs.set('search', search);
      if (roleF)  qs.set('role', roleF);
      const res = await api.get<{ data: SysUser[]; total: number }>(`/users?${qs}`);
      setUsers(res.data); setTotal(res.total);
    } catch { onToast('Không tải được danh sách', 'error'); }
    finally { setLoading(false); }
  }, [search, roleF]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try { setEvents(await api.get<Event[]>('/events', false)); }
    catch { } finally { setLoading(false); }
  }, []);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try { setStats(await api.get<Stats>('/statistics/overview')); }
    catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (page==='users')  loadUsers();
    if (page==='events') loadEvents();
    if (page==='stats')  loadStats();
  }, [page, search, roleF]);

  const handleAddUser = async () => {
    if (!newU.username || !newU.email || !newU.password) { onToast('Vui lòng nhập đầy đủ', 'error'); return; }
    try {
      await api.post('/users', newU);
      onToast(`✅ Đã tạo: ${newU.username}`, 'success');
      setNewU({ username:'', email:'', password:'123456', role:'STUDENT' });
      setShowAdd(false); loadUsers();
    } catch (e: unknown) { onToast(e instanceof Error ? e.message : 'Lỗi', 'error'); }
  };

  const handleSaveEdit = async (id: number, data: any) => {
    if (Object.keys(data).length === 0) { onToast('Không có thay đổi nào', 'info'); return; }
    try {
      await api.patch(`/users/${id}`, data);
      onToast('✅ Đã cập nhật tài khoản thành công!', 'success');
      loadUsers();
    } catch (e: unknown) { onToast(e instanceof Error ? e.message : 'Lỗi cập nhật', 'error'); throw e; }
  };

  const handleToggle = async (u: SysUser) => {
    try { await api.patch(`/users/${u.id}/${u.isActive ? 'deactivate' : 'activate'}`, {}); onToast(`${u.isActive?'Đã khóa':'Đã mở khóa'}: ${u.username}`, 'info'); loadUsers(); }
    catch (e: unknown) { onToast(e instanceof Error ? e.message : 'Lỗi', 'error'); }
  };

  const handleDeleteUser = async (u: SysUser) => {
    if (!confirm(`Xóa vĩnh viễn "${u.username}"?`)) return;
    try { await api.delete(`/users/${u.id}`); onToast(`Đã xóa: ${u.username}`, 'info'); loadUsers(); }
    catch (e: unknown) { onToast(e instanceof Error ? e.message : 'Lỗi', 'error'); }
  };

  const handleDeleteEvent = async (id: number, title: string) => {
    if (!confirm(`Xóa sự kiện "${title}"?`)) return;
    try { await api.delete(`/events/${id}`); onToast(`Đã xóa: ${title}`, 'info'); loadEvents(); }
    catch (e: unknown) { onToast(e instanceof Error ? e.message : 'Lỗi', 'error'); }
  };

  const NAV = [{ key:'users', icon:'👥', label:'Người dùng' }, { key:'events', icon:'📅', label:'Sự kiện' }, { key:'stats', icon:'📊', label:'Thống kê' }];

  return (
    <div className="dash">
      <div className="dash-hdr"><div className="dash-hi">
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, background:'linear-gradient(135deg,#7C3AED,#4F46E5)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:18 }}>🛡️</div>
          <div><div className="dash-ttl">Super Admin Panel</div><div className="dash-st">{user.name} · {user.email}</div></div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="ab" onClick={onHome}>← Trang chủ</button>
          <button className="ab dan" onClick={onLogout}>Đăng xuất</button>
        </div>
      </div></div>

      <div style={{ display:'flex', minHeight:'calc(100vh - 72px)' }}>
        {/* Sidebar */}
        <div className="sa-sidebar" style={{ width:220, flexShrink:0 }}>
          <div style={{ padding:'16px 24px 12px', borderBottom:'1px solid rgba(255,255,255,.06)', marginBottom:8 }}>
            <div style={{ fontSize:22, fontWeight:900, color:'white' }}>{total}</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.08em' }}>Tổng tài khoản</div>
          </div>
          {NAV.map(n => (
            <div key={n.key} className={`sa-nav-item${page===n.key?' active':''}`} onClick={() => setPage(n.key as SaPage)}>
              <span className="icon">{n.icon}</span>{n.label}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex:1, padding:28, overflow:'auto' }}>

          {/* ── USERS ── */}
          {page==='users' && (
            <>
              <div className="dcard">
                <div className="dcard-h">
                  <h3>Tài khoản hệ thống ({total}) {loading && <span style={{ fontSize:11, color:'#9CA3AF' }}>Đang tải...</span>}</h3>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    <input placeholder="🔍 Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)}
                      style={{ padding:'7px 12px', border:'1.5px solid #E5E7EB', borderRadius:8, fontSize:13, fontFamily:'inherit', outline:'none', width:160 }} />
                    <select value={roleF} onChange={e => setRoleF(e.target.value)}
                      style={{ padding:'7px 12px', border:'1.5px solid #E5E7EB', borderRadius:8, fontSize:13, fontFamily:'inherit', outline:'none', cursor:'pointer' }}>
                      <option value="">Tất cả role</option>
                      <option value="STUDENT">Sinh viên</option>
                      <option value="EVENT_MANAGER">Ban tổ chức</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                    <button className="ab pri" style={{ background:'linear-gradient(135deg,#7C3AED,#4F46E5)', border:'none' }} onClick={() => setShowAdd(!showAdd)}>+ Thêm tài khoản</button>
                    <button className="ab" onClick={loadUsers}>🔄</button>
                  </div>
                </div>

                <table className="dt">
                  <thead>
                    <tr>
                      <th>#</th><th>Username</th><th>Email</th><th>Role</th>
                      <th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u.id}>
                        <td style={{ color:'#9CA3AF', fontSize:12 }}>{i+1}</td>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:34, height:34, borderRadius:'50%', background:`${ROLE_CLR[u.role]}20`, border:`2px solid ${ROLE_CLR[u.role]}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, color:ROLE_CLR[u.role], flexShrink:0 }}>
                              {u.username[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize:13, fontWeight:700 }}>{u.username}</div>
                              <div style={{ fontSize:10, color:'#9CA3AF' }}>ID: {u.id}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize:13, color:'#374151' }}>{u.email}</td>
                        <td>
                          <span style={{ fontSize:11, fontWeight:700, color:ROLE_CLR[u.role], background:`${ROLE_CLR[u.role]}15`, padding:'3px 10px', borderRadius:100 }}>
                            {ROLE_LABEL[u.role]}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize:11, fontWeight:700, color: u.isActive?'#16A34A':'#DC2626', background: u.isActive?'#DCFCE7':'#FEE2E2', padding:'3px 10px', borderRadius:100 }}>
                            {u.isActive ? '● Active' : '● Inactive'}
                          </span>
                        </td>
                        <td style={{ fontSize:12, color:'#9CA3AF' }}>{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <div style={{ display:'flex', gap:5 }}>
                            {/* Nút SỬA */}
                            <button
                              disabled={u.role==='SUPER_ADMIN'}
                              onClick={() => setEditUser(u)}
                              style={{ padding:'5px 12px', fontSize:12, borderRadius:7, border:'1.5px solid #7C3AED', color:u.role==='SUPER_ADMIN'?'#CBD5E1':'#7C3AED', background:'white', cursor:u.role==='SUPER_ADMIN'?'not-allowed':'pointer', fontFamily:'inherit', fontWeight:600 }}>
                              ✏️ Sửa
                            </button>
                            <button
                              disabled={u.role==='SUPER_ADMIN'}
                              onClick={() => handleToggle(u)}
                              style={{ padding:'5px 12px', fontSize:12, borderRadius:7, border:`1.5px solid ${u.isActive?'#FCA5A5':'#86EFAC'}`, color:u.isActive?'#DC2626':'#16A34A', background:'white', cursor:u.role==='SUPER_ADMIN'?'not-allowed':'pointer', fontFamily:'inherit', fontWeight:600 }}>
                              {u.isActive ? '🔒 Khóa' : '🔓 Mở'}
                            </button>
                            {u.role !== 'SUPER_ADMIN' && (
                              <button onClick={() => handleDeleteUser(u)}
                                style={{ padding:'5px 12px', fontSize:12, borderRadius:7, border:'1.5px solid #FCA5A5', color:'#DC2626', background:'white', cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>
                                🗑 Xóa
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!loading && users.length===0 && (
                      <tr><td colSpan={7} style={{ textAlign:'center', color:'#9CA3AF', padding:32 }}>Không có dữ liệu</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ADD USER FORM */}
              {showAdd && (
                <div className="dcard" style={{ padding:24, marginTop:16 }}>
                  <div style={{ fontSize:15, fontWeight:800, marginBottom:16 }}>➕ Thêm tài khoản mới</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div><label className="flbl">Tên đăng nhập *</label><input className="fin" placeholder="sv001" value={newU.username} onChange={e=>setNewU(p=>({...p,username:e.target.value}))} /></div>
                    <div><label className="flbl">Email *</label><input className="fin" type="email" placeholder="email@school.edu" value={newU.email} onChange={e=>setNewU(p=>({...p,email:e.target.value}))} /></div>
                    <div><label className="flbl">Mật khẩu *</label><input className="fin" type="password" value={newU.password} onChange={e=>setNewU(p=>({...p,password:e.target.value}))} /></div>
                    <div><label className="flbl">Vai trò</label>
                      <select className="fin" value={newU.role} onChange={e=>setNewU(p=>({...p,role:e.target.value}))}>
                        <option value="STUDENT">Sinh viên</option>
                        <option value="EVENT_MANAGER">Ban tổ chức</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, marginTop:14 }}>
                    <button className="ab pri" style={{ background:'linear-gradient(135deg,#7C3AED,#4F46E5)', border:'none' }} onClick={handleAddUser}>✅ Tạo tài khoản</button>
                    <button className="ab" onClick={() => setShowAdd(false)}>Hủy</button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── EVENTS ── */}
          {page==='events' && (
            <div className="dcard">
              <div className="dcard-h">
                <h3>Tất cả sự kiện ({events.length}) {loading && '...'}</h3>
                <button className="ab" onClick={loadEvents}>🔄</button>
              </div>
              <table className="dt">
                <thead><tr><th>Tiêu đề</th><th>Danh mục</th><th>Ngày bắt đầu</th><th>Địa điểm</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {events.map(ev => (
                    <tr key={ev.id}>
                      <td><b>{ev.title}</b></td>
                      <td>{(() => { const c: Record<string,string> = {HERO:'🎠 Hero',FEATURED:'⭐ Đề xuất',HIGHLIGHT:'🌟 Nổi bật',NORMAL:'📋 Thường'}; return <span style={{ fontSize:11, fontWeight:700, color:'#6B7280' }}>{c[(ev as any).category||'NORMAL']}</span>; })()}</td>
                      <td style={{ fontSize:12 }}>{new Date(ev.startDate).toLocaleDateString('vi-VN')}</td>
                      <td style={{ fontSize:12, color:'#6B7280' }}>{ev.location}</td>
                      <td><span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:100, color:ev.status==='OPEN'?'#16A34A':ev.status==='CLOSED'?'#64748B':'#92400E', background:ev.status==='OPEN'?'#DCFCE7':ev.status==='CLOSED'?'#F1F5F9':'#FEF3C7' }}>{ev.status==='OPEN'?'Đang mở':ev.status==='CLOSED'?'Đã đóng':'Sắp diễn ra'}</span></td>
                      <td><button className="ab dan" style={{ padding:'5px 10px', fontSize:12 }} onClick={() => handleDeleteEvent(ev.id, ev.title)}>🗑 Xóa</button></td>
                    </tr>
                  ))}
                  {!loading && events.length===0 && <tr><td colSpan={6} style={{ textAlign:'center', color:'#9CA3AF', padding:32 }}>Chưa có sự kiện</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* ── STATS ── */}
          {page==='stats' && (
            <>
              <div className="kgrid">
                {[
                  { label:'Tổng sự kiện',    val:stats?.totalEvents,        color:'#C8102E' },
                  { label:'Tổng sinh viên',   val:stats?.totalStudents,      color:'#2563EB' },
                  { label:'Tổng đăng ký',     val:stats?.totalRegistrations, color:'#7C3AED' },
                  { label:'Tổng check-in',    val:stats?.totalCheckins,      color:'#16A34A' },
                ].map(k => (
                  <div key={k.label} className="kcard">
                    <div className="klbl">{k.label}</div>
                    <div className="kval" style={{ color:k.color }}>{k.val ?? '...'}</div>
                  </div>
                ))}
              </div>
              <div className="dcard" style={{ padding:24 }}>
                <div className="dttl">📊 Tỷ lệ check-in tổng thể</div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:14 }}>
                  <span>Check-in / Đăng ký</span>
                  <span style={{ fontWeight:700, color:'#16A34A' }}>{stats?.checkinRate ?? 0}%</span>
                </div>
                <div className="prog-wrap"><div className="prog" style={{ width:`${stats?.checkinRate ?? 0}%`, background:'linear-gradient(90deg,#16A34A,#22C55E)' }} /></div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* EDIT USER MODAL */}
      {editUser && <EditUserModal u={editUser} onClose={() => setEditUser(null)} onSave={handleSaveEdit} />}
    </div>
  );
}
