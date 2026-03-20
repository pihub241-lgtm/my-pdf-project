import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

function StatusBanner({ status, message }) {
  if (status === 'idle') return null;

  const variants = {
    processing: {
      className: 'border-blue-200 bg-blue-50 text-blue-700',
      Icon: Loader2,
      iconClassName: 'animate-spin',
    },
    success: {
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      Icon: CheckCircle2,
      iconClassName: '',
    },
    error: {
      className: 'border-rose-200 bg-rose-50 text-rose-700',
      Icon: AlertTriangle,
      iconClassName: '',
    },
  };

  const current = variants[status] || variants.processing;
  const { Icon } = current;

  return (
    <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${current.className}`}>
      <Icon size={16} className={current.iconClassName} />
      <span>{message}</span>
    </div>
  );
}

export default StatusBanner;
