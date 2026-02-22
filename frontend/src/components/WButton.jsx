import React from "react";

const WButton = (props) => {
  return (
    <>
      <div className=" bg-white text-black px-5 py-2 transition-all duration-150 ease-in-out cursor-pointer hover:bg-[#cfcfcf]  rounded-4xl border-[0.1px]  text-center text-md font-[500]  ">
        {props.text}
      </div>
    </>
  );
};

export default WButton;
