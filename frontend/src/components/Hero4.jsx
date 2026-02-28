import React from "react";
import Hero4Card from "./Hero4Card";

import { FaUserCheck } from "react-icons/fa";
import { IoShieldCheckmark } from "react-icons/io5";
import { IoLayers } from "react-icons/io5";
import { FaKey } from "react-icons/fa6";
import { FaClockRotateLeft } from "react-icons/fa6";
import { BsFileTextFill } from "react-icons/bs";

const Hero4 = () => {
  const hero4Data = [
    {
      id: 1,
      icon: FaUserCheck,
      heading: "Single Editor Lock",
      subheading: "One editor at a time, enforced.",
    },
    {
      id: 2,
      icon: IoShieldCheckmark,
      heading: "Role-Based Access",
      subheading: "API-level permission enforcement.",
    },
    {
      id: 3,
      icon: IoLayers,
      heading: "Session Isolation",
      subheading: "Dedicated boundaries per session.",
    },
    {
      id: 4,
      icon: FaKey,
      heading: "Signed Access URLs",
      subheading: "Time-limited verified file operations.",
    },
    {
      id: 5,
      icon: FaClockRotateLeft,
      heading: "Automatic Expiry",
      subheading: "Self-expiring sessions and files.",
    },
    {
      id: 6,
      icon: BsFileTextFill,
      heading: "Audit Metadata",
      subheading: "Tracked actions with timestamps.",
    },
  ];
  return (
    <>
      <div className="w-full h-full  flex flex-col justify-center gap-20   ">
        <div className="flex justify-center">
          <div className="max-w-xl  ">
            <h1 className="text-white text-center text-[48px] font-[500] leading-[1.1] ">
              Edit, share, control precisely.
            </h1>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-16  ">
          {hero4Data.map((item) => (
            <Hero4Card key={item.id} data={item} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Hero4;
