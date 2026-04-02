import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserFiles,
  initUpload,
  completeUpload,
  setFiles,
  setFileProgress,
  setFileStatus,
} from "../../store/slices/FileSlices";
import { toast } from "react-toastify";
import WButton from "../WButton";

const UploadModal = ({ onClose }) => {
  const dispatch = useDispatch();

  const {
    userFiles = [],
    files = [],
    progressMap = {},
    statusMap = {},
    loadingFiles,
  } = useSelector((state) => state.files);

  const [activeTab, setActiveTab] = useState("files");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [localFiles, setLocalFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    dispatch(fetchUserFiles());
  }, [dispatch]);

  // 📁 SELECT EXISTING
  const toggleSelect = (file) => {
    setSelectedFiles((prev) =>
      prev.some((f) => f.file_id === file.file_id)
        ? prev.filter((f) => f.file_id !== file.file_id)
        : [...prev, file],
    );
  };

  // 📁 ADD FILES
  const handleChange = (e) => {
    const incoming = Array.from(e.target.files);
    setLocalFiles((prev) => [...prev, ...incoming]);

    dispatch(
      setFiles([
        ...files,
        ...incoming.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
        })),
      ]),
    );
  };

  // 🚀 UPLOAD
  const uploadWithProgress = (url, file, index) =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);

      xhr.upload.onprogress = (e) => {
        const percent = Math.round((e.loaded / e.total) * 100);
        dispatch(setFileProgress({ index, progress: percent }));
      };

      xhr.onload = resolve;
      xhr.onerror = reject;
      xhr.send(file);
    });

  const handleUpload = async () => {
    try {
      setUploading(true);

      const res = await dispatch(initUpload(localFiles)).unwrap();

      const uploaded = [];

      await Promise.all(
        res.files.map((meta, i) => {
          dispatch(setFileStatus({ index: i, status: "uploading" }));

          return uploadWithProgress(meta.upload_url, localFiles[i], i).then(
            () => {
              dispatch(setFileStatus({ index: i, status: "done" }));

              uploaded.push({
                file_id: meta.file_id,
                storage_key: meta.storage_key,
                filename: meta.filename,
                size: meta.size,
              });
            },
          );
        }),
      );

      await dispatch(completeUpload(uploaded)).unwrap();

      toast.success("Uploaded 🚀");
      dispatch(fetchUserFiles());

      setLocalFiles([]);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="w-[760px] max-h-[85vh] bg-[#0d0d0d] border border-[#ffffff10] rounded-xl flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-[#ffffff08] flex justify-between items-center">
          <h2 className="text-white text-sm">Manage Files</h2>
          <button onClick={onClose} className="text-[#6a6a6a]">
            ✕
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-[#ffffff08] px-6">
          {["files", "upload"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-xs mr-6 transition ${
                activeTab === tab
                  ? "text-white border-b border-white"
                  : "text-[#6a6a6a] hover:text-white"
              }`}
            >
              {tab === "files" ? "Your Files" : "Upload"}
            </button>
          ))}
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ================= FILES TAB ================= */}
          {activeTab === "files" && (
            <>
              {loadingFiles ? (
                <p className="text-gray-500 text-xs">Loading...</p>
              ) : userFiles.length === 0 ? (
                <div className="text-center text-gray-500 text-xs py-10">
                  No files found
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {userFiles.map((file) => (
                    <div
                      key={file.file_id}
                      onClick={() => toggleSelect(file)}
                      className={`p-3 border rounded-lg cursor-pointer transition ${
                        selectedFiles.some((f) => f.file_id === file.file_id)
                          ? "border-white bg-[#1a1a1a]"
                          : "border-[#ffffff10] hover:border-white/30"
                      }`}
                    >
                      <div className="h-[80px] bg-[#111] flex items-center justify-center text-xs text-gray-500 rounded">
                        FILE
                      </div>

                      <p className="text-white text-xs mt-2 truncate">
                        {file.filename}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ================= UPLOAD TAB ================= */}
          {activeTab === "upload" && (
            <div className="space-y-5">
              {/* DROP ZONE */}
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  handleChange({ target: { files: e.dataTransfer.files } });
                }}
                className={`p-8 border rounded-xl text-center cursor-pointer transition ${
                  dragActive ? "border-white bg-white/5" : "border-[#ffffff20]"
                }`}
              >
                <p className="text-xs text-gray-400">
                  Drag & drop files or click to upload
                </p>
                <input type="file" multiple hidden onChange={handleChange} />
              </label>

              {/* FILE LIST */}
              {files.length > 0 && (
                <div className="space-y-3">
                  {files.map((file, i) => (
                    <div key={i} className="bg-[#1a1a1a] p-3 rounded-lg">
                      <p className="text-xs text-white">{file.name}</p>

                      <div className="h-[5px] bg-[#2a2a2a] mt-2 rounded">
                        <div
                          className="h-full bg-green-400 transition-all"
                          style={{ width: `${progressMap[i] || 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-[#ffffff08] flex justify-between items-center">
          <p className="text-xs text-gray-500">
            {activeTab === "files"
              ? `${selectedFiles.length} selected`
              : `${files.length} files`}
          </p>

          <div className="flex gap-2">
            <button onClick={onClose} className="text-xs text-gray-400">
              Cancel
            </button>

            {activeTab === "upload" && files.length > 0 && (
              <WButton
                onClick={handleUpload}
                text={uploading ? "Uploading..." : "Upload"}
              />
            )}

            {activeTab === "files" && selectedFiles.length > 0 && (
              <WButton
                text="Share Selected"
                onClick={() => {
                  console.log(selectedFiles);
                  toast.success("Ready to share 🚀");
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
