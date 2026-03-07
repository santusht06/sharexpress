import React from "react";
import { Navigate } from "react-router-dom";
import LOGOw from "../../../DOCUMENTS/logo.PNG";

const Dashboard = () => {
  return (
    <>
      <div className="w-screen h-screen flex  fixed  ">
        <div className="px-6 py-3">
          <img
            onClick={() => Navigate("/")}
            src={LOGOw}
            alt="sharexpress logo"
            className="h-12 object-contain"
          />
        </div>
        <div className=" w-screen h-screen flex items-center justify-end">
          <div className="w-[82%] h-full flex justify-center items-center ">
            <div className=" w-[99%] h-[98%] bg-[#0d0d0d] rounded-xl border-[0.8px] border-[#ffffff1a] "></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
