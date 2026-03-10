// Copyright 2026 Sharexpress
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
//
import React from "react";
import { FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUser, LogoutUser } from "../store/slices/authSlice";

const SettingsProfile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(LogoutUser()).unwrap();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

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

      <button
        onClick={handleLogout}
        className="w-full rounded-md flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-[#262626] transition"
      >
        <FiLogOut size={16} />
        Logout
      </button>
    </div>
  );
};

export default SettingsProfile;
