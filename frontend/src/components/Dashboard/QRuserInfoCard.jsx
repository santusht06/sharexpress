import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiUser, FiMail, FiX, FiAlertCircle } from "react-icons/fi";
import WButton from "../../components/WButton";
import { clearReceiver } from "../../store/slices/QrSlice";
import {
  SessionCreate,
  RequestSession,
} from "../../store/slices/ShareSessionSlice";
import { clearSessionState } from "../../store/slices/ShareSessionSlice";

const QRuserInfoCard = () => {
  const dispatch = useDispatch();

  const {
    reciever_name,
    reciever_email,
    reciever_img,
    reciever_loading,
    reciever_error,
    reciever_qr,
  } = useSelector((state) => state.QR);

  const { loading, success, error, mode, requestSent, rejected } = useSelector(
    (state) => state.session,
  );
  useEffect(() => {
    console.log("Receiver QR:", reciever_qr);
  }, [reciever_qr]);

  useEffect(() => {
    if (rejected) {
      const timer = setTimeout(() => {
        dispatch(clearSessionState());
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [rejected, dispatch]);

  console.log(loading, success, error, mode, requestSent);

  if (!reciever_loading && !reciever_error && !reciever_name) return null;

  const initial = reciever_name?.charAt(0)?.toUpperCase() || "U";

  const handleSessionCreation = async () => {
    try {
      const res = await dispatch(RequestSession(reciever_qr)).unwrap();
      return res;
    } catch (err) {
      console.error(err);
    }
  };

  let buttonText = "Request Session Connection";
  let buttonStyle = "";
  let showSpinner = false;

  if (loading) {
    buttonText = "Sending Request...";
    showSpinner = true;
  }

  if (requestSent) {
    buttonText = "Request Sent ✓";
    buttonStyle = "opacity-70 cursor-not-allowed";
  }

  if (rejected) {
    buttonText = "Request Rejected";
    buttonStyle = "text-red-400 cursor-not-allowed";
  }

  if (error && !rejected) {
    buttonText = "Retry Request";
  }
  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-slideIn">
      <div className="w-[320px] bg-[#171717] border border-[#ffffff15] rounded-2xl p-5 flex flex-col gap-4 shadow-2xl relative">
        {/* CLOSE BUTTON */}
        <button
          onClick={() => dispatch(clearReceiver())}
          className="absolute top-3 right-3 text-[#8a8a8a] hover:text-white transition"
        >
          <FiX size={16} />
        </button>

        {/* LOADING STATE */}
        {reciever_loading && (
          <>
            <h2 className="text-white text-sm font-medium tracking-wide">
              Searching User...
            </h2>

            <div className="flex items-center gap-4 animate-pulse">
              <div className="h-11 w-11 rounded-full bg-[#2a2a2a]" />

              <div className="flex flex-col gap-2">
                <div className="h-3 w-24 bg-[#2a2a2a] rounded" />
                <div className="h-3 w-32 bg-[#2a2a2a] rounded" />
              </div>
            </div>
          </>
        )}

        {/* ERROR STATE */}
        {reciever_error && !reciever_loading && (
          <>
            <h2 className="text-white text-sm font-medium tracking-wide">
              Error
            </h2>

            <div className="flex items-center gap-3 text-red-400 text-sm">
              <FiAlertCircle />
              {reciever_error?.detail || reciever_error}
            </div>

            <button
              onClick={() => dispatch(clearReceiver())}
              className="flex justify-end"
            >
              <WButton text={"Dismiss"} Font_extralight />
            </button>
          </>
        )}

        {/* SUCCESS STATE */}
        {reciever_name && !reciever_loading && !reciever_error && (
          <>
            <h2 className="text-white text-sm font-medium tracking-wide">
              QR Owner Found
            </h2>

            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-full overflow-hidden bg-[#202020] flex items-center justify-center text-white font-medium text-sm">
                {reciever_img ? (
                  <img
                    src={reciever_img}
                    alt="profile"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  initial
                )}
              </div>

              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-2 text-white text-sm">
                  <FiUser size={14} className="text-[#8a8a8a]" />
                  {reciever_name}
                </div>

                <div className="flex items-center gap-2 text-[#8a8a8a] text-xs mt-1">
                  <FiMail size={14} />
                  {reciever_email}
                </div>
              </div>
            </div>

            <button
              onClick={handleSessionCreation}
              disabled={loading || requestSent}
              className={`flex justify-end transition ${buttonStyle}`}
            >
              <div className="flex items-center gap-2">
                {showSpinner && (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}

                <WButton text={buttonText} Font_extralight />
              </div>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default QRuserInfoCard;
