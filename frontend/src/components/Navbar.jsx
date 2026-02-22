import React from "react";
import LOGOw from "../../../DOCUMENTS/logo.PNG";
import WButton from "./WButton";

const Navbar = () => {
  return (
    <div className="fixed w-full bg-black border-b-[0.7px]  border-white/10 z-50">
      <div className="relative flex items-center justify-between px-40 py-5">
        <img
          src={LOGOw}
          alt="sharexpress logo"
          className="h-12 object-contain"
        />

        <div className="absolute left-1/2 -translate-x-1/2">
          <h1 className="text-[#B8B8B8] hover:text-[#909090] transition-all duration-150 cursor-pointer font-[400]">
            How it Works
          </h1>
        </div>

        <div className="flex gap-3 items-center">
          <div className=" transition-all text-white duration-150 ease-in-out cursor-pointer hover:border-white/30     bg-transparent px-5 py-2   rounded-4xl border-[1px] border-white/20 text-center text-md font-[400]  ">
            Sign in
          </div>

          <WButton text={"Get Started"} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
