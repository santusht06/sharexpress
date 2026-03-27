import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  initUpload,
  completeUpload,
  setFiles,
  setFileProgress,
  resetUpload,
} from "../../store/slices/FileSlices";

const UploadModal = ({ onClose }) => {
  const dispatch = useDispatch();

  const fileState = useSelector((state) => state.files || {});
  const { files = [], progressMap = {} } = fileState;

  // 📁 FILE SELECT
  const handleChange = (e) => {
    dispatch(setFiles(Array.from(e.target.files)));
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

  const handleUpload = async () => {
    try {
      const res = await dispatch(initUpload(files)).unwrap();

      const uploaded = [];

      await Promise.all(
        res.files.map((meta, index) =>
          uploadWithProgress(meta.upload_url, files[index], index).then(() => {
            uploaded.push({
              file_id: meta.file_id,
              file_name: files[index].name,
            });
          }),
        ),
      );

      await dispatch(completeUpload(uploaded)).unwrap();

      dispatch(resetUpload());
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="w-[380px] bg-[#171717] border border-[#ffffff12] rounded-2xl shadow-2xl p-6 flex flex-col gap-5">
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
        <label className="border border-dashed border-[#ffffff20] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-white/40 transition">
          <p className="text-xs text-[#8a8a8a]">
            Click to browse or drag files
          </p>

          <input
            type="file"
            multiple
            onChange={handleChange}
            className="hidden"
          />
        </label>

        {/* FILE LIST */}
        <div className="flex flex-col gap-3 max-h-[180px] overflow-y-auto pr-1">
          {files.length === 0 && (
            <p className="text-xs text-[#5a5a5a] text-center">
              No files selected
            </p>
          )}

          {files.map((file, i) => (
            <div
              key={i}
              className="bg-[#1f1f1f] border border-[#ffffff10] rounded-lg p-3 flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <p className="text-xs text-white truncate max-w-[200px]">
                  {file.name}
                </p>

                <span className="text-[10px] text-[#8a8a8a]">
                  {progressMap[i] || 0}%
                </span>
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full h-[4px] bg-[#2a2a2a] rounded overflow-hidden">
                <div
                  className="h-full bg-green-400 transition-all duration-300"
                  style={{ width: `${progressMap[i] || 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={onClose}
            className="text-xs text-[#8a8a8a] hover:text-white transition"
          >
            Cancel
          </button>

          <button
            onClick={handleUpload}
            disabled={!files.length}
            className={`text-xs px-4 py-1 rounded-lg border transition
              ${
                files.length
                  ? "text-green-400 border-green-400/20 hover:bg-green-400/10"
                  : "text-[#5a5a5a] border-[#ffffff10] cursor-not-allowed"
              }
            `}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
