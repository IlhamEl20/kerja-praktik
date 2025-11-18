import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import AxiosInstance from "../../api/axios-instance";

export default function TwoFADemo() {
  const [email, setEmail] = useState("");
  const [qrUrl, setQrUrl] = useState(null);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("setup"); // setup | verify | login
  const [result, setResult] = useState(null);

  const setupMFA = async () => {
    try {
      setResult(null);
      const res = await AxiosInstance.get("/2fa/setup", { params: { email } });
      const data = res.data;

      if (data.already_setup) {
        setQrUrl(null);
        setStep("login");
        return;
      }

      setQrUrl(data.otpauth_url);
      setStep("verify");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Gagal setup 2FA.");
    }
  };

  const verifyOTP = async () => {
    try {
      const res = await AxiosInstance.post("/2fa/verify", { email, otp });

      // Jika ini pertama kali setup
      if (res.data.first_time) {
        setResult(res.data.login); // langsung login
        setStep("done");
        return;
      }

      // Sudah pernah setup → lanjut ke login OTP
      if (res.data.valid) {
        setStep("login");
      } else {
        alert("OTP tidak valid");
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Verifikasi OTP gagal.");
    }
  };

  const login = async () => {
    try {
      const res = await AxiosInstance.post("/2fa/login", {
        email,
        password: "password123",
        otp,
      });
      setResult(res.data);
      setStep("done");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Login gagal.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-3xl p-8 backdrop-blur-sm">
          <h1 className="text-3xl font-semibold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Secure Your Account 🔐
          </h1>

          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Protect your login with <strong>Google Authenticator</strong>
          </p>

          <AnimatePresence mode="wait">
            {step === "setup" && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
              >
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setupMFA();
                  }}
                >
                  <label className="font-medium text-gray-700 dark:text-gray-200">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
                  >
                    Setup 2FA
                  </motion.button>
                </form>
              </motion.div>
            )}

            {step === "verify" && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <h2 className="font-semibold text-center text-lg mb-2 text-gray-800 dark:text-gray-100">
                  Masukkan OTP
                </h2>

                {qrUrl ? (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="mx-auto w-48 h-48 border rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center shadow-md"
                  >
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        qrUrl
                      )}`}
                      className="w-40 h-40"
                      alt="qr"
                    />
                  </motion.div>
                ) : (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-300">
                    Akun ini sudah pernah setup. Silakan masukkan OTP dari
                    aplikasi Anda.
                  </p>
                )}

                <input
                  type="text"
                  placeholder="123456"
                  className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={verifyOTP}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl"
                >
                  Verify OTP
                </motion.button>
              </motion.div>
            )}

            {step === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <p className="text-center text-gray-700 dark:text-gray-100 font-medium">
                  Masukkan OTP untuk Login
                </p>

                <input
                  type="text"
                  className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-700"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={login}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl"
                >
                  Login
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl bg-green-50 dark:bg-green-900 border-l-4 border-green-500"
            >
              <p className="font-semibold text-green-800 dark:text-green-100">
                {result.message}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Email: {result.email}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
