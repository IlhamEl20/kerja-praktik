import React, { useState, useEffect } from "react";
import { DeleteOutlined, CheckOutlined, RedoOutlined } from "@ant-design/icons";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Plus, Trash2, Edit, Calendar } from "lucide-react";
import { Button, Tag } from "antd";

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [status] = useState("ingin dikerjakan");

  // Load dari localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("todos_v2")) || [];
    setTodos(stored);
  }, []);

  // Simpan ke localStorage
  useEffect(() => {
    localStorage.setItem("todos_v2", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!input.trim()) return;
    const newTodo = {
      id: Date.now(),
      text: input,
      status,
      date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    };
    setTodos([...todos, newTodo]);
    setInput("");
  };

  const toggleStatus = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              status:
                todo.status === "selesai" ? "ingin dikerjakan" : "selesai",
            }
          : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // Group todos berdasarkan tanggal
  const groupedTodos = todos.reduce((acc, todo) => {
    if (!acc[todo.date]) acc[todo.date] = [];
    acc[todo.date].push(todo);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6 flex flex-col items-center">
      <motion.div
        className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold mb-4 text-indigo-700">Tambah Todo</h1>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-950 text-black"
            placeholder="Apa yang ingin kamu kerjakan?"
          />
          <Button
            onClick={addTodo}
            type="primary"
            size="large"
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-1 hover:bg-indigo-700"
          >
            <Plus size={18} /> Tambah
          </Button>
        </div>
      </motion.div>

      <div className="w-full max-w-lg space-y-6">
        {Object.keys(groupedTodos).map((date) => (
          <div key={date} className="bg-white rounded-2xl shadow p-4">
            {/* Divider dengan tanggal */}
            <div className="flex items-center gap-2 border-b pb-2 mb-3 text-indigo-600 font-semibold">
              <Calendar size={18} />
              {new Date(date).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>

            {groupedTodos[date].map((todo) => (
              <motion.div
                key={todo.id}
                className="flex justify-between items-start p-3 rounded-lg mb-2 bg-indigo-50"
                whileHover={{ scale: 1.02 }}
              >
                {/* Left Content */}
                <div className="flex flex-col flex-1 pr-4">
                  <p
                    className={`font-stretch-100% whitespace-pre-wrap break-all ${
                      todo.status === "selesai"
                        ? "line-through text-gray-500"
                        : "text-gray-800"
                    }`}
                  >
                    {todo.text}
                  </p>

                  {/* Divider tipis */}
                  <div className="h-px bg-gray-200 my-2" />

                  {/* Status Legend */}
                  <Tag
                    color={
                      todo.status === "selesai"
                        ? "green"
                        : todo.status === "sedang dikerjakan"
                        ? "gold"
                        : "blue"
                    }
                    className="w-fit text-sm font-medium"
                  >
                    {todo.status}
                  </Tag>
                </div>

                {/* Right Actions */}
                {/* Right Actions */}
                <div className="flex gap-2 items-start shrink-0">
                  <Button
                    type={todo.status === "selesai" ? "default" : "primary"}
                    danger={false}
                    icon={
                      todo.status === "selesai" ? (
                        <RedoOutlined />
                      ) : (
                        <CheckOutlined />
                      )
                    }
                    onClick={() => toggleStatus(todo.id)}
                  >
                    {todo.status === "selesai" ? "Ulangi" : "Selesai"}
                  </Button>

                  <Button
                    danger
                    type="primary"
                    icon={<DeleteOutlined />}
                    onClick={() => deleteTodo(todo.id)}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
