import React from "react";
import useInViewUrl, { getFileType } from "../../helpers/Useinviewurl";
import PreviewThumbnail from "./Previewthumbnail";

const FilePreviewCard = ({ file, selected, onClick }) => {
  const { ref, url, loading, error, retry } = useInViewUrl(file);
  const type = getFileType(file?.filename);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`group p-2 border rounded-lg cursor-pointer transition ${
        selected
          ? "border-white bg-[#1a1a1a]"
          : "border-[#ffffff10] hover:border-white/30"
      }`}
    >
      {/* THUMBNAIL */}
      <div className="h-[90px] bg-[#111] rounded flex items-center justify-center overflow-hidden">
        <PreviewThumbnail
          type={type}
          url={url}
          filename={file.filename}
          size="full"
          loading={loading}
          error={error}
          onRetry={retry}
        />
      </div>

      {/* NAME */}
      <p className="text-white text-[11px] mt-2 truncate">{file.filename}</p>
    </div>
  );
};

export default FilePreviewCard;
