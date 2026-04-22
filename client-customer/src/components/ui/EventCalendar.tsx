'use client';
import React, { useState } from 'react';

// Category colors matching the screenshot exactly
const CATEGORIES = [
  { key: 'academic',   label: 'Học Thuật – Kỹ năng',  color: '#4A90D9' },
  { key: 'culture',    label: 'Văn Hóa – Văn nghệ',   color: '#F4A7B9' },
  { key: 'sport',      label: 'Thể thao',              color: '#F5A623' },
  { key: 'community',  label: 'Vì Cộng Đồng',         color: '#27AE60' },
  { key: 'national',   label: 'Quốc lễ',               color: '#C8102E' },
  { key: 'school',     label: 'Lễ hội trường',         color: '#E8A020' },
  { key: 'seminar',    label: 'Diễn đàn – Hội thảo',  color: '#1ABC9C' },
];

type Category = typeof CATEGORIES[number]['key'];

interface CalEvent {
  id: number;
  title: string;
  category: Category;
  date: number;   // day of month
  month: number;  // 1-12
  year: number;
  time: string;
  loc: string;
  org: string;
}

const EVENTS_2026: CalEvent[] = [
  // April 2026
  { id:1,  title:'Explore The Culture 6 – Kết nối cùng sinh viên Ngành Khoa học Dược phẩm từ Republic Polytechnic', category:'culture',   date:1,  month:4, year:2026, time:'09:00', loc:'Toà J, CS3', org:'Chương trình Đào tạo Đặc biệt' },
  { id:2,  title:'Hội thao Sinh viên Văn Lang 2026 – Môn Thể thao Điện tử', category:'sport',    date:1,  month:4, year:2026, time:'18:00', loc:'Toà F, CS3', org:'Đoàn – Hội' },
  { id:3,  title:'Panel Discussion – Concierge Excellence',                   category:'seminar',  date:2,  month:4, year:2026, time:'13:30', loc:'Toà J, CS3', org:'Khoa Du lịch' },
  { id:4,  title:'Workshop: Hành trang vững vàng, sẵn sàng thực tập',        category:'academic', date:2,  month:4, year:2026, time:'17:30', loc:'Toà J, CS3', org:'Khoa Kỹ thuật và Quản lý công nghiệp' },
  { id:5,  title:'Hoạt động Vì Cộng Đồng – Góp nắng cho em',                 category:'community',date:3,  month:4, year:2026, time:'06:00', loc:'Ngoài trường', org:'Đoàn – Hội' },
  { id:6,  title:'Workshop Hành trình Phát triển Sinh viên "Rèn tâm – Luyện kỹ năng – Phát triển bản thân"', category:'academic', date:3,  month:4, year:2026, time:'07:30', loc:'Toà J, CS3', org:'Khoa Thương mại' },
  { id:7,  title:'Hội thao Sinh viên Văn Lang 2026 – Môn Bóng chuyền Nam & Nữ', category:'sport', date:3,  month:4, year:2026, time:'18:00', loc:'Ngoài trường', org:'Đoàn – Hội' },
  { id:8,  title:'Hội thao Sinh viên Văn Lang 2026 – Môn Bóng đá Nam & Nữ',  category:'sport',   date:3,  month:4, year:2026, time:'18:00', loc:'Ngoài trường', org:'Đoàn – Hội' },
  { id:9,  title:'Hội nghị thông tin thời sự Quý I năm 2026',                 category:'seminar',  date:4,  month:4, year:2026, time:'08:30', loc:'Toà Q, CS3', org:'Đảng ủy Trường Đại học Văn Lang' },
  { id:10, title:'Hội thao Sinh viên Văn Lang 2026 – Môn Bóng đá (vòng loại)', category:'sport',  date:4,  month:4, year:2026, time:'18:00', loc:'Ngoài trường', org:'Đoàn – Hội' },
  { id:11, title:'Hội thao Sinh viên Văn Lang 2026 – Môn Bóng đá (vòng loại)', category:'sport',  date:4,  month:4, year:2026, time:'18:00', loc:'Ngoài trường', org:'Đoàn – Hội' },
  { id:12, title:'Kỳ thi Đánh Giá Năng Lực Đại Học Quốc Gia – TP. HCM Đợt 1 năm 2026', category:'academic', date:5, month:4, year:2026, time:'06:00', loc:'Toà F, CS3', org:'Trung tâm Khảo thí' },
  { id:13, title:'Hội thao Sinh viên Văn Lang 2026 – Môn Bóng Rổ Nam & Nữ',  category:'sport',   date:5,  month:4, year:2026, time:'13:00', loc:'Toà J, CS3', org:'Đoàn – Hội' },
  { id:14, title:'Vòng Bán Kết Van Lang English Challenge 2026',               category:'academic', date:4,  month:4, year:2026, time:'13:00', loc:'Toà J, CS3', org:'Viện Ngôn ngữ' },
  { id:15, title:'Training: Mô hình BMC trong Khởi nghiệp',                   category:'seminar',  date:5,  month:4, year:2026, time:'15:00', loc:'Online',     org:'Khoa Quản Trị Kinh Doanh' },
  { id:16, title:'Hội thao Sinh viên Văn Lang 2026 – Môn Thể thao Điện tử',  category:'sport',    date:5,  month:4, year:2026, time:'18:00', loc:'Toà J, CS3', org:'Đoàn – Hội' },
  { id:17, title:'C.E.C\'s Event: "Drafting the Shadow – What If I Write It"', category:'culture', date:4,  month:4, year:2026, time:'18:00', loc:'Toà J, CS3', org:'CLB Tiếng Anh' },
  { id:18, title:'Career Day 2026 – Unlock Your Future in Hospitality',        category:'seminar',  date:8,  month:4, year:2026, time:'08:00', loc:'Toà J, CS3', org:'Khoa Khách sạn' },
  { id:19, title:'Lễ Trao Giải Nghiên Cứu Khoa học Sinh viên',                category:'academic', date:8,  month:4, year:2026, time:'13:00', loc:'Hội trường N2T1', org:'Phòng NCKH' },
  { id:20, title:'A&A Racing 2026 – Vòng Bán Kết',                            category:'sport',    date:11, month:4, year:2026, time:'09:00', loc:'Online',         org:'CLB Đua xe' },
  { id:21, title:'Future Fest 2026 – Van Lang Global School',                  category:'school',   date:11, month:4, year:2026, time:'07:00', loc:'Hội trường TCS',  org:'Van Lang Global School' },
  { id:22, title:'Hội Thao Sinh Viên Văn Lang 2026 – Chung kết',              category:'sport',    date:17, month:4, year:2026, time:'18:00', loc:'Toà J, CS3',      org:'Đoàn – Hội' },
  { id:23, title:'Chung Kết Cuộc Thi Học Thuật Cấp Khoa',                     category:'academic', date:18, month:4, year:2026, time:'13:30', loc:'Toà J, CS3-3.03', org:'Phòng Đào tạo' },
  { id:24, title:'Hiến máu tình nguyện VLU – Red Connection Đợt 2',           category:'community',date:27, month:5, year:2026, time:'07:00', loc:'CS3',             org:'Đoàn – Hội' },
  { id:25, title:'Chào mừng kỷ niệm 30/04 & 01/05',                          category:'national', date:30, month:4, year:2026, time:'08:00', loc:'Hội trường TCS',  org:'BGH Trường' },
];

