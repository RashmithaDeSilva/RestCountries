"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Link from "next/link";

// Define interfaces for response data
interface ValidationError {
  msg: {
    error: string;
  };
}

interface ErrorResponseData {
  status: boolean;
  errors?: ValidationError[];
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post("/api/auth/admin/login", {
        email,
        password,
      });

      if (response.status === 200 && response.data.status) {
        // If login is successful, set the token in cookies
        document.cookie = `token=${response.data.data}; path=/;`;

        // Redirect to the admin dashboard
        router.push("/admin/dashboard");
      } else {
        setErrorMessage("Something went wrong, please try again.");
      }
    } catch (err: unknown) {
      const error = err as AxiosError;
      const data = error.response?.data;

      // Check for 400 status and validate the error response type
      if (error.response?.status === 400) {
        if (isValidationErrorResponse(data)) {
          const errors = data.errors;
          if (errors && errors.length > 0) {
            setErrorMessage(errors[0]?.msg?.error || "Invalid data submitted");
          }
        }
      } else if (error.response?.status === 401) {
        setErrorMessage("Invalid email or password.");
      } else if (error.response?.status === 500) {
        setErrorMessage("Internal server error, please try again later.");
      } else {
        setErrorMessage("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Type guard to check if the error response matches our expected format
  function isValidationErrorResponse(data: unknown): data is ErrorResponseData {
    return (
      typeof data === "object" &&
      data !== null &&
      "errors" in data &&
      Array.isArray((data as ErrorResponseData).errors)
    );
  }

  return (
    <main className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 to-black">
      <div className="w-full max-w-sm p-8 bg-black/70 rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold text-green-400 text-center mb-6">
          Rest Countries
        </h2>
        <h4 className="text-3lg font-bold text-green-400 text-center mb-6">
          Admin Login
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
