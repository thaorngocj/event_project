'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../../lib/apiClient';

// Static slides mặc định khi chưa có sự kiện HERO từ DB
const DEFAULT_SLIDES = [
  { id:0, bg:'linear-gradient(135deg,#8B0000 0%,#C8102E 40%,#1a0a0e 100%)', label:'SỰ KIỆN NỔI BẬT', title:'CHÀO MỪNG KỶ NIỆM\n30/04 & 01/05', sub:'Kỷ niệm 50 năm Ngày Giải Phóng Miền Nam & Quốc Tế Lao Động', emoji:'🎖️', date:'30/04 – 01/05/2026', loc:'Hội trường Trịnh Công Sơn', imageUrl:undefined as string|undefined },
  { id:0, bg:'linear-gradient(135deg,#0a1628 0%,#1a3a6b 40%,#C8102E 100%)', label:'HIẾN MÁU NHÂN ĐẠO', title:'VLU RED CONNECTION\nĐỢT 2 & 3', sub:'Hiến máu tình nguyện – Kết nối yêu thương trong cộng đồng Văn Lang', emoji:'❤️', date:'27 & 30/05/2026', loc:'Cơ sở Chính – CS3', imageUrl:undefined as string|undefined },
  { id:0, bg:'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)', label:'SẮP DIỄN RA', title:'HỘI THAO SINH VIÊN\nVĂN LANG 2026', sub:'Đỉnh cao thể thao – Bùng cháy tinh thần – Kết nối cộng đồng sinh viên', emoji:'⚽', date:'17/04/2026', loc:'Toà J, CS3', imageUrl:undefined as string|undefined },
  { id:0, bg:'linear-gradient(135deg,#0d2818 0%,#1a5c38 50%,#0d2818 100%)', label:'HỘI NGHỊ', title:'CAREER DAY 2026\nUNLOCK YOUR FUTURE', sub:'Cơ hội gặp gỡ 50+ doanh nghiệp hàng đầu – Ngành Khách sạn & Du lịch', emoji:'💼', date:'08/04/2026', loc:'Toà J, CS3 – J.03.03', imageUrl:undefined as string|undefined },
];

const GRAD_LIST = [
  'linear-gradient(135deg,#8B0000,#C8102E,#1a0a0e)',
  'linear-gradient(135deg,#0a1628,#1a3a6b,#C8102E)',
  'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)',
  'linear-gradient(135deg,#0d2818,#1a5c38,#0d2818)',
  'linear-gradient(135deg,#1a0a00,#5c3a1a,#c87020)',
  'linear-gradient(135deg,#1a001a,#3a1a5c,#7020c8)',
];

const FEAT_COLORS = ['#C8102E','#27AE60','#E8A020','#2563EB','#7C3AED','#0891B2'];
const FEAT_EMOJIS = ['💼','🌏','🔥','🔬','🎓','⚽','🎨','🎭','❤️'];

interface Slide { id: number; bg: string; label: string; title: string; sub: string; emoji: string; date: string; loc: string; imageUrl?: string; }
interface FeatItem { id: number; title: string; color: string; emoji: string; imageUrl?: string; }

