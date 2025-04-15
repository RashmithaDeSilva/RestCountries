"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { User, LogOut } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [csrf, setCsrf] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show error popup
  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 1000);
  };

  const forceLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/login");
  };

  // Check user status every 5s
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get("/api/auth/user/status");
        if (!res?.data?.status) {
          showError("Unauthorized. Redirecting...");
          forceLogout();
        }
      } catch (err) {
        console.error("User status error:", err);
        showError("Error checking user status.");
        forceLogout();
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch CSRF token
  useEffect(() => {
    const fetchCsrf = async () => {
      try {
        const response = await axios.get("/api/auth/csrf-token");
        if (response.status === 200) {
          setCsrf(response.data.data.CSRF_Token);
        }
      } catch (err) {
        console.error("Failed to fetch CSRF");
        showError("Failed to fetch CSRF token.");
      }
    };
    fetchCsrf();
  }, []);

  const handleLogout = async () => {
    if (!csrf) return;
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/logout", { _csrf: csrf });
      if (res.status === 200 && res.data.status) {
        forceLogout();
      } else {
        showError("Logout failed.");
      }
    } catch (error) {
      showError("Logout failed.");
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
            onClick={() => router.push("/user/details")}
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

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in-out">
          {error}
        </div>
      )}
    </>
  );
}
