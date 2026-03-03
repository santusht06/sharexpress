import React from "react";
import LOGOw from "../../../DOCUMENTS/logo.PNG";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="w-screen  border-white/10 mt-32">
      <div className=" mx-auto px-40 py-20 flex justify-between">
        {/* LEFT SIDE - COMPANY */}
        <div className="max-w-sm space-y-6">
          <div className="flex items-center gap-3">
            <img className="h-12 object-contain" src={LOGOw} alt="" />
            <h2 className="text-white text-lg font-medium">Sharexpress</h2>
          </div>

          <p className="text-[#B8B8B8] text-sm leading-relaxed">
            Secure session-based file sharing with permission-aware architecture
            built for modern collaboration.
          </p>

          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Sharexpress.
          </p>
        </div>

        {/* RIGHT SIDE - LINKS */}
        <div className="flex gap-20">
          {/* PRODUCT */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">Product</h3>
            <ul className="space-y-3 text-[#B8B8B8] text-sm">
              <li className="hover:text-[#909090] cursor-pointer transition">
                How it Works
              </li>
              <li className="hover:text-[#909090] cursor-pointer transition">
                Features
              </li>
              <li className="hover:text-[#909090] cursor-pointer transition">
                Security
              </li>
              <li className="hover:text-[#909090] cursor-pointer transition">
                Questions
              </li>
            </ul>
          </div>

          {/* LEGAL */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">Legal</h3>
            <ul className="space-y-3 text-[#B8B8B8] text-sm">
              <li
                onClick={() => navigate("/privacy")}
                className="hover:text-[#909090] cursor-pointer transition"
              >
                Privacy Policy
              </li>
              <li className="hover:text-[#909090] cursor-pointer transition">
                Terms of Service
              </li>
              <li className="hover:text-[#909090] cursor-pointer transition">
                Security Policy
              </li>
            </ul>
          </div>

          {/* CONNECT */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">Connect</h3>
            <ul className="space-y-3 text-[#B8B8B8] text-sm">
              <li className="hover:text-[#909090] cursor-pointer transition">
                GitHub
              </li>
              <li className="hover:text-[#909090] cursor-pointer transition">
                LinkedIn
              </li>
              <li className="hover:text-[#909090] cursor-pointer transition">
                Contact
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
