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
  } = useSelector((state) => state.files || {});

  const [localFiles, setLocalFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const MAX_SIZE = 20 * 1024 * 1024;

  // 📁 SIZE FORMAT
  const formatSize = (size) => {
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
    return (size / (1024 * 1024)).toFixed(1) + " MB";
  };

  // 🚫 FILTER
  const filterValidFiles = (arr) => {
    const valid = [];
    const rejectedSize = [];
    const rejectedEmpty = [];

    arr.forEach((f) => {
      if (f.size === 0) {
        rejectedEmpty.push(f);
      } else if (f.size > MAX_SIZE) {
        rejectedSize.push(f);
      } else {
        valid.push(f);
      }
    });

    // 🚫 EMPTY FILES
    if (rejectedEmpty.length) {
      toast.error(`${rejectedEmpty.length} empty file(s) removed`);
    }

    // 🚫 TOO LARGE FILES
    if (rejectedSize.length) {
      toast.error(`${rejectedSize.length} file(s) exceed 20MB`);
    }

    return valid;
  };

  // 📁 ADD FILES (append)
  const addFiles = (incoming) => {
    const valid = filterValidFiles(incoming);

    if (!valid.length) return;

    const updatedLocal = [...localFiles, ...valid];
    setLocalFiles(updatedLocal);

    dispatch(
      setFiles([
        ...files,
        ...valid.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
        })),
      ]),
    );
  };

  const handleChange = (e) => {
    addFiles(Array.from(e.target.files));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    addFiles(Array.from(e.dataTransfer.files));
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

  // 🚀 MAIN UPLOAD (ONLY PENDING)
  const handleUpload = async () => {
    try {
      if (!localFiles.length) return;

      // 🔥 find pending indexes
      const pendingIndexes = files
        .map((_, i) => i)
        .filter((i) => statusMap[i] !== "done");

      if (!pendingIndexes.length) {
        toast.info("Nothing to upload");
        return;
      }

      setUploading(true);

      const pendingFiles = pendingIndexes
        .map((i) => localFiles[i])
        .filter((f) => f && f.size > 0);

      const res = await dispatch(initUpload(pendingFiles)).unwrap();

      const uploaded = [];

      await Promise.all(
        res.files.map((meta, idx) => {
          const actualIndex = pendingIndexes[idx];

          dispatch(setFileStatus({ index: actualIndex, status: "uploading" }));

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

      await dispatch(completeUpload(uploaded)).unwrap();

      toast.success("Upload complete 🚀");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ❌ REMOVE
  const handleRemoveFile = (index) => {
    if (uploading) return;

    const updatedLocal = [...localFiles];
    updatedLocal.splice(index, 1);
    setLocalFiles(updatedLocal);

    dispatch(removeFile(index));
  };

  const handleRemoveAll = () => {
    if (uploading) return;

    setLocalFiles([]);
    dispatch(removeAllFiles());
  };

  // 🔥 STATE FIX
  const hasPending = files.some((_, i) => statusMap[i] !== "done");

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="w-[440px] bg-[#171717] border border-[#ffffff12] rounded-2xl shadow-2xl p-6 flex flex-col gap-5">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h2 className="text-white text-[15px] font-medium tracking-wide">
              Upload Files
            </h2>
            <span className="text-[11px] text-[#6a6a6a]">
              {files.length} file{files.length !== 1 && "s"}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-[#6a6a6a] hover:text-white transition text-sm"
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
          className={`p-7 text-center cursor-pointer border rounded-xl transition-all duration-300 ${
            dragActive
              ? "border-green-400 bg-green-400/10 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
              : "border-[#ffffff15] hover:border-white/40"
          }`}
        >
          <p className="text-sm text-[#d1d1d1] font-light">
            Drag & drop files here
          </p>

          <p className="text-[11px] text-[#6a6a6a] mt-1">
            or click to browse • Max 20MB
          </p>

          <input type="file" multiple onChange={handleChange} hidden />
        </label>

        {/* CLEAR */}
        {files.length > 0 && !uploading && (
          <div className="flex justify-end">
            <button
              onClick={handleRemoveAll}
              className="text-[11px] text-red-400 hover:text-red-300 transition"
            >
              Clear all
            </button>
          </div>
        )}

        {/* FILE LIST */}
        <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto pr-1">
          {files.map((file, i) => {
            const status = statusMap[i];
            const progress = progressMap[i] || 0;

            return (
              <div
                key={i}
                className="group bg-[#1f1f1f] border border-[#ffffff08] rounded-lg px-3 py-2 transition hover:border-white/20"
              >
                {/* TOP */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col max-w-[70%]">
                    <p className="text-[12px] text-white truncate">
                      {file.name}
                    </p>

                    <span className="text-[10px] text-[#6a6a6a]">
                      {formatSize(file.size)}
                    </span>
                  </div>

                  {/* STATUS */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] ${
                        status === "done"
                          ? "text-green-400"
                          : status === "uploading"
                            ? "text-yellow-400"
                            : "text-[#8a8a8a]"
                      }`}
                    >
                      {status === "done"
                        ? "Uploaded"
                        : status === "uploading"
                          ? "Uploading"
                          : `${progress}%`}
                    </span>

                    {!uploading && status !== "done" && (
                      <button
                        onClick={() => handleRemoveFile(i)}
                        className="text-[#6a6a6a] hover:text-red-400 transition text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="mt-2 h-[4px] bg-[#2a2a2a] rounded overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      status === "done" ? "bg-green-400" : "bg-green-400"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={onClose}
            className="text-[11px] text-[#6a6a6a] hover:text-white transition"
          >
            Cancel
          </button>

          <WButton
            onClick={handleUpload}
            disabled={!hasPending || uploading}
            text={
              uploading ? "Uploading..." : hasPending ? "Upload" : "Uploaded"
            }
            Font_extralight={true}
          />
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
