"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import axios, { AxiosError } from "axios"; // Import AxiosError
import { User, LogOut } from "lucide-react";
import NotificationBox from "@/components/NotificationBox"; 

export default function Navbar() {
  const router = useRouter();
  const [csrf, setCsrf] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
  };

  const forceLogout = useCallback(() => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/login");
  }, [router]); // Add router as a dependency

  // Check user status every 5 seconds
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get("/api/auth/user/status");
        if (!res?.data?.status) {
          showNotification("error", "Unauthorized. Redirecting...");
          forceLogout();
        }
      } catch (err) {
        console.error("User status error:", err);
        showNotification("error", "Error checking user status.");
        forceLogout();
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, [forceLogout]); // Add forceLogout to the dependency array

  // Fetch CSRF token
  useEffect(() => {
    const fetchCsrf = async () => {
      try {
        const response = await axios.get("/api/auth/csrf-token");
        if (response.status === 200) {
          setCsrf(response.data.data.CSRF_Token);
        } else {
          showNotification("error", "Failed to fetch CSRF token.");
        }
      } catch (err) {
        console.error("CSRF fetch error:", err);
        showNotification("error", "Failed to fetch CSRF token.");
      }
    };
    fetchCsrf();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // Always fetch a fresh CSRF token before logout
      const csrfRes = await axios.get("/api/auth/csrf-token");
      const freshCsrf = csrfRes.data.data.CSRF_Token;
  
      const res = await axios.post("/api/auth/logout", { _csrf: freshCsrf });
      if (res.status === 200 && res.data.status) {
        forceLogout();
      } else {
        showNotification("error", "Logout failed.");
      }
    } catch (err: unknown) { // Type catch clause variable as unknown
      console.error("Logout error:", err);
      if (err instanceof AxiosError) { // Check if the error is an AxiosError
        if (err?.response?.status === 403) {
          showNotification("error", "CSRF token expired. Please try again.");
        } else {
          showNotification("error", "Logout failed.");
        }
      } else {
        showNotification("error", "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };  

  return (
    <>
      <nav className="w-full bg-black text-white flex items-center justify-between px-8 py-5 shadow-md h-20">
        <Link href="/user" className="text-2xl font-extrabold text-green-400">
          Rest Countrys
        </Link>

        <div className="flex items-center gap-8">
          <button
            onClick={() => router.push("/user/info")}
            className="hover:text-green-400 transition duration-200"
            title="User Details"
          >
            <User className="w-7 h-7" />
          </button>

          <button
            onClick={handleLogout}
            disabled={loading || !csrf}
            className="hover:text-red-400 transition duration-200"
            title="Logout"
          >
            <LogOut className="w-7 h-7" />
          </button>
        </div>
      </nav>

      {notification && (
        <NotificationBox
          type={notification.type}
          message={notification.message}
          duration={5000}
        />
      )}
    </>
  );
}
