'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { api, tokenStorage } from '../lib/apiClient';
import { backendEventToFrontend } from '../lib/mappers';
import { BackendUser, BackendEvent } from '../types';

type Page = 'dashboard' | 'users' | 'events' | 'registrations' | 'system';
interface ToastState { msg: string; type: 'success' | 'error' | 'info'; id: number; }
interface AuthUser { id: number; email: string; username: string; role: string; }
type EventForm = { title: string; description: string; startDate: string; endDate: string; location: string; maxParticipants: string; status: string; imageUrl: string; category: string };
const EMPTY_FORM: EventForm = { title: '', description: '', startDate: '', endDate: '', location: '', maxParticipants: '200', status: 'UPCOMING', imageUrl: '', category: 'NORMAL' };

async function saLogin(email: string, password: string) {
  const data = await api.post<{ accessToken: string; refreshToken: string; role: string; email: string }>('/auth/login', { email, password }, false);
  if (data.role !== 'SUPER_ADMIN') throw new Error('Chỉ Super Admin mới được truy cập!');
  tokenStorage.setTokens(data.accessToken, data.refreshToken);
  return data;
}

function Toast({ toasts }: { toasts: ToastState[] }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}
    </div>
  );
}

function LoginPage({ onLogin }: { onLogin: (u: AuthUser) => void }) {
  const [email, setEmail] = useState(''); const [pass, setPass] = useState('');
  const [err, setErr] = useState(''); const [loading, setLoading] = useState(false);
  const handle = async () => {
    const e = email.includes('@') ? email : `${email}@school.edu`;
    setLoading(true); setErr('');
    try { await saLogin(e, pass); const me = await api.get<AuthUser>('/users/me'); onLogin(me); }
    catch (er: unknown) { setErr(er instanceof Error ? er.message : 'Đăng nhập thất bại'); }
    finally { setLoading(false); }
  };
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header"><div className="login-icon">🛡️</div><h1>Super Admin</h1><p>Hệ thống quản trị toàn diện – VLU</p></div>
        <div className="login-body">
          {err && <div className="login-error">{err}</div>}
          <div className="form-group"><label className="form-label">Email / Tài khoản</label>
            <input className="form-input" placeholder="superadmin1@school.edu" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handle()} autoFocus /></div>
          <div className="form-group"><label className="form-label">Mật khẩu</label>
            <input className="form-input" type="password" placeholder="••••••" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && handle()} /></div>
          <button className="login-btn" onClick={handle} disabled={loading || !email || !pass}>{loading ? 'Đang đăng nhập...' : '🔐 Đăng nhập Super Admin'}</button>
          <div className="login-hint">💡 Mặc định: <b>superadmin1</b> / <b>super123</b></div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ page, setPage, user, onLogout }: { page: Page; setPage: (p: Page) => void; user: AuthUser; onLogout: () => void }) {
  const NAV = [{ key: 'dashboard', icon: '📊', label: 'Tổng quan' }, { key: 'users', icon: '👥', label: 'Người dùng' }, { key: 'events', icon: '📅', label: 'Sự kiện' }, { key: 'registrations', icon: '📋', label: 'Đăng ký & Check-in' }, { key: 'system', icon: '⚙️', label: 'Hệ thống' }];
  return (
    <div className="sidebar">
      <div className="sidebar-logo"><div className="sidebar-logo-icon">🛡️</div><div><div className="sidebar-logo-name">VLU Admin</div><div className="sidebar-logo-sub">Super Admin Panel</div></div></div>
      <div className="sidebar-nav"><div className="sidebar-section-label">Quản lý</div>
        {NAV.map(n => <div key={n.key} className={`nav-item${page === n.key ? ' active' : ''}`} onClick={() => setPage(n.key as Page)}><span className="ni">{n.icon}</span>{n.label}</div>)}
      </div>
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div className="sa-av">{user.username[0]?.toUpperCase()}</div>
          <div><div className="sa-name">{user.username}</div><div className="sa-role">SUPER_ADMIN</div></div>
        </div>
        <button className="btn-logout" onClick={onLogout}>🚪 Đăng xuất</button>
      </div>
    </div>
  );
}

