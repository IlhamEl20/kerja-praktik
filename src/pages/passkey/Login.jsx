import { useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { Card, Input, Button, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import AxiosInstance from "../../api/axios-instance";

export default function LoginPasskey() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username) {
      message.warning("Please enter a username first!");
      return;
    }

    setLoading(true);
    try {
      const { data: options } = await AxiosInstance.post("/login/begin", {
        username,
      });
      const asseResp = await startAuthentication(options.publicKey || options);
      const { data } = await AxiosInstance.post("/login/finish", asseResp);

      message.success("✅ Login successful!");
      console.log("Login result:", data);
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
        </div>
      </Card>
    </div>
  );
}
