import React, { useRef, useState } from "react";
import { Button, Select, Card, Modal, ColorPicker, Space } from "antd";
import {
  CameraOutlined,
  DownloadOutlined,
  BgColorsOutlined,
} from "@ant-design/icons";

const { Option } = Select;

export default function PhotoBooth() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [template, setTemplate] = useState("kerja");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [openTemplateModal, setOpenTemplateModal] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setStreamActive(true);
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const takePhoto = () => {
    const context = canvasRef.current.getContext("2d");

    // Background warna
    context.fillStyle = bgColor;
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Frame dari kamera
    context.drawImage(
      videoRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    const dataURL = canvasRef.current.toDataURL("image/png");
    setPhoto(dataURL);
  };

  const downloadPhoto = (size = "1x1") => {
    const link = document.createElement("a");
    link.download = `photo-${size}.png`;
    link.href = photo;
    link.click();
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100 flex flex-col items-center">
      <Card className="w-full max-w-3xl shadow-lg rounded-2xl">
        <h1 className="text-2xl font-bold mb-4 text-center">
          📸 Modern Photobooth
        </h1>

        {/* Template Selector */}
        <div className="flex justify-between mb-4">
          <Select value={template} onChange={setTemplate} className="w-48">
            <Option value="kerja">Template Kerja</Option>
            <Option value="custom">Buat Template</Option>
          </Select>

          <Button
            icon={<BgColorsOutlined />}
            onClick={() => setOpenTemplateModal(true)}
          >
            Pilih Background
          </Button>
        </div>

        {/* Video / Photo Preview */}
        <div
          className="border rounded-lg overflow-hidden flex items-center justify-center h-96 mb-4"
          style={{ backgroundColor: bgColor }}
        >
          {!photo ? (
            <video ref={videoRef} className="w-full h-full object-cover" />
          ) : (
            <img
              src={photo}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="flex gap-2 justify-center">
          {!streamActive ? (
            <Button
              type="primary"
              icon={<CameraOutlined />}
              onClick={startCamera}
            >
              Aktifkan Kamera
            </Button>
          ) : (
            <Button
              type="default"
              icon={<CameraOutlined />}
              onClick={takePhoto}
            >
              Ambil Foto
            </Button>
          )}

          {photo && (
            <>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => downloadPhoto("1x1")}
              >
                Download 1x1
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => downloadPhoto("3x4")}
              >
                Download 3x4
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => downloadPhoto("4x6")}
              >
                Download 4x6
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} width="400" height="500" className="hidden" />

      {/* Modal Pilih Background */}
      <Modal
        title="Pilih Background"
        open={openTemplateModal}
        onCancel={() => setOpenTemplateModal(false)}
        footer={null}
      >
        <p className="mb-2 font-medium">Preset Warna:</p>
        <Space>
          <Button
            style={{ backgroundColor: "red", color: "white" }}
            onClick={() => setBgColor("red")}
          >
            Merah
          </Button>
          <Button
            style={{ backgroundColor: "blue", color: "white" }}
            onClick={() => setBgColor("blue")}
          >
            Biru
          </Button>
          <Button
            style={{
              backgroundColor: "white",
              color: "black",
              border: "1px solid #ddd",
            }}
            onClick={() => setBgColor("white")}
          >
            Putih
          </Button>
          <Button
            style={{ backgroundColor: "green", color: "white" }}
            onClick={() => setBgColor("green")}
          >
            Hijau
          </Button>
        </Space>

        <p className="mt-4 mb-2 font-medium">Custom Warna:</p>
        <ColorPicker
          value={bgColor}
          onChange={(color) => setBgColor(color.toHexString())}
        />
      </Modal>
    </div>
  );
}
