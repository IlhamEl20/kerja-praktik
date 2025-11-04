import { useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { Card, Input, Button, message } from "antd";
import { UserAddOutlined, UserOutlined } from "@ant-design/icons";
import AxiosInstance from "../../api/axios-instance";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username) {
      message.warning("Please enter a username first!");
      return;
    }

    setLoading(true);
    try {
      const { data: options } = await AxiosInstance.post("/register/begin", {
        username,
      });

      const attResp = await startRegistration(options.publicKey || options);
      console.log("Attestation response:", attResp);

      await AxiosInstance.post("/register/finish", attResp);

      message.success("✅ Registered successfully!");
      setUsername("");
    } catch (err) {
      console.error("Registration error:", err);
      message.error("❌ Registration failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card
        title={
          <div className="flex items-center gap-2">
            <UserAddOutlined className="text-blue-600" />
            <span className="font-semibold">Register Passkey</span>
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
            onClick={handleRegister}
            className="bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Register
          </Button>
        </div>
      </Card>
    </div>
  );
}
