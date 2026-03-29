// DashboardFiles.jsx
// Parent is clean — no URL fetching logic here.
// Each FileCard handles its own lazy fetch via useInViewUrl.

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserFiles, deleteAllFiles } from "../../store/slices/FileSlices";
import FileCard from "./FileCard";
import NofileFound from "./NofileFound";
import { Grid, List } from "lucide-react";
import { toast } from "react-toastify";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { clearUrlCache, removeCachedUrl } from "../../helpers/urlCache";

const DashboardFiles = () => {
  const dispatch = useDispatch();
  const { userFiles = [], loadingFiles } = useSelector((state) => state.files);

  const [view, setView] = useState("list");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  useEffect(() => {
    dispatch(fetchUserFiles());
  }, [dispatch]);

  const handleDownload = (file) => {
    const url = file?.download_url;
    if (url) {
      window.open(url, "_blank");
    } else {
      window.open(
        `http://localhost:8000/files/download/${file.file_id}`,
        "_blank",
      );
    }
  };

  const handleDelete = (fileId) => {
    removeCachedUrl(fileId);
    // dispatch your single delete action here
  };

  const handleDeleteAll = async () => {
    try {
      setDeletingAll(true);
      await dispatch(deleteAllFiles()).unwrap();
      clearUrlCache();
      toast.success("All files deleted");
      setDeleteModalOpen(false);
    } catch {
      toast.error("Failed to delete all");
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div className="ml-[260px] flex-1 p-3">
      <div className="w-full min-h-full bg-[#0d0d0d] rounded-xl border border-[#ffffff10] p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-white text-lg font-medium">Your Files</h1>
          <div className="flex items-center gap-3">
            {userFiles.length > 0 && (
              <div className="flex bg-[#1a1a1a] border border-[#ffffff10] rounded-lg overflow-hidden">
                <button
                  onClick={() => setView("list")}
                  className={`p-2 transition ${view === "list" ? "bg-white text-black" : "text-[#8a8a8a] hover:text-white"}`}
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 transition ${view === "grid" ? "bg-white text-black" : "text-[#8a8a8a] hover:text-white"}`}
                >
                  <Grid size={16} />
                </button>
              </div>
            )}
            {userFiles.length > 0 && (
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="text-xs text-red-400 hover:text-red-300 transition"
              >
                Delete All
              </button>
            )}
          </div>
        </div>

        {loadingFiles && (
          <p className="text-[#7a7a7a] text-sm">Loading files...</p>
        )}
        {!loadingFiles && userFiles.length === 0 && <NofileFound />}

        {!loadingFiles && userFiles.length > 0 && (
          <div
            className={
              view === "grid"
                ? "grid grid-cols-2 md:grid-cols-3 gap-4"
                : "flex flex-col gap-3"
            }
          >
            {userFiles.map((file) => (
              <FileCard
                key={file.file_id}
                file={file}
                onDownload={handleDownload}
                onDelete={handleDelete}
                view={view}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAll}
        loading={deletingAll}
      />
    </div>
  );
};

export default DashboardFiles;
