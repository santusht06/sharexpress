import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link2, ShieldCheck, AlertCircle, Power } from "lucide-react";
import { toast } from "react-toastify";
import {
  clearSessionState,
  revokeSession,
} from "../../store/slices/ShareSessionSlice";
import WButton from "../../components/WButton";
import { disconnectSocket } from "../../helpers/socket";
import UploadModal from "./UploadModal";

const ActiveSession = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [openModal, setOpenModal] = useState(false);

  const {
    sender_name,
    reciever_name,
    loading,
    error,
    check_sender_name,
    check_receiver_name,
    check_loading,
    sender_ID,
  } = useSelector((state) => state.session);

  const isActive =
    check_sender_name || check_receiver_name || sender_name || reciever_name;

  if (!isActive) return null;

  const isSender = user?.user_id === sender_ID;

  const sender = check_sender_name || sender_name;
  const receiver = check_receiver_name || reciever_name;

  // 🔥 MODAL RENDER
  if (openModal) {
    return <UploadModal onClose={() => setOpenModal(false)} />;
  }

  if (loading || check_loading) {
    return (
      <div className="w-full bg-[#171717] border border-[#ffffff15] rounded-2xl p-5 animate-pulse">
        <div className="h-3 w-24 bg-[#2a2a2a] rounded mb-3"></div>
        <div className="h-10 w-full bg-[#2a2a2a] rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-[#171717] border border-[#ffffff15] rounded-2xl p-5">
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle size={16} />
          Session Error
        </div>
      </div>
    );
  }

  const handleTerminate = async () => {
    try {
      await dispatch(revokeSession()).unwrap();
      dispatch(clearSessionState());
      toast.info("Session terminated");
    } catch {
      toast.error("Failed to terminate session");
    }
  };

  return (
    <div className="w-full bg-[#171717] border border-[#ffffff15] rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
      {/* HEADER */}
      <div className="flex items-center gap-2 text-white text-sm font-medium tracking-wide">
        <Link2 size={16} className="text-green-400" />
        Active Session
      </div>

      {/* CARD */}
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 rounded-full bg-[#202020] flex items-center justify-center text-green-400">
          <ShieldCheck size={18} />
        </div>

        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col leading-tight">
            <p className="text-white text-sm">
              {sender} ↔ {receiver}
            </p>

            <p
              className={`text-xs mt-1 ${
                isSender ? "text-green-400" : "text-blue-400"
              }`}
            >
              {isSender ? "You are sending files" : "You are receiving files"}
            </p>
          </div>

          {/* 🔥 SEND FILES BUTTON */}
          {isSender && (
            <button onClick={() => setOpenModal(true)}>
              <WButton text={"Send Files"} />
            </button>
          )}
        </div>
      </div>

      {/* STATUS */}
      <div className="flex items-center justify-between text-xs text-[#8a8a8a]">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          Session Active
        </span>
      </div>

      {/* TERMINATE */}
      <button
        onClick={async () => {
          try {
            if (isSender) {
              await handleTerminate();
              disconnectSocket();
            } else {
              dispatch(clearSessionState());
              disconnectSocket();
              toast.info("Disconnected from session");
            }
          } catch (err) {
            console.error("Terminate error:", err);
            toast.error("Failed to terminate");
          }
        }}
        className="flex items-center justify-center gap-2 mt-2 text-xs text-red-400 border border-red-400/20 rounded-lg py-2 hover:bg-red-400/10 transition"
      >
        <Power size={14} />
        {isSender ? "Terminate Session" : "Disconnect"}
      </button>
    </div>
  );
};

export default ActiveSession;
