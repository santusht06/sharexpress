import React, { useState, useRef } from "react";
import LOGOw from "../../../DOCUMENTS/logo.PNG";
import google from "../images/google.png";
import { useNavigate } from "react-router-dom";
import WButton from "../components/WButton";

const Signin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const inputsRef = useRef([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setStep("otp");
  };

  const handleGoogleSign = () => {
    window.location.href = "http://localhost:8000/auth/google/login";
  };

  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    if (value && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value) {
      if (inputsRef.current[index - 1]) {
        inputsRef.current[index - 1].focus();
      }
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#262626] flex items-center justify-center">
      <div className="w-[420px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={LOGOw} alt="Sharexpress" className="h-12 object-contain" />
        </div>

        {/* Card */}
        <div className="bg-[#171717] border border-white/10 rounded-2xl p-8">
          {step === "email" && (
            <>
              <h1 className="text-white text-center text-xl font-medium mb-6">
                Welcome to Sharexpress
              </h1>

              <button
                onClick={handleGoogleSign}
                className="w-full flex items-center justify-center gap-3 border border-white/10 rounded-4xl py-2.5 text-sm text-white hover:bg-white/5 transition"
              >
                <img src={google} alt="" className="h-5" />
                Continue with Google
              </button>

              <div className="flex items-center gap-3 my-6">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-xs text-white/40">or</span>
                <div className="h-px bg-white/10 flex-1" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-[#909090] px-3">Email</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="mt-1 w-full bg-[#1e1e1e] border border-white/10 rounded-4xl px-4 py-3 text-sm text-white focus:outline-none transition-all duration-300 ease-in-out focus:border-[#B8B8B8]"
                  />
                </div>

                <button type="submit" className="w-full mt-4">
                  <WButton text={"Continue"} />
                </button>
              </form>

              <p className="text-[#909090] text-sm text-start mt-5">
                By clicking Continue, you agree to our{" "}
                <span
                  onClick={() => navigate("/terms")}
                  className="underline cursor-pointer"
                >
                  Terms
                </span>{" "}
                and{" "}
                <span
                  onClick={() => navigate("/privacy")}
                  className="underline cursor-pointer"
                >
                  Privacy Policies
                </span>
              </p>
            </>
          )}

          {step === "otp" && (
            <>
              <h1 className="text-white text-center text-xl font-medium mb-2">
                Enter OTP
              </h1>

              <p className="text-center text-sm text-[#B8B8B8] mb-6">
                We sent a code to {email}
              </p>

              <div className="flex justify-center gap-3 mb-6">
                {[...Array(6)].map((_, i) => (
                  <input
                    key={i}
                    maxLength={1}
                    ref={(el) => (inputsRef.current[i] = el)}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    className="w-10 h-12 text-center bg-[#1e1e1e] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                  />
                ))}
              </div>

              <button className="w-full">
                <WButton text={"Verify"} />
              </button>

              <p
                onClick={() => setStep("email")}
                className="text-center text-sm text-[#B8B8B8] mt-6 cursor-pointer hover:text-[#909090]"
              >
                Change email
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signin;
