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
import HeroCard from "./HeroCard";

const Hero2 = () => {
  return (
    <>
      <div className="w-full mt-50  h-60  ">
        <div className=" max-w-xl  h-full ">
          <h1 className="text-start text-[48px] text-white  leading-[1.1]  ">
            Transfer files securely between devices.
          </h1>
          <div className="w-fit mt-9 ">
            <WButton text={"Share your files securely"} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero2;
