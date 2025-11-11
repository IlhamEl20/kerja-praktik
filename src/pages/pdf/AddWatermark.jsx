import React, { useState } from "react";
import {
  Upload,
  Button,
  Input,
  Switch,
  Card,
  message,
  Space,
  Typography,
  Modal,
  Progress,
} from "antd";
import { InboxOutlined, DownloadOutlined } from "@ant-design/icons";
import AxiosInstance from "../../api/axios-instance";

const { Dragger } = Upload;
const { TextArea } = Input;
const { Title } = Typography;

export default function AddWatermark() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [onTop, setOnTop] = useState(false);
  const [update, setUpdate] = useState(false);
  const [pages, setPages] = useState("");
  const [desc, setDesc] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [loading, setLoading] = useState(false);
  const [progressTime, setProgressTime] = useState(0);

  // Simulate UI blocking time countdown
  const simulateProgress = (duration = 5) => {
    setProgressTime(duration);
    const interval = setInterval(() => {
      setProgressTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const props = {
    name: "file",
    multiple: false,
    maxCount: 1,
    accept: ".pdf",
    beforeUpload: (file) => {
      setFile(file);
      return false;
    },
    onRemove: () => {
      setFile(null);
    },
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageBase64(reader.result.split(",")[1]);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!file) {
      message.warning("Silakan upload file PDF terlebih dahulu.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("text", text);
    formData.append("onTop", onTop);
    formData.append("update", update);
    formData.append("pages", pages);
    formData.append("desc", desc);
    if (imageBase64) formData.append("image", imageBase64);

    setLoading(true);
    simulateProgress(7); // simulasi durasi 7 detik

    try {
      const response = await AxiosInstance.post("/pdf/watermark", formData, {
        responseType: "blob",
      });

      // ✅ Download otomatis
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "watermarked.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();

      message.success("Watermark berhasil diterapkan!");
    } catch (err) {
      console.error(err);
      message.error("Gagal menambahkan watermark.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center  min-h-screen bg-gray-50 p-6">
      <Card className="w-full max-w-3xl shadow-xl rounded-2xl">
        {/* File Upload */}
        <Dragger {...props} className="mb-6">
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Klik atau tarik PDF ke area ini untuk menambahkan watermark
          </p>
          <p className="ant-upload-hint text-gray-500">
            Hanya file PDF yang didukung
          </p>
        </Dragger>

        {/* Text Input */}
        <TextArea
          placeholder="Tulis teks watermark (contoh: CONFIDENTIAL)"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mb-4"
        />

        {/* Image Input */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-600">
            Atau unggah gambar watermark (opsional)
          </label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {imageBase64 && (
            <div className="mt-2">
              <img
                src={`data:image/png;base64,${imageBase64}`}
                alt="Preview"
                className="w-24 h-24 object-contain border rounded"
              />
              <Button
                type="link"
                danger
                onClick={() => setImageBase64("")}
                style={{ padding: 0 }}
              >
                Hapus Gambar
              </Button>
            </div>
          )}
        </div>

        {/* Options */}
        <Space direction="vertical" className="w-full mb-4">
          <div className="flex justify-between items-center">
            <span>Watermark di atas konten (onTop):</span>
            <Switch checked={onTop} onChange={setOnTop} />
          </div>

          <div className="flex justify-between items-center">
            <span>Update watermark yang sudah ada:</span>
            <Switch checked={update} onChange={setUpdate} />
          </div>

          <Input
            placeholder="Halaman (contoh: 1-3,5-)"
            value={pages}
            onChange={(e) => setPages(e.target.value)}
          />
          <Input
            placeholder='Deskripsi opsional (contoh: "points:24, color:.8 .8 .4, op:.6")'
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </Space>

        {/* Submit */}
        <Button
          type="primary"
          block
          icon={<DownloadOutlined />}
          size="large"
          onClick={handleSubmit}
          disabled={loading}
        >
          Tambahkan Watermark
        </Button>
      </Card>

      {/* Block UI saat proses */}
      <Modal open={loading} footer={null} closable={false} centered>
        <div className="text-center py-6">
          <Title level={4}>Menambahkan Watermark...</Title>
          <p>Proses ini memerlukan waktu sekitar {progressTime} detik</p>
          <Progress percent={((7 - progressTime) / 7) * 100} status="active" />
        </div>
      </Modal>
    </div>
  );
}
