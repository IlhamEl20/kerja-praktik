import React, { Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, Card, Button } from "antd";
import {
  FileAddOutlined,
  CompressOutlined,
  FontSizeOutlined,
  ArrowLeftOutlined,
  LockOutlined,
} from "@ant-design/icons";

// Lazy load komponen agar performa lebih baik
const PdfMerge = lazy(() => import("./PdfMerge"));

const PdfCompress = lazy(() => import("./PdfCompress"));

const PdfWatermark = lazy(() => import("./AddWatermark"));

const PdfSplit = lazy(() => import("./SplitPDF"));

const PdfEncrypt = lazy(() => import("./EncryptPDF"));

const ImageToPDF = lazy(() => import("./ImageToPDF"));

export default function PdfToolsContainer() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-10 px-4 flex  ">
      <Card
        variant="borderless"
        className="w-full max-w-8xl mx-auto shadow-lg rounded-2xl bg-white relative p-8"
      >
        {/* 🔙 Tombol Back */}
        <div className="absolute top-4 left-4">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-blue-600"
          >
            Kembali
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-center mb-5 text-gray-700 mt-4">
          🧰 Ilham PDF Tools Center
        </h1>
        {/* 🟢 Pengumuman */}
        <div className="bg-green-100 border border-green-300 text-green-800 text-center px-8 py-4 rounded-xl shadow-sm mx-auto max-w-2xl w-full mb-10 animate-fade-in">
          <p className="font-semibold">
            💚 100% Aman — Data Anda tidak disimpan.
          </p>
          <p className="text-sm mt-1">Setiap 1 kali digunakan = 1 amal 🌱</p>
        </div>

        <Tabs
          defaultActiveKey="merge"
          centered
          size="large"
          items={[
            {
              key: "merge",
              label: (
                <span>
                  <FileAddOutlined /> Merge PDF
                </span>
              ),
              children: (
                <Suspense
                  fallback={
                    <p className="text-center py-20 text-gray-400">
                      Loading...
                    </p>
                  }
                >
                  <PdfMerge />
                </Suspense>
              ),
            },
            {
              key: "compress",
              label: (
                <span>
                  <CompressOutlined /> Compress PDF
                </span>
              ),
              children: <PdfCompress />,
            },
            {
              key: "watermark",
              label: (
                <span>
                  <FontSizeOutlined /> Add Watermark
                </span>
              ),
              children: <PdfWatermark />,
            },
            {
              key: "split",
              label: (
                <span>
                  <FileAddOutlined /> Split PDF
                </span>
              ),
              children: <PdfSplit />,
            },
            {
              key: "encrypt",
              label: (
                <span>
                  <LockOutlined /> Encrypt PDF
                </span>
              ),
              children: <PdfEncrypt />,
            },
            {
              key: "pdftoimage",
              label: (
                <span>
                  <FileAddOutlined /> Image To PDF
                </span>
              ),
              children: <ImageToPDF />,
            },
          ]}
        />
      </Card>
    </div>
  );
}
