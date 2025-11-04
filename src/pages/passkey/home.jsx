import LoginForm from "./Login";
import RegisterForm from "./Register";

export default function HomePasskey() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-8 min-h-screen bg-gray-50">
      <RegisterForm />
      <LoginForm />
    </div>
  );
}
