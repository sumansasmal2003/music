"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "@/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, get, update } from "firebase/database";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BiPlayCircle, BiPauseCircle, BiEdit, BiCheck, BiChevronDown, BiChevronUp } from "react-icons/bi";
import "../app/globals.css";

type Song = {
  musicId: string;
  musicName: string;
  artistName: string;
  albumImageUrl: string;
  musicFileUrl: string;
};

type Playlist = {
  id: string;
  name: string;
  songs: Song[];
};

const Dashboard: React.FC = () => {
    const [user, setUser] = useState<{
        name: string | null;
        photoURL: string | null;
      }>({
        name: null,
        photoURL: null,
      });
  const [loading, setLoading] = useState(true);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);
  const [playlistPlaying, setPlaylistPlaying] = useState<string | null>(null);
  const [editingPlaylist, setEditingPlaylist] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>("00:00");
  const [totalTime, setTotalTime] = useState<string>("00:00");
  const router = useRouter();
  const [expandedPlaylistId, setExpandedPlaylistId] = useState<string | null>(null);

  const toggleExpand = (playlistId: string) => {
    setExpandedPlaylistId((prev) => (prev === playlistId ? null : playlistId));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({
          name: currentUser.displayName,
          photoURL: currentUser.photoURL,
        });
        await fetchPlaylists(currentUser.uid);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchPlaylists = async (userId: string) => {
    try {
      const playlistsRef = ref(db, `playlists/${userId}`);
      const snapshot = await get(playlistsRef);
      if (snapshot.exists()) {
        const playlistsData: Record<string, Playlist> = snapshot.val();
        const playlistsArray = Object.entries(playlistsData).map(([id, data]: [string, Playlist]) => ({
          id,
          name: data.name,
          songs: data.songs ? Object.values(data.songs) : [],
        }));
        setPlaylists(playlistsArray);
      } else {
        setPlaylists([]);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  const playSong = (musicFileUrl: string, songId: string) => {
    if (currentAudio && currentSongId === songId) {
      currentAudio.pause();
      setCurrentSongId(null);
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
    }

    const newAudio = new Audio(musicFileUrl);
    setCurrentAudio(newAudio);
    setCurrentSongId(songId);

    newAudio.play();

    newAudio.addEventListener("timeupdate", () => {
      const progressValue = (newAudio.currentTime / newAudio.duration) * 100;
      setProgress(progressValue);
      setCurrentTime(formatTime(newAudio.currentTime));
      setTotalTime(formatTime(newAudio.duration));
    });

    newAudio.addEventListener("ended", () => {
      setCurrentSongId(null);
    });
  };

  const playPlaylist = (playlistId: string) => {
    if (playlistPlaying === playlistId) {
      if (currentAudio) {
        currentAudio.pause();
        setPlaylistPlaying(null);
        setCurrentSongId(null);
      }
      return;
    }

    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist || playlist.songs.length === 0) return;

    const playNextSong = (index: number) => {
      if (index >= playlist.songs.length) {
        setPlaylistPlaying(null);
        setCurrentSongId(null);
        return;
      }

      const song = playlist.songs[index];
      const newAudio = new Audio(song.musicFileUrl);

      setCurrentAudio(newAudio);
      setCurrentSongId(song.musicId);
      setPlaylistPlaying(playlistId);

      newAudio.play();

      newAudio.addEventListener("timeupdate", () => {
        const progressValue = (newAudio.currentTime / newAudio.duration) * 100;
        setProgress(progressValue);
        setCurrentTime(formatTime(newAudio.currentTime));
        setTotalTime(formatTime(newAudio.duration));
      });

      newAudio.addEventListener("ended", () => {
        playNextSong(index + 1);
      });
    };

    playNextSong(0);
  };


  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const updatePlaylistName = async (playlistId: string, newName: string) => {
    try {
      const playlistRef = ref(db, `playlists/${auth.currentUser?.uid}/${playlistId}`);
      await update(playlistRef, { name: newName });
      setPlaylists((prev) =>
        prev.map((playlist) =>
          playlist.id === playlistId ? { ...playlist, name: newName } : playlist
        )
      );
      setEditingPlaylist(null);
    } catch (error) {
      console.error("Error updating playlist name:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="text-2xl font-bold">MusicVerse</div>
        <div className="flex items-center space-x-4">
          {user.photoURL && (
            <Image
              src={user.photoURL}
              alt="User Profile"
              width={40}
              height={40}
              className="rounded-full"
            />
          )}
          <button
            onClick={handleLogout}
            className="bg-red-600 px-3 py-2 rounded-md hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow p-4 flex flex-col items-center space-y-6">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="w-full max-w-3xl bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg shadow-lg p-4"
          >
            <div className="flex justify-between items-center mb-4">
              {editingPlaylist === playlist.id ? (
                <input
                  title="Change playlist name"
                  className="bg-gray-700 text-white w-2/3 h-[2rem] outline-none p-2 rounded"
                  defaultValue={playlist.name}
                  onBlur={(e) => updatePlaylistName(playlist.id, e.target.value)}
                  autoFocus
                />
              ) : (
                <h2 className="text-xl font-semibold">{playlist.name}</h2>
              )}

              <div className="flex items-center space-x-2">
              <button
                  onClick={() =>
                    setEditingPlaylist((prev) => (prev === playlist.id ? null : playlist.id))
                  }
                  className="text-gray-400 hover:text-white"
                >
                  {editingPlaylist === playlist.id ? <BiCheck /> : <BiEdit />}
                </button>
                <button
                  onClick={() => toggleExpand(playlist.id)}
                  className="text-gray-400 hover:text-white"
                >
                  {expandedPlaylistId === playlist.id ? (
                    <BiChevronUp size={24} />
                  ) : (
                    <BiChevronDown size={24} />
                  )}
                </button>
                <button
                  onClick={() => playPlaylist(playlist.id)}
                  className="bg-green-600 p-2 rounded-md hover:bg-green-700 transition"
                >
                  {playlistPlaying === playlist.id ? (
                    <BiPauseCircle className="text-xl text-white" />
                  ) : (
                    <BiPlayCircle className="text-xl text-white" />
                  )}
                </button>
              </div>
            </div>

            {/* Expandable Songs Section */}
            {expandedPlaylistId === playlist.id && (
              <ul className="space-y-4 transition-max-height duration-500 ease-in-out">
              {Object.values(playlist.songs).map((song) => (
                <li
                key={song.musicId}
                className="flex items-center justify-between space-x-4"
              >
                <Image
                  src={song.albumImageUrl}
                  alt={song.musicName}
                  width={50}
                  height={50}
                  className={`w-12 h-12 rounded-full ${
                    currentSongId === song.musicId && "animate-spin-slow"
                  }`}
                />
                <div className="flex-1">
                  <p className="font-medium">{song.musicName}</p>
                  <p className="text-sm text-gray-400">{song.artistName}</p>
                  {currentSongId === song.musicId && (
                    <div className="mt-1">
                      <div className="w-full bg-gray-700 h-1 rounded">
                        <div
                          className="bg-red-500 h-1 rounded"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs mt-1">
                        {currentTime} / {totalTime}
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => playSong(song.musicFileUrl, song.musicId)}
                  className="bg-red-600 p-2 rounded-md hover:bg-red-700 transition"
                >
                  {currentSongId === song.musicId ? (
                    <BiPauseCircle className="text-xl text-white" />
                  ) : (
                    <BiPlayCircle className="text-xl text-white" />
                  )}
                </button>
              </li>
              ))}
            </ul>
            )}
          </div>
        ))}
        {playlists.length === 0 && (
          <p className="text-gray-400 text-center">
            No playlists found. Add some music to get started!
          </p>
        )}
      </div>
      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 py-4 text-center text-sm text-zinc-50">
        © {new Date().getFullYear()} MusicVerse. All Rights Reserved.
      </footer>
    </div>
  );

};

export default Dashboard;
