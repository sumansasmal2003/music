"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/firebaseConfig";
import { ref, onValue } from "firebase/database";
import MusicCard from "@/components/MusicCard";
import '../app/globals.css';

// Define the type for a single music item
interface Music {
  id: string;
  musicName: string;
  artistName: string;
  duration: string;
  albumImageUrl: string;
  musicFileUrl: string;
}

const ExplorePage: React.FC = () => {
  const [musicList, setMusicList] = useState<Music[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredMusicList, setFilteredMusicList] = useState<Music[]>([]);

  useEffect(() => {
    const fetchMusic = () => {
      const musicRef = ref(db, "music/");
      onValue(musicRef, (snapshot) => {
        const data = snapshot.val();
        const musicArray: Music[] = data
          ? Object.keys(data).map((key) => ({
              id: key,
              musicName: data[key].musicName,
              artistName: data[key].artistName,
              duration: data[key].duration,
              albumImageUrl: data[key].albumImageUrl,
              musicFileUrl: data[key].musicFileUrl,
            }))
          : [];
        setMusicList(musicArray);
        setFilteredMusicList(musicArray);  // Initially show all music
      });
    };

    fetchMusic();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      // Filter musicList by musicName or artistName
      const filtered = musicList.filter(
        (music) =>
          music.musicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          music.artistName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMusicList(filtered);
    } else {
      setFilteredMusicList(musicList); // Show all music if search query is empty
    }
  }, [searchQuery, musicList]);

  return (
    <div className="bg-black text-white min-h-screen p-6 flex flex-col items-center justify-center w-full gap-3">

      {/* Search Bar */}
      <div className="mb-6 flex justify-center w-full">
        <input
          type="text"
          className="p-3 bg-zinc-800 outline-none text-white border border-gray-700 rounded-lg w-full md:w-1/2"
          placeholder="Search by music name or artist"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Display music cards */}
      <div className="flex flex-col items-center justify-center gap-3 w-full max-w-5xl">
        {filteredMusicList.length > 0 ? (
          filteredMusicList.map((music) => (
            <MusicCard
              key={music.id}
              musicName={music.musicName}
              artistName={music.artistName}
              duration={music.duration}
              albumImageUrl={music.albumImageUrl}
              musicFileUrl={music.musicFileUrl}
            />
          ))
        ) : (
          <p className="text-center text-gray-400">No results found</p>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
