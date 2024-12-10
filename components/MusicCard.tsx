import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FaPlayCircle, FaPauseCircle } from "react-icons/fa";
import { MdOutlineForward10, MdOutlineReplay10 } from "react-icons/md";

// Interface for the MusicCard props
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
  duration,
  albumImageUrl,
  musicFileUrl,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0); // Current time in seconds
  const [audioDuration, setAudioDuration] = useState(0); // Total duration of the audio
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Format the timestamp in mm:ss format
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration); // Set the total audio duration
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
      setCurrentTime(audioRef.current.currentTime); // Update current time
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100); // Update progress bar
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = (parseFloat(e.target.value) / 100) * audioDuration;
      audioRef.current.currentTime = newTime; // Set new time
      setCurrentTime(newTime);
      setProgress(parseFloat(e.target.value));
    }
  };

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      const newTime = audioRef.current.currentTime + seconds;
      audioRef.current.currentTime = Math.min(newTime, audioDuration); // Skip forward (limit to duration)
      setCurrentTime(newTime);
      setProgress((newTime / audioDuration) * 100); // Update progress bar
    }
  };

  return (
    <div
      className={`${
        isPlaying
          ? "animate-border-multicolor" // Apply animation when playing
          : "border border-gray-700"
      } bg-zinc-900 rounded-lg p-4 shadow-lg flex flex-col items-center transition duration-300`}
    >
      {/* Album Image */}
      <div className="w-full h-48 overflow-hidden rounded-md mb-4">
        <Image
          src={albumImageUrl}
          alt={`${musicName} Album Cover`}
          width={700}
          height={700}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Music Info */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-white">{musicName}</h3>
        <p className="text-gray-400">{artistName}</p>
        <p className="text-gray-500">{duration}</p>
      </div>

      {/* Progress Bar with Timestamp */}
      <div className="w-full mt-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(audioDuration)}</span>
        </div>
        <input
          aria-label="progressbar"
          type="range"
          value={progress}
          onChange={handleProgressChange}
          max="100"
          className="w-full bg-gray-700 appearance-none rounded-lg h-2"
          style={{
            background: `linear-gradient(to right, #1DB954 ${progress}%, #444 ${progress}%)`,
          }}
        />
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center gap-4">
        {/* Skip 10 seconds backward */}
        {isPlaying && (
        <button
          title="Skip"
          onClick={() => handleSkip(-10)}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-300"
        >
          <MdOutlineReplay10 className="text-2xl" />
        </button>
        )}

        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-300"
        >
          {isPlaying ? (
            <FaPauseCircle className="text-2xl" />
          ) : (
            <FaPlayCircle className="text-2xl" />
          )}
        </button>
        {/* Skip 10 seconds forward */}
          {isPlaying && (
        <button
            title="skip"
          onClick={() => handleSkip(10)}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-300"
        >
          <MdOutlineForward10 className="text-2xl" />
        </button>
        )}
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
