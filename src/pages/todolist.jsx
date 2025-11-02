import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  CalendarOutlined,
  AppstoreOutlined,
  PlusOutlined,
  CheckOutlined,
  RedoOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Input,
  Select,
  DatePicker,
  Calendar,
  Modal,
  Tag,
  Switch,
  Tooltip,
  Space,
  Divider,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");
const { TextArea } = Input;

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("biasa");
  const [date, setDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("card"); // "card" | "calendar"

  // Load dari localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("todos_v5")) || [];
    setTodos(stored);
  }, []);

  // Simpan ke localStorage
  useEffect(() => {
    localStorage.setItem("todos_v5", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!input.trim()) return;
    const newTodo = {
      id: Date.now(),
      text: input.trim(),
      title: title.trim(),
      status: "ongoing",
      category,
      date: date.format("YYYY-MM-DD"),
    };
    setTodos([...todos, newTodo]);
    setInput("");
    setTitle("");
  };

  const toggleStatus = (id) => {
    setTodos(
      todos.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === "ongoing" ? "selesai" : "ongoing",
            }
          : t
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  const todosByDate = todos.reduce((acc, todo) => {
    acc[todo.date] = acc[todo.date] || [];
    acc[todo.date].push(todo);
    return acc;
  }, {});

  const handleDateSelect = (value) => {
    const formatted = value.format("YYYY-MM-DD");
    setSelectedDate(formatted);
    setModalOpen(true);
  };

  const filteredTodos = selectedDate ? todosByDate[selectedDate] || [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
      <motion.div
        className="bg-white rounded-2xl shadow-lg p-6 max-w-4xl mx-auto mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-indigo-700 flex items-center gap-2">
            <CalendarOutlined /> Tambah Kegiatan
          </h2>

          <Tooltip title="Ganti tampilan Kalender / Kartu">
            <Switch
              checkedChildren={<CalendarOutlined />}
              unCheckedChildren={<AppstoreOutlined />}
              checked={viewMode === "calendar"}
              onChange={(checked) => setViewMode(checked ? "calendar" : "card")}
            />
          </Tooltip>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-2">
            <Input
              placeholder="Judul kegiatan (opsional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1"
            />
            <TextArea
              rows={2}
              placeholder="Tulis kegiatanmu..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={category}
              onChange={setCategory}
              className="w-36"
              options={[
                { value: "biasa", label: "Biasa" },
                { value: "urgent", label: "Urgent" },
              ]}
            />
            <DatePicker
              value={date}
              onChange={(d) => setDate(d)}
              format="DD MMM YYYY"
              className="w-44"
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={addTodo}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Tambah
            </Button>
          </div>
        </div>
      </motion.div>
      {/* MAIN VIEW */}
      {viewMode === "calendar" ? (
        <motion.div
          className="max-w-4xl mx-auto mb-8 bg-white rounded-2xl shadow-lg p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Calendar fullscreen={false} onSelect={handleDateSelect} />
        </motion.div>
      ) : (
        <motion.div
          className="max-w-5xl mx-auto grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {todos.length ? (
            todos.map((todo) => (
              <Card
                key={todo.id}
                className="rounded-2xl shadow-md border border-indigo-100 hover:shadow-lg transition-all"
                title={
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-indigo-700">
                      {dayjs(todo.date).format("DD MMM YYYY")}
                    </span>

                    <Space>
                      <Tag
                        color={
                          todo.category === "urgent"
                            ? "red"
                            : todo.category === "biasa"
                            ? "blue"
                            : "default"
                        }
                      >
                        {todo.category.toUpperCase()}
                      </Tag>
                      <Tag
                        color={todo.status === "selesai" ? "green" : "orange"}
                      >
                        {todo.status === "selesai" ? "SELESAI" : "ONGOING"}
                      </Tag>
                    </Space>
                  </div>
                }
                actions={[
                  todo.status === "selesai" ? (
                    <RedoOutlined
                      key="redo"
                      onClick={() => toggleStatus(todo.id)}
                    />
                  ) : (
                    <CheckOutlined
                      key="check"
                      onClick={() => toggleStatus(todo.id)}
                    />
                  ),
                  <Button
                    key="delete"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteTodo(todo.id)}
                  >
                    Hapus
                  </Button>,
                ]}
              >
                <motion.p
                  className="text-gray-800 text-base font-medium leading-snug"
                  whileHover={{ scale: 1.02 }}
                >
                  {todo.title && (
                    <strong className="block mb-1">{todo.title}</strong>
                  )}
                  {todo.text}
                </motion.p>
              </Card>
            ))
          ) : (
            <div className="text-center text-gray-500 col-span-3">
              Belum ada kegiatan.
            </div>
          )}
        </motion.div>
      )}
      {/* Modal Detail Hari */}
      <Modal
        title={`Detail Kegiatan (${dayjs(selectedDate).format(
          "DD MMMM YYYY"
        )})`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        {filteredTodos.length ? (
          filteredTodos.map((t) => (
            <Card
              key={t.id}
              className="mb-3"
              size="small"
              title={t.title || "Kegiatan"}
              extra={
                <Space>
                  <Tag color={t.category === "urgent" ? "red" : "blue"}>
                    {t.category}
                  </Tag>
                  <Tag color={t.status === "selesai" ? "green" : "orange"}>
                    {t.status === "selesai" ? "Selesai" : "Ongoing"}
                  </Tag>
                </Space>
              }
            >
              <div className="flex justify-between items-center">{t.text}</div>
              <Divider />
              <div className="flex justify-between items-center">
                <Button
                  size="small"
                  type="link"
                  onClick={() => toggleStatus(t.id)}
                >
                  {t.status === "selesai" ? "Ulangi" : "Tandai Selesai"}
                </Button>
                <Button size="small" danger onClick={() => deleteTodo(t.id)}>
                  Hapus
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <p>Tidak ada kegiatan di tanggal ini.</p>
        )}
      </Modal>
    </div>
  );
}
