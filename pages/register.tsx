"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage, provider } from "@/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { ref, set } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from "next/image";

import '../app/globals.css'

const Register: React.FC = () => {
    const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePhoto: null as File | null,
  });
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files![0]; // The '!' tells TypeScript this value is definitely not null
    setForm((prev) => ({ ...prev, profilePhoto: file }));
  };


  const handleRegister = async () => {
    const { name, email, password, confirmPassword, profilePhoto } = form;
    if (!name || !email || !password || !confirmPassword || !profilePhoto) {
      setError("All fields are required!");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Upload profile photo to storage
      const photoRef = storageRef(storage, `users/${user.uid}/profilePhoto`);
      await uploadBytes(photoRef, profilePhoto);
      const photoURL = await getDownloadURL(photoRef);

      // Update profile
      await updateProfile(user, { displayName: name, photoURL });

      // Save user info in Realtime Database
      const userRef = ref(db, `users/${user.uid}`);
      await set(userRef, {
        name,
        email,
        profilePhoto: photoURL,
      });

      alert("Registration successful!");
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred.");
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Save user info in Realtime Database
      const userRef = ref(db, `users/${user.uid}`);
      await set(userRef, {
        name: user.displayName,
        email: user.email,
        profilePhoto: user.photoURL,
      });

      alert("Google registration successful!");
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="w-full max-w-lg bg-gray-800 text-white shadow-lg rounded-xl p-8">
        <h2 className="text-4xl font-bold text-center mb-6">Create Account</h2>
        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}
        <div className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={form.name}
            onChange={handleInputChange}
          />
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
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={form.confirmPassword}
            onChange={handleInputChange}
          />
          <input
            placeholder="file for profile photo"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full bg-gray-700 text-white rounded-lg border border-gray-600 py-3 px-4 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
          />
        </div>
        <button
          onClick={handleRegister}
          className="w-full mt-6 bg-black text-white py-3 rounded-lg font-semibold hover:bg-zinc-900 transition duration-300"
        >
          Register
        </button>
        <div className="flex items-center justify-center my-6">
          <span className="border-t border-gray-600 w-1/4"></span>
          <span className="mx-4 text-gray-400">or</span>
          <span className="border-t border-gray-600 w-1/4"></span>
        </div>
        <button
          onClick={handleGoogleRegister}
          className="w-full bg-white text-zinc-800 py-3 rounded-lg font-semibold hover:bg-gray-200 transition duration-300 flex items-center justify-center gap-2"
        >
          <Image
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            height={20}
            width={20}
          />
          Register with Google
        </button>
      </div>
    </div>
  );
};

export default Register;
