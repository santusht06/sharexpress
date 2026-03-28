import React from "react";
import {
  Download,
  Trash2,
  MoreVertical,
  FileText,
  FileImage,
} from "lucide-react";

const formatSize = (size) => {
  if (size < 1024) return size + " B";
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
  return (size / (1024 * 1024)).toFixed(1) + " MB";
};

const getFileType = (filename = "") => {
  const ext = filename.split(".").pop()?.toLowerCase();

  if (["png", "jpg", "jpeg", "webp"].includes(ext)) return "image";
  if (["pdf"].includes(ext)) return "pdf";
  return "doc";
};

const FileCard = ({ file, onDownload, onDelete, view }) => {
  const type = getFileType(file.filename);
  const previewUrl = `http://localhost:8000/files/download/${file.file_id}`;

  // ================= GRID VIEW =================
  if (view === "grid") {
    return (
      <div className="group bg-[#171717] border border-[#ffffff10] rounded-xl overflow-hidden hover:border-white/30 transition-all duration-300 hover:shadow-lg hover:shadow-black/30">
        {/* PREVIEW */}
        <div className="h-[160px] bg-[#0f0f0f] flex items-center justify-center overflow-hidden relative">
          {/* IMAGE */}
          {type === "image" ? (
            <img
              src={previewUrl}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-[#6a6a6a]">
              {type === "pdf" ? <FileText size={32} /> : <FileText size={32} />}
              <span className="text-[10px] uppercase opacity-70">{type}</span>
            </div>
          )}

          {/* HOVER ACTION BAR */}
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
        </div>

        {/* INFO */}
        <div className="p-3">
          <p className="text-white text-sm break-words leading-tight line-clamp-2">
            {file.filename}
          </p>

          <div className="flex justify-between items-center mt-2">
            <p className="text-[11px] text-[#6a6a6a]">
              {formatSize(file.size)}
            </p>

            <span className="text-[10px] text-[#444] uppercase">{type}</span>
          </div>
        </div>
      </div>
    );
  }

  // ================= LIST VIEW =================
  return (
    <div className="group flex items-center justify-between px-4 py-3 border-b border-[#ffffff08] hover:bg-[#1a1a1a] transition-all duration-200">
      {/* LEFT */}
      <div className="flex items-center gap-4 w-[55%] min-w-0">
        {/* ICON / PREVIEW */}
        <div className="w-10 h-10 rounded-md bg-[#111] flex items-center justify-center overflow-hidden">
          {type === "image" ? (
            <img
              src={previewUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <FileText size={18} className="text-[#8a8a8a]" />
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
