import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  initUpload,
  completeUpload,
  setFiles,
  setFileProgress,
  setFileStatus,
  removeFile,
  removeAllFiles,
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

  const MAX_SIZE = 20 * 1024 * 1024;

  const [localFiles, setLocalFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  // 📁 FORMAT SIZE
  const formatSize = (size) => {
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
    return (size / (1024 * 1024)).toFixed(1) + " MB";
  };

  // 🚫 FILTER SIZE
  const filterValidFiles = (filesArr) => {
    const valid = [];
    const rejected = [];

    filesArr.forEach((file) => {
      if (file.size <= MAX_SIZE) valid.push(file);
      else rejected.push(file);
    });

    if (rejected.length) {
      toast.error(`${rejected.length} file(s) exceed 20MB limit`);
    }

    return valid;
  };

  // 📁 ADD FILES
  const handleChange = (e) => {
    let selected = Array.from(e.target.files);
    selected = filterValidFiles(selected);

    const updatedLocal = [...localFiles, ...selected];
    setLocalFiles(updatedLocal);

    dispatch(
      setFiles([
        ...files,
        ...selected.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
        })),
      ]),
    );
  };

  // 📦 DROP
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    let dropped = Array.from(e.dataTransfer.files);
    dropped = filterValidFiles(dropped);

    const updatedLocal = [...localFiles, ...dropped];
    setLocalFiles(updatedLocal);

    dispatch(
      setFiles([
        ...files,
        ...dropped.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
        })),
      ]),
    );
  };

  // 🚀 UPLOAD WITH PROGRESS
  const uploadWithProgress = (url, file, index) =>
    new Promise((resolve, reject) => {
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

  // 🚀 HANDLE UPLOAD
  const handleUpload = async () => {
    try {
      if (!localFiles.length) return;

      toast.info("Preparing upload...");

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

  const handleRemoveFile = (index) => {
    if (uploading) return;

    const updated = [...localFiles];
    updated.splice(index, 1);
    setLocalFiles(updated);

    dispatch(removeFile(index));
  };

  const handleRemoveAll = () => {
    if (uploading) return;

    setLocalFiles([]);
    dispatch(removeAllFiles());
  };

  const allDone =
    files.length > 0 && files.every((_, i) => statusMap[i] === "done");

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="w-[420px] bg-[#171717] border border-[#ffffff12] rounded-2xl shadow-2xl p-6 flex flex-col gap-5">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-white text-sm tracking-wide">Upload Files</h2>
          <button
            onClick={onClose}
            className="text-[#6a6a6a] hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* DROP ZONE */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`rounded-xl p-6 text-center cursor-pointer transition border relative overflow-hidden
            ${
              dragActive
                ? "border-green-400 bg-green-400/5 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                : "border-[#ffffff20] hover:border-white/40"
            }
          `}
        >
          <p className="text-xs text-[#8a8a8a]">
            Drag & drop or click to browse
          </p>

          <input
            type="file"
            multiple
            onChange={handleChange}
            className="hidden"
          />
        </label>

        {/* CLEAR ALL */}
        {files.length > 0 && !uploading && (
          <button
            onClick={handleRemoveAll}
            className="text-[10px] text-red-400 text-right hover:underline"
          >
            Clear all
          </button>
        )}

        {/* FILE LIST */}
        <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto">
          {files.length === 0 && (
            <div className="text-center text-[#5a5a5a] text-xs py-6">
              Drop files to start uploading
            </div>
          )}

          {files.map((file, i) => {
            const status = statusMap[i];
            const isDone = status === "done";

            return (
              <div
                key={i}
                className="bg-[#1f1f1f] border border-[#ffffff10] rounded-lg p-3 flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-white truncate max-w-[200px] flex items-center gap-2">
                      📄 {file.name}
                    </p>
                    <p className="text-[10px] text-[#5a5a5a]">
                      {formatSize(file.size)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* STATUS BADGE */}
                    <span
                      className={`text-[10px] px-2 py-[2px] rounded-full ${
                        isDone
                          ? "bg-green-400/10 text-green-400"
                          : status === "uploading"
                            ? "bg-yellow-400/10 text-yellow-400"
                            : "bg-[#ffffff10] text-[#8a8a8a]"
                      }`}
                    >
                      {isDone
                        ? "Uploaded"
                        : status === "uploading"
                          ? "Uploading"
                          : `${progressMap[i] || 0}%`}
                    </span>

                    {!uploading && !isDone && (
                      <button
                        onClick={() => handleRemoveFile(i)}
                        className="text-[10px] text-red-400 opacity-60 hover:opacity-100"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="w-full h-[6px] bg-[#2a2a2a] rounded overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 transition-all duration-500 ease-out relative"
                    style={{ width: `${progressMap[i] || 0}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse blur-sm" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={onClose}
            className="text-xs text-[#8a8a8a] hover:text-white"
          >
            Close
          </button>

          <WButton
            Font_extralight
            disabled={!files.length || uploading || allDone}
            onClick={handleUpload}
            text={
              uploading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Uploading...
                </span>
              ) : allDone ? (
                "✔ Uploaded"
              ) : (
                "Upload"
              )
            }
          />
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
