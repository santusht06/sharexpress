import React from "react";
import { useSelector } from "react-redux";
import { Link2, ShieldCheck } from "lucide-react";

const ActiveSession = () => {
  const { success, senderName, receiverName } = useSelector(
    (state) => state.session,
  );

  if (!success) return null;

  return (
    <div className="w-full bg-[#171717] border border-[#ffffff15] rounded-2xl p-5 flex flex-col gap-4 shadow-2xl animate-slideIn">
      {/* HEADER */}
      <div className="flex items-center gap-2 text-white text-sm font-medium tracking-wide">
        <Link2 size={16} className="text-green-400" />
        Active Session
      </div>

      {/* PARTICIPANTS */}
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 rounded-full bg-[#202020] flex items-center justify-center text-green-400">
          <ShieldCheck size={18} />
        </div>

        <div className="flex flex-col leading-tight">
          <p className="text-white text-sm">
            {senderName} ↔ {receiverName}
          </p>

          <p className="text-xs text-[#8a8a8a] mt-1">
            Secure connection established
          </p>
        </div>
      </div>

      {/* STATUS */}
      <div className="flex items-center justify-between text-xs text-[#8a8a8a]">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          Session Active
        </span>

        <span>Ready for file transfer</span>
      </div>
    </div>
  );
};

export default ActiveSession;
