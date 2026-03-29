import React from "react";
import { Download, Trash2, MoreVertical } from "lucide-react";

// 📦 FORMAT SIZE
const formatSize = (size) => {
  if (!size) return "0 B";
  if (size < 1024) return size + " B";
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
  return (size / (1024 * 1024)).toFixed(1) + " MB";
};

// 📂 FILE TYPE DETECTOR
const getFileType = (filename = "") => {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "webp"].includes(ext)) return "image";
  if (["pdf"].includes(ext)) return "pdf";
  if (["doc", "docx"].includes(ext)) return "doc";
  return "other";
};

// ✅ Pure component — receives downloadUrl and loadingUrl as props
// No fetching, no useEffect, no internal state
const FileCard = ({
  file,
  downloadUrl,
  loadingUrl,
  onDownload,
  onDelete,
  view,
}) => {
  const type = getFileType(file?.filename);

  // ================= GRID VIEW =================
  if (view === "grid") {
    return (
      <div className="group bg-[#171717] border border-[#ffffff10] rounded-xl overflow-hidden hover:border-white/30 hover:shadow-lg hover:shadow-black/30">
        {/* 🔥 PREVIEW */}
        <div className="h-[160px] bg-[#0f0f0f] flex items-center justify-center overflow-hidden relative">
          {/* LOADING */}
          {loadingUrl && (
            <div className="text-[#6a6a6a] text-xs animate-pulse">
              Loading preview...
            </div>
          )}

          {/* IMAGE */}
          {!loadingUrl && type === "image" && downloadUrl && (
            <img
              src={downloadUrl}
              alt={file.filename}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          )}

          {/* PDF */}
          {!loadingUrl && type === "pdf" && downloadUrl && (
            <iframe
              src={downloadUrl}
              className="w-full h-full"
              title="pdf-preview"
            />
          )}

          {/* DOC / DOCX */}
          {!loadingUrl && type === "doc" && downloadUrl && (
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(downloadUrl)}&embedded=true`}
              className="w-full h-full"
              title="doc-preview"
            />
          )}

          {/* FALLBACK */}
          {!loadingUrl && (!downloadUrl || type === "other") && (
            <div className="text-[#6a6a6a] text-xs">No preview</div>
          )}

          {/* 🔥 HOVER ACTIONS */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4">
            <Download
              size={18}
              className="text-white hover:scale-110 cursor-pointer transition"
              onClick={() => onDownload(file)}
            />
            <Trash2
              size={18}
              className="text-red-400 hover:scale-110 cursor-pointer transition"
              onClick={() => onDelete(file.file_id)}
            />
          </div>

          {/* TYPE BADGE */}
          <div className="absolute bottom-2 right-2 bg-black/60 text-[10px] px-2 py-[2px] rounded text-white uppercase">
            {type}
          </div>
        </div>

        {/* 📄 INFO */}
        <div className="p-3">
          <p className="text-white text-sm break-words leading-tight line-clamp-2">
            {file.filename}
          </p>
          <div className="flex justify-between items-center mt-2">
            <p className="text-[11px] text-[#6a6a6a]">
              {formatSize(file.size)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ================= LIST VIEW =================
  return (
    <div className="group flex items-center justify-between px-4 py-3 border-b border-[#ffffff08] hover:bg-[#1a1a1a]">
      {/* LEFT */}
      <div className="flex items-center gap-4 w-[55%] min-w-0">
        {/* PREVIEW BOX */}
        <div className="w-10 h-10 rounded-md bg-[#111] flex items-center justify-center overflow-hidden">
          {loadingUrl && (
            <div className="w-3 h-3 rounded-full border border-[#444] border-t-white animate-spin" />
          )}

          {!loadingUrl && type === "image" && downloadUrl && (
            <img
              src={downloadUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          )}

          {!loadingUrl && type === "pdf" && downloadUrl && (
            <iframe
              src={downloadUrl}
              className="w-full h-full"
              title="pdf-preview-small"
            />
          )}

          {!loadingUrl && type === "doc" && (
            <span className="text-[10px] text-[#888] uppercase">DOC</span>
          )}

          {!loadingUrl && type === "other" && (
            <span className="text-[10px] text-[#555] uppercase">?</span>
          )}
        </div>

        {/* NAME */}
        <p className="text-white text-sm truncate flex-1">{file.filename}</p>
      </div>

      {/* SIZE */}
      <div className="text-[#7a7a7a] text-xs w-[90px] text-left">
        {formatSize(file.size)}
      </div>

      {/* TYPE */}
      <div className="text-[#5a5a5a] text-[11px] w-[80px] uppercase">
        {type}
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
        <Download
          size={16}
          className="text-[#8a8a8a] hover:text-white cursor-pointer"
          onClick={() => onDownload(file)}
        />
        <Trash2
          size={16}
          className="text-red-400 hover:text-red-300 cursor-pointer"
          onClick={() => onDelete(file.file_id)}
        />
        <MoreVertical
          size={16}
          className="text-[#8a8a8a] hover:text-white cursor-pointer"
        />
      </div>
    </div>
  );
};

export default FileCard;
