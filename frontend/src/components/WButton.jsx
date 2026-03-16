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

const WButton = (props) => {
  return (
    <>
      <div
        className={`bg-white text-black px-5 py-2 transition-all duration-150 ease-in-out cursor-pointer hover:bg-[#cfcfcf] ${props.diabled && "cursor-not-allowed"}  rounded-4xl border-[0.1px]  text-center text-md ${props.Font_extralight ? "font-light" : "font-[500px] "} `}
      >
        {props.text}
      </div>
    </>
  );
};

export default WButton;
