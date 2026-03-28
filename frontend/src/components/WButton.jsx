import React from "react";

const WButton = ({
  text,
  onClick,
  disabled = false,
  loading = false,
  Font_extralight,
  w_full,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-5 py-2 rounded-4xl border-[0.1px] text-md flex items-center justify-center gap-2 ${w_full && "w-full"}
        transition-all duration-150 ease-in-out

        ${
          disabled
            ? "bg-[#2a2a2a] text-[#5a5a5a] cursor-not-allowed border-[#ffffff10]"
            : "bg-white text-black hover:bg-[#cfcfcf]"
        }

        ${Font_extralight ? "font-light" : "font-medium"}
      `}
    >
      {/* 🔄 LOADER */}
      {loading && (
        <span className="w-3 h-3 border border-black border-t-transparent rounded-full animate-spin"></span>
      )}

      {text}
    </button>
  );
};

export default WButton;
