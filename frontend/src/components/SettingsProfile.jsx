import React from "react";
import { FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SettingsProfile = () => {
  const navigate = useNavigate();
  return (
    <div className="w-48 bg-[#171717] border border-[#ffffff10] rounded-xl shadow-xl py-2 px-1 ">
      <button
        onClick={() => navigate("/dashboard/profile")}
        className="w-full rounded-md flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-[#262626] transition"
      >
        <FiUser size={16} />
        Account
      </button>

      <button className="w-full rounded-md  flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-[#262626] transition">
        <FiSettings size={16} />
        Settings
      </button>

      <div className="border-t rounded-md  border-[#ffffff10] my-2"></div>

      <button className="w-full rounded-xl  flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-[#262626] transition">
        <FiLogOut size={16} />
        Logout
      </button>
    </div>
  );
};

export default SettingsProfile;