export default function HeroCarousel({ onLogin, user }: { onLogin: () => void; user: any }) {
  const [current, setCurrent]   = useState(0);
  const [featIdx, setFeatIdx]   = useState(0);
  const [slides, setSlides]     = useState<Slide[]>(DEFAULT_SLIDES);
  const [featured, setFeatured] = useState<FeatItem[]>([]);
  const heroTimer = useRef<ReturnType<typeof setInterval>>();
  const featTimer = useRef<ReturnType<typeof setInterval>>();

  // Load events từ API theo category
  useEffect(() => {
    api.get<any[]>('/events', false).then(events => {
      const pad = (n: number) => String(n).padStart(2,'0');
      const fmtDate = (iso: string) => { const d = new Date(iso); return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`; };

      // HERO slides từ DB
      const heroEvs = events.filter(e => e.category === 'HERO');
      if (heroEvs.length > 0) {
        setSlides(heroEvs.map((e, i) => ({
          id:       e.id,
          bg:       GRAD_LIST[i % GRAD_LIST.length],
          label:    e.status === 'OPEN' ? 'ĐANG MỞ ĐĂNG KÝ' : 'SẮP DIỄN RA',
          title:    e.title.toUpperCase(),
          sub:      e.description || e.title,
          emoji:    FEAT_EMOJIS[i % FEAT_EMOJIS.length],
          date:     fmtDate(e.startDate),
          loc:      e.location,
          imageUrl: e.imageUrl,
        })));
      }

      // FEATURED section
      const featEvs = events.filter(e => e.category === 'FEATURED');
      if (featEvs.length > 0) {
        setFeatured(featEvs.map((e, i) => ({
          id:       e.id,
          title:    e.title,
          color:    FEAT_COLORS[i % FEAT_COLORS.length],
          emoji:    FEAT_EMOJIS[i % FEAT_EMOJIS.length],
          imageUrl: e.imageUrl,
        })));
      }
    }).catch(() => {});
  }, []);

  const nextSlide   = useCallback(() => setCurrent(p => (p + 1) % slides.length), [slides.length]);
  const prevSlide   = useCallback(() => setCurrent(p => (p - 1 + slides.length) % slides.length), [slides.length]);
  const nextFeat    = useCallback(() => setFeatIdx(p => (p + 1) % Math.max(1, featured.length - 3)), [featured.length]);
  const prevFeat    = useCallback(() => setFeatIdx(p => (p - 1 + Math.max(1, featured.length - 3)) % Math.max(1, featured.length - 3)), [featured.length]);

  useEffect(() => { heroTimer.current = setInterval(nextSlide, 4500); return () => clearInterval(heroTimer.current); }, [nextSlide]);
  useEffect(() => { if (featured.length > 4) { featTimer.current = setInterval(nextFeat, 3000); return () => clearInterval(featTimer.current); } }, [nextFeat, featured.length]);

  const sl = slides[current];
  const titleLines = sl.title.split('\n');

  // FEATURED data (static nếu DB trống)
  const DEFAULT_FEAT: FeatItem[] = [
    { id:0, title:'Chuỗi hoạt động Career Boot Camp',                color:'#C8102E', emoji:'💼' },
    { id:0, title:'Explore The Culture 6 – Kết nối cùng sinh viên', color:'#27AE60', emoji:'🌏' },
    { id:0, title:'Diễn tập phương án phòng cháy chữa cháy',         color:'#E8A020', emoji:'🔥' },
    { id:0, title:'Cuộc thi Tìm Hiểu Các Môn Khoa Học Đại Cương',  color:'#2563EB', emoji:'🔬' },
  ];
  const featData = featured.length > 0 ? featured : DEFAULT_FEAT;
  const visibleFeat = featData.slice(featIdx, featIdx + 4);
  if (visibleFeat.length < 4) visibleFeat.push(...featData.slice(0, 4 - visibleFeat.length));

  return (
    <>
      {/* ── HERO SECTION ───────────────────────── */}
      <section style={{ background:'#0a0a0a', padding:'32px 0 40px', overflow:'hidden' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 2rem' }}>
          {/* Title */}
          <div style={{ textAlign:'center', marginBottom:24 }}>
            <h1 style={{ fontSize:'clamp(22px,3.5vw,40px)', fontWeight:900, color:'white' }}>
              Danh Mục <span style={{ color:'#C8102E' }}>Sự Kiện</span>
            </h1>
            <div style={{ width:32, height:3, background:'#C8102E', margin:'10px auto 12px', borderRadius:2 }} />
            <p style={{ color:'rgba(255,255,255,.5)', fontSize:14 }}>Hãy đến với trường đại học Văn Lang để tận hưởng những giây phút vui vẻ nhất!</p>
          </div>

          {/* Carousel */}
          <div style={{ position:'relative', display:'flex', alignItems:'center', gap:16 }}>
            <button onClick={prevSlide} style={{ width:36, height:36, borderRadius:'50%', background:'#C8102E', border:'none', color:'white', fontSize:16, cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>‹</button>

            <div style={{ flex:1, display:'grid', gridTemplateColumns:'clamp(100px,25%,1fr) clamp(200px,50%,1.6fr) clamp(100px,25%,1fr)', gap:12, overflow:'hidden' }}>
              {[-1, 0, 1].map(offset => {
                const idx = (current + offset + slides.length) % slides.length;
                const s   = slides[idx];
                const isCenter = offset === 0;
                return (
                  <div key={idx} style={{ borderRadius:12, overflow:'hidden', position:'relative', height: isCenter ? 200 : 160, alignSelf:'center', transition:'all .4s', opacity: isCenter ? 1 : 0.6, transform: isCenter ? 'scale(1)' : 'scale(0.95)', cursor:'pointer', background: s.bg }}>
                    {s.imageUrl && <img src={s.imageUrl} alt={s.title} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:.45 }} onError={e=>{(e.target as HTMLImageElement).style.display='none';}} />}
                    <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.25)' }} />
                    {isCenter && s.label && (
                      <div style={{ position:'absolute', top:10, right:10, background:'#C8102E', color:'white', fontSize:10, fontWeight:800, padding:'3px 10px', borderRadius:100, letterSpacing:'.05em', zIndex:2 }}>{s.label}</div>
                    )}
                    <div style={{ position:'absolute', bottom:0, left:0, right:0, padding: isCenter ? '16px 18px' : '12px 14px', zIndex:2 }}>
                      {isCenter && <div style={{ fontSize:28, marginBottom:8, filter:'drop-shadow(0 2px 4px rgba(0,0,0,.5))' }}>{s.emoji}</div>}
                      <div style={{ fontSize: isCenter ? 15 : 12, fontWeight:800, color:'white', lineHeight:1.3, textTransform:'uppercase', letterSpacing:'.04em' }}>
                        {isCenter ? titleLines.map((l,i) => <div key={i}>{l}</div>) : s.title.split('\n')[0]}
                      </div>
                      {isCenter && (
                        <div style={{ marginTop:8, display:'flex', gap:12, flexWrap:'wrap' }}>
                          <span style={{ fontSize:11, color:'rgba(255,255,255,.75)' }}>📅 {s.date}</span>
                          <span style={{ fontSize:11, color:'rgba(255,255,255,.75)' }}>📍 {s.loc}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={nextSlide} style={{ width:36, height:36, borderRadius:'50%', background:'#C8102E', border:'none', color:'white', fontSize:16, cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>›</button>
          </div>

          {/* Dots */}
          <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:16 }}>
            {slides.map((_,i) => (
              <button key={i} onClick={() => setCurrent(i)} style={{ width: i===current ? 20 : 8, height:8, borderRadius:100, border:'none', background: i===current ? '#C8102E' : 'rgba(255,255,255,.3)', cursor:'pointer', transition:'all .3s', padding:0 }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED / ĐỀ XUẤT ─────────────────── */}
      <section style={{ background:'#F5F5F5', padding:'44px 0' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 2rem' }}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <h2 style={{ fontSize:'clamp(20px,2.5vw,32px)', fontWeight:900, color:'#0D0D0D' }}>
              Sự Kiện <span style={{ color:'#C8102E' }}>Đề Xuất</span>
            </h2>
            <div style={{ width:32, height:3, background:'#C8102E', margin:'8px auto 10px', borderRadius:2 }} />
            <p style={{ color:'#888', fontSize:13 }}>Các sự kiện hay cần xem</p>
          </div>

          <div style={{ position:'relative', display:'flex', alignItems:'center', gap:12 }}>
            {featData.length > 4 && (
              <button onClick={prevFeat} style={{ width:32, height:32, borderRadius:'50%', background:'#C8102E', border:'none', color:'white', fontSize:16, cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>‹</button>
            )}
            <div style={{ flex:1, display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:12 }}>
              {visibleFeat.map((item, i) => (
                <div key={`${item.id}-${i}`} style={{ borderRadius:10, overflow:'hidden', cursor:'pointer', position:'relative', height:120, background:item.imageUrl ? '#000' : item.color, transition:'transform .2s' }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-4px)';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='';}}
                >
                  {item.imageUrl && <img src={item.imageUrl} alt={item.title} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:.55 }} onError={e=>{(e.target as HTMLImageElement).style.display='none';}} />}
                  <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.2)' }} />
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'10px 12px', zIndex:2 }}>
                    <div style={{ fontSize:11, fontWeight:800, color:'white', textTransform:'uppercase', letterSpacing:'.04em', lineHeight:1.3 }}>
                      {item.title.length > 40 ? item.title.slice(0,40)+'...' : item.title}
                    </div>
                  </div>
                  <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-70%)', fontSize:28, zIndex:1 }}>{item.emoji}</div>
                </div>
              ))}
            </div>
            {featData.length > 4 && (
              <button onClick={nextFeat} style={{ width:32, height:32, borderRadius:'50%', background:'#C8102E', border:'none', color:'white', fontSize:16, cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>›</button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
