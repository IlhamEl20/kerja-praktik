import { useState } from "react";
import { Card, Upload, Button, Modal, Spin, message } from "antd";
import { FileImageOutlined, UploadOutlined } from "@ant-design/icons";
import AxiosInstance from "../../api/axios-instance";

const { Dragger } = Upload;

export default function ImageToPDF() {
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const handleBeforeUpload = (file) => {
    const isImage =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/jpg";
    if (!isImage) {
      message.error("Hanya file gambar (JPG/PNG) yang diizinkan!");
      return Upload.LIST_IGNORE;
    }
    setFiles((prev) => [...prev, file]);

    const url = URL.createObjectURL(file);
    setPreviewUrls((prev) => [...prev, url]);
    return false; // jangan auto upload
  };

  const handleRemove = (file) => {
    const newFiles = files.filter((f) => f.uid !== file.uid);
    setFiles(newFiles);
    setPreviewUrls(previewUrls.filter((_, idx) => idx !== files.indexOf(file)));
  };

  const handleConvert = async () => {
    if (files.length === 0)
      return message.warning("Tambahkan minimal satu gambar!");

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    setLoading(true);
    setModalOpen(true);
    const start = performance.now();

    try {
      const res = await AxiosInstance.post("/pdf/imagetopdf", formData, {
        responseType: "blob",
      });

      const duration = ((performance.now() - start) / 1000).toFixed(2);
      setTimeTaken(duration);

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "converted.pdf";
      a.click();

      message.success(`Berhasil dikonversi (${duration}s)!`);
      // Reset form
      setFiles([]);
      setPreviewUrls([]);
    } catch (err) {
      console.log(err);
      message.error("Gagal konversi gambar ke PDF!");
    } finally {
      setLoading(false);
      setModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col items-center  min-h-screen bg-gray-50 p-4">
      <Card
        title={
          <span className="text-xl font-semibold">
            🖼️ Convert Gambar ke PDF
          </span>
        }
        className="w-full max-w-3xl shadow-md rounded-2xl"
      >
        <Dragger
          multiple
          showUploadList={false}
          beforeUpload={handleBeforeUpload}
          onRemove={handleRemove}
          accept="image/jpeg,image/png"
          className="p-6 rounded-xl"
        >
          <p className="ant-upload-drag-icon">
            <FileImageOutlined style={{ fontSize: 40, color: "#1677ff" }} />
          </p>
          <p className="ant-upload-text text-gray-700">
            Klik atau seret gambar ke sini
          </p>
          <p className="ant-upload-hint text-gray-500">
            Format: JPG, PNG (dikonversi menjadi 1 file PDF)
          </p>
        </Dragger>

        {/* Preview Gambar */}
        {previewUrls.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            {previewUrls.map((url, idx) => (
              <div key={idx} className="relative">
                <img
                  src={url}
                  alt={`Preview ${idx}`}
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  size="small"
                  type="primary"
                  danger
                  className="absolute top-1 right-1"
                  onClick={() => handleRemove(files[idx])}
                >
                  Hapus
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button
          type="primary"
          className="w-full mt-6 h-12 text-lg rounded-xl"
          disabled={files.length === 0 || loading}
          onClick={handleConvert}
        >
          {loading ? "Memproses..." : `Convert ke PDF (${files.length})`}
        </Button>
      </Card>

      {/* Modal proses konversi */}
      <Modal
        open={modalOpen}
        footer={null}
        closable={false}
        centered
        bodyStyle={{ textAlign: "center", padding: "2rem" }}
      >
        <Spin size="large" />
        <p className="mt-4 text-gray-700 text-lg">
          Mengonversi gambar ke PDF...
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Waktu berjalan: <strong>{timeTaken}s</strong>
        </p>
      </Modal>
    </div>
  );
}
