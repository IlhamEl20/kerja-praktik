import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Upload,
  Button,
  Spin,
  notification,
  Modal,
  Progress,
  Typography,
} from "antd";
import {
  InboxOutlined,
  LoadingOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min?url";
import AxiosInstance from "../../api/axios-instance";

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const { Dragger } = Upload;
const { Title } = Typography;

function SortableItem({ id, file, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative bg-white shadow-md rounded-xl flex flex-col border hover:shadow-lg transition"
    >
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
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const handleBeforeUpload = (file) => {
    if (!file.name.endsWith(".pdf")) {
      notification.error({
        message: "❌ Hanya file PDF yang diperbolehkan",
        placement: "topRight",
      });
      return Upload.LIST_IGNORE;
    }
    setFiles((prev) => [...prev, file]);
    return false;
  };

  const handleRemove = (fileToRemove) => {
    setFiles((prev) => prev.filter((f) => f !== fileToRemove));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      notification.warning({
        message: "Minimal 2 File Diperlukan",
        description: "Tambahkan minimal 2 file PDF untuk digabungkan.",
        placement: "topRight",
      });
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    // Mulai proses + tampilkan modal progress
    setLoading(true);
    setProgress(0);
    setTimeLeft(8); // estimasi waktu 8 detik

    // simulasi animasi progress
    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) return 100;
        return old + 100 / 8; // 8 detik -> 100%
      });
    }, 1000);

    const countdown = setInterval(() => {
      setTimeLeft((old) => {
        if (old <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return old - 1;
      });
    }, 1000);

    try {
      const res = await AxiosInstance.post("/pdf/merge", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const mergedName = `${files[0].name.replace(/\.pdf$/, "")}_merged.pdf`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = mergedName;
      a.click();
      window.URL.revokeObjectURL(url);

      notification.success({
        message: "✅ Berhasil Digabung!",
        description: `File hasil: ${mergedName}`,
        placement: "topRight",
      });
    } catch (err) {
      notification.error({
        message: "❌ Gagal Menggabungkan",
        description: err.message,
        placement: "topRight",
      });
    } finally {
      setFiles([]);
      clearInterval(timer);
      setProgress(100);
      setTimeout(() => setLoading(false), 1200);
    }
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

  // eslint-disable-next-line no-unused-vars
  const loadingIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center p-8">
      {/* 🔹 Modal Progress */}
      <Modal open={loading} closable={false} footer={null} centered width={400}>
        <div className="text-center py-6">
          <FilePdfOutlined style={{ fontSize: 48, color: "#1677ff" }} />
          <Title level={4} className="mt-3 mb-1">
            Menggabungkan File PDF
          </Title>
          <p className="text-gray-600 mb-4">
            Proses akan selesai dalam sekitar <strong>{timeLeft}s</strong>
          </p>
          <Progress
            percent={Math.round(progress)}
            status="active"
            strokeColor={{ from: "#1677ff", to: "#52c41a" }}
          />
        </div>
      </Modal>

      {/* 🔹 Upload */}
      <Dragger
        multiple
        showUploadList={false}
        beforeUpload={handleBeforeUpload}
        accept="application/pdf"
        disabled={loading}
        className="w-full max-w-3xl border-dashed border-gray-400 hover:border-blue-500 bg-white hover:bg-blue-50 rounded-2xl p-12 transition-all duration-300 shadow-sm"
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ color: "#1677ff", fontSize: "32px" }} />
        </p>
        <p className="ant-upload-text text-gray-700 text-lg">
          Tarik & jatuhkan file PDF di sini
        </p>
        <p className="ant-upload-hint text-gray-500 text-sm mb-4">
          atau klik tombol di bawah untuk memilih file
        </p>
      </Dragger>

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
      <Button
        onClick={handleMerge}
        disabled={files.length < 2 || loading}
        type="primary"
        size="large"
        className="mt-8"
      >
        Merge PDFs ({files.length}/2)
      </Button>
    </div>
  );
}
