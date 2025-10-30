import React, { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useDropzone } from "react-dropzone";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ✅ Worker PDF.js untuk Vite
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min?url";
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// ✅ Sortable item (card preview)
function SortableItem({ id, file, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative bg-white shadow-md rounded-xl flex flex-col border hover:shadow-lg transition"
    >
      {/* 🔹 Header card di luar area drag */}
      <div className="flex justify-end items-center px-2 pt-2 pb-1 border-b">
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove(file);
          }}
          className="bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
        >
          ✕
        </button>
      </div>

      {/* 🔹 Area drag (bawah header) */}
      <div
        {...attributes}
        {...listeners}
        className="flex flex-col items-center p-3 cursor-grab select-none"
      >
        <div className="w-full h-40 flex justify-center items-center bg-gray-50 rounded-md overflow-hidden">
          <Document
            file={file}
            loading={<p className="text-sm text-gray-400">Loading...</p>}
            error={<p className="text-sm text-red-400">Failed to load</p>}
            className="pointer-events-none"
          >
            <Page
              pageNumber={1}
              width={120}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
        <p className="text-xs mt-2 text-center truncate w-full">{file.name}</p>
      </div>
    </div>
  );
}

export default function PdfMerge() {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const pdfs = acceptedFiles.filter(
      (file) => file.type === "application/pdf"
    );
    setFiles((prev) => [...prev, ...pdfs]);
    setDragging(false);
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openFileDialog,
  } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    noClick: true,
  });

  const handleRemove = (fileToRemove) => {
    setFiles((prev) => prev.filter((f) => f !== fileToRemove));
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await fetch("/api/pdf/merge", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      alert("❌ Gagal menggabungkan PDF");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "merged.pdf";
    link.click();
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = files.findIndex((f) => f.name === active.id);
      const newIndex = files.findIndex((f) => f.name === over.id);
      setFiles((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-700">Merge PDF Files</h1>

      {/* 🔹 Drag & Drop Area */}
      <div
        {...getRootProps()}
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        className={`w-full max-w-3xl border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          isDragActive || dragging
            ? "border-blue-500 bg-blue-50 scale-105"
            : "border-gray-400 bg-white"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600 text-lg">
          {isDragActive || dragging
            ? "Lepaskan file PDF di sini..."
            : "Tarik & jatuhkan file PDF di sini"}
        </p>
        <button
          onClick={openFileDialog}
          type="button"
          className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Pilih File
        </button>
      </div>

      {/* 🔹 Preview */}
      {files.length > 0 && (
        <div className="mt-10 w-full max-w-5xl">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={files.map((f) => f.name)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {files.map((file) => (
                  <SortableItem
                    key={file.name}
                    id={file.name}
                    file={file}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* 🔹 Tombol Merge */}
      <button
        onClick={handleMerge}
        disabled={files.length < 2}
        className={`mt-10 px-8 py-3 rounded-lg text-white font-semibold transition-all ${
          files.length < 2
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        Merge PDFs ({files.length}/2)
      </button>
    </div>
  );
}
