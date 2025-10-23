import React, { useState } from "react";
import { Button } from "antd";
import formbricks from "@formbricks/js";
// If you don't already import antd styles, add:
// import "antd/dist/reset.css"; // or "antd/dist/antd.css" for older antd versions

export default function EmbedFormbrick() {
  const [loading, setLoading] = useState(false);

  const triggerFormbricks = async () => {
    try {
      await Promise.resolve(formbricks.track("vite"));
      console.log("Triggering Formbricks action...");
    } catch (err) {
      console.error("Formbricks error:", err);
    }
  };

  const handleClick = async () => {
    setLoading(true);
    try {
      await triggerFormbricks();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Button
        type="primary"
        loading={loading}
        onClick={handleClick}
        style={{ borderRadius: 8 }}
      >
        Click Me
      </Button>
    </div>
  );
}
