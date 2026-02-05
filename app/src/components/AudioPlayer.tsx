import { useEffect, useRef, useState } from "react";

type AudioPlayerProps = {
  audioUrl: string | null;
  className?: string;
  variant?: "primary" | "compact";
  showStop?: boolean;
};

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function AudioPlayer({
  audioUrl,
  className,
  variant = "primary",
  showStop = true,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audio.preload = "metadata";

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    const onLoadedMeta = () =>
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("loadedmetadata", onLoadedMeta);
    audio.addEventListener("timeupdate", onTimeUpdate);

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("loadedmetadata", onLoadedMeta);
      audio.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [audioUrl]);
  console.log("audioUrl =", audioUrl);
  console.log("audio.currentSrc =", audioRef.current?.currentSrc);

  function togglePlayPause() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play();
    else a.pause();
  }

  function stopAudio() {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
  }

  function seekTo(percent: number) {
    const a = audioRef.current;
    if (!a || !duration) return;
    a.currentTime = Math.max(0, Math.min(duration, percent * duration));
  }

  if (!audioUrl) return null;

  const buttonBase =
    "inline-flex items-center justify-center rounded-full bg-emerald-800 text-white shadow-md hover:bg-emerald-900";
  const size =
    variant === "compact"
      ? "px-4 py-2 text-sm font-semibold"
      : "px-5 py-2.5 text-sm md:text-base font-semibold";

  return (
    <div className={className}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={togglePlayPause}
            className={`${buttonBase} ${size}`}
          >
            🎧 {isPlaying ? "Pause" : "Anhören"}
          </button>

          {showStop && (
            <button
              type="button"
              onClick={stopAudio}
              className={`${buttonBase} ${size}`}
            >
              ⏹ Zurücksetzten
            </button>
          )}

          <div className="text-sm md:text-base font-semibold text-emerald-900">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <div
          className="h-3 w-full max-w-[520px] rounded-full bg-emerald-100 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            seekTo(percent);
          }}
        >
          <div
            className="h-3 rounded-full bg-emerald-700"
            style={{
              width: duration
                ? `${Math.min(100, (currentTime / duration) * 100)}%`
                : "0%",
            }}
          />
        </div>
      </div>
    </div>
  );
}
