import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FaPlayCircle, FaPauseCircle } from "react-icons/fa";
import { MdOutlineForward10, MdOutlineReplay10 } from "react-icons/md";
import { RiAddLine } from "react-icons/ri"; // Add icon for create playlist
import "../app/globals.css";
import { useAuth } from "../context/AuthContext"; // Import AuthContext
import { ref, get, push, set } from "firebase/database";
import { db } from "@/firebaseConfig";

interface MusicCardProps {
  musicName: string;
  artistName: string;
  albumImageUrl: string;
  musicFileUrl: string;
  musicId: string;
}

type Song = {
    musicId: string;
    musicName: string;
    artistName: string;
    albumImageUrl: string;
    musicFileUrl: string;
  };

  // Define a type for the structure of the 'songs' object in Firebase
  type SongsData = Record<string, Song>;

type PlaylistsData = Record<string, { name: string }>;

const MusicCard: React.FC<MusicCardProps> = ({
  musicName,
  artistName,
  albumImageUrl,
  musicFileUrl,
  musicId,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { user, login } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [playlists, setPlaylists] = useState<{ id: string; name: string }[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  }, [audioRef.current?.duration]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play();
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = (parseFloat(e.target.value) / 100) * audioDuration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(parseFloat(e.target.value));
    }
  };

  useEffect(() => {
    if (user) {
      const fetchPlaylists = async () => {
        const playlistRef = ref(db, `playlists/${user.uid}`);
        const snapshot = await get(playlistRef);

        if (snapshot.exists()) {
            const playlistsData: PlaylistsData = snapshot.val();
          const playlistsArray =Object.entries(playlistsData).map(([id, data]) => ({
            id,
            name: data.name,
          }));
          setPlaylists(playlistsArray);
        } else {
          setPlaylists([]);
        }
      };

      fetchPlaylists();
    }
  }, [user]);

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) {
      alert("Please enter a playlist name.");
      return;
    }
    if (!user) {
      login();
      return;
    }

    try {
        const playlistRef = ref(db, `playlists/${user.uid}`);
        const newPlaylistRef = push(playlistRef);  // Push to create a new unique key
        await set(newPlaylistRef, { name: playlistName });  // Use set instead of calling set on the reference directly

        setPlaylists((prev) => [
          ...prev,
          { id: newPlaylistRef.key!, name: playlistName },
        ]);
        setPlaylistName("");
        setShowModal(false);
        alert("Playlist created successfully!");
      } catch (error) {
        console.error(error);
        alert("Failed to create playlist.");
      }

  };

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      const newTime = audioRef.current.currentTime + seconds;
      audioRef.current.currentTime = Math.min(newTime, audioDuration);
      setCurrentTime(newTime);
      setProgress((newTime / audioDuration) * 100);
    }
  };

  const handleAddToPlaylist = async () => {
    if (!selectedPlaylist) {
      alert("Please select a playlist.");
      return;
    }
    if (!user) {
      login();
      return;
    }

    try {
      // Fetch existing songs in the selected playlist
      const playlistRef = ref(db, `playlists/${user.uid}/${selectedPlaylist}/songs`);
      const snapshot = await get(playlistRef);
      const existingSongs: SongsData = snapshot.val() || {}; // Use the SongsData type

      // Check if the song is already in the playlist
      const isSongAlreadyInPlaylist = Object.values(existingSongs).some(
        (song: Song) => song.musicId === musicId
      );

      if (isSongAlreadyInPlaylist) {
        alert("This song is already in the selected playlist.");
        return;
      }

      // Add song to the playlist if not already present
      await push(playlistRef, {
        musicId,
        musicName,
        artistName,
        albumImageUrl,
        musicFileUrl,
      });

      alert("Song added to playlist!");
      setShowModal(false); // Close the modal
    } catch (error) {
      console.error("Error adding song to playlist:", error);
      alert("Failed to add song to playlist.");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center bg-gradient-to-tr from-black via-gray-800 to-zinc-900 rounded-lg p-6 w-full shadow-lg space-y-6 sm:space-y-0 sm:space-x-6">
      {/* Album Image */}
      <div className="flex-shrink-0">
        <div
          className={`relative p-2 w-32 h-32 rounded-full bg-gray-800 border-4 border-gray-600 shadow-lg ${
            isPlaying ? "animate-spin-slow" : ""
          }`}
        >
          <Image
            src={albumImageUrl}
            alt={`${musicName} Album Cover`}
            width={700}
            height={700}
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      </div>

      {/* Music Info and Progress */}
      <div className="flex-1 w-full">
        <div className="text-left">
          <h3 className="text-2xl font-bold text-white">{musicName}</h3>
          <p className="text-gray-400">Artist: {artistName}</p>
        </div>
        <div className="mt-4 w-full flex flex-col">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(audioDuration)}</span>
          </div>
          <input
            aria-label="progressbar"
            type="range"
            value={progress}
            onChange={handleProgressChange}
            max="100"
            className="w-full bg-gray-600 rounded-lg cursor-pointer"
          />
        </div>

        {/* Play/Pause and Skip Controls */}
        <div className="flex items-center justify-between mt-4">
          <button
            title="skip 10 seconds backward"
            onClick={() => handleSkip(-10)} className="text-white hover:bg-zinc-900 p-1 rounded-full transition-all duration-300">
            <MdOutlineReplay10 size={24} />
          </button>
          <button onClick={handlePlayPause} className="text-white">
            {isPlaying ? (
              <FaPauseCircle size={24} />
            ) : (
              <FaPlayCircle size={24} />
            )}
          </button>
          <button
            title="skip 10 seconds forward"
           onClick={() => handleSkip(10)} className="text-white hover:bg-gray-900 p-1 rounded-full transition-all duration-300">
            <MdOutlineForward10 size={24} />
          </button>
        </div>
      </div>

      {/* Create Playlist Icon */}
      {/* Add to Playlist Button */}
      {user && (
  <>
    {/* Add to Playlist Button */}
    <button
      title="Add to playlist"
      onClick={() => setShowModal(true)}
      className="text-white bg-zinc-800 hover:bg-gray-800 rounded-full p-1 shadow-lg"
    >
      <RiAddLine size={20} />
    </button>

    {/* Modal */}
    {showModal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={() => setShowModal(false)}
      >
        {/* Modal Content */}
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Add to Playlist
          </h2>

          {/* Create New Playlist */}
          <div className="mb-6">
            <label htmlFor="playlistName" className="block text-gray-600 mb-2">
              New Playlist Name
            </label>
            <input
              id="playlistName"
              type="text"
              placeholder="Enter playlist name"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleCreatePlaylist}
              className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Create Playlist
            </button>
          </div>

          {/* Existing Playlists */}
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Select an Existing Playlist
          </h3>
          {playlists.length === 0 ? (
            <p className="text-gray-500">No playlists found.</p>
          ) : (
            <ul className="space-y-2">
              {playlists.map((playlist) => (
                <li key={playlist.id} className="flex items-center">
                  <input
                    aria-label="radio"
                    type="radio"
                    name="playlist"
                    value={playlist.id}
                    onChange={(e) => setSelectedPlaylist(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{playlist.name}</span>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={handleAddToPlaylist}
            className="mt-6 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            Add to Selected Playlist
          </button>

          {/* Close Button */}
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 bg-red-700 w-[2rem] h-[2rem] rounded-full text-2xl text-gray-50 hover:bg-rose-700"
          >
            &times;
          </button>
        </div>
      </div>
    )}
  </>
)}


      <audio
        ref={audioRef}
        src={musicFileUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setAudioDuration(audioRef.current.duration);
          }
        }}
      />
    </div>
  );
};

export default MusicCard;
