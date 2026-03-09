import React from "react";

const DashboardFiles = () => {
  return (
    <div className="ml-[260px] flex-1 p-3">
      <div className="w-full h-full bg-[#0d0d0d] rounded-xl border border-[#ffffff10] p-6 flex flex-col">
        <h1 className="text-white text-lg font-medium mb-6">Files</h1>

        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <video
            src="/animations/empty.webm"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-[260px]"
          />

          <div className="text-center">
            <h2 className="text-white text-xl font-semibold">No files found</h2>

            <p className="text-[#8a8a8a] text-sm mt-2 max-w-[300px]">
              Upload or receive files to start sharing through Sharexpress.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFiles;
