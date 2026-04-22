'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { AuthUser } from '../../hooks/useAuth';
import { api } from '../../lib/apiClient';

interface Props { user: AuthUser; onHome: () => void; onLogout: () => void; onToast: (m: string, t?: 'success'|'error'|'info') => void; }
interface Event { id: number; title: string; description: string; startDate: string; location: string; status: string; maxParticipants: number; imageUrl?: string; category?: string; }
type EForm = { title: string; description: string; startDate: string; endDate: string; location: string; maxParticipants: string; status: string; imageUrl: string; category: string; };
const EMPTY: EForm = { title:'', description:'', startDate:'', endDate:'', location:'', maxParticipants:'200', status:'UPCOMING', imageUrl:'', category:'NORMAL' };

export default function AdminDash({ user, onHome, onLogout, onToast }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<EForm>(EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    try { setEvents(await api.get<Event[]>('/events', false)); }
    catch { onToast('Không tải được sự kiện', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditId(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (ev: Event) => {
    const toLocal = (iso: string) => { if (!iso) return ''; const d = new Date(iso); const p = (n: number) => String(n).padStart(2,'0'); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };
    setEditId(ev.id);
    setForm({ title:ev.title, description:ev.description||'', startDate:toLocal(ev.startDate), endDate:toLocal(ev.startDate), location:ev.location, maxParticipants:String(ev.maxParticipants||200), status:ev.status, imageUrl:ev.imageUrl||'', category:(ev as any).category||'NORMAL' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.startDate) { onToast('Nhập đầy đủ thông tin', 'error'); return; }
    const payload = { title:form.title, description:form.description||form.title, startDate:new Date(form.startDate).toISOString(), endDate:new Date(form.endDate||form.startDate).toISOString(), location:form.location||'TBD', maxParticipants:parseInt(form.maxParticipants)||200, status:form.status, imageUrl:form.imageUrl||undefined, category:form.category };
    try {
      if (editId !== null) { await api.patch(`/events/${editId}`, payload); onToast(`✅ Đã cập nhật: ${form.title}`, 'success'); }
      else { await api.post('/events', payload); onToast(`✅ Đã tạo: ${form.title}`, 'success'); }
      setShowForm(false); setForm(EMPTY); setEditId(null); load();
    } catch (e: unknown) { onToast(e instanceof Error ? e.message : 'Lỗi', 'error'); }
  };

  const handleStatus = async (id: number, status: string) => {
    try { await api.patch(`/events/${id}`, { status }); onToast('Đã cập nhật', 'success'); load(); }
    catch (e: unknown) { onToast(e instanceof Error ? e.message : 'Lỗi', 'error'); }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Xóa sự kiện "${title}"?`)) return;
    try { await api.delete(`/events/${id}`); onToast(`Đã xóa: ${title}`, 'info'); load(); }
    catch (e: unknown) { onToast(e instanceof Error ? e.message : 'Lỗi', 'error'); }
  };

  const STATUS = { UPCOMING:{ cls:'ps', label:'Sắp diễn ra' }, OPEN:{ cls:'po', label:'Đang mở' }, CLOSED:{ cls:'pe', label:'Đã đóng' } } as const;
  const open = events.filter(e => e.status === 'OPEN').length;
  const soon = events.filter(e => e.status === 'UPCOMING').length;
  const ended = events.filter(e => e.status === 'CLOSED').length;

  return (
    <div className="dash" style={{ paddingTop: 0 }}>
      <div className="dash-hdr"><div className="dash-hi">
        <div><div className="dash-ttl">⚙️ Quản lý Sự Kiện</div><div className="dash-st">{user.name} · Admin</div></div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="ab" onClick={onHome}>← Trang chủ</button>
          <button className="ab dan" onClick={onLogout}>Đăng xuất</button>
        </div>
      </div></div>

      <div className="dash-body">
        <div className="kgrid">
          <div className="kcard"><div className="klbl">Tổng sự kiện</div><div className="kval" style={{ color:'#C8102E' }}>{events.length}</div></div>
          <div className="kcard"><div className="klbl">Đang mở</div><div className="kval">{open}</div></div>
          <div className="kcard"><div className="klbl">Sắp diễn ra</div><div className="kval" style={{ color:'#E8A020' }}>{soon}</div></div>
          <div className="kcard"><div className="klbl">Đã đóng</div><div className="kval" style={{ color:'#6B7280' }}>{ended}</div></div>
        </div>

        {showForm && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', backdropFilter:'blur(4px)', zIndex:400, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'white', borderRadius:20, padding:0, width:580, maxWidth:'100%', maxHeight:'calc(100vh - 40px)', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 24px 60px rgba(0,0,0,.25)' }}>
            {/* Modal header */}
            <div style={{ padding:'20px 28px', borderBottom:'1px solid #F3F4F6', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:editId?'#EFF6FF':'#FFF5F5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{editId?'✏️':'📅'}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:17, fontWeight:800, color:'#111' }}>{editId !== null ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}</div>
                <div style={{ fontSize:12, color:'#6B7280' }}>{editId !== null ? 'Cập nhật thông tin sự kiện' : 'Điền đầy đủ thông tin bên dưới'}</div>
              </div>
              <button onClick={() => { setShowForm(false); setEditId(null); }} style={{ width:30, height:30, borderRadius:'50%', background:'#F3F4F6', border:'none', cursor:'pointer', fontSize:14 }}>✕</button>
            </div>
            {/* Modal body scrollable */}
            <div style={{ flex:1, overflowY:'auto', padding:'20px 28px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="flbl">📌 Tên sự kiện *</label>
                <input className="fin" value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} placeholder="VD: Career Day VLU 2026..." style={{ fontSize:15, fontWeight:600 }} />
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="flbl">📝 Mô tả sự kiện</label>
                <textarea value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} placeholder="Nhập mô tả chi tiết về sự kiện..." style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #E5E7EB', borderRadius:8, fontSize:14, fontFamily:'inherit', outline:'none', resize:'vertical', minHeight:72, lineHeight:1.6 }} />
              </div>
              <div><label className="flbl">📅 Ngày bắt đầu *</label><input className="fin" type="datetime-local" value={form.startDate} onChange={e => setForm(p=>({...p,startDate:e.target.value}))} /></div>
              <div><label className="flbl">📅 Ngày kết thúc</label><input className="fin" type="datetime-local" value={form.endDate} onChange={e => setForm(p=>({...p,endDate:e.target.value}))} /></div>
              <div><label className="flbl">📍 Địa điểm</label><input className="fin" value={form.location} onChange={e => setForm(p=>({...p,location:e.target.value}))} placeholder="VD: Toà J - CS3" /></div>
              <div><label className="flbl">👥 Số lượng tối đa</label><input className="fin" type="number" value={form.maxParticipants} onChange={e => setForm(p=>({...p,maxParticipants:e.target.value}))} /></div>
              <div><label className="flbl">🔖 Trạng thái</label>
                <select className="fin" value={form.status} onChange={e => setForm(p=>({...p,status:e.target.value}))}>
                  <option value="UPCOMING">⏳ Sắp diễn ra</option>
                  <option value="OPEN">✅ Mở đăng ký</option>
                  <option value="CLOSED">🔒 Đã đóng</option>
                </select>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="flbl">📂 Danh mục hiển thị</label>
                <div style={{ display:'flex', gap:12, marginTop:8, flexWrap:'wrap' }}>
                  {[
                    { value:'HERO',      icon:'🎠', label:'Hero Carousel',    desc:'Hiện trên banner trang chủ' },
                    { value:'FEATURED',  icon:'⭐', label:'Sự kiện đề xuất',  desc:'Hiện trong mục Đề Xuất' },
                    { value:'HIGHLIGHT', icon:'🌟', label:'Sự kiện nổi bật',  desc:'Hiện trong mục Nổi Bật' },
                    { value:'NORMAL',    icon:'📋', label:'Thường',            desc:'Chỉ hiện trong danh sách' },
                  ].map(cat => (
                    <label key={cat.value} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 14px', borderRadius:10, border:`2px solid ${form.category===cat.value?'#C8102E':'#E5E7EB'}`, background:form.category===cat.value?'#FFF5F5':'white', cursor:'pointer', flex:1, minWidth:140 }}>
                      <input type="radio" name="category" value={cat.value} checked={form.category===cat.value} onChange={e=>setForm(p=>({...p,category:e.target.value}))} style={{ marginTop:2 }} />
                      <div>
                        <div style={{ fontSize:13, fontWeight:700 }}>{cat.icon} {cat.label}</div>
                        <div style={{ fontSize:11, color:'#6B7280', marginTop:2 }}>{cat.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div><label className="flbl">🖼️ Ảnh sự kiện</label>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <label style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', background:'#C8102E', color:'white', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'inherit' }}>
                    📁 Chọn tệp
                    <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => {
                      const file = e.target.files?.[0]; if (!file) return;
                      const reader = new FileReader();
                      reader.onload = ev => setForm(p=>({...p,imageUrl:ev.target?.result as string}));
                      reader.readAsDataURL(file);
                    }} />
                  </label>
                  {form.imageUrl && <button style={{ padding:'6px 10px', border:'1.5px solid #FCA5A5', borderRadius:8, color:'#DC2626', background:'white', cursor:'pointer', fontSize:12, fontFamily:'inherit' }} onClick={() => setForm(p=>({...p,imageUrl:''}))}>✕</button>}
                </div>
                {form.imageUrl && <div style={{ marginTop:6, borderRadius:8, overflow:'hidden', height:80 }}><img src={form.imageUrl} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} /></div>}
              </div>
            </div>{/* end grid */}
            </div>{/* end modal body */}
            {/* Modal footer */}
            <div style={{ padding:'16px 28px', borderTop:'1px solid #F3F4F6', display:'flex', gap:10, justifyContent:'flex-end', background:'#FAFAFA' }}>
              <button className="ab" onClick={() => { setShowForm(false); setEditId(null); }}>Hủy</button>
              <button className="ab pri" onClick={handleSave} style={{ padding:'10px 24px' }}>{editId !== null ? '💾 Lưu thay đổi' : '✅ Tạo sự kiện'}</button>
            </div>
          </div>
          </div>
        )}

        <div className="dcard">
          <div className="dcard-h">
            <h3>Danh sách sự kiện ({events.length}) {loading && '...'}</h3>
            <div style={{ display:'flex', gap:8 }}>
              <button className="ab pri" onClick={openCreate}>+ Tạo mới</button>
              <button className="ab" onClick={load}>🔄</button>
            </div>
          </div>
          <table className="dt">
            <thead><tr><th>Sự kiện</th><th>Danh mục</th><th>Ngày</th><th>Địa điểm</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {events.map(ev => {
                const s = STATUS[ev.status as keyof typeof STATUS] || { cls:'pe', label:ev.status };
                return (
                  <tr key={ev.id}>
                    <td><b>{ev.title}</b><br /><small style={{ color:'#6B7280', fontSize:11 }}>{ev.description?.slice(0,50)}</small></td>
                    <td>{(() => {
                      const CAT: Record<string,{icon:string;label:string;color:string}> = {HERO:{icon:'🎠',label:'Hero',color:'#7C3AED'},FEATURED:{icon:'⭐',label:'Đề xuất',color:'#E8A020'},HIGHLIGHT:{icon:'🌟',label:'Nổi bật',color:'#C8102E'},NORMAL:{icon:'📋',label:'Thường',color:'#6B7280'}};
                      const cat = CAT[(ev as any).category||'NORMAL'];
                      return <span style={{fontSize:11,fontWeight:700,color:cat.color}}>{cat.icon} {cat.label}</span>;
                    })()}</td>
                    <td style={{ fontSize:12 }}>{new Date(ev.startDate).toLocaleDateString('vi-VN')}</td>
                    <td style={{ fontSize:12, color:'#6B7280' }}>{ev.location}</td>
                    <td>
                      <select value={ev.status} style={{ padding:'4px 8px', borderRadius:6, border:'1.5px solid #E5E7EB', fontSize:12, fontFamily:'inherit', cursor:'pointer' }} onChange={e => handleStatus(ev.id, e.target.value)}>
                        <option value="UPCOMING">Sắp diễn ra</option>
                        <option value="OPEN">Đang mở</option>
                        <option value="CLOSED">Đã đóng</option>
                      </select>
                    </td>
                    <td style={{ display:'flex', gap:6 }}>
                      <button className="ab" style={{ background:'#3B82F6', color:'white', border:'none', padding:'5px 12px', fontSize:12 }} onClick={() => openEdit(ev)}>✏️ Sửa</button>
                      <button className="ab dan" style={{ padding:'5px 12px', fontSize:12 }} onClick={() => handleDelete(ev.id, ev.title)}>Xóa</button>
                    </td>
                  </tr>
                );
              })}
              {!loading && events.length === 0 && <tr><td colSpan={5} style={{ textAlign:'center', color:'#6B7280', padding:24 }}>Chưa có sự kiện</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
