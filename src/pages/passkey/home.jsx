import LoginForm from "./Login";
import RegisterForm from "./Register";

export default function HomePasskey() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header Info */}
      <div className="text-center py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🔐 Aman dan Praktis: Password + MFA vs Passkey
        </h1>
        <p className="max-w-3xl mx-auto text-gray-600 leading-relaxed">
          Pelajari perbedaan antara metode tradisional{" "}
          <b>Password dengan MFA</b> dan teknologi baru <b>Passkey</b>. Keduanya
          aman, tapi Passkey menghadirkan keamanan tanpa repot mengingat kata
          sandi.
        </p>
      </div>

      {/* Penjelasan */}
      <div className="flex flex-col md:flex-row justify-center items-start gap-6 px-6 md:px-16 pb-10">
        <div className="bg-white shadow-md rounded-2xl p-6 flex-1 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            🔸 Password + MFA
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Menggunakan kombinasi username + password.</li>
            <li>
              MFA (Multi-Factor Authentication) menambah keamanan dengan kode
              OTP / autentikator.
            </li>
            <li>
              Masih rentan terhadap <b>phishing</b> atau{" "}
              <b>pencurian password</b>.
            </li>
            <li>Cocok jika sistem belum mendukung Passkey.</li>
          </ul>
        </div>

        <div className="bg-white shadow-md rounded-2xl p-6 flex-1 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            🔹 Passkey
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>
              Tidak perlu mengingat password — login cukup dengan sidik jari,
              PIN, atau Face ID.
            </li>
            <li>
              Lebih aman karena berbasis <b>public-key cryptography</b>.
            </li>
            <li>Tidak bisa dipalsukan atau dicuri lewat phishing.</li>
            <li>Ideal untuk pengalaman login cepat dan aman.</li>
          </ul>
        </div>
      </div>

      {/* Forms */}
      <div className="flex flex-col md:flex-row items-start justify-center gap-8 px-6 md:px-16 pb-16">
        <RegisterForm />
        <LoginForm />
      </div>
    </div>
  );
}
