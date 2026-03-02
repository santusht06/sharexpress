import React from "react";
import { motion } from "framer-motion";

import cloud from "../images/cloud.png";
import clouds from "../images/clouds.png";

import download from "../images/download.png";
import folder from "../images/folder.png";
import notification from "../images/notification.png";
import laptop from "../images/laptop.png";
import sattelite from "../images/sattelite.png";
import smartphones from "../images/smartphones.png";

import identity from "../images/identity.png";
import avatar from "../images/avatar.png";
import bell from "../images/bell.png";
import send from "../images/send.png";
import husky from "../images/husky.png";
import shield from "../images/shield.png";
import unlocked from "../images/unlocked.png";
import word from "../images/word.png";
import xls from "../images/xls.png";
import zip from "../images/zip.png";
import key from "../images/key.png";

const Marquee = ({ images, size, gap, speed, position, z, opacity, blur }) => {
  return (
    <div
      className="absolute w-full overflow-hidden"
      style={{
        ...position,
        zIndex: z,
        opacity: opacity,
        filter: `blur(${blur}px)`,
      }}
    >
      <motion.div
        className="flex min-w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {[...images, ...images].map((img, i) => (
          <div key={i} style={{ marginRight: gap }}>
            <img
              src={img}
              alt=""
              style={{ width: size }}
              className="object-contain"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const Images_Float = () => {
  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden ">
      {/* BACKGROUND – subtle, blurry, slow */}
      <Marquee
        images={[cloud, clouds, word, xls, zip]}
        size="160px"
        gap="130px"
        speed={140}
        position={{ top: "15%" }}
        z={1}
        opacity={0.25}
        blur={3}
      />

      {/* MID – balanced */}
      <Marquee
        images={[
          download,
          folder,
          send,
          notification,
          laptop,
          sattelite,
          smartphones,
          unlocked,
        ]}
        size="260px"
        gap="150px"
        speed={110}
        position={{ top: "50%", transform: "translateY(-50%)" }}
        z={2}
        opacity={0.6}
        blur={1}
      />

      {/* FOREGROUND – sharp, visible */}
      <Marquee
        images={[identity, avatar, bell, husky, shield, key]}
        size="420px"
        gap="170px"
        speed={75}
        position={{ bottom: "8%" }}
        z={3}
        opacity={1}
        blur={0}
      />
    </div>
  );
};

export default Images_Float;
