import React from "react";
import LOGOw from "../../../DOCUMENTS/logo.PNG";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const initial = user?.user_name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="w-screen h-screen bg-black flex">
      <div className="w-[260px] h-full border-r border-[#ffffff10] px-5 py-5 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <img
            src={LOGOw}
            alt="sharexpress logo"
            className="h-10 object-contain"
          />
        </div>

        <div>
          <h1 className="text-[11px] tracking-wide text-[#6b6b6b] uppercase mb-3">
            Uploads
          </h1>

          <div className="flex flex-col gap-1">
            <button className="text-left bg-[#1a1a1a] rounded-lg px-4 py-2 text-sm text-white">
              Files
            </button>

            <button className="text-left rounded-lg px-4 py-2 text-sm text-[#b3b3b3] hover:bg-[#1a1a1a] hover:text-white transition">
              History
            </button>
          </div>
        </div>

        <div className="mt-auto border-t border-[#ffffff10] pt-4">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1a1a1a] cursor-pointer transition">
            <div className="h-9 w-9 bg-[#202020] rounded-full flex items-center justify-center text-white text-sm font-medium">
              {initial}
            </div>

            <div className="leading-tight">
              <p className="text-sm text-white font-medium">
                {user?.user_name || "User"}
              </p>

              <p className="text-xs text-[#7a7a7a]">{user?.email || ""}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-3">
        <div className="w-full h-full bg-[#0d0d0d] rounded-xl border border-[#ffffff10] p-6">
          <h1 className="text-white text-lg font-medium">Dashboard</h1>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
