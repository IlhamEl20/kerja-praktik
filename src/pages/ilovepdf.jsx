import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
// NOTE: react-pdf requires workerSrc to load the PDF worker. In Vite, add this line or set it in index.html
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url"; // 🧠 penting untuk Vite
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
/**
 * PdfToolkit.jsx
 * A single-file React component that implements a clean, modern UI inspired by iLovePDF
 * - Upload area (drag & drop or click)
 * - Tool selector (Merge / Compress / Watermark)
 * - File list with drag-to-reorder
 * - Preview pane (renders selected PDF using react-pdf)
 * - Action buttons that call backend endpoints (merge/compress/watermark)
 *
 * Stack assumptions:
 * - Vite + React
 * - TailwindCSS for styling
 * - react-pdf for previewing PDFs (npm i react-pdf)
 *
 * Usage:
 * 1. Install deps: npm i react-pdf
 * 2. Make sure Tailwind is configured in your Vite project
 * 3. Place this file in src/components/PdfToolkit.jsx and import in your app
 *
 */

export default function PdfToolkit() {
  const [files, setFiles] = useState([]); // { id, file, name, size, url }
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [tool, setTool] = useState("merge");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [quality, setQuality] = useState(75); // for compress
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const uploadRef = useRef(null);

  useEffect(() => {
    // Cleanup object URLs on unmount
    return () => {
      files.forEach((f) => f.url && URL.revokeObjectURL(f.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilesFromInput(fileList) {
    const arr = Array.from(fileList)
      .filter((f) => f.type === "application/pdf")
      .map((file, idx) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${idx}`,
        file,
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
      }));

    setFiles((prev) => [...prev, ...arr]);
    if (!selectedFileId && arr.length) setSelectedFileId(arr[0].id);
  }

  function onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const dt = e.dataTransfer;
    if (dt?.files) handleFilesFromInput(dt.files);
  }

  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  function removeFile(id) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (selectedFileId === id) setSelectedFileId(null);
  }

  function reorderFiles(startIndex, endIndex) {
    const result = Array.from(files);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setFiles(result);
  }

  function onFileInputChange(e) {
    handleFilesFromInput(e.target.files);
    e.target.value = null;
  }

  // simple drag reorder handlers for file list
  const dragIndex = useRef(null);
  function onFileDragStart(e, index) {
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
  }
  function onFileDragOverList(e) {
    e.preventDefault();
  }
  function onFileDropList(e, index) {
    e.preventDefault();
    if (dragIndex.current === null) return;
    reorderFiles(dragIndex.current, index);
    dragIndex.current = null;
  }

  async function callApi(endpoint, formData, expectBlob = true) {
    setLoading(true);
    setProgress(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      if (expectBlob) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        // Auto-download
        const a = document.createElement("a");
        a.href = url;
        a.download = `result-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else {
        const json = await res.json();
        return json;
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  function buildFormData() {
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f.file, f.name));
    return fd;
  }

  async function handleAction() {
    if (!files.length) return alert("Tambah file PDF dulu.");

    if (tool === "merge") {
      const fd = buildFormData();
      await callApi("/api/pdf/merge", fd, true);
    }

    if (tool === "compress") {
      const fd = buildFormData();
      fd.append("quality", String(quality));
      await callApi("/api/pdf/compress", fd, true);
    }

    if (tool === "watermark") {
      const fd = buildFormData();
      fd.append("text", watermarkText);
      fd.append("position", "center");
      await callApi("/api/pdf/watermark", fd, true);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">PDF Toolkit</h1>
          <div className="text-sm text-gray-600">
            Stack: Vite · React · Tailwind
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          {/* Left column: tool selector + upload */}
          <aside className="col-span-3 bg-white rounded-lg shadow p-4">
            <div className="space-y-4">
              <div>
                <h2 className="font-medium text-gray-700">Tools</h2>
                <div className="mt-2 grid gap-2">
                  <button
                    className={`w-full text-left px-3 py-2 rounded ${
                      tool === "merge"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                    onClick={() => setTool("merge")}
                  >
                    Merge
                  </button>
                  <button
                    className={`w-full text-left px-3 py-2 rounded ${
                      tool === "compress"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                    onClick={() => setTool("compress")}
                  >
                    Compress
                  </button>
                  <button
                    className={`w-full text-left px-3 py-2 rounded ${
                      tool === "watermark"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                    onClick={() => setTool("watermark")}
                  >
                    Watermark
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700">Upload PDF</h3>
                <div
                  ref={uploadRef}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  className="mt-2 border-2 border-dashed border-gray-200 rounded p-3 text-center cursor-pointer hover:border-indigo-300"
                  onClick={() => document.getElementById("pdf-input").click()}
                >
                  <input
                    id="pdf-input"
                    type="file"
                    accept="application/pdf"
                    multiple
                    className="hidden"
                    onChange={onFileInputChange}
                  />
                  <p className="text-sm text-gray-600">
                    Drag & drop file di sini atau klik untuk pilih
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Maks 10 file per operasi. Hanya PDF.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <h4 className="font-medium">Options</h4>
                <div className="mt-2">
                  {tool === "compress" && (
                    <div>
                      <label className="text-sm text-gray-600">
                        Quality ({quality}%)
                      </label>
                      <input
                        type="range"
                        min={10}
                        max={95}
                        value={quality}
                        onChange={(e) => setQuality(Number(e.target.value))}
                        className="w-full mt-2"
                      />
                    </div>
                  )}

                  {tool === "watermark" && (
                    <div>
                      <label className="text-sm text-gray-600">
                        Watermark text
                      </label>
                      <input
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        className="w-full mt-2 border rounded px-2 py-1"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Selain teks, backend bisa mendukung gambar/QR jika
                        diimplementasikan.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t">
                <button
                  onClick={handleAction}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-2 rounded"
                >
                  {loading
                    ? "Processing..."
                    : tool === "merge"
                    ? "Merge PDF"
                    : tool === "compress"
                    ? "Compress PDF"
                    : "Apply Watermark"}
                </button>

                {progress !== null && (
                  <div className="mt-2">
                    <div className="text-sm">Progress: {progress}%</div>
                    <div className="w-full bg-gray-200 rounded h-2 mt-1">
                      <div
                        style={{ width: `${progress}%` }}
                        className="h-2 rounded bg-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Center column: preview */}
          <main className="col-span-6 bg-white rounded-lg shadow p-4 min-h-[60vh]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Preview</h2>
              <div className="text-sm text-gray-500">
                {files.length} file(s) •{" "}
                {selectedFileId
                  ? files.find((f) => f.id === selectedFileId)?.name
                  : "No selection"}
              </div>
            </div>

            <div className="border rounded h-[60vh] overflow-auto p-3 flex items-start justify-center bg-gray-50">
              {selectedFileId ? (
                <div className="w-full">
                  <Document
                    file={files.find((f) => f.id === selectedFileId)?.url}
                    loading={
                      <div className="text-center text-gray-500">
                        Memuat preview...
                      </div>
                    }
                  >
                    <Page pageNumber={1} width={800} />
                  </Document>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  Pilih file di sebelah kanan untuk preview
                </div>
              )}
            </div>

            <div className="mt-3 text-right">
              <button
                className="text-sm px-3 py-1 rounded border"
                onClick={() => {
                  // simple example: download selected file
                  const f = files.find((x) => x.id === selectedFileId);
                  if (!f) return alert("Pilih file dulu");
                  const a = document.createElement("a");
                  a.href = f.url;
                  a.download = f.name;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                }}
              >
                Download Selected
              </button>
            </div>
          </main>

          {/* Right column: file list */}
          <section className="col-span-3 bg-white rounded-lg shadow p-4">
            <h3 className="font-medium">Files</h3>
            <p className="text-xs text-gray-400">
              Tarik untuk mengurutkan. Klik nama untuk memilih preview.
            </p>

            <div className="mt-3 space-y-2 max-h-[60vh] overflow-auto">
              {files.map((f, idx) => (
                <div
                  key={f.id}
                  draggable
                  onDragStart={(e) => onFileDragStart(e, idx)}
                  onDragOver={(e) => onFileDragOverList(e, idx)}
                  onDrop={(e) => onFileDropList(e, idx)}
                  className={`flex items-center justify-between p-2 rounded border ${
                    selectedFileId === f.id
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-gray-100"
                  }`}
                >
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setSelectedFileId(f.id)}
                  >
                    <div className="w-10 h-12 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                      PDF
                    </div>
                    <div className="text-sm">
                      <div className="font-medium truncate w-48">{f.name}</div>
                      <div className="text-xs text-gray-400">
                        {(f.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeFile(f.id)}
                      className="text-xs text-red-500 px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {!files.length && (
                <div className="text-center text-gray-400 py-6">
                  Tidak ada file. Tambah file untuk mulai.
                </div>
              )}
            </div>

            <div className="mt-4 border-t pt-3 text-xs text-gray-500">
              <div>Tips:</div>
              <ul className="list-disc ml-4 mt-2">
                <li>Gunakan Merge untuk menggabungkan beberapa PDF.</li>
                <li>
                  Compress mengecilkan ukuran; sesuaikan quality untuk hasil
                  terbaik.
                </li>
                <li>
                  Watermark menambahkan teks di tengah halaman — backend harus
                  mengimplementasikannya.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
