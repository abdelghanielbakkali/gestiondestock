export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-blue-600 hover:bg-blue-50 rounded-full p-1"
        >
          ✕
        </button>
        {title && <h3 className="text-xl font-bold mb-4 text-blue-800">{title}</h3>}
        {children}
      </div>
    </div>
  );
}