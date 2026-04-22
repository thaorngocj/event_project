'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { AuthUser } from '../../hooks/useAuth';
import { api } from '../../lib/apiClient';

interface Props { user: AuthUser; onHome: () => void; onLogout: () => void; onToast: (m: string, t?: 'success'|'error'|'info') => void; }
interface RegItem { id: number; username: string; email: string; status: string; registeredAt: string; checkedInAt?: string; }
interface EvOption { id: number; title: string; }

export default function ManagerDash({ user, onHome, onLogout, onToast }: Props) {
  const [events, setEvents]    = useState<EvOption[]>([]);
  const [selEv,  setSelEv]     = useState<number | null>(null);
  const [regs,   setRegs]      = useState<RegItem[]>([]);
  const [scanVal, setScanVal]  = useState('');
  const [scanResult, setScanResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [loading, setLoading]  = useState(false);

  useEffect(() => {
    api.get<any[]>('/events', false).then(data => {
      setEvents(data.map((e: any) => ({ id: e.id, title: e.title })));
      if (data.length) setSelEv(data[0].id);
    }).catch(() => {});
  }, []);

  const loadRegs = useCallback(async () => {
    if (!selEv) return;
    setLoading(true);
    try { setRegs(await api.get<RegItem[]>(`/registrations/events/${selEv}/list`)); }
    catch { onToast('Không tải được danh sách', 'error'); }
    finally { setLoading(false); }
  }, [selEv]);

  useEffect(() => { loadRegs(); }, [loadRegs]);

  const doCheckIn = async () => {
    const v = scanVal.trim();
    if (!v || !selEv) return;
    // Tìm registration theo email hoặc username
    const found = regs.find(r => r.email === v || r.username === v || r.email.split('@')[0] === v);
    if (!found) { setScanResult({ ok:false, msg:`❌ Không tìm thấy: ${v}` }); setScanVal(''); setTimeout(()=>setScanResult(null),3000); return; }
    if (found.status === 'CHECKED_IN') { setScanResult({ ok:false, msg:`⚠️ ${found.username} – Đã check-in rồi!` }); setScanVal(''); setTimeout(()=>setScanResult(null),3000); return; }
    // Dùng QR data từ registration
    try {
      const qrData = JSON.stringify({ registrationId: found.id, userId: found.id, eventId: selEv });
      await api.post(`/registrations/events/${selEv}/checkin`, { qrData });
      setScanResult({ ok:true, msg:`✅ ${found.username} – Check-in thành công!` });
      onToast(`✅ Check-in: ${found.username}`, 'success');
      loadRegs();
    } catch (e: unknown) {
      setScanResult({ ok:false, msg:`❌ ${e instanceof Error ? e.message : 'Lỗi checkin'}` });
    }
    setScanVal(''); setTimeout(()=>setScanResult(null),3000);
  };

  const checked = regs.filter(r => r.status === 'CHECKED_IN').length;
  const pending  = regs.filter(r => r.status !== 'CHECKED_IN').length;

  return (
    <div className="dash" style={{ paddingTop: 0 }}>
      <div className="dash-hdr"><div className="dash-hi">
        <div><div className="dash-ttl">👥 Ban Tổ Chức</div><div className="dash-st">{user.name} · Event Manager</div></div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="ab" onClick={onHome}>← Trang chủ</button>
          <button className="ab dan" onClick={onLogout}>Đăng xuất</button>
        </div>
      </div></div>

      <div className="dash-body">
        {/* Chọn sự kiện */}
        <div className="dcard" style={{ padding:16, marginBottom:20 }}>
          <label className="flbl">📅 Chọn sự kiện để quản lý:</label>
          <select className="fin" style={{ marginTop:6, maxWidth:500 }} value={selEv??''} onChange={e => setSelEv(Number(e.target.value))}>
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
          </select>
        </div>

        <div className="kgrid">
          <div className="kcard"><div className="klbl">Tổng đăng ký</div><div className="kval" style={{ color:'#C8102E' }}>{regs.length}</div></div>
          <div className="kcard"><div className="klbl">Đã check-in</div><div className="kval">{checked}</div></div>
          <div className="kcard"><div className="klbl">Chờ check-in</div><div className="kval" style={{ color:'#E8A020' }}>{pending}</div></div>
          <div className="kcard"><div className="klbl">Tỷ lệ</div><div className="kval" style={{ fontSize:18 }}>{regs.length > 0 ? Math.round((checked/regs.length)*100) : 0}%</div></div>
        </div>

        {/* Check-in zone */}
        <div className="scan-zone">
          <div className="scan-ic">📷</div>
          <div className="scan-t">Check-in sinh viên</div>
          <div className="scan-d">Nhập username hoặc email để check-in</div>
          <div className="scan-row">
            <input className="scan-in" placeholder="Nhập username (sv01) hoặc email..." value={scanVal} onChange={e => setScanVal(e.target.value)} onKeyDown={e => e.key==='Enter' && doCheckIn()} />
            <button className="bsc" onClick={doCheckIn}>✓ Check-in</button>
          </div>
          {scanResult && <div style={{ marginTop:12, fontSize:14, fontWeight:700, color:scanResult.ok?'#DCFCE7':'#FCA5A5' }}>{scanResult.msg}</div>}
        </div>

        {/* Danh sách */}
        <div className="dcard">
          <div className="dcard-h">
            <h3>Danh sách đăng ký ({regs.length}) {loading && '...'}</h3>
            <button className="ab" onClick={loadRegs}>🔄</button>
          </div>
          <table className="dt">
            <thead><tr><th>Username</th><th>Email</th><th>Trạng thái</th><th>Đăng ký lúc</th><th>Check-in lúc</th></tr></thead>
            <tbody>
              {regs.map(r => (
                <tr key={r.id}>
                  <td><b>{r.username}</b></td>
                  <td style={{ fontSize:13 }}>{r.email}</td>
                  <td>{r.status==='CHECKED_IN' ? <span className="pill pc">✓ Check-in</span> : <span className="pill ps">Chờ</span>}</td>
                  <td style={{ fontSize:12, color:'#6B7280' }}>{r.registeredAt ? new Date(r.registeredAt).toLocaleString('vi-VN') : '-'}</td>
                  <td style={{ fontSize:12, color:'#6B7280' }}>{r.checkedInAt ? new Date(r.checkedInAt).toLocaleString('vi-VN') : '-'}</td>
                </tr>
              ))}
              {!loading && regs.length===0 && <tr><td colSpan={5} style={{ textAlign:'center', color:'#6B7280', padding:24 }}>Chưa có đăng ký</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
