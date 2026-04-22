export type ToastType = 'success' | 'error' | 'info';

export interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

export function Toast({ toasts, onRemove }: {
  toasts: ToastData[];
  onRemove?: (id: number) => void;
}) {
  if (!toasts.length) return null;
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:8 }}>
      {toasts.map(t => (
        <div key={t.id}
          onClick={() => onRemove?.(t.id)}
          style={{
            padding:'12px 20px',
            borderRadius:8,
            color:'#fff',
            cursor:'pointer',
            minWidth:240,
            boxShadow:'0 4px 12px rgba(0,0,0,.2)',
            background: t.type==='success' ? '#22c55e' : t.type==='error' ? '#ef4444' : '#3b82f6',
          }}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
