import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  initUpload,
  completeUpload,
  setFiles,
  setFileProgress,
  setFileStatus,
  resetUpload,
} from "../../store/slices/FileSlices";
import { toast } from "react-toastify";
import WButton from "../WButton";

const UploadModal = ({ onClose }) => {
  const dispatch = useDispatch();

  const {
    files = [],
    progressMap = {},
    statusMap = {},
    uploading,
  } = useSelector((state) => state.files || {});

  const [localFiles, setLocalFiles] = useState([]);

  // 📁 SELECT FILES
  const handleChange = (e) => {
    const selected = Array.from(e.target.files);

    setLocalFiles(selected);

    dispatch(
      setFiles(
        selected.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
        })),
      ),
    );
  };

  // 📦 DRAG DROP
  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);

    setLocalFiles(dropped);

    dispatch(
      setFiles(
        dropped.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
        })),
      ),
    );
  };

  // 🚀 UPLOAD WITH PROGRESS
  const uploadWithProgress = (url, file, index) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          dispatch(setFileProgress({ index, progress: percent }));
        }
      };

      xhr.onload = () => resolve();
      xhr.onerror = reject;

      xhr.send(file);
    });
  };

  // 🚀 MAIN UPLOAD
  const handleUpload = async () => {
    try {
      if (!localFiles.length) return;

      const res = await dispatch(initUpload(localFiles)).unwrap();

      const uploaded = [];
      const CHUNK = 3;

      for (let i = 0; i < res.files.length; i += CHUNK) {
        const batch = res.files.slice(i, i + CHUNK);

        await Promise.all(
          batch.map((meta, index) => {
            const actualIndex = i + index;

            dispatch(
              setFileStatus({ index: actualIndex, status: "uploading" }),
            );

            return uploadWithProgress(
              meta.upload_url,
              localFiles[actualIndex],
              actualIndex,
            ).then(() => {
              dispatch(setFileStatus({ index: actualIndex, status: "done" }));

              uploaded.push({
                file_id: meta.file_id,
                storage_key: meta.storage_key,
                filename: meta.filename,
                size: meta.size,
              });
            });
          }),
        );
      }

      await dispatch(completeUpload(uploaded)).unwrap();

      toast.success("All files uploaded 🚀");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    }
  };

  const allDone =
    files.length > 0 && files.every((_, i) => statusMap[i] === "done");

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="w-[400px] bg-[#171717] border border-[#ffffff12] rounded-2xl shadow-2xl p-6 flex flex-col gap-5">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-white text-sm tracking-wide">Upload Files</h2>

          <button
            onClick={onClose}
            className="text-[#8a8a8a] hover:text-white text-xs"
          >
            ✕
          </button>
        </div>

        {/* DROP ZONE */}
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border border-dashed border-[#ffffff20] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-white/40 transition"
        >
          <p className="text-xs text-[#8a8a8a]">Click or drag files here</p>

          <input
            type="file"
            multiple
            onChange={handleChange}
            className="hidden"
          />
        </label>

        {/* FILE LIST */}
        <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto pr-1">
          {files.length === 0 && (
            <p className="text-center text-[#5a5a5a] text-xs">
              No files selected
            </p>
          )}

          {files.map((file, i) => {
            const isDone = statusMap[i] === "done";

            return (
              <div
                key={i}
                className="bg-[#1f1f1f] border border-[#ffffff10] rounded-lg p-3 flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <p className="text-xs text-white truncate max-w-[200px]">
                    {file.name}
                  </p>

                  <span
                    className={`text-[10px] ${
                      isDone ? "text-green-400 font-medium" : "text-[#8a8a8a]"
                    }`}
                  >
                    {isDone ? "Uploaded" : `${progressMap[i] || 0}%`}
                  </span>
                </div>

                <div className="w-full h-[4px] bg-[#2a2a2a] rounded overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isDone ? "bg-green-500" : "bg-green-400"
                    }`}
                    style={{ width: `${progressMap[i] || 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* PROGRESS INFO */}
        {files.length > 0 && (
          <p className="text-[10px] text-[#5a5a5a] text-center">
            {Object.values(statusMap).filter((s) => s === "done").length} /{" "}
            {files.length} completed
          </p>
        )}

        {/* ACTIONS */}
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={onClose}
            className="text-xs text-[#8a8a8a] hover:text-white"
          >
            Cancel
          </button>
          <WButton
            Font_extralight={true}
            text={allDone ? "Uploaded" : uploading ? "Uploading..." : "Upload"}
            onClick={handleUpload}
            disabled={!files.length || uploading || allDone}
            loading={uploading}
          />
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
