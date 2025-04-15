"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // setError(null);
    setErrorMessage("");

    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });

      if (response.status === 200 && response.data.status) {
        // If login is successful, set the token in cookies
        document.cookie = `token=${response.data.data}; path=/;`;

        // Redirect to the user page
        router.push("/user");
      } else {
        setErrorMessage("Something went wrong, please try again.");
      }
    } catch (err: any) {
      if (err?.response?.status === 400) {
        // Validation error (bad input)
        const errors = err?.response?.data?.errors;
        if (errors && errors.length > 0) {
          setErrorMessage(errors[0]?.msg.error || "Invalid data submitted");
        }
      } else if (err?.response?.status === 401) {
        // Authentication failed
        setErrorMessage("Invalid email or password.");
      } else if (err?.response?.status === 500) {
        // Internal server error
        setErrorMessage("Internal server error, please try again later.");
      } else {
        setErrorMessage("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 to-black">
      <div className="w-full max-w-sm p-8 bg-black/70 rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold text-green-400 text-center mb-6">
          Rest Countries
        </h2>
        <h4 className="text-3lg font-bold text-green-400 text-center mb-6">
          User Login
        </h4>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="text-white block text-sm">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mt-2 bg-black/60 text-white border border-gray-600 rounded-md"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="text-white block text-sm">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mt-2 bg-black/60 text-white border border-gray-600 rounded-md"
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className={`w-full p-3 mt-4 bg-green-600 hover:bg-green-500 rounded-lg font-semibold ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Error Message Popup */}
        {errorMessage && (
          <div className="absolute top-20 right-4 bg-red-600 text-white p-3 rounded-lg">
            <p>{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Back to Home Button */}
      <Link href="/">
        <button className="mt-8 bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded-lg font-semibold text-white mb-6">
          Back to Home
        </button>
      </Link>
    </main>
  );
}
