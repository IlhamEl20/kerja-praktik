import React, { useState } from "react";
import {
  Upload,
  Button,
  Select,
  InputNumber,
  Input,
  Modal,
  Spin,
  notification,
} from "antd";
import { InboxOutlined, ClockCircleOutlined } from "@ant-design/icons";
import AxiosInstance from "../../api/axios-instance";

const { Dragger } = Upload;
const { Option } = Select;

export default function SplitPDF() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("per_page");
  const [span, setSpan] = useState(2);
  const [pages, setPages] = useState("");
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [visible, setVisible] = useState(false);

  const handleBeforeUpload = (file) => {
    if (!file.name.endsWith(".pdf")) {
      notification.error({ message: "❌ Hanya file PDF yang diperbolehkan" });
      return Upload.LIST_IGNORE;
    }
    setFile(file);
    return false;
  };

  const handleSplit = async () => {
    if (!file) {
      notification.warning({ message: "Pilih file PDF terlebih dahulu" });
      return;
    }

    setVisible(true);
    setLoading(true);
    setElapsed(0);
    const startTime = Date.now();

    // Timer tampilkan waktu proses
    const timer = setInterval(() => {
      setElapsed(((Date.now() - startTime) / 1000).toFixed(1));
    }, 100);

    const formData = new FormData();
    formData.append("file", file);

    const config = { mode };
    if (mode === "per_n") config.span = span;
    if (mode === "page_numbers") {
      try {
        config.pages = pages
          .split(",")
          .map((p) => parseInt(p.trim()))
          .filter((n) => !isNaN(n));
      } catch {
        notification.error({ message: "Format halaman tidak valid" });
        clearInterval(timer);
        setVisible(false);
        setLoading(false);
        return;
      }
    }
    formData.append("config", JSON.stringify(config));

    try {
      const res = await AxiosInstance.post("/pdf/splitv2", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      clearInterval(timer);
      setElapsed(duration);

      const blob = new Blob([res.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `split_result_${Date.now()}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);

      notification.success({
        message: "✅ Split Berhasil",
        description: `Mode: ${
          res.headers["x-split-mode"] || mode
        } | Waktu: ${duration}s`,
      });
    } catch (err) {
      notification.error({
        message: "❌ Gagal Split PDF",
        description: err.message,
      });
    } finally {
      clearInterval(timer);
      setLoading(false);
      setVisible(false);
    }
  };

  const handleRemove = () => setFile(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center  p-8">
      {/* 🔹 Upload */}
      <Dragger
        multiple={false}
        showUploadList={false}
        beforeUpload={handleBeforeUpload}
        accept="application/pdf"
        disabled={loading}
        className="w-full max-w-2xl border-dashed border-gray-400 hover:border-blue-500 bg-white hover:bg-blue-50 rounded-2xl p-12 transition-all duration-300 shadow-sm"
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ color: "#1677ff", fontSize: "32px" }} />
        </p>
        <p className="ant-upload-text text-gray-700 text-lg">
          {file ? file.name : "Tarik & jatuhkan file PDF di sini"}
        </p>
        {!file && (
          <p className="ant-upload-hint text-gray-500 text-sm mb-4">
            atau klik untuk memilih file
          </p>
        )}
      </Dragger>

      {file && (
        <div className="mt-6 bg-white rounded-xl shadow-md p-6 w-full max-w-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-semibold">Mode Split:</span>
            <Select
              value={mode}
              onChange={setMode}
              style={{ width: 200 }}
              options={[
                { value: "per_page", label: "Setiap Halaman" },
                { value: "per_n", label: "Per N Halaman" },
                { value: "bookmark", label: "Berdasarkan Bookmark" },
                { value: "page_numbers", label: "Nomor Halaman Tertentu" },
              ]}
            />
          </div>

          {mode === "per_n" && (
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-semibold">
                Jumlah Halaman per File:
              </span>
              <InputNumber min={1} value={span} onChange={setSpan} />
            </div>
          )}

          {mode === "page_numbers" && (
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-semibold">
                Halaman (pisahkan dengan koma):
              </span>
              <Input
                placeholder="contoh: 2,5,9"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3">
            <Button onClick={handleRemove} disabled={loading}>
              Hapus File
            </Button>
            <Button type="primary" onClick={handleSplit} loading={loading}>
              Split PDF
            </Button>
          </div>
        </div>
      )}

      {/* 🔹 Modal Proses Split */}
      <Modal
        open={visible}
        closable={false}
        footer={null}
        centered
        bodyStyle={{ textAlign: "center", padding: "40px" }}
      >
        <Spin spinning={loading} size="large" />
        <div className="mt-4 text-lg text-gray-700 font-medium">
          <ClockCircleOutlined className="mr-2 text-blue-500" />
          Memproses Split... ({elapsed}s)
        </div>
      </Modal>
    </div>
  );
}
