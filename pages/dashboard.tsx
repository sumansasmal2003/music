"use client";

import React, { useEffect, useState } from "react";
import { auth } from "@/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BiLogOut } from "react-icons/bi";

import "../app/globals.css";

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<{
    name: string | null;
    photoURL: string | null;
  }>({
    name: null,
    photoURL: null,
  });

  const [imageLoading, setImageLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          name: currentUser.displayName,
          photoURL: currentUser.photoURL,
        });
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logged out successfully!");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Error logging out. Please try again.");
    }
  };

  const handleImageLoaded = () => {
    setImageLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 px-6 py-4 flex items-center justify-between shadow-md">
        {/* Left: Website Name */}
        <div className="text-2xl font-bold tracking-wide">MusicVerse</div>

        {/* Right: User Info */}
        <div className="flex items-center space-x-6">
          {user.photoURL && (
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white hidden md:block">
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-700 animate-pulse hidden md:block"></div>
              )}
              <Image
                src={user.photoURL}
                alt="User Profile"
                width={48}
                height={48}
                className={`object-cover ${imageLoading ? "blur-sm" : ""}`}
                onLoadingComplete={handleImageLoaded}
              />
            </div>
          )}
          {user.name && <span className="text-xs md:text-lg font-medium">{user.name}</span>}
          <button
          title="button"
            onClick={handleLogout}
            className="w-7 h-7 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-300 shadow-md"
          >
            <BiLogOut className="text-lg" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-80px)] px-4">
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
          Welcome to <span className="text-red-600">MusicVerse</span>
        </h1>
        <p className="text-lg font-light text-gray-400">
          Discover your favorite music and connect with the rhythm of your life.
        </p>
        <p className="text-2xl mt-6">Hello, {user.name || "User"}!</p>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} MusicVerse. All Rights Reserved.
      </footer>
    </div>
  );
};

export default Dashboard;
