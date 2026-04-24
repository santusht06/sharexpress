// PreviewModal.jsx
// Full document preview in modal overlay.
// This is the ONLY place iframes are ever rendered.
// Closes on Escape or backdrop click. Locks body scroll while open.

import React, { useEffect } from "react";
import { X, Download, ExternalLink } from "lucide-react";

const PreviewModal = ({ file, url, type, onClose, onDownload }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const renderContent = () => {
    if (!url) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-[#6a6a6a]">
          <span className="text-sm">Preview not available</span>
          <button
            onClick={() => onDownload(file)}
            className="text-xs text-white bg-[#2a2a2a] hover:bg-[#333] px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            <Download size={14} /> Download instead
          </button>
        </div>
      );
    }
    if (type === "image") {
      return (
        <img
          src={url}
          alt={file.filename}
          className="max-w-full max-h-full object-contain rounded"
        />
      );
    }
    if (type === "pdf") {
      return (
        <iframe
          src={url}
          className="w-full h-full rounded"
          title={file.filename}
        />
      );
    }
    if (type === "doc") {
      return (
        <iframe
          src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
          className="w-full h-full rounded"
          title={file.filename}
        />
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-[#6a6a6a]">
        <span className="text-sm">No preview for this file type</span>
        <button
          onClick={() => onDownload(file)}
          className="text-xs text-white bg-[#2a2a2a] hover:bg-[#333] px-4 py-2 rounded-lg transition flex items-center gap-2"
        >
          <Download size={14} /> Download instead
        </button>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl h-[85vh] bg-[#111] rounded-2xl border border-[#ffffff15] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#ffffff10] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-[10px] text-[#555] uppercase bg-[#1a1a1a] px-2 py-0.5 rounded font-mono">
              {file.filename.split(".").pop()?.toUpperCase()}
            </span>
            <p className="text-white text-sm truncate">{file.filename}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {url && (
              <button
                onClick={() => window.open(url, "_blank")}
                className="text-[#8a8a8a] hover:text-white transition"
                title="Open in new tab"
              >
                <ExternalLink size={16} />
              </button>
            )}
            <button
              onClick={() => onDownload({ ...file, download_url: url })}
              className="text-[#8a8a8a] hover:text-white transition"
              title="Download"
            >
              <Download size={16} />
            </button>
            <button
              onClick={onClose}
              className="text-[#8a8a8a] hover:text-white transition"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-4">{renderContent()}</div>
      </div>
    </div>
  );
};

export default PreviewModal;
