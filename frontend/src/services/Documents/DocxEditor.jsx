import React, { useState } from "react";
import mammoth from "mammoth";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const DocxEditor = () => {
  const [htmlContent, setHtmlContent] = useState("");
  const [fileName, setFileName] = useState("");

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p class='text-gray-400'>Upload a .docx file to start...</p>",
    onUpdate: ({ editor }) => {
      setHtmlContent(editor.getHTML());
    },
  });

  // 📂 DOCX → HTML
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });

    editor.commands.setContent(result.value);
    setHtmlContent(result.value);
  };

  // 💾 HTML → DOCX (DOWNLOAD ONLY)
  const handleDownload = async () => {
    const htmlDocx = (await import("html-docx-js/dist/html-docx")).default;

    const blob = htmlDocx.asBlob(htmlContent);

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = fileName || "edited.docx";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 text-white flex flex-col gap-4  ">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-sm text-[#aaa]">DOCX Editor (Frontend Test)</h1>

        {htmlContent && (
          <button
            onClick={handleDownload}
            className="px-3 py-1 text-xs bg-white text-black rounded"
          >
            Download DOCX
          </button>
        )}
      </div>

      {/* FILE INPUT */}
      <input
        type="file"
        accept=".docx"
        onChange={handleFileUpload}
        className="text-xs text-[#777]"
      />

      {/* EDITOR */}
      <div className="border border-[#ffffff10] bg-[#0f0f0f] rounded-lg p-4 min-h-[400px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default DocxEditor;
