import React from "react";

const ProfileSkeleton = () => {
  return (
    <div className="w-[600px] flex flex-col gap-4 animate-pulse">
      <h2 className="text-white text-sm">Profile</h2>

      <div className="bg-[#171717] border border-[#ffffff10] rounded-4xl overflow-hidden">
        {/* Avatar Skeleton */}
        <div className="p-6 flex items-center gap-4 border-b border-[#ffffff10]">
          <div className="h-20 w-20 rounded-full bg-[#2a2a2a]" />
        </div>

        {/* Name Skeleton */}
        <div className="p-6 border-b border-[#ffffff10] flex flex-col gap-2">
          <div className="h-3 w-24 bg-[#2a2a2a] rounded" />
          <div className="h-10 w-full bg-[#2a2a2a] rounded-4xl" />
        </div>

        {/* Email Skeleton */}
        <div className="p-6 flex flex-col gap-2">
          <div className="h-3 w-16 bg-[#2a2a2a] rounded" />
          <div className="h-10 w-full bg-[#2a2a2a] rounded-4xl" />
          <div className="h-3 w-64 bg-[#2a2a2a] rounded mt-2" />
        </div>
      </div>

      {/* Button Skeleton */}
      <div className="flex justify-end pt-3">
        <div className="h-9 w-32 bg-[#2a2a2a] rounded-full" />
      </div>
    </div>
  );
};

export default ProfileSkeleton;
