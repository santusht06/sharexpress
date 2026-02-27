import React from "react";
import Hero3Card from "./Hero3Card";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { IoQrCodeSharp } from "react-icons/io5";
import { FaLock } from "react-icons/fa";
import { FaClockRotateLeft } from "react-icons/fa6";
import { FaCloud } from "react-icons/fa";

import { MdOutlineLocalActivity } from "react-icons/md";

const Hero3 = () => {
  let data = [
    {
      icon: <IoShieldCheckmarkSharp />,
      heading: "Session Isolation",
      subheading: "Dedicated transfer channels per sharing session.",
    },
    {
      icon: <IoQrCodeSharp />,
      heading: "QR Pairing",
      subheading: "Instant device pairing with time-limited tokens.",
    },
    {
      icon: <FaLock />,
      heading: "Permission Engine",
      subheading: "Role-based file access enforced at API level.",
    },
    {
      icon: <FaClockRotateLeft />,
      heading: "Expiry Control",
      subheading: "Automatic session and file expiration policies.",
    },
    {
      icon: <FaCloud />,
      heading: "S3-Backed Storage",
      subheading: "Secure object storage with integrity validation.",
    },
    {
      icon: <MdOutlineLocalActivity />,
      heading: "Resilient Upload Engine",
      subheading: "Retry logic and circuit breaker protection.",
    },
  ];
  return (
    <>
      <div className="w-full h-screen  flex flex-col justify-center gap-20   ">
        <div className="flex justify-center">
          <div className="max-w-md  ">
            <h1 className="text-white text-center text-[48px] font-[500] leading-[1.1] ">
              Granular control for secure transfers
            </h1>
            <h3 className="text-[#B8B8B8] text-center mt-3   ">
              Session-bound architecture with permission-aware file governance.
            </h3>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-8  ">
          {data.map((item, index) => (
            <Hero3Card key={index} data={item} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Hero3;
