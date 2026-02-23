import React from "react";
import WButton from "./WButton";

const Hero2 = () => {
  return (
    <>
      <div className="w-full mt-50  h-60  ">
        <div className=" max-w-xl  h-full ">
          <h1 className="text-start text-[48px] text-white  leading-[1.1]  ">
            Transfer files securely between devices.
          </h1>
          <div className="w-fit mt-8 ">
            <WButton text={"Share your files securely"} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero2;
