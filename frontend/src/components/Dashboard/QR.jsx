import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { GenerateQRCode } from "../../store/slices/QrSlice";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "react-toastify";

const QR = () => {
  const { QRToken, loading } = useSelector((state) => state.QR);
  const dispatch = useDispatch();

  // Generate QR on mount
  useEffect(() => {
    const generateQR = async () => {
      try {
        await dispatch(GenerateQRCode()).unwrap();
      } catch (error) {
        toast.error("Failed to generate QR");
      }
    };

    generateQR();
  }, [dispatch]);

  const HandleRegenQR = async () => {
    try {
      await dispatch(GenerateQRCode()).unwrap();
      toast.success("QR Generated");
    } catch (error) {
      toast.error("Failed to regenerate QR");
    }
  };

  return (
    <div className="ml-[260px] flex-1 p-3">
      <div className="w-full h-full bg-[#0d0d0d] rounded-xl border border-[#ffffff10] p-6">
        <h1 className="text-white text-lg font-medium mb-10">QR Code</h1>

        <div className="w-full flex justify-center">
          <div className="w-[600px] flex flex-col gap-4">
            <h2 className="text-white text-sm">Share Access</h2>

            <div className="bg-[#171717] border border-[#ffffff10] rounded-2xl p-8 flex flex-col items-center gap-6">
              {/* QR Container */}
              <div className="w-[220px] h-[220px] bg-white rounded-xl flex items-center justify-center">
                {loading ? (
                  <p className="text-black text-sm">Generating...</p>
                ) : QRToken ? (
                  <div className="bg-white p-4 rounded-xl">
                    <QRCodeCanvas value={QRToken} size={200} />
                  </div>
                ) : (
                  <p className="text-black text-sm">No QR available</p>
                )}
              </div>

              <p className="text-xs text-[#7a7a7a] text-center max-w-[300px]">
                Scan this QR code from another device to quickly access your
                Sharexpress session.
              </p>

              <button
                onClick={HandleRegenQR}
                disabled={loading}
                className="bg-white text-black text-sm px-5 py-2 cursor-pointer rounded-full hover:bg-[#cfcfcf] transition-all duration-200 ease-in-out disabled:opacity-50"
              >
                {loading ? "Generating..." : "Regenerate QR"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QR;
