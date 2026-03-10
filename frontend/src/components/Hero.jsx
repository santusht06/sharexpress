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
import WButton from "./WButton";

const Hero = () => {
  return (
    <div className="h-fit w-full flex items-center justify-center bg-black text-white mt-40 ">
      <div className="text-center max-w-4xl px-6">
        <h1 className="text-[60px] font-[500] leading-[1.1]">
          Secure file transfers
        </h1>

        <h1 className="text-[60px] font-[500] leading-[1.1]">
          Built for distributed systems.
        </h1>

        <p className="mt-6 text-[#B8B8B8] text-xl">
          Session-bound architecture. Permission-aware transfers.
        </p>

        <p className="text-[#B8B8B8] text-xl">Built for scale.</p>

        <div className="mt-8 flex justify-center">
          <WButton text={"Share your files securely"} />
        </div>
      </div>
    </div>
  );
};

export default Hero;
