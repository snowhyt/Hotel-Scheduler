

export default function Modal({isOpen, onClose, children, title}) {
    if (!isOpen) return null;

  return (
       <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}