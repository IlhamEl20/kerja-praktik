import { useState, useEffect } from "react";
import {
  Card,
  Upload,
  Input,
  Select,
  Button,
  Modal,
  Spin,
  message,
} from "antd";
import { LockOutlined, UploadOutlined } from "@ant-design/icons";
import AxiosInstance from "../../api/axios-instance";

const { Dragger } = Upload;
const { Option } = Select;

export default function EncryptPDF() {
  const [file, setFile] = useState(null);
  const [userPw, setUserPw] = useState("");
  const [ownerPw, setOwnerPw] = useState("");
  const [key, setKey] = useState("256");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);

  // ⏱ Hitung waktu realtime selama proses enkripsi
  useEffect(() => {
    let timer;
    if (loading) {
      const start = Date.now();
      timer = setInterval(() => {
        setTimeTaken(((Date.now() - start) / 1000).toFixed(1));
      }, 200);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const handleEncrypt = async () => {
    if (!file)
      return message.warning("Silakan pilih file PDF terlebih dahulu!");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userpw", userPw);
    formData.append("opw", ownerPw);
    formData.append("key", key);

    setLoading(true);
    setModalOpen(true);
    setTimeTaken(0);

    try {
      const res = await AxiosInstance.post("/pdf/encrypt", formData, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "encrypted.pdf";
      a.click();

      message.success(`PDF berhasil dienkripsi (${timeTaken}s)`);

      // 🔄 Reset semua field setelah sukses
      setFile(null);
      setUserPw("");
      setOwnerPw("");
      setKey("256");
    } catch (err) {
      console.error(err);
      message.error("Gagal mengenkripsi PDF!");
    } finally {
      setLoading(false);
      setModalOpen(false);
    }
  };

  const uploadProps = {
    multiple: false,
    beforeUpload: (file) => {
      if (file.type !== "application/pdf") {
        message.error("Hanya file PDF yang diizinkan!");
        return Upload.LIST_IGNORE;
      }
      setFile(file);
      return false;
    },
    fileList: file ? [file] : [],
    accept: "application/pdf",
    maxCount: 1,
    onRemove: () => setFile(null),
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-4">
      <Card
        title={<span className="text-xl font-semibold">🔐 Encrypt PDF</span>}
        className="w-full max-w-3xl shadow-md rounded-2xl"
      >
        {/* Upload Area */}
        <Dragger {...uploadProps} className="p-6 rounded-xl">
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ fontSize: 40, color: "#1677ff" }} />
          </p>
          <p className="ant-upload-text text-gray-700">
            Klik atau seret file PDF ke area ini untuk mengenkripsi
          </p>
          {file && <p className="text-gray-500 mt-2">📄 {file.name}</p>}
        </Dragger>

        {/* Password Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="User Password (optional)"
            value={userPw}
            onChange={(e) => setUserPw(e.target.value)}
          />
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Owner Password (optional)"
            value={ownerPw}
            onChange={(e) => setOwnerPw(e.target.value)}
          />
        </div>

        {/* Key Selection */}
        <div className="mt-4">
          <Select
            value={key}
            onChange={setKey}
            className="w-full md:w-1/2"
            placeholder="Pilih panjang kunci (bit)"
          >
            <Option value="40">40-bit (Low)</Option>
            <Option value="128">128-bit (Medium)</Option>
            <Option value="256">256-bit (Strong)</Option>
          </Select>
        </div>

        {/* Encrypt Button */}
        <Button
          type="primary"
          className="w-full mt-6 h-12 text-lg rounded-xl"
          disabled={!file || loading}
          onClick={handleEncrypt}
        >
          {loading ? "Memproses..." : "Encrypt PDF"}
        </Button>
      </Card>

      {/* Modal progress */}
      <Modal
        open={modalOpen}
        footer={null}
        closable={false}
        centered
        bodyStyle={{ textAlign: "center", padding: "2rem" }}
      >
        <Spin size="large" />
        <p className="mt-4 text-gray-700 text-lg">Sedang mengenkripsi PDF...</p>
        <p className="text-sm text-gray-500 mt-1">
          Waktu berjalan: <strong>{timeTaken}s</strong>
        </p>
      </Modal>
    </div>
  );
}
