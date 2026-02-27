import React from "react";

const Hero3Card = (props) => {
  const { data } = props;

  console.log(data);

  return (
    <>
      <div className="w-fit h-20 ">
        <div className="w-fit  gap-5 flex ">
          <div className="w-[56px] h-[56px]  bg-[#1F1F1F] rounded-xl  "></div>
          <div className="max-w-2/3">
            <div className=" ">
              <h1 className="text-[17px] text-white font-[500] ">
                {data.heading}
              </h1>
            </div>
            <div className="mt-1">
              <h2 className="text-[16px] text-[#B8B8B8]   ">
                {data.subheading}{" "}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero3Card;
