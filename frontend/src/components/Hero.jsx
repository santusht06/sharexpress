import React from "react";
import WButton from "./WButton";

const Hero = () => {
  return (
    <div className="h-fit w-full flex items-center justify-center bg-black text-white mt-40 ">
      <div className="text-center max-w-4xl px-6">
        <h1 className="text-[60px] font-[500] leading-[1.1]">
          Secure file transfers
        </h1>

        <h1 className="text-[60px] font-[500] leading-[1.1]">
          Built for distributed systems.
        </h1>

        <p className="mt-6 text-[#B8B8B8] text-xl">
          Session-bound architecture. Permission-aware transfers.
        </p>

        <p className="text-[#B8B8B8] text-xl">Built for scale.</p>

        <div className="mt-8 flex justify-center">
          <WButton text={"Share your first file securely"} />
        </div>
      </div>
    </div>
  );
};

export default Hero;
