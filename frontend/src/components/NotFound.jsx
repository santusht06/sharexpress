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
