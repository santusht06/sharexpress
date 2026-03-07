import React from "react";
import { FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";

const SettingsProfile = () => {
  return (
    <div className="w-48 bg-[#171717] border border-[#ffffff10] rounded-xl shadow-xl py-2 px-1 ">
      <button className="w-full rounded-xl flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-[#262626] transition">
        <FiUser size={16} />
        Profile
      </button>

      <button className="w-full rounded-xl  flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-[#262626] transition">
        <FiSettings size={16} />
        Settings
      </button>

      <div className="border-t rounded-xl  border-[#ffffff10] my-2"></div>

      <button className="w-full rounded-xl  flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-[#262626] transition">
        <FiLogOut size={16} />
        Logout
      </button>
    </div>
  );
};

export default SettingsProfile;
