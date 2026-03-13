import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiUser, FiX } from "react-icons/fi";
import WButton from "../../components/WButton";

import {
  hideSessionRequest,
  acceptSession,
  rejectSession,
} from "../../store/slices/sessionNotificationSlice";
import { sessionStarted } from "../../store/slices/ShareSessionSlice";
const SessionRequestCard = () => {
  const dispatch = useDispatch();

  const { visible, sender_name, sender_id, qr_token, loading } = useSelector(
    (state) => state.sessionNotification,
  );

  if (!visible) return null;

  const initial = sender_name?.charAt(0)?.toUpperCase() || "U";
  const handleAccept = async () => {
    try {
      const res = await dispatch(
        acceptSession({ qr_token, sender_id }),
      ).unwrap();

      console.log("ACCEPT RESPONSE:", res);

      dispatch(sessionStarted(res));

      dispatch(hideSessionRequest());
    } catch (err) {
      console.error(err);
    }
  };
  const handleReject = () => {
    dispatch(rejectSession({ sender_id }));
  };

  return (
    <div className="fixed top-6 right-6 z-[200] animate-slideIn">
      <div className="w-[320px] bg-[#171717] border border-[#ffffff15] rounded-2xl p-5 flex flex-col gap-4 shadow-2xl relative">
        <button
          onClick={() => dispatch(hideSessionRequest())}
          className="absolute top-3 right-3 text-[#8a8a8a] hover:text-white"
        >
          <FiX size={16} />
        </button>

        <h2 className="text-white text-sm font-medium tracking-wide">
          Session Request
        </h2>

        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-full bg-[#202020] flex items-center justify-center text-white text-sm">
            {initial}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-white text-sm">
              <FiUser size={14} className="text-[#8a8a8a]" />
              {sender_name}
            </div>

            <p className="text-xs text-[#8a8a8a]">wants to start a session</p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          <button
            disabled={loading}
            onClick={handleReject}
            className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
          >
            Reject
          </button>

          <button disabled={loading} onClick={handleAccept}>
            <WButton
              text={loading ? "Processing..." : "Accept"}
              Font_extralight
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionRequestCard;
