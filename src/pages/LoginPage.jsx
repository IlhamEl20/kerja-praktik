import React, { useState } from "react";
import AxiosInstance from "../api/axios-instance";
import SlideCaptcha from "./captcha";

import { Mail, Lock, LogIn } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Modal } from "antd";

function Login() {
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState(null);

  const handleLoginClick = async (e) => {
    e.preventDefault();

    const formData = {
      email: e.target.email.value,
      password: e.target.password.value,
    };

    setPendingLoginData(formData);
    setShowCaptcha(true);
  };

  const onCaptchaSuccess = async () => {
    setShowCaptcha(false);
    console.log(pendingLoginData);
    return alert("Captcha sukses!");
    // const res = await AxiosInstance.post("/auth/login", pendingLoginData);

    // if (res.data.code === 0) {
    //   alert("Login sukses!");
    // } else {
    //   alert("Login gagal!");
    // }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 text-center">
          Selamat Datang 👋
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Silakan login untuk melanjutkan
        </p>

        <form className="space-y-5" onSubmit={handleLoginClick}>
          {/* Email */}
          <div>
            <label className="text-gray-700 font-medium">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="email"
                name="email"
                required
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-700 font-medium">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="password"
                name="password"
                required
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Login Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 250 }}
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-md hover:bg-blue-700"
          >
            <LogIn size={18} />
            Login
          </motion.button>
        </form>
      </motion.div>

      {/* Captcha Modal */}
      <Modal
        open={showCaptcha}
        onCancel={() => setShowCaptcha(false)}
        footer={null}
        centered
        width={360}
        style={{ padding: 0 }}
        modalRender={(node) => (
          <div className="flex items-center justify-center">{node}</div>
        )}
      >
        <div className="p-3">
          <SlideCaptcha onSuccess={onCaptchaSuccess} />
        </div>
      </Modal>
    </div>
  );
}

export default Login;
