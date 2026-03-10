import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { QrCode } from "lucide-react";
import WButton from "../../components/WButton";
import QRScanner from "../QRScanner";
import { toast } from "react-toastify";
import QrScanner from "qr-scanner";

const Session = () => {
  const [email, setEmail] = useState("");
  const [QR_SCAN_OPEN, setQR_SCAN_OPEN] = useState(false);

  const handleSearch = () => {
    console.log("Search user:", email);
  };

  const handleQRScan = (data) => {
    console.log("QR Result:", data);

    setQR_SCAN_OPEN(false);
  };

  const handleQRUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true,
      });

      console.log("QR from image:", result.data);
      handleQRScan(result.data);
    } catch {
      toast.error("Invalid QR image");
    }
  };

  return (
    <div className="ml-[260px] flex-1 p-3">
      <div className="w-full h-full bg-[#0d0d0d] rounded-xl border border-[#ffffff10] p-6">
        <h1 className="text-white text-lg font-medium mb-8">Sessions</h1>

        <div className="max-w-[700px] mx-auto flex flex-col gap-8">
          {/* EMAIL SEARCH */}
          <div className="bg-[#171717] border border-[#ffffff10] rounded-xl p-6 transition-all duration-300 ease-in-out ">
            <h2 className="text-white text-sm mb-4">Connect by Email</h2>

            <div className="flex gap-3">
              <div className="flex items-center bg-[#1f1f1f] border border-[#ffffff10] rounded-4xl px-3 flex-1">
                <FiSearch className="text-[#7a7a7a]" />

                <input
                  type="email"
                  placeholder="Enter user email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent text-white text-sm px-3 py-2 outline-none w-full"
                />
              </div>

              <div onClick={handleSearch}>
                <WButton text={"Search"} Font_extralight />
              </div>
            </div>
          </div>

          {/* QR SECTION */}
          <div className="bg-[#171717] border border-[#ffffff10] rounded-xl p-6 flex flex-col items-center gap-4 transition-all duration-200  ">
            <QrCode size={42} className="text-white" />

            <h2 className="text-white text-sm">Scan QR to Join Session</h2>

            <p className="text-[#7a7a7a] text-xs text-center max-w-[320px]">
              Scan or upload a QR code from another device to instantly connect
              and share files.
            </p>

            {/* BUTTONS */}
            <div className="flex gap-3">
              <div onClick={() => setQR_SCAN_OPEN((prev) => !prev)}>
                <WButton
                  text={QR_SCAN_OPEN ? "Close Scanner" : "Scan QR"}
                  Font_extralight
                />
              </div>

              <label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQRUpload}
                  className="hidden"
                />

                <WButton text={"Upload QR"} Font_extralight />
              </label>
            </div>

            {/* CAMERA */}
            {QR_SCAN_OPEN && (
              <div className="mt-4">
                <QRScanner onScan={handleQRScan} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Session;
