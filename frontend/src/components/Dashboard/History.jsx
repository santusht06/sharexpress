import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHistory } from "../../store/slices/historySlice";

/* ─── Helpers ───────────────────────────────────────── */

const formatDate = (date) => new Date(date).toLocaleString();

const formatSize = (size) => {
  if (!size) return "0 B";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

/* ─── Skeleton ─────────────────────────────────────── */

const HistorySkeleton = () => (
  <div className="flex flex-col gap-4">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="border border-[#ffffff08] rounded-xl p-4 bg-[#0f0f0f]"
      >
        <div className="flex justify-between mb-3">
          <div className="h-3 w-40 bg-[#1a1a1a] rounded" />
          <div className="h-3 w-20 bg-[#1a1a1a] rounded" />
        </div>
        <div className="flex gap-2 mb-2">
          <div className="h-5 w-16 bg-[#1a1a1a] rounded" />
          <div className="h-5 w-20 bg-[#1a1a1a] rounded" />
        </div>
      </div>
    ))}
  </div>
);

/* ─── Card (Memoized) ───────────────────────────────── */

const HistoryCard = React.memo(({ item }) => {
  return (
    <div className="border border-[#ffffff08] hover:border-[#ffffff30] transition-all duration-200 ease-in-out bg-[#0f0f0f] rounded-xl px-4 py-3 flex flex-col gap-3">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col leading-tight">
          <p className="text-[13px] text-[#9a9a9a] font-medium tracking-tight">
            {item.sender?.name}
            <span className="text-[#444] mx-1.5">→</span>
            <span className="text-[#9a9a9a] font-normal">
              {item.receiver?.name}
            </span>
          </p>
        </div>

        <span className="text-[10px] text-[#9a9a9a] font-mono">
          {formatDate(item.created_at)}
        </span>
      </div>

      {/* META */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-mono text-[#555]">
          <span className="px-2 py-[3px] bg-[#0a0a0a] border border-[#ffffff06] rounded">
            {item.total_files} FILE{item.total_files > 1 && "S"}
          </span>

          <span className="px-2 py-[3px] bg-[#0a0a0a] border border-[#ffffff06] rounded">
            {formatSize(item.total_size)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-[5px] h-[5px] rounded-full bg-green-400/70" />
          <span className="text-[10px] text-green-400/60 font-mono uppercase tracking-wide">
            {item.status}
          </span>
        </div>
      </div>

      {/* FILES */}
      <div className="flex flex-wrap gap-1.5">
        {item.files?.slice(0, 5).map((file) => (
          <div
            key={file.file_id}
            className="px-2 py-[3px] rounded bg-[#0a0a0a] border border-[#ffffff06] text-[10px] text-[#6a6a6a] font-mono"
          >
            {file.filename}
          </div>
        ))}

        {item.files?.length > 5 && (
          <div className="text-[10px] text-[#3a3a3a] font-mono px-1">
            +{item.files.length - 5}
          </div>
        )}
      </div>
    </div>
  );
});

/* ─── Main Component ───────────────────────────────── */

const History = () => {
  const dispatch = useDispatch();
  const { histories, loading, error } = useSelector((state) => state.history);

  useEffect(() => {
    dispatch(fetchHistory());
  }, [dispatch]);

  /* ✅ Memoized sorting */
  const sortedHistories = useMemo(() => {
    return [...histories].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
  }, [histories]);

  return (
    <div className="ml-[260px] flex-1 p-3  ">
      <div className="w-full h-full bg-[#0d0d0d] rounded-xl border border-[#ffffff10] p-6 flex flex-col">
        {/* HEADER */}
        <h1 className="text-white text-sm font-medium tracking-tight mb-4">
          History
        </h1>

        {/* ERROR */}
        {error && (
          <p className="text-red-400 text-xs mb-2 font-mono">{error}</p>
        )}

        {/* LOADING */}
        {loading && <HistorySkeleton />}

        {/* EMPTY */}
        {!loading && sortedHistories.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-2">
            <p className="text-[#444] text-sm">No history yet</p>
            <p className="text-[#2a2a2a] text-xs">
              Your shared files will appear here
            </p>
          </div>
        )}

        {/* LIST */}
        {!loading && sortedHistories.length > 0 && (
          <div className="flex flex-col gap-3 overflow-y-auto pr-1">
            {sortedHistories.map((item) => (
              <HistoryCard key={item.transfer_id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