function DashboardPage({ toast }: { toast: (m: string, t?: 'success' | 'error' | 'info') => void }) {
  const [stats, setStats] = useState({ users: 0, students: 0, managers: 0, admins: 0, events: 0, open: 0 });
  useEffect(() => {
    Promise.all([api.get<{ total: number; data: BackendUser[] }>('/users?limit=200').catch(() => ({ total: 0, data: [] })), api.get<BackendEvent[]>('/events').catch(() => [])]).then(([users, events]) => {
      const u = users.data ?? [];
      setStats({ users: users.total || u.length, students: u.filter((x: BackendUser) => x.role === 'STUDENT').length, managers: u.filter((x: BackendUser) => x.role === 'EVENT_MANAGER').length, admins: u.filter((x: BackendUser) => x.role === 'ADMIN').length, events: (events as BackendEvent[]).length, open: (events as BackendEvent[]).filter((e: BackendEvent) => e.status === 'OPEN').length });
    });
  }, []);
  return (
    <div className="page-content">
      <div className="page-header"><h1>📊 Tổng quan hệ thống</h1><p>Giám sát toàn bộ hoạt động hệ thống Rèn Luyện VLU</p></div>
      <div className="kpi-grid">
        {[{ icon: '👥', cls: 'purple', label: 'Tổng người dùng', val: stats.users, sub: 'Tài khoản hệ thống' }, { icon: '📅', cls: 'blue', label: 'Tổng sự kiện', val: stats.events, sub: 'Tất cả học kỳ' }, { icon: '🟢', cls: 'green', label: 'Sự kiện đang mở', val: stats.open, sub: 'Đang nhận đăng ký' }, { icon: '🎓', cls: 'red', label: 'Sinh viên', val: stats.students, sub: 'Tài khoản SV' }].map(k => (
          <div key={k.label} className="kpi-card"><div className={`kpi-icon ${k.cls}`}>{k.icon}</div><div><div className="kpi-label">{k.label}</div><div className="kpi-value">{k.val}</div><div className="kpi-sub">{k.sub}</div></div></div>
        ))}
      </div>
      <div className="two-col">
        <div className="card"><div className="card-header"><h3>📊 Phân bố người dùng</h3></div><div className="card-body">
          {[{ label: '🎓 Sinh viên', count: stats.students, color: 'var(--red)' }, { label: '👥 Ban tổ chức', count: stats.managers, color: 'var(--gold)' }, { label: '⚙️ Admin', count: stats.admins, color: 'var(--blue)' }].map(r => (
            <div key={r.label} style={{ marginBottom: 16 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 13, fontWeight: 600 }}>{r.label}</span><span style={{ fontSize: 13, fontWeight: 700, color: r.color }}>{r.count}</span></div><div className="prog-wrap"><div className="prog" style={{ width: `${stats.users ? Math.round((r.count / stats.users) * 100) : 0}%`, background: r.color }} /></div></div>
          ))}
        </div></div>
        <div className="card"><div className="card-header"><h3>🔗 Trạng thái hệ thống</h3></div><div className="card-body">
          {[{ label: 'API Backend', val: 'Đang hoạt động', ok: true }, { label: 'Database', val: 'PostgreSQL – OK', ok: true }, { label: 'JWT Auth', val: 'HS256 – Active', ok: true }, { label: 'CORS Policy', val: 'Đã cấu hình', ok: true }, { label: 'Email Service', val: 'Chưa cấu hình', ok: false }].map(s => (
            <div key={s.label} className="status-row"><span style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</span><span style={{ fontSize: 12, color: s.ok ? 'var(--green)' : '#EF4444' }}><span className={s.ok ? 'dot-green' : 'dot-red'} />{s.val}</span></div>
          ))}
        </div></div>
      </div>
    </div>
  );
}

