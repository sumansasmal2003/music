"use client";
import React, { useState } from "react";
import { auth, provider } from "@/firebaseConfig";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import Image from "next/image";
import { useRouter } from "next/router";
import '../app/globals.css'
import Link from "next/link";

const Login: React.FC = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    const { email, password } = form;
    if (!email || !password) {
      setError("All fields are required!");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
      router.push('/dashboard')
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred!";
      setError(message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      alert("Google login successful!");
      router.push('/dashboard')
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred!";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="w-full max-w-lg bg-gray-800 shadow-lg rounded-xl p-8">
        <h2 className="text-4xl font-bold text-center text-white mb-8">
          Welcome Back
        </h2>
        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}
        <div className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={form.email}
            onChange={handleInputChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={form.password}
            onChange={handleInputChange}
          />
        </div>
        <button
          onClick={handleLogin}
          className="w-full mt-6 bg-white text-rose-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition duration-300"
        >
          Login
        </button>
        <div className="flex items-center justify-center my-6">
          <span className="border-t border-gray-600 w-1/4"></span>
          <span className="mx-4 text-gray-400">or</span>
          <span className="border-t border-gray-600 w-1/4"></span>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-zinc-900 transition duration-300 flex items-center justify-center gap-2"
        >
          <Image
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            height={20}
            width={20}
          />
          Login with Google
        </button>
        <p className="text-center text-gray-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-blue-400 hover:underline hover:text-blue-500"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
