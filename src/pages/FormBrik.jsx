import formbricks from "@formbricks/js";

export default function KotakSaran() {
  const HandleOpenSurvy = () => {
    formbricks.track("vite");
    console.log("Triggering Formbricks action...");
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-2xl font-semibold text-gray-700 mb-4">
        💬 Kotak Saran
      </h1>
      <button
        onClick={HandleOpenSurvy}
        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition-all"
      >
        Isi Kuisioner 🌱
      </button>
      <p className="text-gray-500 text-sm mt-4">
        Form akan muncul otomatis dari Formbricks
      </p>
    </div>
  );
}
