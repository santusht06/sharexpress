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
        <div className="flex flex-col gap-3 overflow-y-auto">
          {histories.map((item) => (
            <div
              key={item.transfer_id}
              className="border border-[#ffffff08] bg-[#111] rounded-lg p-4 flex flex-col gap-2"
            >
              {/* TOP ROW */}
              <div className="flex items-center justify-between">
                <p className="text-white text-sm">
                  {item.sender?.name} → {item.receiver?.name}
                </p>

                <span className="text-[10px] text-[#444] font-mono">
                  {formatDate(item.created_at)}
                </span>
              </div>

              {/* FILE INFO */}
              <div className="flex items-center justify-between text-xs text-[#444]">
                <span>{item.total_files} files</span>
                <span>{formatSize(item.total_size)}</span>
              </div>

              {/* FILE LIST (compact) */}
              <div className="flex flex-wrap gap-2 mt-1">
                {item.files?.slice(0, 4).map((file) => (
                  <span
                    key={file.file_id}
                    className="text-[10px] px-2 py-1 bg-[#0a0a0a] border border-[#ffffff08] rounded-md text-[#777]"
                  >
                    {file.filename}
                  </span>
                ))}

                {item.files?.length > 4 && (
                  <span className="text-[10px] text-[#333]">
                    +{item.files.length - 4} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;
