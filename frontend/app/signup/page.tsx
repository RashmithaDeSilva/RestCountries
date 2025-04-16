"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Link from "next/link";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("/api/auth/register", {
        first_name: firstName,
        surname: surname,
        email,
        contact_number: contactNumber,
        password,
        confirm_password: confirmPassword,
      });

      if (response.status === 201 && response.data.status) {
        router.push("/login");
      } else {
        setErrorMessage(response.data.message || "Something went wrong.");
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosError;

      if (axiosError.response?.status === 400) {
        const errors = (axiosError.response.data as { errors?: string[] })?.errors;
        setErrorMessage(errors?.join(", ") || "Validation error.");
      } else if (axiosError.response?.status === 500) {
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="first_name" className="text-white block text-sm">
              First Name
            </label>
            <input
              type="text"
              id="first_name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-3 mt-2 bg-black/60 text-white border border-gray-600 rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="surname" className="text-white block text-sm">
              Surname
            </label>
            <input
              type="text"
              id="surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="w-full p-3 mt-2 bg-black/60 text-white border border-gray-600 rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="text-white block text-sm">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mt-2 bg-black/60 text-white border border-gray-600 rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="contact_number" className="text-white block text-sm">
              Contact Number
            </label>
            <input
              type="text"
              id="contact_number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full p-3 mt-2 bg-black/60 text-white border border-gray-600 rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="text-white block text-sm">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mt-2 bg-black/60 text-white border border-gray-600 rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="confirm_password" className="text-white block text-sm">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm_password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 mt-2 bg-black/60 text-white border border-gray-600 rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full p-3 mt-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        {errorMessage && (
          <div className="absolute top-20 right-4 bg-red-600 text-white p-3 rounded-lg">
            <p>{errorMessage}</p>
          </div>
        )}
      </div>

      <Link href="/">
        <button className="mt-8 bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded-lg font-semibold text-white mb-6">
          Back to Home
        </button>
      </Link>
    </main>
  );
}
