"use client";
import { useState } from "react";
import { apiService } from "../services/apiService";

export default function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");

    try {
      const result = await apiService.login(username, password);

      if (result.success) {
        localStorage.setItem("isAuthenticated", "true");
        onLoginSuccess();
      } else {
        setLoginError(result.message || "Invalid credentials");
      }
    } catch (error) {
      setLoginError("Login failed. Please try again.");
    }

    setLoggingIn(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-600">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:bg-gradient-to-r dark:from-[#1a1a1a] dark:to-[#1a1a1a] px-6 py-6 text-center border-b border-transparent dark:border-[#2a2a2a]">
          <h2 className="text-2xl font-bold text-white dark:text-white">Ad Reports Dashboard</h2>
          <p className="text-blue-100 dark:text-[#a0a0a0] text-sm mt-1">Welcome back! Please sign in to continue.</p>
        </div>

        {/* Form */}
        <div className="px-6 py-6 bg-white dark:bg-gray-800">
          <form onSubmit={handleLogin}>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Enter your username"
                required
                disabled={loggingIn}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Enter your password"
                required
                disabled={loggingIn}
              />
            </div>

            {loginError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm mb-6">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 px-4 rounded-lg font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-teal-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500 dark:focus:ring-teal-500 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loggingIn ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
          <p className="text-xs text-center text-gray-600 dark:text-gray-500">
            Secure access to your advertising analytics dashboard
          </p>
        </div>
      </div>
    </div>
  );
}