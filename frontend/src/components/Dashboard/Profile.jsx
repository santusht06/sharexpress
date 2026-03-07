import React from "react";
import { useSelector } from "react-redux";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  const initial = user?.user_name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="ml-[260px] flex-1 p-3">
      <div className="w-full h-full bg-[#0d0d0d] rounded-xl border border-[#ffffff10] p-6">
        {/* TITLE */}
        <h1 className="text-white text-lg font-medium mb-10">
          Account Settings
        </h1>

        <div className="w-full flex justify-center">
          <div className="w-[600px] flex flex-col gap-4">
            <h2 className="text-white text-sm">Profile</h2>

            <div className="bg-[#171717] border border-[#ffffff10] rounded-2xl overflow-hidden">
              <div className="p-6 flex items-center gap-4 border-b border-[#ffffff10]">
                <div className="h-20 w-20 rounded-full overflow-hidden bg-[#222] flex items-center justify-center text-white text-lg font-medium">
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt="profile"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    initial
                  )}
                </div>
              </div>

              <div className="p-6 border-b border-[#ffffff10] flex flex-col gap-2">
                <label className="text-xs text-[#a3a3a3]">Display Name</label>

                <input
                  type="text"
                  defaultValue={user?.user_name}
                  className="w-full bg-[#212121] border border-[#ffffff10] transition-all duration-300 ease-in-out rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#ffffff30]"
                />
              </div>

              <div className="p-6 flex flex-col gap-2">
                <label className="text-xs text-[#a3a3a3]">Email</label>

                <input
                  type="text"
                  value={user?.email}
                  disabled
                  className="w-full bg-[#212121] border border-[#ffffff10] rounded-lg px-3 py-2 text-sm text-[#777] outline-none"
                />

                <p className="text-xs text-[#6b6b6b]">
                  Email cannot be changed here. Contact support to update your
                  email.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button className="bg-white text-black text-sm px-5 py-2 rounded-full cursor-pointer hover:bg-[#cfcfcf] transition">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
