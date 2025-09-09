import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { Button, Card } from "antd";

export default function Dashboard() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <Card className="w-96 shadow-lg">
        <h2 className="text-xl mb-4">Welcome, {user?.name}</h2>
        <Button danger block onClick={() => dispatch(logout())}>
          Logout
        </Button>
      </Card>
    </div>
  );
}
