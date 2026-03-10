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
import Hero4Card from "./Hero4Card";

import { FaUserCheck } from "react-icons/fa";
import { IoShieldCheckmark } from "react-icons/io5";
import { IoLayers } from "react-icons/io5";
import { FaKey } from "react-icons/fa6";
import { FaClockRotateLeft } from "react-icons/fa6";
import { BsFileTextFill } from "react-icons/bs";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion } from "framer-motion";
const Hero4 = () => {
  const hero4Data = [
    {
      id: 1,
      icon: FaUserCheck,
      heading: "Single Editor Lock",
      subheading: "One editor at a time, enforced.",
    },
    {
      id: 2,
      icon: IoShieldCheckmark,
      heading: "Role-Based Access",
      subheading: "API-level permission enforcement.",
    },
    {
      id: 3,
      icon: IoLayers,
      heading: "Session Isolation",
      subheading: "Dedicated boundaries per session.",
    },
    {
      id: 4,
      icon: FaKey,
      heading: "Signed Access URLs",
      subheading: "Time-limited verified file operations.",
    },
    {
      id: 5,
      icon: FaClockRotateLeft,
      heading: "Automatic Expiry",
      subheading: "Self-expiring sessions and files.",
    },
    {
      id: 6,
      icon: BsFileTextFill,
      heading: "Audit Metadata",
      subheading: "Tracked actions with timestamps.",
    },
  ];

  return (
    <>
      <div className="w-full py-32 flex flex-col gap-20">
        <div className="flex justify-center">
          <div className="max-w-xl">
            <h1 className="text-white text-center text-[48px] font-[500] leading-[1.1]">
              Edit, share, control precisely.
            </h1>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 h-full w-64 z-30">
            <div className="h-full w-full bg-gradient-to-r from-black/90 via-black/50 via-black/20 to-transparent" />
          </div>

          <div className="pointer-events-none absolute right-0 top-0 h-full w-64 z-30">
            <div className="h-full w-full bg-gradient-to-l from-black/90 via-black/50 via-black/20 to-transparent" />
          </div>

          <div className="mask-container">
            <motion.div
              className="flex gap-8 w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                repeat: Infinity,
                duration: 25,
                ease: "linear",
              }}
            >
              {hero4Data.map((item, index) => (
                <div key={index} className="min-w-[320px]">
                  <Hero4Card data={item} />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero4;
