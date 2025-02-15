"use client";
import Image from "next/image";
import React, { useState } from "react";
import { signIn } from "next-auth/react";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FaTruckLoading } from "react-icons/fa";

const SignUp = ({ onClose }: { onClose: () => void }) => {
  const [signUp, setSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        throw new Error(result?.error || "Invalid email or password.");
      }

      toast.success("Login successful!! Redirecting ...");
      setLoading(false);
      router.push("/dashboard"); // Redirect on success
    } catch (error: any) {
      toast.error("Oops!Unable to login.");
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: email.split("@")[0] }), // Use email name as default name
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to sign up");

      toast.info("Sign up successful! You can now log in.");
      setSignUp(false); // Switch to login view after successful signup
    } catch (error: any) {
      toast.error("unable to sign up!!");
      console.log(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-gray-900 text-white p-8 rounded-xl shadow-lg w-96 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className={`absolute top-3 right-3 text-gray-400 ${!loading ? "hover:text-white": "cursor-not-allowed"} `}
        >
          ✕
        </button>

        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/static/intelLogo.png"
            alt="Logo"
            width={60}
            height={60}
            className="rounded-full"
          />
        </div>

        {/* Toggle Signup/Login */}
        <div className="flex justify-center mt-4 space-x-4">
          <button
            className={`py-2 px-6 rounded-lg ${
              signUp ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
            }`}
            disabled={loading}
            onClick={() => setSignUp(true)}
          >
            Sign Up
          </button>
          <button
            className={`py-2 px-6 rounded-lg ${
              !signUp ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
            }`}
            onClick={() => setSignUp(false)}
            disabled={loading}
          >
            Login
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={!signUp ? handleLogin : handleSignUp}
          className="mt-6 space-y-4"
        >
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-800 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-800 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          />
          {signUp && (
            <input
              type="password"
              placeholder="Confirm Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 bg-gray-800 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className={`w-full  py-3 rounded-lg text-white bg-blue-600 ${loading ? "opacity-50 cursor-not-allowed" : " hover:bg-blue-700"}`}
            disabled={loading}
          >
            {loading ? "Loading..." : signUp ? "Sign Up" : "Login"}
            
          </button>
        </form>

        {/* OR Divider */}
        <div className="text-center my-4 text-gray-500">OR</div>

        {/* Google Button */}
        <button className={`w-full flex items-center justify-center py-3 bg-gray-600 rounded-lg text-white ${loading ? "opacity-50 cursor-not-allowed" : " hover:bg-gray-700"}`}
        disabled={loading}>
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default SignUp;
