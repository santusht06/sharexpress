import React from "react";
import Hero3Card from "./Hero3Card";

const Hero3 = () => {
  return (
    <>
      <div className="w-full h-full flex justify-center mb-20 ">
        <div className="max-w-md  ">
          <h1 className="text-white text-center text-[48px] font-[500] leading-[1.1] ">
            Granular control for secure transfers
          </h1>
          <h3 className="text-[#B8B8B8] text-center mt-6   ">
            Session-bound architecture with permission-aware file governance.
          </h3>
        </div>
      </div>

      <Hero3Card />
    </>
  );
};

export default Hero3;
