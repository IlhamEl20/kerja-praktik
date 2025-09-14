import React, { useRef, useState, useEffect } from "react";

export default function Photobooth() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);
  const [facingMode, setFacingMode] = useState("user"); // 'user' or 'environment'
  const [selectedFrame, setSelectedFrame] = useState("polaroid");
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Templates (SVG strings). They scale with the canvas size.
  const templates = {
    polaroid: (w, h) =>
      `<?xml version='1.0' encoding='utf-8'?>\n<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>\n  <rect x='0' y='0' width='${w}' height='${h}' fill='white'/>\n  <rect x='8' y='8' width='${
        w - 16
      }' height='${
        h - 56
      }' rx='8' ry='8' fill='none' stroke='#111827' stroke-width='6'/>\n  <rect x='8' y='${
        h - 40
      }' width='${w - 16}' height='32' rx='4' ry='4' fill='white'/>\n</svg>`,

    simpleBorder: (w, h) =>
      `<?xml version='1.0' encoding='utf-8'?>\n<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>\n  <rect x='0' y='0' width='${w}' height='${h}' fill='transparent'/>\n  <rect x='10' y='10' width='${
        w - 20
      }' height='${
        h - 20
      }' rx='20' ry='20' fill='none' stroke='#FFD166' stroke-width='18'/>\n</svg>`,

    floral: (w, h) =>
      `<?xml version='1.0' encoding='utf-8'?>\n<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>\n  <defs>\n    <linearGradient id='g' x1='0' x2='1'>\n      <stop offset='0' stop-color='#FFB4A2'/>\n      <stop offset='1' stop-color='#FFC6FF'/>\n    </linearGradient>\n  </defs>\n  <rect x='0' y='0' width='${w}' height='${h}' fill='none'/>\n  <!-- corner ornament -->\n  <g transform='translate(0,0)'>\n    <circle cx='60' cy='60' r='36' fill='url(#g)' opacity='0.95'/>\n    <path d='M30 90 C70 110, 120 60, 160 100' stroke='#FF7B7B' stroke-width='6' fill='none' stroke-linecap='round'/>\n  </g>\n  <rect x='18' y='18' width='${
        w - 36
      }' height='${
        h - 36
      }' rx='24' ry='24' fill='none' stroke='#ffffff' stroke-width='8'/>\n</svg>`,
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  async function startCamera() {
    setIsLoading(true);
    try {
      const opts = {
        audio: false,
        video: { facingMode },
      };
      const stream = await navigator.mediaDevices.getUserMedia(opts);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreamActive(true);
      }
    } catch (err) {
      console.error("camera error", err);
      alert("Gagal mengakses kamera. Pastikan browser diberi izin.");
    } finally {
      setIsLoading(false);
    }
  }

  function stopCamera() {
    const stream = videoRef.current?.srcObject;
    if (stream && stream.getTracks) {
      stream.getTracks().forEach((t) => t.stop());
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setStreamActive(false);
  }

  function switchCamera() {
    setFacingMode((s) => (s === "user" ? "environment" : "user"));
  }

  function svgToDataUrl(svg) {
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  async function captureFromVideo() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    drawFinalImage(video, w, h);
  }

  function handleUploadImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        drawFinalImage(img, img.width, img.height);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  // --- ubah fungsi drawFinalImage ---
  function drawFinalImage(source, sourceW, sourceH, ratioMode = "original") {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let w, h;

    if (ratioMode === "square") {
      // bikin square 1:1
      const size = Math.min(sourceW, sourceH);
      w = h = size;
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);

      // crop tengah
      const sx = (sourceW - size) / 2;
      const sy = (sourceH - size) / 2;
      ctx.drawImage(source, sx, sy, size, size, 0, 0, w, h);

      const svg = templates[selectedFrame](w, h);
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, w, h);
        setPhotoDataUrl(canvas.toDataURL("image/png"));
      };
      img.src = svgToDataUrl(svg);
      return;
    }

    // mode original (default)
    const maxDim = 1200;
    let ratio = sourceW / sourceH;
    w = sourceW > maxDim ? maxDim : sourceW;
    h = Math.round(w / ratio);

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    ctx.drawImage(source, 0, 0, w, h);

    const svg = templates[selectedFrame](w, h);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, w, h);
      setPhotoDataUrl(canvas.toDataURL("image/png"));
    };
    img.src = svgToDataUrl(svg);
  }

  // --- ubah tombol Download ---
  function downloadPhoto(mode = "original") {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `photobooth-${mode}-${Date.now()}.png`;
    link.click();
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">
        Photobooth sederhana (React + Tailwind)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div
            className="border rounded-lg overflow-hidden bg-black relative "
            z-index="2"
          >
            {/* Video area */}
            <div className="w-full h-80 md:h-96 flex items-center justify-center bg-gray-900">
              {!streamActive && (
                <div className="text-gray-300">Kamera belum aktif</div>
              )}
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                style={{ display: streamActive ? "block" : "none" }}
              />

              {/* Overlay preview */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* small preview of selected frame using inline SVG */}
                <div className="w-full h-full">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: templates[selectedFrame](640, 480),
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="p-3 flex gap-2 items-center">
              <button
                onClick={captureFromVideo}
                className="bg-blue-600 text-white px-3 py-2 rounded-md shadow hover:bg-blue-700"
                disabled={!streamActive}
              >
                Ambil Foto
              </button>
              <label className="bg-gray-200 px-3 py-2 rounded-md cursor-pointer">
                Unggah Foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => {
                  if (streamActive) stopCamera();
                  else startCamera();
                }}
                className="px-3 py-2 rounded-md border"
              >
                {streamActive ? "Matikan Kamera" : "Nyalakan Kamera"}
              </button>

              <button
                onClick={switchCamera}
                className="px-3 py-2 rounded-md border"
              >
                Ganti Kamera
              </button>

              {isLoading && (
                <div className="text-sm text-gray-500">Memuat kamera...</div>
              )}
            </div>
          </div>

          <div className="mt-3">
            <canvas
              ref={canvasRef}
              className="w-full border rounded-md"
              style={{ maxHeight: 600 }}
            />
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => downloadPhoto("original")}
              disabled={!photoDataUrl}
              className="bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              Unduh Asli
            </button>
            <button
              onClick={() => downloadPhoto("square")}
              disabled={!photoDataUrl}
              className="bg-purple-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              Unduh 1:1
            </button>
            <button
              onClick={() => {
                setPhotoDataUrl(null);
                const c = canvasRef.current;
                if (c) c.getContext("2d").clearRect(0, 0, c.width, c.height);
              }}
              className="px-3 py-2 border rounded-md"
            >
              Reset
            </button>
          </div>
        </div>

        <aside className="space-y-3">
          <div className="p-3 border rounded-md">
            <h3 className="font-medium mb-2">Pilih bingkai</h3>
            <div className="flex flex-col gap-2">
              {Object.keys(templates).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedFrame(key)}
                  className={`flex items-center gap-3 p-2 rounded-md text-left ${
                    selectedFrame === key ? "ring-2 ring-blue-400" : "border"
                  }`}
                >
                  <div className="w-20 h-14 bg-gray-100 flex items-center justify-center overflow-hidden rounded">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: templates[key](160, 112),
                      }}
                    />
                  </div>
                  <div className="capitalize">{key}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 border rounded-md">
            <h3 className="font-medium mb-2">Preview/result</h3>
            {photoDataUrl ? (
              <img
                src={photoDataUrl}
                alt="preview"
                className="w-full rounded-md border"
              />
            ) : (
              <div className="text-sm text-gray-500">
                Belum ada foto. Ambil foto atau unggah.
              </div>
            )}
          </div>

          <div className="p-3 border rounded-md text-sm text-gray-600">
            Tips: biarkan kamera menyala lalu tekan "Ambil Foto". Anda bisa
            mengganti bingkai sebelum mengunduh.
          </div>
        </aside>
      </div>
    </div>
  );
}
