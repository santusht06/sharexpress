import React from "react";
import { FaUserCheck } from "react-icons/fa";

const Hero4Card = ({ data }) => {
  const Icon = data.icon;
  return (
    <>
      <div>
        <div className=" h-[360px] w-full  bg-[#141414] rounded-xl    ">
          <div className="py-10 text-center flex  flex-col px-4 justify-between items-center w-full h-full    ">
            <h1 className="text-xl text-white font-[400] ">{data.heading}</h1>
            <h1>
              <Icon className="text-8xl text-white" />
            </h1>
            <h1 className="text-[#B8B8B8] ">{data.subheading}</h1>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero4Card;