const DAYS_VI = ['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','Chủ nhật'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}
// day of week for first day: 0=Sun,1=Mon...
function getFirstDayOfMonth(year: number, month: number) {
  const d = new Date(year, month - 1, 1).getDay();
  // Convert to Mon-first: Sun=6, Mon=0...
  return d === 0 ? 6 : d - 1;
}

const COLOR_MAP: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.key, c.color])
);

interface Props {
  onEventClick?: (ev: CalEvent) => void;
}

export default function EventCalendar({ onEventClick }: Props) {
  const [year,  setYear]  = useState(2026);
  const [month, setMonth] = useState(4);
  const [selected, setSelected] = useState<CalEvent | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDayOfMonth(year, month);

  const eventsThisMonth = EVENTS_2026.filter(e => e.month === month && e.year === year);

  const getEventsForDay = (day: number) =>
    eventsThisMonth.filter(e => e.date === day);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  // Build calendar grid (always 6 rows)
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();

  return (
    <div style={{ background: '#fff', padding: '48px 2rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 24px', justifyContent: 'center', marginBottom: 32 }}>
          {CATEGORIES.map(c => (
            <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: c.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#444', fontWeight: 500 }}>{c.label}</span>
            </div>
          ))}
        </div>

        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button onClick={prevMonth} style={{
            background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#C8102E', fontWeight: 700, padding: '4px 12px',
          }}>‹</button>
          <div style={{
            background: '#C8102E', color: 'white', fontWeight: 900,
            fontSize: 18, padding: '8px 36px', borderRadius: 8, letterSpacing: '.08em',
          }}>
            THÁNG {month} {year}
          </div>
          <button onClick={nextMonth} style={{
            background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#C8102E', fontWeight: 700, padding: '4px 12px',
          }}>›</button>
        </div>

        {/* Calendar grid */}
        <div style={{ border: '1px solid #e0e0e0', borderRadius: 8, overflow: 'hidden' }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', background: '#C8102E' }}>
            {DAYS_VI.map(d => (
              <div key={d} style={{
                padding: '10px 6px', textAlign: 'center',
                color: 'white', fontWeight: 700, fontSize: 13,
                borderRight: '1px solid rgba(255,255,255,.2)',
              }}>{d}</div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} style={{
              display: 'grid', gridTemplateColumns: 'repeat(7,1fr)',
              borderTop: '1px solid #e8e8e8', minHeight: 100,
            }}>
              {week.map((day, di) => {
                const dayEvents = day ? getEventsForDay(day) : [];
                const isT = day ? isToday(day) : false;
                const isPast = day ? new Date(year, month - 1, day) < new Date(today.setHours(0,0,0,0)) : false;

                return (
                  <div key={di} style={{
                    borderRight: di < 6 ? '1px solid #e8e8e8' : 'none',
                    padding: '6px 5px',
                    minHeight: 100,
                    background: !day ? '#fafafa' : isT ? '#FFF8F8' : 'white',
                    verticalAlign: 'top',
                  }}>
                    {day && (
                      <>
                        <div style={{
                          fontSize: 13, fontWeight: 600, marginBottom: 4,
                          width: 24, height: 24,
                          background: isT ? '#C8102E' : 'transparent',
                          color: isT ? 'white' : isPast ? '#bbb' : '#333',
                          borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        } as any}>{day}</div>

                        {dayEvents.slice(0, 3).map(ev => (
                          <div key={ev.id}
                            onClick={() => setSelected(ev)}
                            style={{
                              background: COLOR_MAP[ev.category],
                              color: 'white', fontSize: 10, fontWeight: 600,
                              padding: '3px 5px', borderRadius: 4,
                              marginBottom: 3, lineHeight: 1.3,
                              cursor: 'pointer', transition: 'opacity .15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '.8')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                          >
                            {ev.title.slice(0, 38)}{ev.title.length > 38 ? '...' : ''}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div style={{ fontSize: 10, color: '#888', fontWeight: 600, paddingLeft: 4 }}>
                            +{dayEvents.length - 3} sự kiện khác
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Event detail popup */}
        {selected && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }} onClick={() => setSelected(null)}>
            <div onClick={e => e.stopPropagation()} style={{
              background: 'white', borderRadius: 16, width: 440,
              maxWidth: 'calc(100vw - 32px)', overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,.25)',
            }}>
              <div style={{
                background: COLOR_MAP[selected.category],
                padding: '20px 24px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              }}>
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.7)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                    {CATEGORIES.find(c => c.key === selected.category)?.label}
                  </div>
                  <h3 style={{ color: 'white', fontWeight: 800, fontSize: 16, lineHeight: 1.4, margin: 0, maxWidth: 320 }}>
                    {selected.title}
                  </h3>
                </div>
                <button onClick={() => setSelected(null)} style={{
                  background: 'rgba(0,0,0,.2)', border: 'none', color: 'white',
                  width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 14,
                }}>✕</button>
              </div>
              <div style={{ padding: '20px 24px' }}>
                {[
                  { icon: '📅', label: 'Ngày', val: `${selected.date < 10 ? '0' : ''}${selected.date}/${selected.month < 10 ? '0' : ''}${selected.month}/${selected.year}` },
                  { icon: '🕐', label: 'Giờ',  val: selected.time },
                  { icon: '📍', label: 'Địa điểm', val: selected.loc },
                  { icon: '🏛️', label: 'Ban tổ chức', val: selected.org },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 16 }}>{r.icon}</span>
                    <div>
                      <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: '.06em' }}>{r.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#222' }}>{r.val}</div>
                    </div>
                  </div>
                ))}
                <button style={{
                  width: '100%', padding: '12px', marginTop: 8,
                  background: COLOR_MAP[selected.category], color: 'white',
                  border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  Đăng ký tham gia →
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
