import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";
import { Button, Input, Card, Form } from "antd";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const onFinish = (values) => {
    const { username, password } = values;
    // simulasi login, nanti bisa diganti API call
    if (username === "admin" && password === "1234") {
      dispatch(login({ user: { name: "Admin" }, token: "fake-jwt-token" }));
      navigate("/dashboard");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Card title="Login" className="w-96 shadow-lg">
        <Form name="login" layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input placeholder="Username" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
