import React from "react";

export default function PdfPreviewModal({
  open,
  onClose,
  src,
  title = "PDF Preview",
}) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body" style={{ height: "70vh", padding: 0 }}>
          <iframe
            title={title}
            src={src}
            style={{ width: "100%", height: "100%", border: 0 }}
          />
        </div>
      </div>
    </div>
  );
}
