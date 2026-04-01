import React from "react";

const FileCardSkeleton = ({ view = "grid" }) => {
  // ================= GRID SKELETON =================
  if (view === "grid") {
    return (
      <div className="bg-[#171717] border border-[#ffffff10] rounded-xl overflow-hidden animate-pulse">
        {/* IMAGE */}
        <div className="h-[160px] bg-[#1f1f1f]" />

        {/* TEXT */}
        <div className="p-3 space-y-2">
          <div className="h-3 bg-[#2a2a2a] rounded w-[80%]" />
          <div className="h-3 bg-[#2a2a2a] rounded w-[40%]" />
        </div>
      </div>
    );
  }

  // ================= LIST SKELETON =================
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-[#ffffff08] animate-pulse">
      {/* THUMB */}
      <div className="w-10 h-10 bg-[#1f1f1f] rounded-md shrink-0" />

      {/* NAME */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div className="h-3 bg-[#2a2a2a] rounded w-[60%]" />
        <div className="h-2 bg-[#2a2a2a] rounded w-[30%]" />
      </div>

      {/* TYPE */}
      <div className="h-3 bg-[#2a2a2a] rounded w-[60px] shrink-0" />

      {/* ACTIONS */}
      <div className="flex gap-2 shrink-0">
        <div className="w-4 h-4 bg-[#2a2a2a] rounded" />
        <div className="w-4 h-4 bg-[#2a2a2a] rounded" />
        <div className="w-4 h-4 bg-[#2a2a2a] rounded" />
      </div>
    </div>
  );
};

export default FileCardSkeleton;
