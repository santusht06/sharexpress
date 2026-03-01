import React from "react";
import StartHeroCard from "./StartHeroCard";

const StartHero = () => {
  const accessModes = [
    {
      id: 1,
      badge: "Free",
      title: "Guest Mode",
      subtitle: "Instant sharing. No account required.",
      buttonText: "Start as Guest",
      highlight: false,
      features: [
        "Temporary sharing session",
        "QR-based device pairing",
        "Auto-expiring files",
        "Time-limited uploads",
        "Basic download access",
      ],
    },
    {
      id: 2,
      badge: "Recommended",
      title: "Registered Mode",
      subtitle: "Full control. Persistent workspace.",
      buttonText: "Create Account",
      highlight: true,
      features: [
        "Persistent sharing sessions",
        "Role-based permission engine",
        "Single editor lock mode",
        "Advanced expiry controls",
        "Session history & tracking",
        "Personal storage quota",
      ],
    },
  ];
  return (
    <>
      <div className="w-full h-screen  flex flex-col justify-center gap-20   ">
        <div className="flex justify-center">
          <div className="max-w-md  ">
            <h1 className="text-white text-center text-[48px] font-[500] leading-[1.1] ">
              Choose how you want to share{" "}
            </h1>
            <h3 className="text-[#B8B8B8] text-center mt-3   ">
              Flexible access modes for instant transfers or persistent control.
            </h3>
          </div>
        </div>
        <StartHeroCard />
      </div>
    </>
  );
};

export default StartHero;
