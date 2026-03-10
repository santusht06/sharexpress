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

const NotFound = () => {
  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center ">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="w-[600px] max-w-full"
      >
        <source src="/animations/Error 404.webm" type="video/webm" />
      </video>
    </div>
  );
};

export default NotFound;
