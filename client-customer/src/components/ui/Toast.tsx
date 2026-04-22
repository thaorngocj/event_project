'use client';
import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastData {
  id:      number;
  message: string;
  type:    ToastType;
}

const ICONS: Record<ToastType, string> = { success: '✅', error: '❌', info: 'ℹ️' };

interface Props {
  toasts:   ToastData[];
  onRemove: (id: number) => void;
}

export default function Toast({ toasts, onRemove }: Props) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div className={`toast ${toast.type}`} onClick={() => onRemove(toast.id)} style={{ cursor: 'pointer' }}>
      <span>{ICONS[toast.type]}</span>
      <span>{toast.message}</span>
    </div>
  );
}
