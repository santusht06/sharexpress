import React from "react";
import WButton from "./WButton";

const StartHeroCard = () => {
  return (
    <div className="w-[420px] bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 transition-all duration-300 ">
      <div className="text-white text-md ">Free</div>

      <h2 className="text-white text-2xl font-medium mt-6">Guest Mode</h2>

      <p className="text-[#B8B8B8] mt-2">
        Instant sharing. No account required.
      </p>

      <div className="h-px bg-white/10 my-6" />

      <ul className="space-y-3 text-[#B8B8B8] text-sm mb-8 ">
        <li>✔ Temporary sharing session</li>
        <li>✔ QR-based device pairing</li>
        <li>✔ Auto-expiring files</li>
        <li>✔ Time-limited uploads</li>
        <li>✔ Basic download access</li>
      </ul>

      <div>
        <WButton text={"Start as Guest"} />
      </div>
    </div>
  );
};

export default StartHeroCard;
