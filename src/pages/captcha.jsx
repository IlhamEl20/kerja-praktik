import React, { useEffect, useRef, useState } from "react";
import GoCaptcha from "go-captcha-react";
import AxiosInstance from "../api/axios-instance";

function SlideCaptcha({ onSuccess }) {
  const captchaRef = useRef(null);
  const [captchaData, setCaptchaData] = useState(null);
  const [token, setToken] = useState(null);

  const fetchCaptcha = async () => {
    const res = await AxiosInstance.get("/captcha/jwt");
    setCaptchaData(res.data.data);
    setToken(res.data.token);
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleConfirm = async (x, reset) => {
    // x dari go-captcha-react = posisi slider user
    const point = `${x.x},${captchaData.thumbY}`; // Format sesuai backend: "x,y"

    const res = await AxiosInstance.post("/captcha/jwt/verify", {
      token: token, // backend expects "token"
      point: point, // backend expects "x,y"
      tol: 5, // optional, backend auto-default
    });

    if (res.data.code === 0) {
      onSuccess(); // panggil callback login
      return true;
    }

    alert("Captcha salah!");
    reset();
    fetchCaptcha();
    return false;
  };

  if (!captchaData) return <div>Loading Captcha...</div>;

  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: "100%",
        maxWidth: 360,
        padding: 6,
        overflow: "hidden",
      }}
    >
      <GoCaptcha.Slide
        config={{
          title: "Silakan geser puzzle untuk verifikasi",
        }}
        ref={captchaRef}
        data={captchaData}
        events={{
          confirm: handleConfirm,
          refresh: () => {
            fetchCaptcha();
            captchaRef.current?.reset();
          },
        }}
      />
    </div>
  );
}

export default SlideCaptcha;
