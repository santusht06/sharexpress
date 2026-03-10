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
import React, { useRef } from "react";
import WButton from "../WButton";

const NofileFound = () => {
  const fileInputRef = useRef(null);

  const handleBrowse = () => {
    fileInputRef.current.click();
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);

    console.log("Selected files:", files);
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <video
        src="/animations/empty.webm"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="w-[260px]"
      />

      <div className="text-center">
        <h2 className="text-white text-xl font-semibold">No files found</h2>

        <p className="text-[#8a8a8a] text-sm mt-2 max-w-[300px]">
          Upload or receive files to start sharing through Sharexpress.
        </p>
      </div>

      {/* Hidden input */}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFiles}
        className="hidden"
      />

      {/* Upload button */}
      <div onClick={handleBrowse}>
        <WButton text={"Upload Files"} Font_extralight={true} />
      </div>
    </div>
  );
};

export default NofileFound;
