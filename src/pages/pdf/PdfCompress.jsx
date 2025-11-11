import React, { useState, useEffect } from "react";
import { Upload, Button, Card, Divider, message, Spin } from "antd";
import {
  InboxOutlined,
  CompressOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { Document, Page, pdfjs } from "react-pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min?url";
import AxiosInstance from "../../api/axios-instance";

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const { Dragger } = Upload;

export default function PdfCompress() {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compressionPercent, setCompressionPercent] = useState(null);
  const [sizeBefore, setSizeBefore] = useState(null);
  const [sizeAfter, setSizeAfter] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval;
    if (loading) {
      setElapsed(0);
      const start = Date.now();
      interval = setInterval(() => {
        setElapsed(((Date.now() - start) / 1000).toFixed(1));
      }, 100);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleBeforeUpload = (file) => {
    if (!file.name.endsWith(".pdf")) {
      message.error("❌ Hanya file PDF yang diperbolehkan.");
      return Upload.LIST_IGNORE;
    }

    const fileURL = URL.createObjectURL(file);
    setFile(file);
    setPreviewUrl(fileURL);
    setCompressionPercent(null);
    setDownloadUrl(null);
    setSizeBefore(file.size);
    return false;
  };

  const handleRemove = () => {
    setFile(null);
    setPreviewUrl(null);
    setNumPages(null);
    setCompressionPercent(null);
    setSizeBefore(null);
    setSizeAfter(null);
    setDownloadUrl(null);
  };

  const handleCompress = async () => {
    if (!file) {
      message.warning("Pilih file PDF terlebih dahulu.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const originalSize = file.size;

      const response = await AxiosInstance.post("/pdf/compress", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
      });

      const compressedLength = Number(response.headers["content-length"]);
      const percent = ((originalSize - compressedLength) / originalSize) * 100;

      setCompressionPercent(percent.toFixed(2));
      setSizeAfter(compressedLength);

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);

      // Setelah sukses → hapus preview
      setPreviewUrl(null);

      message.success("✅ Kompresi selesai!");
    } catch (err) {
      console.error(err);
      message.error("❌ Terjadi kesalahan saat mengompres PDF.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `compressed_${file.name}`;
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 relative">
      <Card
        variant="borderless"
        className="w-full max-w-4xl shadow-lg rounded-2xl p-8 bg-white relative overflow-hidden"
      >
        {/* Overlay saat kompres berlangsung */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <Spin size="large" />
            <p className="mt-4 text-gray-700 text-lg font-medium">
              Sedang mengompres PDF...
            </p>
            <p className="text-sm text-gray-500 mt-1">
              ⏳ {elapsed} detik berlalu
            </p>
          </div>
        )}

        {!file ? (
          <Dragger
            multiple={false}
            showUploadList={false}
            beforeUpload={handleBeforeUpload}
            accept="application/pdf"
            disabled={loading}
            className="border-dashed border-gray-300 hover:border-blue-500 transition-all"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: "#1677ff" }} />
            </p>
            <p className="ant-upload-text text-gray-700">
              Klik atau tarik 1 file PDF ke area ini
            </p>
            <p className="ant-upload-hint text-gray-500 text-sm">
              Hanya mendukung satu file per proses
            </p>
          </Dragger>
        ) : !compressionPercent ? (
          <>
            <Divider orientation="center">📄 Preview PDF</Divider>
            <div className="border rounded-xl shadow-sm p-4 bg-gray-50 relative">
              <Button
                icon={<DeleteOutlined />}
                danger
                size="small"
                onClick={handleRemove}
                className="absolute mb-3 right-3"
              >
                Hapus
              </Button>

              <div
                className="flex justify-center overflow-auto"
                style={{ maxHeight: 500 }}
              >
                <Document
                  file={previewUrl}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={<p>Memuat pratinjau PDF...</p>}
                >
                  <Page pageNumber={1} scale={1.2} />
                </Document>
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Total halaman: {numPages}
              </p>
            </div>

            <div className="flex justify-center mt-8">
              <Button
                type="primary"
                icon={<CompressOutlined />}
                size="large"
                onClick={handleCompress}
                loading={loading}
              >
                Kompres Sekarang
              </Button>
            </div>
          </>
        ) : (
          <>
            <Divider orientation="center">📊 Hasil Kompresi</Divider>
            <Card
              className="bg-green-50 border border-green-300 text-center py-6 rounded-xl"
              bordered={false}
            >
              <h3 className="text-2xl font-semibold text-green-700 mb-2">
                🎉 Kompresi Berhasil!
              </h3>
              <p className="text-green-600 text-lg font-medium mb-1">
                Ukuran berkurang {compressionPercent}% 🚀
              </p>
              <p className="text-gray-600">
                Dari {(sizeBefore / 1024 / 1024).toFixed(2)} MB →{" "}
                {(sizeAfter / 1024 / 1024).toFixed(2)} MB
              </p>
              <div className="flex justify-center mt-6">
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  size="large"
                  onClick={handleDownload}
                >
                  Download PDF Hasil
                </Button>
              </div>
            </Card>

            <div className="text-center mt-8">
              <Button type="link" onClick={handleRemove}>
                🔄 Kompres file lain
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
