// components/NotificationBox.tsx

"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type MessageType = "success" | "error";

export default function NotificationBox({
  message,
  type,
  duration = 5000,
}: {
  message: string;
  type: MessageType;
  duration?: number;
}) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed bottom-5 right-5 max-w-xs rounded-xl px-4 py-3 shadow-lg text-white text-sm font-medium z-50
            ${type === "success" ? "bg-green-600" : "bg-red-600"}
          `}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
