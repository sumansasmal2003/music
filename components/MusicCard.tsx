import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FaPlayCircle, FaPauseCircle } from "react-icons/fa";
import { MdOutlineForward10, MdOutlineReplay10 } from "react-icons/md";

import '../app/globals.css'

interface MusicCardProps {
  musicName: string;
  artistName: string;
  duration: string;
  albumImageUrl: string;
  musicFileUrl: string;
}

const MusicCard: React.FC<MusicCardProps> = ({
  musicName,
  artistName,
  albumImageUrl,
  musicFileUrl,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      const newTime = audioRef.current.currentTime + seconds;
      audioRef.current.currentTime = Math.min(newTime, audioDuration);
      setCurrentTime(newTime);
      setProgress((newTime / audioDuration) * 100);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center bg-zinc-900 rounded-lg p-6 w-full shadow-lg space-y-6 sm:space-y-0 sm:space-x-6">
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
            className="w-full appearance-none rounded-lg h-2"
            style={{
              background: `linear-gradient(to right, #1DB954 ${progress}%, #444 ${progress}%)`,
            }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          title="Skip backward 10 seconds"
          onClick={() => handleSkip(-10)}
          className="text-white p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition duration-300"
        >
          <MdOutlineReplay10 className="text-2xl" />
        </button>
        <button
          onClick={handlePlayPause}
          className="text-white p-4 rounded-full bg-gray-800 hover:bg-gray-700 transition duration-300"
        >
          {isPlaying ? (
            <FaPauseCircle className="text-3xl" />
          ) : (
            <FaPlayCircle className="text-3xl" />
          )}
        </button>
        <button
          title="Skip forward 10 seconds"
          onClick={() => handleSkip(10)}
          className="text-white p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition duration-300"
        >
          <MdOutlineForward10 className="text-2xl" />
        </button>
      </div>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={musicFileUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default MusicCard;
