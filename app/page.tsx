"use client";
import { motion } from "framer-motion";
import React from "react";
import { useInView } from "react-intersection-observer";
import { AiOutlinePlus } from "react-icons/ai";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const HomePage: React.FC = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user); // Set user login state
    });

    return () => unsubscribe(); // Cleanup on component unmount
  }, []);

  return (
    <div className="bg-gradient-to-br from-zinc-800 via-black to-gray-800 text-white min-h-screen">
      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full flex items-center justify-between px-6 py-4 bg-zinc-950 shadow-lg z-50">
        <h1 className="text-2xl font-bold text-white">MusicVerse</h1>
        <Link href={isLoggedIn ? "/dashboard" : "/login"}>
          <button className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition duration-300">
            {isLoggedIn ? "Dashboard" : "Login"}
          </button>
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center h-screen px-4">
        <motion.h2
          className="text-4xl md:text-6xl font-extrabold mb-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Feel the Rhythm
        </motion.h2>
        <motion.p
          className="text-md md:text-lg text-gray-400 mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Discover your favorite music and explore the top charts worldwide.
        </motion.p>
        <Link
            href="/explore"
        >
            <motion.button
            className="bg-white text-black px-6 py-3 text-lg rounded hover:bg-gray-200 transition duration-300"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            >
            Explore Now
            </motion.button>
        </Link>
      </section>

      {/* Features Section */}
      <section
        ref={ref}
        className={`py-16 px-6 bg-gradient-to-br from-zinc-800 via-black to-gray-800 min-h-screen flex flex-col items-center justify-center ${
          inView ? "animate-fade-in-up" : "opacity-0"
        }`}
      >
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Features
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <motion.div
            className="p-6 bg-gray-900 rounded-lg shadow-lg text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h4 className="text-xl font-semibold mb-2">Discover</h4>
            <p className="text-gray-400">
              Explore trending songs, albums, and playlists.
            </p>
          </motion.div>
          <motion.div
            className="p-6 bg-gray-900 rounded-lg shadow-lg text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-xl font-semibold mb-2">Listen Anywhere</h4>
            <p className="text-gray-400">
              Stream music on your favorite devices seamlessly.
            </p>
          </motion.div>
          <motion.div
            className="p-6 bg-gray-900 rounded-lg shadow-lg text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h4 className="text-xl font-semibold mb-2">Create Playlists</h4>
            <p className="text-gray-400">
              Save your favorites and create custom playlists.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-6 text-center text-gray-200">
        <p>© 2024 MusicVerse. All rights reserved.</p>
      </footer>

      {/* Floating Action Button */}
      <Link href="/uploadMusic"
        className="fixed bottom-6 right-6 bg-zinc-800 text-white p-2 rounded-full shadow-lg transition duration-300 z-50 hover:animate-bounce"
        aria-label="Add"
      >
        <AiOutlinePlus size={24} />
      </Link>
    </div>
  );
};

export default HomePage;
