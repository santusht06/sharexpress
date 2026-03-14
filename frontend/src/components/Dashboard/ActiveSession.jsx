import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link2, ShieldCheck, AlertCircle, Power } from "lucide-react";
import {
  clearSessionState,
  revokeSession,
} from "../../store/slices/ShareSessionSlice";
import { toast } from "react-toastify";

const ActiveSession = () => {
  const dispatch = useDispatch();

  const { success, senderName, receiverName, loading, error } = useSelector(
    (state) => state.session,
  );

  if (loading) {
    return (
      <div className="w-full bg-[#171717] border border-[#ffffff15] rounded-2xl p-5 flex flex-col gap-4 animate-pulse">
        <div className="h-3 w-28 bg-[#2a2a2a] rounded"></div>

        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-full bg-[#2a2a2a]" />

          <div className="flex flex-col gap-2">
            <div className="h-3 w-36 bg-[#2a2a2a] rounded"></div>
            <div className="h-3 w-24 bg-[#2a2a2a] rounded"></div>
          </div>
        </div>

        <div className="h-3 w-40 bg-[#2a2a2a] rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-[#171717] border border-[#ffffff15] rounded-2xl p-5 flex flex-col gap-3 shadow-2xl">
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle size={16} />
          Session Error
        </div>

        <p className="text-xs text-[#8a8a8a]">
          Unable to restore active session.
        </p>
      </div>
    );
  }

  if (!success) return null;

  const handleTerminate = async () => {
    try {
      await dispatch(revokeSession()).unwrap();

      dispatch(clearSessionState());

      toast.info("Session terminated");
    } catch (err) {
      toast.error("Failed to terminate session");
      console.error(err);
    }
  };

  return (
    <div className="w-full bg-[#171717] border border-[#ffffff15] rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
      <div className="flex items-center gap-2 text-white text-sm font-medium tracking-wide">
        <Link2 size={16} className="text-green-400" />
        Active Session
      </div>

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

      <div className="flex items-center justify-between text-xs text-[#8a8a8a]">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          Session Active
        </span>

        <span>Ready for file transfer</span>
      </div>

      <button
        onClick={handleTerminate}
        className="flex items-center cursor-pointer justify-center gap-2 mt-2 text-xs text-red-400 border border-red-400/20 rounded-lg py-2 hover:bg-red-400/10 transition"
      >
        <Power size={14} />
        Terminate Session
      </button>
    </div>
  );
};

export default ActiveSession;
