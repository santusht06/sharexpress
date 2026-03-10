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

const HeroCard = () => {
  return (
    <>
      <div className="w-1/2  h-fit ">
        <div className="h-1/2 border-[1px] border-[#ffffff1a] w-[97%] rounded-xl h-[540px]   "></div>
        <h1 className="text-white text-xl font-[500] mt-7 ">
          Start a Secure Session{" "}
        </h1>

        <h3 className="text-[#B8B8B8] mt-3 ">
          Generate a QR code and pair devices instantly. Every transfer is
          isolated, encrypted, and time-limited.
        </h3>
      </div>
    </>
  );
};

export default HeroCard;
