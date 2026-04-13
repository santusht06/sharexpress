import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHistory } from "../../store/slices/historySlice";
import { Loader2 } from "lucide-react";

/* ─── Helpers ───────────────────────────────────────── */

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleString();
};

const formatSize = (size) => {
  if (!size) return "0 B";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

/* ─── Component ─────────────────────────────────────── */

const History = () => {
  const dispatch = useDispatch();

  const { histories, loading, error } = useSelector((state) => state.history);

  useEffect(() => {
    const load = async () => {
      const data = await dispatch(fetchHistory()).unwrap();
      console.log("REAL DATA:", data);
    };
    load();
  }, [dispatch]);

  return (
    <div className="ml-[260px] flex-1 p-3">
      <div className="w-full h-full bg-[#0d0d0d] rounded-xl border border-[#ffffff10] p-6 flex flex-col">
        {/* HEADER */}
        <h1 className="text-white text-lg font-medium mb-4">History</h1>

        {/* LOADING */}
        {loading && (
          <div className="flex items-center justify-center flex-1">
            <Loader2 size={18} className="text-[#333] animate-spin" />
          </div>
        )}

        {/* ERROR */}
        {error && <p className="text-red-400 text-xs">{error}</p>}

        {/* EMPTY */}
        {!loading && histories.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-2">
            <p className="text-[#444] text-sm">No history yet</p>
            <p className="text-[#2a2a2a] text-xs">
              Your shared files will appear here
            </p>
          </div>
        )}

        {/* LIST */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-1">
          {histories
            .slice()
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .map((item) => (
              <div
                key={item.transfer_id}
                className="group relative border border-[#ffffff08] from-[#111] to-[#0c0c0c] rounded-xl p-4 flex flex-col gap-3 transition-all duration-200 ]"
              >
                {/* TOP */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <p className="text-white text-sm font-medium tracking-tight">
                      {item.sender?.name}
                      <span className="text-[#444] mx-1.5">→</span>
                      <span className="text-[#aaa]">{item.receiver?.name}</span>
                    </p>

                    <span className="text-[10px] text-[#333] mt-0.5">
                      {item.direction === "sender_to_receiver"
                        ? "Sent"
                        : "Received"}
                    </span>
                  </div>

                  <span className="text-[10px] text-[#333] font-mono">
                    {formatDate(item.created_at)}
                  </span>
                </div>

                {/* META */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px] text-[#444]">
                    <span className="px-2 py-[2px] bg-[#0a0a0a] border border-[#ffffff08] rounded-md">
                      {item.total_files} file{item.total_files > 1 && "s"}
                    </span>

                    <span className="px-2 py-[2px] bg-[#0a0a0a] border border-[#ffffff08] rounded-md">
                      {formatSize(item.total_size)}
                    </span>
                  </div>

                  {/* STATUS DOT */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400/70" />
                    <span className="text-[10px] text-green-400/60">
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* FILES */}
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.files?.slice(0, 5).map((file) => (
                    <div
                      key={file.file_id}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#0a0a0a] border border-[#ffffff08] text-[10px] text-[#777] hover:text-white transition"
                    >
                      {/* FILE ICON */}
                      <span className="w-1.5 h-1.5 rounded-full bg-[#444]" />
                      {file.filename}
                    </div>
                  ))}

                  {item.files?.length > 5 && (
                    <div className="text-[10px] text-[#333] flex items-center">
                      +{item.files.length - 5} more
                    </div>
                  )}
                </div>

                {/* HOVER GLOW */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition pointer-events-none bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_60%)]" />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default History;
