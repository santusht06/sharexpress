import React from "react";
import LOGOw from "../../../DOCUMENTS/logo.PNG";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  console.log(user?.user_name || null);

  return (
    <div className="w-screen h-screen bg-black">
      {/* LEFT SIDEBAR */}
      <div className="fixed left-0 top-0 w-[260px] h-screen px-6 py-4 bg-black flex flex-col">
        {/* Logo */}
        <img
          src={LOGOw}
          alt="sharexpress logo"
          className="h-12 object-contain"
        />

        {/* Menu */}
        <div className="mt-8">
          <h1 className="text-[#b3b3b3] text-xs">Uploads</h1>

          <div className="mt-3 flex flex-col gap-1">
            <div className="rounded-xl bg-[#202020] text-sm px-4 py-2 text-white">
              Files
            </div>

            <div className="rounded-xl hover:bg-[#202020] text-sm px-4 py-2 text-white">
              History
            </div>
          </div>
        </div>

        {/* PROFILE (Bottom) */}
        <div className="mt-auto pt-6 border-t border-[#ffffff1a]">
          <div className="text-white text-sm px-2 py-2 hover:bg-[#202020] rounded-lg cursor-pointer flex items-center gap-3    ">
            <div>
              <h1> {user?.user_name || null} </h1>
              <h1 className="text-xs text-[#b3b3b3] ">
                {" "}
                {user?.email || null}{" "}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="ml-[260px] h-screen p-2">
        <div className="w-full h-full bg-[#0d0d0d] rounded-xl border border-[#ffffff1a]"></div>
      </div>
    </div>
  );
};

export default Dashboard;
