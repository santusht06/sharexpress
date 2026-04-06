import React from "react";
import WButton from "../WButton";

const ConfirmDeleteModal = ({ open, onClose, onConfirm, loading }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[360px] bg-[#171717] border border-[#ffffff10] rounded-xl p-6 shadow-2xl flex flex-col gap-4">
        {/* TITLE */}
        <h2 className="text-white text-sm font-medium">Delete all files?</h2>

        {/* MESSAGE */}
        <p className="text-[#7a7a7a] text-xs leading-relaxed">
          This action cannot be undone. All your uploaded files will be
          permanently removed.
        </p>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="text-xs text-[#8a8a8a] hover:text-white transition"
          >
            Cancel
          </button>

          <WButton
            Font_extralight={true}
            text={
              loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  Deleting...
                </span>
              ) : (
                "Delete"
              )
            }
            onClick={onConfirm}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
