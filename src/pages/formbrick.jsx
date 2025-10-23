import { useEffect } from "react";
import formbricks from "@formbricks/js";
import { v4 as uuidv4 } from "uuid";

export default function FormbricksInitializer() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const environmentId = import.meta.env.VITE_FORMBRICKS_ENVIRONMENT_ID;
    const apiHost = import.meta.env.VITE_FORMBRICKS_API_HOST; // contoh: https://formbricks.ilhamboy.site

    if (!environmentId || !apiHost) {
      console.error("❌ Missing Formbricks env vars");
      return;
    }

    let userId = localStorage.getItem("user_uuid");
    if (!userId) {
      userId = uuidv4();
      localStorage.setItem("user_uuid", userId);
    }

    formbricks.init({
      environmentId,
      apiHost, // API host, bukan app URL
      userId,
    });

    console.log("✅ Formbricks initialized:", {
      environmentId,
      apiHost,
      userId,
    });
    localStorage.clear();
    sessionStorage.clear();
  }, []);

  return null;
}
