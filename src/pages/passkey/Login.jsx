import { useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { Card, Input, Button, message, Typography } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import AxiosInstance from "../../api/axios-instance";

const { Text } = Typography;

export default function LoginPasskey() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleLogin = async () => {
    if (!username) {
      message.warning("Please enter a username first!");
      return;
    }

    setLoading(true);
    setResult(null); // reset tampilan hasil sebelumnya

    try {
      // 1️⃣ Dapatkan challenge dari server
      const { data: options } = await AxiosInstance.post("/login/begin", {
        username,
      });

      // 2️⃣ Jalankan WebAuthn di browser
      const asseResp = await startAuthentication(options.publicKey || options);

      // 3️⃣ Kirim hasil autentikasi ke server untuk diverifikasi
      const { data } = await AxiosInstance.post(
        `/login/finish?username=${username}`,
        asseResp
      );

      // 4️⃣ Tampilkan hasil sukses di UI
      setResult(data);
      message.success("✅ Login successful!");
    } catch (err) {
      console.error("Login error:", err);
      message.error("❌ Login failed, check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card
        title={
          <div className="flex items-center gap-2">
            <LockOutlined className="text-green-600" />
            <span className="font-semibold">Login with Passkey</span>
          </div>
        }
        className="shadow-lg w-96 rounded-2xl border border-gray-100"
      >
        <div className="space-y-3">
          <Input
            size="large"
            prefix={<UserOutlined />}
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded-lg"
          />

          <Button
            type="primary"
            block
            loading={loading}
            onClick={handleLogin}
            className="bg-green-600 hover:bg-green-700 rounded-lg"
          >
            Login
          </Button>

          {result && (
            <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <Text strong>Status:</Text>{" "}
              <Text type="success">{result.status}</Text>
              <br />
              <Text strong>User:</Text> <Text code>{result.user}</Text>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
