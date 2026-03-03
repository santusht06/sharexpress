import React from "react";
import LOGOw from "../../../DOCUMENTS/logo.PNG";
import { FaGoogle, FaGithub } from "react-icons/fa";
import WButton from "../components/WButton";
import google from "../images/google.png";
import { useNavigate } from "react-router-dom";

const Signin = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-screen bg-[#262626] flex items-center justify-center">
      <div className="w-[420px]">
        <div className="flex justify-center mb-8">
          <img src={LOGOw} alt="Sharexpress" className="h-12 object-contain" />
        </div>

        <div className="bg-[#171717] border border-white/10 rounded-2xl p-8 ">
          <h1 className="text-white text-center text-xl font-medium mb-6 tracking-wide ">
            Welcome to Sharexpress
          </h1>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-3 border border-white/10 rounded-4xl py-2.5 text-sm text-white hover:bg-white/5 transition">
              <img
                src={google}
                alt="Sharexpress"
                className="h-5 object-contain"
              />
              Continue with Google
            </button>
          </div>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-xs text-white/40">or</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-[#909090] px-3 ">Email</label>
              <input
                type="email"
                placeholder="Your email address"
                className="mt-1 w-full bg-[#1e1e1e] border border-white/10 rounded-4xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-all duration-300 ease-in-out  "
              />
            </div>

            <div className="mt-7">
              <WButton text={"Continue"} />
            </div>
          </div>
          <div className="  ">
            <h1 className="text-[#909090] text-sm text-start mt-5   ">
              By clicking Continue, you agree to our{" "}
              <span
                onClick={() => navigate("/terms")}
                className="underline  cursor-pointer  "
              >
                Terms
              </span>{" "}
              and{" "}
              <span
                onClick={() => navigate("/privacy")}
                className="underline cursor-pointer "
              >
                Privacy Policies
              </span>
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
