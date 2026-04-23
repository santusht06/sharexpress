import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHistoryByTransferID } from "../../store/slices/historySlice";

const formatDate = (date) => new Date(date).toLocaleString();

const formatSize = (size) => {
  if (!size) return "0 B";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

/* ─── Skeleton ───────────────── */

const ModalSkeleton = () => (
  <div className="flex flex-col gap-3">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="h-12 bg-[#121212] border border-[#ffffff08] rounded-md"
      />
    ))}
  </div>
);

/* ─── Component ───────────────── */

const HistoryModal = ({ transferId, onClose }) => {
  const dispatch = useDispatch();

  const { transfer_loading, transfer_history } = useSelector(
    (state) => state.history,
  );

  useEffect(() => {
    if (transferId) {
      dispatch(fetchHistoryByTransferID(transferId));
    }
  }, [transferId, dispatch]);

  if (!transferId) return null;

  const handleDownloadZip = async () => {
    try {
      const res = await fetch(
        `/history/${transfer_history.transfer_id}/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("user")}`,
          },
        },
      );

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `sharexpress_${transfer_history.transfer_id.slice(0, 6)}.zip`;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl max-h-[85vh] bg-[#0d0d0d] border border-[#ffffff10] rounded-xl flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#ffffff08]">
          <div className="flex flex-col">
            <h2 className="text-white text-sm font-medium tracking-tight">
              Transfer Details
            </h2>
            {transfer_history && (
              <span className="text-[10px] text-[#444] font-mono mt-1">
                {transfer_history.transfer_id}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-[#666] hover:text-white text-xs"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {/* LOADING */}
          {transfer_loading && <ModalSkeleton />}

          {/* CONTENT */}
          {!transfer_loading && transfer_history && (
            <>
              {/* META */}
              <div className="flex flex-col gap-1">
                <p className="text-[13px] text-[#aaa]">
                  {transfer_history.sender?.name}
                  <span className="text-[#444] mx-1.5">→</span>
                  <span className="text-white">
                    {transfer_history.receiver?.name}
                  </span>
                </p>

                <span className="text-[10px] text-[#444] font-mono">
                  {formatDate(transfer_history.created_at)}
                </span>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2 text-[10px] text-[#555] font-mono">
                  <span className="px-2 py-[3px] border border-[#ffffff08] rounded bg-[#0a0a0a]">
                    {transfer_history.total_files} FILES
                  </span>

                  <span className="px-2 py-[3px] border border-[#ffffff08] rounded bg-[#0a0a0a]">
                    {formatSize(transfer_history.total_size)}
                  </span>
                </div>

                {/* DOWNLOAD ALL */}
                <button
                  onClick={handleDownloadZip}
                  className="text-[11px] px-3 py-1 bg-white text-black rounded-md"
                >
                  Download ZIP
                </button>
              </div>

              {/* FILE LIST */}
              <div className="flex flex-col gap-2 mt-2">
                {transfer_history.files?.map((file) => (
                  <div
                    key={file.file_id}
                    className="flex items-center justify-between px-3 py-2 border border-[#ffffff08] bg-[#111] rounded-md"
                  >
                    {/* LEFT */}
                    <div className="flex flex-col">
                      <span className="text-[12px] text-white tracking-tight">
                        {file.filename}
                      </span>

                      <span className="text-[10px] text-[#555] font-mono mt-[2px]">
                        {formatSize(file.size)}
                      </span>
                    </div>

                    {/* DOWNLOAD */}
                    <button
                      onClick={() =>
                        window.open(`/files/download/${file.file_id}`, "_blank")
                      }
                      className="text-[10px] text-[#777] hover:text-white"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* EMPTY SAFETY */}
          {!transfer_loading && !transfer_history && (
            <p className="text-[#444] text-xs">No data found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
