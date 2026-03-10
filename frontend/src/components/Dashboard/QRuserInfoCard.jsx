import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiUser, FiMail, FiX } from "react-icons/fi";
import WButton from "../../components/WButton";
import { ResolveQR, clearReceiver } from "../../store/slices/QrSlice";
const QRuserInfoCard = () => {
  const dispatch = useDispatch();

  const { reciever_name, reciever_email, reciever_img } = useSelector(
    (state) => state.QR,
  );

  if (!reciever_name || !reciever_email) return null;

  const initial = reciever_name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="fixed top-6 right-6 z-[100] animate-slideIn">
      <div className="w-[320px] bg-[#171717] border border-[#ffffff15] rounded-2xl p-5 flex flex-col gap-4 shadow-2xl relative">
        {/* CLOSE BUTTON */}
        <button
          onClick={() => dispatch(clearReceiver())}
          className="absolute top-3 right-3 text-[#8a8a8a] hover:text-white transition"
        >
          <FiX size={16} />
        </button>

        {/* TITLE */}
        <h2 className="text-white text-sm font-medium tracking-wide">
          QR Owner Found
        </h2>

        {/* USER INFO */}
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

        {/* ACTION */}
        <div className="flex justify-end">
          <WButton text={"Connect Session"} Font_extralight />
        </div>
      </div>
    </div>
  );
};

export default QRuserInfoCard;
