import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserFiles, deleteAllFiles } from "../../store/slices/FileSlices";
import FileCard from "./FileCard";
import NofileFound from "./NofileFound";
import { Grid, List } from "lucide-react";
import { toast } from "react-toastify";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import {
  getCachedUrl,
  setCachedUrl,
  getMissingFileIds,
  getUrlMapFromCache,
  removeCachedUrl,
  clearUrlCache,
} from "../../helpers/urlCache";

const PREVIEWABLE_EXTS = ["png", "jpg", "jpeg", "webp", "pdf", "doc", "docx"];

const isPreviewable = (filename = "") => {
  const ext = filename.split(".").pop()?.toLowerCase();
  return PREVIEWABLE_EXTS.includes(ext);
};

// ─── Fetch download URLs only for file IDs not already in cache ──────────────
const fetchMissingUrls = async (files) => {
  const previewable = files.filter((f) => isPreviewable(f.filename));
  const missingIds = getMissingFileIds(previewable.map((f) => f.file_id));

  if (!missingIds.length) return; // ✅ everything already cached

  const missingFiles = previewable.filter((f) =>
    missingIds.includes(f.file_id),
  );

  const results = await Promise.allSettled(
    missingFiles.map((f) =>
      fetch(`http://localhost:8000/files/download/${f.file_id}`, {
        credentials: "include",
      }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
    ),
  );

  // Write successful results into cache
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      const url = result.value?.download_url;
      if (url) setCachedUrl(missingFiles[i].file_id, url);
    }
  });
};

const DashboardFiles = () => {
  const dispatch = useDispatch();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [view, setView] = useState("list");
  const [deletingAll, setDeletingAll] = useState(false);
  const [downloadUrls, setDownloadUrls] = useState({});
  const [loadingUrls, setLoadingUrls] = useState(false);

  const { userFiles = [], loadingFiles } = useSelector((state) => state.files);

  useEffect(() => {
    dispatch(fetchUserFiles());
  }, [dispatch]);

  useEffect(() => {
    if (!userFiles.length) return;

    const allFileIds = userFiles
      .filter((f) => isPreviewable(f.filename))
      .map((f) => f.file_id);

    // ✅ Immediately populate from cache (no flicker)
    const cachedMap = getUrlMapFromCache(allFileIds);
    setDownloadUrls(cachedMap);

    // 🔍 Check if anything is missing from cache
    const missingIds = getMissingFileIds(allFileIds);
    if (!missingIds.length) return; // all cached — done

    // 🌐 Only fetch what's missing
    setLoadingUrls(true);
    fetchMissingUrls(userFiles)
      .then(() => {
        setDownloadUrls(getUrlMapFromCache(allFileIds));
      })
      .catch((err) => console.error("Failed to fetch download URLs:", err))
      .finally(() => setLoadingUrls(false));
  }, [userFiles]);

  const handleDownload = (file) => {
    const url = getCachedUrl(file.file_id);
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
    setDownloadUrls((prev) => {
      const next = { ...prev };
      delete next[fileId];
      return next;
    });
    // dispatch your single file delete action here
  };

  const handleDeleteAll = async () => {
    try {
      setDeletingAll(true);
      await dispatch(deleteAllFiles()).unwrap();
      clearUrlCache();
      setDownloadUrls({});
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
        {/* 🔥 HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-white text-lg font-medium">Your Files</h1>

          <div className="flex items-center gap-3">
            {userFiles.length > 0 && (
              <div className="flex bg-[#1a1a1a] border border-[#ffffff10] rounded-lg overflow-hidden">
                <button
                  onClick={() => setView("list")}
                  className={`p-2 transition ${
                    view === "list"
                      ? "bg-white text-black"
                      : "text-[#8a8a8a] hover:text-white"
                  }`}
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 transition ${
                    view === "grid"
                      ? "bg-white text-black"
                      : "text-[#8a8a8a] hover:text-white"
                  }`}
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

        {/* LOADING FILES */}
        {loadingFiles && (
          <p className="text-[#7a7a7a] text-sm">Loading files...</p>
        )}

        {/* EMPTY */}
        {!loadingFiles && userFiles.length === 0 && <NofileFound />}

        {/* FILE LIST */}
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
                downloadUrl={downloadUrls[file.file_id] || null}
                loadingUrl={loadingUrls && !downloadUrls[file.file_id]}
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