function UsersPage({ toast }: { toast: (m: string, t?: 'success' | 'error' | 'info') => void }) {
  const [users, setUsers] = useState<BackendUser[]>([]); const [total, setTotal] = useState(0);
  const [search, setSearch] = useState(''); const [roleF, setRoleF] = useState('');
  const [loading, setLoading] = useState(false); const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '123456', role: 'STUDENT' as string });
  const load = useCallback(async () => {
    setLoading(true);
    try { const qs = new URLSearchParams({ limit: '50' }); if (search) qs.set('search', search); if (roleF) qs.set('role', roleF); const res = await api.get<{ data: BackendUser[]; total: number }>(`/users?${qs}`); setUsers(res.data); setTotal(res.total); }
    catch { toast('Không tải được danh sách user', 'error'); } finally { setLoading(false); }
  }, [search, roleF, toast]);
  useEffect(() => { load(); }, [load]);
  const handleCreate = async () => {
    if (!form.username || !form.email || !form.password) { toast('Vui lòng nhập đầy đủ', 'error'); return; }
    try { await api.post('/users', form); toast(`✅ Đã tạo: ${form.username}`, 'success'); setShowAdd(false); setForm({ username: '', email: '', password: '123456', role: 'STUDENT' }); load(); }
    catch (e: unknown) { toast(e instanceof Error ? e.message : 'Lỗi', 'error'); }
  };
  const handleRole = async (id: number, role: string) => { try { await api.patch(`/users/${id}/role`, { role }); toast('Đã cập nhật role', 'success'); load(); } catch (e: unknown) { toast(e instanceof Error ? e.message : 'Lỗi', 'error'); } };
  const handleToggle = async (u: BackendUser) => { try { await api.patch(u.isActive ? `/users/${u.id}/deactivate` : `/users/${u.id}/activate`, {}); toast(`${u.isActive ? 'Đã khóa' : 'Đã mở khóa'}: ${u.username}`, 'info'); load(); } catch (e: unknown) { toast(e instanceof Error ? e.message : 'Lỗi', 'error'); } };
  const handleDelete = async (u: BackendUser) => { if (!confirm(`Xóa "${u.username}"?`)) return; try { await api.delete(`/users/${u.id}`); toast(`Đã xóa: ${u.username}`, 'info'); load(); } catch (e: unknown) { toast(e instanceof Error ? e.message : 'Lỗi', 'error'); } };
  return (
    <div className="page-content">
      <div className="page-header"><h1>👥 Quản lý người dùng</h1><p>Tạo, phân quyền, khóa/mở khóa tài khoản</p></div>
      <div className="card">
        <div className="card-header">
          <h3>Tất cả ({total}) {loading && <span style={{ fontSize: 12, color: 'var(--mid)' }}>...</span>}</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input className="search-input" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 180 }} />
            <select className="form-select" value={roleF} onChange={e => setRoleF(e.target.value)} style={{ width: 160 }}>
              <option value="">Tất cả role</option><option value="STUDENT">Sinh viên</option><option value="EVENT_MANAGER">Ban tổ chức</option><option value="ADMIN">Admin</option><option value="SUPER_ADMIN">Super Admin</option>
            </select>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Thêm user</button>
            <button className="btn" onClick={load}>🔄</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead><tr><th>#</th><th>Username</th><th>Email</th><th>Role</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--mid)', fontSize: 12 }}>{i + 1}</td>
                  <td><b>{u.username}</b><br /><small style={{ color: 'var(--mid)', fontFamily: 'monospace' }}>ID:{u.id}</small></td>
                  <td style={{ fontSize: 13 }}>{u.email}</td>
                  <td><select className="form-select" value={u.role} style={{ width: 140, padding: '5px 8px', fontSize: 12 }} onChange={e => handleRole(u.id, e.target.value)} disabled={u.role === 'SUPER_ADMIN'}><option value="STUDENT">Sinh viên</option><option value="EVENT_MANAGER">Ban tổ chức</option><option value="ADMIN">Admin</option><option value="SUPER_ADMIN" disabled>Super Admin</option></select></td>
                  <td><span className={`pill ${u.isActive ? 'pill-green' : 'pill-gray'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--mid)' }}>{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button className={`btn btn-sm ${u.isActive ? 'btn-danger' : ''}`} onClick={() => handleToggle(u)} disabled={u.role === 'SUPER_ADMIN'}>{u.isActive ? 'Khóa' : 'Mở khóa'}</button>
                    {u.role !== 'SUPER_ADMIN' && <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u)}>Xóa</button>}
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--mid)', padding: 32 }}>Không có dữ liệu</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {showAdd && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div className="modal" style={{ width:560, maxWidth:"calc(100vw - 32px)" }}>
            <button className="modal-close" onClick={() => setShowAdd(false)}>✕</button>
            <div className="modal-title">➕ Thêm người dùng mới</div>
            <div className="form-grid-2">
              <div className="form-group form-full"><label className="form-label">Tên đăng nhập *</label><input className="form-input" placeholder="nguyenvana" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} /></div>
              <div className="form-group form-full"><label className="form-label">Email *</label><input className="form-input" type="email" placeholder="email@school.edu" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Mật khẩu *</label><input className="form-input" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Vai trò</label><select className="form-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}><option value="STUDENT">🎓 Sinh viên</option><option value="EVENT_MANAGER">👥 Ban tổ chức</option><option value="ADMIN">⚙️ Admin</option></select></div>
            </div>
            <div className="modal-footer"><button className="btn" onClick={() => setShowAdd(false)}>Hủy</button><button className="btn btn-primary" onClick={handleCreate}>✅ Tạo tài khoản</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function EventsPage({ toast }: { toast: (m: string, t?: 'success' | 'error' | 'info') => void }) {
  const [events, setEvents] = useState<BackendEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<EventForm>(EMPTY_FORM);

  const load = useCallback(async () => { setLoading(true); try { setEvents(await api.get<BackendEvent[]>('/events', false)); } catch { } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditId(null); setForm(EMPTY_FORM); setShowForm(true); };

  const openEdit = (ev: BackendEvent) => {
    setEditId(ev.id);
    const toLocal = (iso: string) => { if (!iso) return ''; const d = new Date(iso); const p = (n: number) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };
    setForm({ title: ev.title, description: ev.description ?? '', startDate: toLocal(ev.startDate), endDate: toLocal(ev.endDate), location: ev.location, maxParticipants: String(ev.maxParticipants ?? 200), status: ev.status, imageUrl: ev.imageUrl ?? '', category: (ev as any).category ?? 'NORMAL' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.startDate) { toast('Vui lòng nhập đầy đủ', 'error'); return; }
    const payload = { title: form.title, description: form.description || form.title, startDate: new Date(form.startDate).toISOString(), endDate: new Date(form.endDate || form.startDate).toISOString(), location: form.location || 'TBD', maxParticipants: parseInt(form.maxParticipants) || 200, status: form.status, imageUrl: form.imageUrl || undefined, category: form.category };
    try {
      if (editId !== null) { await api.patch(`/events/${editId}`, payload); toast(`✅ Đã cập nhật: ${form.title}`, 'success'); }
      else { await api.post('/events', payload); toast(`✅ Đã tạo: ${form.title}`, 'success'); }
      setShowForm(false); setForm(EMPTY_FORM); setEditId(null); load();
    } catch (e: unknown) { toast(e instanceof Error ? e.message : 'Lỗi', 'error'); }
  };

  const handleStatusChange = async (id: number, status: string) => { try { await api.patch(`/events/${id}`, { status }); toast('Đã cập nhật', 'success'); load(); } catch (e: unknown) { toast(e instanceof Error ? e.message : 'Lỗi', 'error'); } };
  const handleDelete = async (id: number, title: string) => { if (!confirm(`Xóa "${title}"?`)) return; try { await api.delete(`/events/${id}`); toast(`Đã xóa: ${title}`, 'info'); load(); } catch (e: unknown) { toast(e instanceof Error ? e.message : 'Lỗi', 'error'); } };

  return (
    <div className="page-content">
      <div className="page-header"><h1>📅 Quản lý sự kiện</h1><p>Xem, tạo, sửa và xóa tất cả sự kiện trong hệ thống</p></div>
      <div className="card">
        <div className="card-header">
          <h3>Tất cả sự kiện ({events.length}) {loading && <span style={{ fontSize: 12, color: 'var(--mid)' }}>...</span>}</h3>
          <div style={{ display: 'flex', gap: 8 }}><button className="btn btn-primary" onClick={openCreate}>+ Tạo sự kiện</button><button className="btn" onClick={load}>🔄</button></div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead><tr><th>Tiêu đề</th><th>Danh mục</th><th>Bắt đầu</th><th>Địa điểm</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id}>
                  <td><b>{ev.title}</b><br /><small style={{ color: 'var(--mid)', fontSize: 12 }}>{ev.description?.slice(0, 60)}</small></td>
                  <td>{(() => {
                    const c: Record<string,string> = {HERO:'🎠 Hero', FEATURED:'⭐ Đề xuất', HIGHLIGHT:'🌟 Nổi bật', NORMAL:'📋 Thường'};
                    const col: Record<string,string> = {HERO:'#7C3AED', FEATURED:'#E8A020', HIGHLIGHT:'#C8102E', NORMAL:'#6B7280'};
                    const k = (ev as any).category || 'NORMAL';
                    return <span style={{ fontSize:11, fontWeight:700, color:col[k] }}>{c[k]}</span>;
                  })()}</td>
                  <td style={{ fontSize: 13 }}>{new Date(ev.startDate).toLocaleDateString('vi-VN')}</td>
                  <td style={{ fontSize: 13, color: 'var(--mid)' }}>{ev.location}</td>
                  <td style={{ fontSize: 13 }}>{ev.maxParticipants}</td>
                  <td>
                    <select className="form-select" value={ev.status} style={{ width: 130, padding: '5px 8px', fontSize: 12 }} onChange={e => handleStatusChange(ev.id, e.target.value)}>
                      <option value="UPCOMING">Sắp diễn ra</option><option value="OPEN">Đang mở</option><option value="CLOSED">Đã đóng</option>
                    </select>
                  </td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm" style={{ background: '#3B82F6', color: 'white', border: 'none' }} onClick={() => openEdit(ev)}>✏️ Sửa</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(ev.id, ev.title)}>Xóa</button>
                  </td>
                </tr>
              ))}
              {!loading && events.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--mid)', padding: 32 }}>Chưa có sự kiện nào</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) { setShowForm(false); setEditId(null); } }}>
          <div className="modal" style={{ width:560, maxWidth:"calc(100vw - 32px)" }}>
            <button className="modal-close" onClick={() => { setShowForm(false); setEditId(null); }}>✕</button>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
              <div style={{ width:40, height:40, borderRadius:12, background: editId ? '#EFF6FF' : '#FFF5F5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{editId ? '✏️' : '📅'}</div>
              <div>
                <div className="modal-title" style={{ fontSize:17 }}>{editId !== null ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}</div>
                <div className="modal-sub" style={{ marginBottom:0 }}>{editId !== null ? 'Cập nhật thông tin sự kiện' : 'Điền thông tin để tạo sự kiện mới'}</div>
              </div>
            </div>
            <div style={{ height:1, background:'#F3F4F6', margin:'16px 0' }} />
            <div className="form-grid-2">
              {/* Tên sự kiện */}
              <div className="form-group form-full">
                <label className="form-label">📌 Tên sự kiện *</label>
                <input className="form-input" placeholder="VD: Career Day VLU 2026..." value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={{ fontSize:15, fontWeight:600 }} />
              </div>
              {/* Mô tả */}
              <div className="form-group form-full">
                <label className="form-label">📝 Mô tả sự kiện</label>
                <textarea placeholder="Nhập mô tả chi tiết về sự kiện..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #E5E7EB', borderRadius:8, fontSize:14, fontFamily:'inherit', outline:'none', resize:'vertical', minHeight:80, lineHeight:1.6 }} />
              </div>
              {/* Ngày */}
              <div className="form-group">
                <label className="form-label">📅 Ngày bắt đầu *</label>
                <input className="form-input" type="datetime-local" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">📅 Ngày kết thúc</label>
                <input className="form-input" type="datetime-local" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
              </div>
              {/* Địa điểm + số lượng */}
              <div className="form-group">
                <label className="form-label">📍 Địa điểm</label>
                <input className="form-input" placeholder="VD: Toà J - CS3" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">👥 Số lượng tối đa</label>
                <input className="form-input" type="number" min="1" value={form.maxParticipants} onChange={e => setForm(p => ({ ...p, maxParticipants: e.target.value }))} />
              </div>
              {/* Trạng thái */}
              <div className="form-group">
                <label className="form-label">🔖 Trạng thái</label>
                <select className="form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={{ width:'100%', padding:'10px 14px' }}>
                  <option value="UPCOMING">⏳ Sắp diễn ra</option>
                  <option value="OPEN">✅ Mở đăng ký</option>
                  <option value="CLOSED">🔒 Đã đóng</option>
                </select>
              </div>
              <div className="form-group form-full">
                <label className="form-label">📂 Danh mục hiển thị</label>
                <div style={{ display:'flex', gap:10, marginTop:8, flexWrap:'wrap' }}>
                  {([
                    { value:'HERO',      icon:'🎠', label:'Hero Carousel',   desc:'Banner trang chủ' },
                    { value:'FEATURED',  icon:'⭐', label:'Sự kiện đề xuất', desc:'Mục Đề Xuất' },
                    { value:'HIGHLIGHT', icon:'🌟', label:'Sự kiện nổi bật', desc:'Mục Nổi Bật' },
                    { value:'NORMAL',    icon:'📋', label:'Thường',           desc:'Danh sách thường' },
                  ] as const).map(cat => (
                    <label key={cat.value} style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'10px 12px', borderRadius:10, border:`2px solid ${form.category===cat.value?'var(--red)':'var(--border)'}`, background:form.category===cat.value?'#FFF5F5':'white', cursor:'pointer', flex:1, minWidth:120 }}>
                      <input type="radio" name="sa_category" value={cat.value} checked={form.category===cat.value} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ marginTop:2 }} />
                      <div><div style={{ fontSize:12, fontWeight:700 }}>{cat.icon} {cat.label}</div><div style={{ fontSize:11, color:'var(--mid)', marginTop:2 }}>{cat.desc}</div></div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group form-full">
                <label className="form-label">🖼️ Ảnh sự kiện</label>
                <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:8 }}>
                  <label style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', background:'var(--red)', color:'white', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'inherit' }}>
                    📁 Chọn tệp
                    <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = ev => setForm(p => ({ ...p, imageUrl: ev.target?.result as string }));
                      reader.readAsDataURL(file);
                    }} />
                  </label>
                  {form.imageUrl && <button style={{ padding:'6px 12px', border:'1.5px solid #FCA5A5', borderRadius:8, color:'#DC2626', background:'white', cursor:'pointer', fontSize:12, fontWeight:600, fontFamily:'inherit' }} onClick={() => setForm(p => ({ ...p, imageUrl:'' }))}>✕ Xóa ảnh</button>}
                  {!form.imageUrl && <span style={{ fontSize:12, color:'var(--mid)' }}>Chưa chọn ảnh (để trống = icon mặc định)</span>}
                </div>
                {form.imageUrl && (
                  <div style={{ border:'1px solid var(--border)', borderRadius:10, overflow:'hidden', height:140 }}>
                    <img src={form.imageUrl} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => { setShowForm(false); setEditId(null); }}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave}>{editId !== null ? '💾 Lưu thay đổi' : '✅ Tạo sự kiện'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RegistrationsPage({ toast }: { toast: (m: string, t?: 'success' | 'error' | 'info') => void }) {
  const [events, setEvents] = useState<BackendEvent[]>([]); const [selEvent, setSelEvent] = useState<number | null>(null);
  const [regs, setRegs] = useState<any[]>([]); const [loading, setLoading] = useState(false);
  useEffect(() => { api.get<BackendEvent[]>('/events', false).then(data => { setEvents(data); if (data.length) setSelEvent(data[0].id); }).catch(() => {}); }, []);
  useEffect(() => {
    if (!selEvent) return; setLoading(true);
    api.get<any[]>(`/registrations/events/${selEvent}/list`).then(d => setRegs(d)).catch(() => toast('Không tải được', 'error')).finally(() => setLoading(false));
  }, [selEvent]);
  return (
    <div className="page-content">
      <div className="page-header"><h1>📋 Đăng ký & Check-in</h1><p>Xem danh sách đăng ký và trạng thái check-in theo sự kiện</p></div>
      <div className="card" style={{ marginBottom: 20 }}><div className="card-body"><label className="form-label">📅 Chọn sự kiện:</label>
        <select className="form-select" value={selEvent ?? ''} onChange={e => setSelEvent(Number(e.target.value))} style={{ marginTop: 6, maxWidth: 400 }}>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
        </select></div></div>
      <div className="card">
        <div className="card-header"><h3>Danh sách đăng ký ({regs.length}) {loading && <span style={{ fontSize: 12, color: 'var(--mid)' }}>...</span>}</h3></div>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead><tr><th>#</th><th>Username</th><th>Email</th><th>Trạng thái</th><th>Đăng ký lúc</th><th>Check-in lúc</th></tr></thead>
            <tbody>
              {regs.map((r, i) => (
                <tr key={r.id}><td>{i + 1}</td><td><b>{r.username}</b></td><td style={{ fontSize: 13 }}>{r.email}</td>
                  <td><span className={`pill ${r.status === 'CHECKED_IN' ? 'pill-green' : 'pill-yellow'}`}>{r.status === 'CHECKED_IN' ? '✓ Đã check-in' : 'Chờ check-in'}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--mid)' }}>{r.registeredAt ? new Date(r.registeredAt).toLocaleString('vi-VN') : '-'}</td>
                  <td style={{ fontSize: 12, color: 'var(--mid)' }}>{r.checkedInAt ? new Date(r.checkedInAt).toLocaleString('vi-VN') : '-'}</td>
                </tr>
              ))}
              {!loading && regs.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--mid)', padding: 32 }}>Chưa có đăng ký</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SystemPage({ toast }: { toast: (m: string, t?: 'success' | 'error' | 'info') => void }) {
  return (
    <div className="page-content">
      <div className="page-header"><h1>⚙️ Cài đặt hệ thống</h1><p>Cấu hình, backup, logs và các công cụ quản trị</p></div>
      <div className="two-col">
        <div className="card"><div className="card-header"><h3>🔧 Công cụ hệ thống</h3></div><div className="card-body">
          {[{ icon: '📤', label: 'Sao lưu database', desc: 'Xuất toàn bộ dữ liệu ra file SQL' }, { icon: '🔄', label: 'Đồng bộ SIS', desc: 'Cập nhật danh sách sinh viên' }, { icon: '📋', label: 'Xem log', desc: 'Xem lịch sử đăng nhập và thao tác' }, { icon: '📧', label: 'Cấu hình Email', desc: 'Cài đặt gửi email thông báo' }, { icon: '🔑', label: 'JWT Secret', desc: 'Xoay vòng khóa bảo mật' }].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 24 }}>{item.icon}</span><div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{item.label}</div><div style={{ fontSize: 12, color: 'var(--mid)' }}>{item.desc}</div></div>
              <button className="btn btn-sm" onClick={() => toast(`${item.label} (demo)`, 'info')}>Thực hiện</button>
            </div>
          ))}
        </div></div>
        <div className="card"><div className="card-header"><h3>📊 Tài nguyên hệ thống</h3></div><div className="card-body">
          {[{ label: 'CPU Usage', val: 23, color: 'var(--blue)' }, { label: 'RAM Usage', val: 41, color: 'var(--purple)' }, { label: 'Disk Usage', val: 34, color: 'var(--gold)' }, { label: 'DB Connections', val: 12, color: 'var(--green)' }].map(r => (
            <div key={r.label} style={{ marginBottom: 18 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}><span style={{ fontWeight: 600 }}>{r.label}</span><span style={{ color: r.color, fontWeight: 700 }}>{r.val}%</span></div><div className="prog-wrap"><div className="prog" style={{ width: `${r.val}%`, background: r.color }} /></div></div>
          ))}
        </div></div>
      </div>
    </div>
  );
}

export default function SuperAdminApp() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [page, setPage] = useState<Page>('dashboard');
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const toast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now(); setToasts(prev => [...prev, { msg, type, id }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  const logout = () => { tokenStorage.clearTokens(); setUser(null); };
  if (!user) return <><LoginPage onLogin={setUser} /><Toast toasts={toasts} /></>;
  const PAGE_MAP: Record<Page, React.ReactNode> = { dashboard: <DashboardPage toast={toast} />, users: <UsersPage toast={toast} />, events: <EventsPage toast={toast} />, registrations: <RegistrationsPage toast={toast} />, system: <SystemPage toast={toast} /> };
  const PAGE_TITLES: Record<Page, string> = { dashboard: 'Tổng quan', users: 'Người dùng', events: 'Sự kiện', registrations: 'Đăng ký & Check-in', system: 'Hệ thống' };
  return (
    <><Sidebar page={page} setPage={setPage} user={user} onLogout={logout} />
      <div className="sa-main">
        <div className="topbar">
          <div><div className="topbar-title">{PAGE_TITLES[page]}</div><div className="topbar-sub">Super Admin Panel – VLU Rèn Luyện</div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}><span className="badge-online">● API Online</span><div style={{ fontSize: 13, color: 'var(--mid)' }}>🛡️ {user.username}</div></div>
        </div>
        {PAGE_MAP[page]}
      </div>
      <Toast toasts={toasts} /></>
  );
}
