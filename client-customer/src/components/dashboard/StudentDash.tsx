'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { AuthUser } from '../../hooks/useAuth';
import { api } from '../../lib/apiClient';

interface Props { user: AuthUser; onHome: () => void; onLogout: () => void; onToast: (m: string, t?: 'success'|'error'|'info') => void; }
interface MyReg { id: number; eventId: number; eventTitle: string; eventDate: string; status: string; qrCode?: string; }
interface AvailEv { id: number; title: string; date: string; time: string; loc: string; }

export default function StudentDash({ user, onHome, onLogout, onToast }: Props) {
  const init = user.name?.[0]?.toUpperCase() ?? '?';
  const [myRegs, setMyRegs] = useState<MyReg[]>([]);
  const [avail,  setAvail]  = useState<AvailEv[]>([]);
  const [qrData, setQrData] = useState<{ name: string; code: string } | null>(null);
  const [regBusy, setRegBusy] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [regs, events] = await Promise.all([
        api.get<any[]>('/registrations/my-events'),
        api.get<any[]>('/events', false),
      ]);
      const pad = (n: number) => String(n).padStart(2, '0');
      const fmt = (iso: string) => { const d = new Date(iso); return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`; };
      setMyRegs(regs.map((r: any) => ({ id: r.id, eventId: r.eventId, eventTitle: r.eventTitle || 'Sự kiện', eventDate: r.eventDate ? fmt(r.eventDate) : '--', status: r.status, qrCode: r.qrCode })));
      const regIds = new Set(regs.map((r: any) => r.eventId));
      setAvail(events.filter((e: any) => e.status === 'OPEN' && !regIds.has(e.id)).map((e: any) => {
        const d = new Date(e.startDate);
        return { id: e.id, title: e.title, date: fmt(e.startDate), time: `${pad(d.getHours())}:${pad(d.getMinutes())}`, loc: e.location };
      }));
    } catch { onToast('Không tải được dữ liệu', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRegister = async (evId: number, title: string) => {
    setRegBusy(evId);
    try { await api.post(`/registrations/events/${evId}/register`, {}); onToast(`✅ Đã đăng ký: ${title}`, 'success'); load(); }
    catch (e: unknown) { onToast(e instanceof Error ? e.message : 'Lỗi', 'error'); }
    finally { setRegBusy(null); }
  };

  const checkedIn = myRegs.filter(r => r.status === 'CHECKED_IN').length;
  const pending   = myRegs.filter(r => r.status === 'REGISTERED').length;

  return (
    <div className="dash" style={{ paddingTop: 0 }}>
      <div className="dash-hdr"><div className="dash-hi">
        <div><div className="dash-ttl">👋 Chào, {user.name}!</div><div className="dash-st">{user.email} · Sinh viên</div></div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="ab" onClick={onHome}>← Trang chủ</button>
          <button className="ab dan" onClick={onLogout}>Đăng xuất</button>
        </div>
      </div></div>

      <div className="dash-body">
        <div className="pcard">
          <div className="pav" style={{ position:'relative', zIndex:1 }}>{init}</div>
          <div className="pn">{user.name}</div>
          <div className="pi">{user.email}</div>
          <div className="pst">
            <div><div className="pst-n">{myRegs.length}</div><div className="pst-l">Đã đăng ký</div></div>
            <div><div className="pst-n">{checkedIn}</div><div className="pst-l">Đã tham gia</div></div>
            <div><div className="pst-n">{pending}</div><div className="pst-l">Chờ check-in</div></div>
            <div><div className="pst-n" style={{ fontSize:16, marginTop:3 }}>Tốt</div><div className="pst-l">Xếp loại</div></div>
          </div>
        </div>

        <div className="kgrid">
          <div className="kcard"><div className="klbl">Đã đăng ký</div><div className="kval" style={{ color:'#C8102E' }}>{myRegs.length}</div></div>
          <div className="kcard"><div className="klbl">Đã tham gia</div><div className="kval">{checkedIn}</div></div>
          <div className="kcard"><div className="klbl">Chờ check-in</div><div className="kval" style={{ color:'#E8A020' }}>{pending}</div></div>
          <div className="kcard"><div className="klbl">Sẵn đăng ký</div><div className="kval" style={{ color:'#2563EB' }}>{avail.length}</div></div>
        </div>

        {loading && <div style={{ textAlign:'center', padding:32, color:'#6B7280' }}>⏳ Đang tải...</div>}
        {!loading && (
          <div className="two">
            <div>
              <div className="dttl">📋 Sự kiện đã đăng ký</div>
              <div className="dcard">
                <table className="dt">
                  <thead><tr><th>Sự kiện</th><th>Ngày</th><th>Trạng thái</th><th>QR</th></tr></thead>
                  <tbody>
                    {myRegs.length === 0 && <tr><td colSpan={4} style={{ textAlign:'center', color:'#6B7280', padding:20 }}>Chưa đăng ký sự kiện nào</td></tr>}
                    {myRegs.map(r => (
                      <tr key={r.id}>
                        <td><b>{r.eventTitle}</b></td>
                        <td style={{ fontSize:12 }}>{r.eventDate}</td>
                        <td>{r.status === 'CHECKED_IN' ? <span className="pill pc">✓ Check-in</span> : <span className="pill ps">Chờ</span>}</td>
                        <td>{r.qrCode && r.status !== 'CHECKED_IN' && (
                          <button className="ab pri" style={{ padding:'4px 10px', fontSize:11 }} onClick={() => setQrData({ name: r.eventTitle, code: r.qrCode! })}>📱 QR</button>
                        )}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <div className="dttl">🎯 Sự kiện đang mở – Đăng ký ngay</div>
              <div className="dcard">
                <table className="dt">
                  <thead><tr><th>Sự kiện</th><th>Ngày</th><th>Địa điểm</th><th></th></tr></thead>
                  <tbody>
                    {avail.length === 0 && <tr><td colSpan={4} style={{ textAlign:'center', color:'#6B7280', padding:20 }}>Không có sự kiện mới</td></tr>}
                    {avail.map(ev => (
                      <tr key={ev.id}>
                        <td><b>{ev.title}</b><br /><small style={{ color:'#6B7280' }}>{ev.time}</small></td>
                        <td style={{ fontSize:12 }}>{ev.date}</td>
                        <td style={{ fontSize:12, color:'#6B7280' }}>{ev.loc}</td>
                        <td><button className="ab pri" style={{ padding:'5px 12px', fontSize:12 }} disabled={regBusy===ev.id} onClick={() => handleRegister(ev.id, ev.title)}>{regBusy===ev.id?'...':'Đăng ký'}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {qrData && (
        <div className="moverlay show" onClick={e => { if ((e.target as HTMLElement).classList.contains('moverlay')) setQrData(null); }}>
          <div className="modal" style={{ textAlign:'center', maxWidth:340 }}>
            <button className="mclose" onClick={() => setQrData(null)}>✕</button>
            <h3 style={{ fontSize:17, fontWeight:800, marginBottom:4 }}>{qrData.name}</h3>
            <p style={{ fontSize:13, color:'#6B7280', marginBottom:18 }}>Xuất trình QR này tại sự kiện</p>
            <div className="qr-box">{qrData.code.startsWith('data:image') ? <img src={qrData.code} alt="QR" style={{ width:200, height:200 }} /> : <span>📱</span>}</div>
            <div className="qr-info"><b>{user.name}</b><br />{user.email}</div>
            <button className="ab pri" style={{ width:'100%', marginTop:16 }} onClick={() => setQrData(null)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
