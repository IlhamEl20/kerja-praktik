import { Card, Typography } from "antd";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  FilePdfOutlined,
  CameraOutlined,
  CheckSquareOutlined,
  CloudOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const features = [
  {
    title: "PDF Tools",
    description: "Gabungkan, pisahkan, atau ubah file PDF dengan cepat.",
    icon: <FilePdfOutlined className="text-4xl text-red-500" />,
    link: "/pdf",
  },
  {
    title: "Photo Booth",
    description: "Ambil foto seru dengan efek menarik langsung dari browser!",
    icon: <CameraOutlined className="text-4xl text-pink-500" />,
    link: "/photobooth",
  },
  {
    title: "Todos App",
    description: "Kelola kegiatan harianmu dengan mudah dan efisien.",
    icon: <CheckSquareOutlined className="text-4xl text-green-500" />,
    link: "/todos",
  },
  {
    title: "Weather App",
    description:
      "Cek cuaca terkini di daerahmu, lengkap dengan animasi interaktif.",
    icon: <CloudOutlined className="text-4xl text-blue-500" />,
    link: "/weather",
  },
  {
    title: "Jadwal Sholat",
    description: "Lihat waktu azan di lokasimu secara real-time.",
    icon: <ClockCircleOutlined className="text-4xl text-amber-500" />,
    link: "/azan-reminder",
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center px-6 py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <Title level={2} className="text-gray-700 mb-2">
          Selamat Datang di <span className="text-blue-600">Ilham Tools</span>
        </Title>
        <Text className="text-gray-600 text-lg">
          Kumpulan fitur bermanfaat yang membantu aktivitas harianmu 🌱
        </Text>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <Card
              hoverable
              className="rounded-2xl shadow-md hover:shadow-xl transition-all"
              onClick={() => navigate(feature.link)}
            >
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                {feature.icon}
                <Title level={4} className="!mb-1 text-gray-700">
                  {feature.title}
                </Title>
                <Text className="text-gray-500">{feature.description}</Text>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="mt-16 text-center max-w-2xl"
      >
        <blockquote className="italic text-gray-600 text-lg">
          “Ilmu yang bermanfaat, sedekah jariyah, dan anak saleh yang mendoakan
          — itulah amal yang tak terputus meski kita telah tiada.”
        </blockquote>
        <p className="text-gray-500 mt-2">— Hadis Riwayat Muslim</p>
      </motion.div>
    </div>
  );
}
