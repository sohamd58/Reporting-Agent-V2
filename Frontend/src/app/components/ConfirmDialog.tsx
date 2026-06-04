type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white/95 backdrop-blur-xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-[#111111]">{title}</h2>
          <p className="text-base leading-7 text-[#555555]">{message}</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border-2 border-[rgba(0,0,0,0.08)] bg-white px-4 py-3 text-sm font-bold text-[#111111] transition-all duration-200 hover:border-[#FF6B35] hover:text-[#FF6B35] hover:shadow-sm active:scale-95"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-[#FF6B35] px-4 py-3 text-sm font-bold text-white transition-all duration-200 hover:shadow-lg hover:bg-[#FF8C00] active:scale-95"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
