'use client';
import React from 'react';

interface Props {
  isOpen:    boolean;
  eventName: string;
  studentId: string;
  studentName: string;
  onClose:   () => void;
}

export default function QRModal({ isOpen, eventName, studentId, studentName, onClose }: Props) {
  if (!isOpen) return null;
  return (
    <div className="moverlay show"
      onClick={e => { if ((e.target as HTMLElement).classList.contains('moverlay')) onClose(); }}>
      <div className="modal" style={{ textAlign: 'center', maxWidth: 320 }}>
        <button className="mclose" onClick={onClose}>✕</button>
        <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>{eventName}</h3>
        <p style={{ fontSize: 13, color: 'var(--mid)', marginBottom: 18 }}>Xuất trình mã này tại sự kiện</p>

        {/* QR placeholder – thay bằng thư viện qrcode thật khi production */}
        <div className="qr-box">📱</div>

        <div className="qr-info">
          <span style={{ fontWeight: 700, color: 'var(--dark)' }}>SV: {studentId}</span><br />
          {studentName}
        </div>

        <button className="ab pri" style={{ width: '100%', marginTop: 16 }} onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  );
}
