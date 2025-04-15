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

  useEffect(() => {
    const fetchCsrf = async () => {
      try {
        const response = await axios.get("/api/auth/csrf-token");
        if (response.status === 200) {
          setCsrf(response.data.data.CSRF_Token);
        }
      } catch (err) {
        console.error("Failed to fetch CSRF token");
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
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        router.push("/");
      }
    } catch (error) {
      alert("Logout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}
