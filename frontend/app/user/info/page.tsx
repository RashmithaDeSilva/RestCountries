"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import UserNavbar from "@/components/UserNavbar";
import NotificationBox from "@/components/NotificationBox";

type MessageType = "success" | "error";

// Success response codes
const SUCCESS_CODES = [200, 201, 204];

export default function UserInfoPage() {
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    surname: "",
    email: "",
    contactNumber: "",
    password: "********",
  });
  const [formState, setFormState] = useState(userInfo);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [showButtons, setShowButtons] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: MessageType;
  } | null>(null);

  // Show notification and auto-clear after 5s
  const showNotification = (message: string, type: MessageType) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch user info on mount
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await axios.get("/api/auth/user/info");
        if (
          SUCCESS_CODES.includes(res.status) &&
          res.data?.status === true
        ) {
          const { firstName, surname, email, contactNumber } = res.data.data;
          const user = { firstName, surname, email, contactNumber, password: "********" };
          setUserInfo(user);
          setFormState(user);
        } else {
          showNotification(res.data?.message || "Failed to load user info", "error");
        }
      } catch {
        showNotification("Something went wrong while loading user info", "error");
      }
    };
    fetchInfo();
  }, []);

  const fetchCsrf = async () => {
    try {
      const res = await axios.get("/api/auth/csrf-token");
      if (
        SUCCESS_CODES.includes(res.status) &&
        res.data?.status === true
      ) {
        return res.data.data.CSRF_Token;
      } else {
        showNotification(res.data?.message || "Failed to fetch CSRF token", "error");
        return null;
      }
    } catch {
      showNotification("Error fetching CSRF token", "error");
      return null;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updated = { ...formState, [name]: value };
    setFormState(updated);
    setShowButtons(true);
    if (name === "password") setShowConfirm(true);
  };

  const handleReset = () => {
    setFormState(userInfo);
    setConfirmPassword("");
    setOldPassword("");
    setShowConfirm(false);
    setShowButtons(false);
  };

  const handleUpdate = async () => {
    let token = await fetchCsrf();
    if (!token) return;

    try {
      // Password change
      if (formState.password !== userInfo.password && formState.password !== "********") {
        const res = await axios.patch("/api/auth/user/changepassword", {
          old_password: oldPassword,
          password: formState.password,
          confirm_password: confirmPassword,
          _csrf: token,
        });

        if (SUCCESS_CODES.includes(res.status) && res.data?.status === true) {
          showNotification("Password updated successfully", "success");
        } else {
          throw new Error(res.data?.message || "Password update failed");
        }
      }

      token = await fetchCsrf();
      if (!token) return;

      const changedFields = ["firstName", "surname", "email", "contactNumber"];
      const changed = changedFields.some(
        (field) => formState[field as keyof typeof formState] !== userInfo[field as keyof typeof userInfo]
      );

      if (changed) {
        const res = await axios.put("/api/auth/user/update", {
          first_name: formState.firstName,
          surname: formState.surname,
          email: formState.email,
          contact_number: formState.contactNumber,
          _csrf: token,
        });

        if (SUCCESS_CODES.includes(res.status) && res.data?.status === true) {
          showNotification("Details updated successfully", "success");
        } else {
          throw new Error(res.data?.message || "Details update failed");
        }
      }

      // Re-fetch updated user info after 1s
      setTimeout(async () => {
        try {
          const res = await axios.get("/api/auth/user/info");
          if (
            SUCCESS_CODES.includes(res.status) &&
            res.data?.status === true
          ) {
            const { firstName, surname, email, contactNumber } = res.data.data;
            const updatedUser = { firstName, surname, email, contactNumber, password: "********" };
            setUserInfo(updatedUser);
            setFormState(updatedUser);
          }
        } catch {
          showNotification("Failed to reload user info", "error");
        }
      }, 1000);

      handleReset();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Update failed";
      showNotification(msg, "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      {notification && (
        <NotificationBox message={notification.message} type={notification.type} />
      )}
      <div className="max-w-4xl mx-auto mt-10 bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-black">First Name</label>
            <input
              name="firstName"
              value={formState.firstName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg text-black"
            />
          </div>
          <div>
            <label className="font-semibold text-black">Surname</label>
            <input
              name="surname"
              value={formState.surname}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg text-black"
            />
          </div>
          <div>
            <label className="font-semibold text-black">Email</label>
            <input
              name="email"
              value={formState.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg text-black"
            />
          </div>
          <div>
            <label className="font-semibold text-black">Contact Number</label>
            <input
              name="contactNumber"
              value={formState.contactNumber}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg text-black"
            />
          </div>
          <div>
            <label className="font-semibold text-black">Password</label>
            <input
              name="password"
              type="password"
              value={formState.password}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg text-black"
            />
          </div>
          {showConfirm && (
            <>
              <div>
                <label className="font-semibold text-black">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 border rounded-lg text-black"
                />
              </div>
              <div>
                <label className="font-semibold text-black">Old Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full p-2 border rounded-lg text-black"
                />
              </div>
            </>
          )}
        </div>

        {showButtons && (
          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
            >
              Reset
            </button>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
            >
              Update
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
