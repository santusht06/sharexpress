import React from "react";
import LOGOw from "../../../DOCUMENTS/logo.PNG";
import WButton from "./WButton";

const Navbar = () => {
  return (
    <div className=" border-b-[0.5px]  border-b-white/10 min-w-screen bg-black  px-40 py-5  fixed flex justify-between items-center   ">
      <img
        src={LOGOw}
        alt="sharexpress logo"
        className="h-12 object-contain  "
      />

      <div className="flex gap-8 text-[#B8B8B8] ">
        <div>
          <h1 className=" transition-all duration-150 ease-in-out hover:text-[#909090] cursor-pointer ">
            How it Works
          </h1>
        </div>
        <div>
          <h1 className=" transition-all duration-150 ease-in-out hover:text-[#909090] cursor-pointer  ">
            Pricing
          </h1>
        </div>
        <div>
          <h1 className=" transition-all duration-150 ease-in-out hover:text-[#909090] cursor-pointer ">
            Docs{" "}
          </h1>
        </div>
        <div>
          <h1 className=" transition-all duration-150 ease-in-out hover:text-[#909090] cursor-pointer ">
            Privacy
          </h1>
        </div>
      </div>

      <div className="flex gap-2 text-gray-50 ">
        <div className=" transition-all duration-150 ease-in-out cursor-pointer hover:border-white/30     bg-transparent px-5 py-2   rounded-4xl border-[1px] border-white/20 text-center text-md font-[400]  ">
          Sign in
        </div>

        <WButton text={"Get Started"} />
      </div>
    </div>
  );
};

export default Navbar;
