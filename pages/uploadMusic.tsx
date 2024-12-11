"use client";
import React, { useState } from "react";
import { storage, db } from "@/firebaseConfig";
import { ref, set } from "firebase/database";
import { uploadBytes, ref as storageRef, getDownloadURL } from "firebase/storage";
import "../app/globals.css";

const UploadMusic: React.FC = () => {
  const [musicName, setMusicName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [duration, setDuration] = useState("");
  const [albumImage, setAlbumImage] = useState<File | null>(null);
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!musicName || !artistName || !duration || !albumImage || !musicFile) {
      alert("Please fill in all fields");
      return;
    }

    setIsUploading(true);

    try {
      // Upload album image to Firebase Storage
      const albumImageRef = storageRef(storage, `albumImages/${albumImage.name}`);
      await uploadBytes(albumImageRef, albumImage);
      const albumImageUrl = await getDownloadURL(albumImageRef);

      // Upload music file to Firebase Storage
      const musicFileRef = storageRef(storage, `musicFiles/${musicFile.name}`);
      await uploadBytes(musicFileRef, musicFile);
      const musicFileUrl = await getDownloadURL(musicFileRef);

      // Save details in Firebase Realtime Database
      const musicRef = ref(db, "music/" + Date.now());
      await set(musicRef, {
        musicName,
        artistName,
        duration,
        albumImageUrl,
        musicFileUrl,
      });

      alert("Music uploaded successfully!");
    } catch (error) {
      console.error("Error uploading music:", error);
      alert("Failed to upload music.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-zinc-900 rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-white animate-fade-in">
          Upload Music
        </h1>
        <form onSubmit={handleUpload} className="space-y-6">
          {/* Music Name */}
          <div>
            <label
              className="block mb-2 font-semibold text-gray-400"
              htmlFor="musicName"
            >
              Music Name
            </label>
            <input
              type="text"
              id="musicName"
              className="w-full p-3 bg-black border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:bg-gray-800 transition duration-300"
              placeholder="Enter the music name"
              value={musicName}
              onChange={(e) => setMusicName(e.target.value)}
            />
          </div>

          {/* Artist Name */}
          <div>
            <label
              className="block mb-2 font-semibold text-gray-400"
              htmlFor="artistName"
            >
              Artist Name
            </label>
            <input
              type="text"
              id="artistName"
              className="w-full p-3 bg-black border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:bg-gray-800 transition duration-300"
              placeholder="Enter the artist name"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
            />
          </div>

          {/* Duration */}
          <div>
            <label
              className="block mb-2 font-semibold text-gray-400"
              htmlFor="duration"
            >
              Duration (mm:ss)
            </label>
            <input
              type="text"
              id="duration"
              className="w-full p-3 bg-black border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:bg-gray-800 transition duration-300"
              placeholder="e.g., 03:45"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          {/* Album Image */}
          <div>
            <label
              className="block mb-2 font-semibold text-gray-400"
              htmlFor="albumImage"
            >
              Album Image
            </label>
            <input
              type="file"
              id="albumImage"
              className="w-full bg-black border border-gray-600 text-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-300"
              onChange={(e) => setAlbumImage(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* Music File */}
          <div>
            <label
              className="block mb-2 font-semibold text-gray-400"
              htmlFor="musicFile"
            >
              Music File
            </label>
            <input
              type="file"
              id="musicFile"
              className="w-full bg-black border border-gray-600 text-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-300"
              onChange={(e) => setMusicFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3 text-lg font-semibold rounded ${
              isUploading
                ? "bg-zinc-500 cursor-not-allowed"
                : "bg-zinc-800 hover:bg-zinc-700 transition duration-300"
            }`}
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="flex items-center justify-center">
                <span className="loader mr-2"></span> Uploading...
              </div>
            ) : (
              "Upload Music"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadMusic;
