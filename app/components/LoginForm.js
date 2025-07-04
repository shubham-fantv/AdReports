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
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/90 dark:bg-gray-800 rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700 overflow-hidden backdrop-blur-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-white mb-2">Ad Reports Dashboard</h1>
          <p className="text-purple-100 text-sm">Welcome back! Please sign in to continue.</p>
        </div>

        {/* Form */}
        <div className="px-8 py-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                placeholder="Enter your username"
                required
                disabled={loggingIn}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                placeholder="Enter your password"
                required
                disabled={loggingIn}
              />
            </div>

            {loginError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transform hover:-translate-y-0.5"
            >
              {loggingIn ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-white/50 dark:bg-gray-900 px-8 py-4 border-t border-white/20 dark:border-gray-700 backdrop-blur-sm">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Secure access to your advertising analytics dashboard
          </p>
        </div>
      </div>
    </div>
  );
}