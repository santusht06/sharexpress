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
    const rejected = [];

    arr.forEach((f) => {
      if (f.size <= MAX_SIZE) valid.push(f);
      else rejected.push(f);
    });

    if (rejected.length) {
      toast.error(`${rejected.length} file(s) exceed 20MB`);
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

      const pendingFiles = pendingIndexes.map((i) => localFiles[i]);

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
      <div className="w-[420px] bg-[#171717] border border-[#ffffff12] rounded-2xl shadow-2xl p-6 flex flex-col gap-5">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-white text-sm">Upload Files</h2>
          <button onClick={onClose} className="text-[#6a6a6a]">
            ✕
          </button>
        </div>

        {/* DROP */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`p-6 border rounded-xl text-center cursor-pointer transition ${
            dragActive
              ? "border-green-400 bg-green-400/10"
              : "border-[#ffffff20]"
          }`}
        >
          <p className="text-xs text-gray-400">
            Drag & drop or click to browse
          </p>
          <input type="file" multiple onChange={handleChange} hidden />
        </label>

        {/* CLEAR */}
        {files.length > 0 && !uploading && (
          <button
            onClick={handleRemoveAll}
            className="text-[10px] text-red-400 text-right"
          >
            Clear all
          </button>
        )}

        {/* FILES */}
        <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto">
          {files.map((file, i) => {
            const status = statusMap[i];

            return (
              <div key={i} className="bg-[#1f1f1f] p-3 rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-white">{file.name}</p>
                    <p className="text-[10px] text-gray-500">
                      {formatSize(file.size)}
                    </p>
                  </div>

                  <span className="text-[10px] text-green-400">
                    {status === "done"
                      ? "✔ Uploaded"
                      : status === "uploading"
                        ? "Uploading..."
                        : `${progressMap[i] || 0}%`}
                  </span>
                </div>

                <div className="h-[5px] bg-[#2a2a2a] mt-2 rounded">
                  <div
                    className="h-full bg-green-400 transition-all"
                    style={{ width: `${progressMap[i] || 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center">
          <button onClick={onClose} className="text-xs text-gray-400">
            Close
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
