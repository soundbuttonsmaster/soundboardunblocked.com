"use client";

import type React from "react";
import { useState, useRef, useCallback, memo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/contexts/favorites-context";
import type { Sound } from "@/lib/api/client";
import type { Locale } from "@/lib/i18n/config";
import { getColorHex } from "@/lib/constants/colors";
import { getSoundUrl } from "@/lib/utils/slug";
import { apiClient } from "@/lib/api/client";
import { Button } from "../ui/button";
import { DownloadIcon, Share2Icon, HeartIcon, Loader2 } from "lucide-react";

interface Props {
  sound: Sound;
  lang: Locale;
  hideActions?: boolean;
  size?: "default" | "large";
  hideName?: boolean; // Added prop to hide the name
  onShareClick?: (soundName: string) => void; // New prop for share button click
  setMessageContent?: (content: string) => void;
  setShowMessage?: (show: boolean) => void;
  dict?: any;
  className?: string;
}

// Global audio context for pausing other sounds
let currentAudio: HTMLAudioElement | null = null;

const SoundButton = memo(function SoundButton({
  sound,
  lang,
  hideActions = false,
  size = "default",
  hideName = false,
  onShareClick,
  setMessageContent,
  setShowMessage,
  dict,
  className,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const buttonId = `btn-${sound.id}`;

  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(Number(sound.id));

  // Get color based on sound properties
  const getSoundColor = (sound: Sound) => {
    // Check if red color was specifically selected during upload
    if (sound.tag && sound.tag.includes("red_color_selected")) {
      return "red";
    }

    const colors = [
      "red",
      "blue",
      "green",
      "yellow",
      "purple",
      "orange",
      "cyan",
      "emerald",
      "violet",
      "fuchsia",
      "teal",
      "lime",
      "amber",
      "sky",
      "rose",
    ];
    // Use sound id to determine color (cyclic through available colors)
    const colorIndex = sound.id % colors.length;
    return colors[colorIndex];
  };

  const colorHex = getColorHex(getSoundColor(sound));
  const rgb = hexToRgb(colorHex);
  const colors = generateColorVariations(rgb);

  const handlePlay = useCallback(() => {
    const audioUrl = apiClient.getSoundAudioUrl(sound.id);
    // Stop any currently playing sound
    if (currentAudio && currentAudio !== audioRef.current) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      currentAudio = null;
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsPlaying(false);
        currentAudio = null;
      };
      audioRef.current.onerror = () => {
        setIsPlaying(false);
        currentAudio = null;
      };
    }

    audioRef.current.currentTime = 0;
    console.log("Attempting to play audio:", audioUrl); // Added console.log here
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        currentAudio = audioRef.current;
        // Increment play count
        fetch(`/api/sounds/${sound.id}/play`, { method: "POST" }).catch(
          () => {}
        );
      })
      .catch((e) => {
        console.error("Error playing sound:", e);
        setIsPlaying(false);
      });
  }, [isPlaying, sound.id]);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(Number(sound.id));
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShareClick) {
      onShareClick(sound.name);
    } else {
      // Fallback for pages where onShareClick is not provided (e.g., detail page)
      const url = `${window.location.origin}${getSoundUrl(
        sound.name,
        Number(sound.id),
        lang
      )}`;
      navigator.clipboard.writeText(url).then(() => {
        if (setMessageContent && setShowMessage && dict) {
          setMessageContent(dict.share.success);
          setShowMessage(true);
        }
      });
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);
    try {
      const downloadUrl = apiClient.getSoundDownloadUrl(sound.id);
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sound.name}.mp3`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading sound:", error);
      alert("Failed to download sound.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={cn("flex flex-col text-center", className)}>
      {/* Button section - centered */}
      <div className="flex items-center justify-center py-1 flex-shrink-0">
        <div
          className={`relative transition-all duration-300 ${
            isPlaying ? "scale-95" : "hover:scale-105"
          }`}
        >
          <button
            className="sound-button-svg"
            onClick={handlePlay}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setTimeout(() => setIsPressed(false), 250)}
            onMouseLeave={() => setIsPressed(false)}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setTimeout(() => setIsPressed(false), 250)}
            style={
              {
                WebkitTapHighlightColor: "transparent",
                "--button-color-1": rgbToHex(
                  colors.medium.r,
                  colors.medium.g,
                  colors.medium.b
                ),
                "--button-color-2": rgbToHex(
                  colors.dark.r,
                  colors.dark.g,
                  colors.dark.b
                ),
                "--button-color-3": rgbToHex(
                  colors.light.r,
                  colors.light.g,
                  colors.light.b
                ),
                "--button-color-4": rgbToHex(
                  colors.darkest.r,
                  colors.darkest.g,
                  colors.darkest.b
                ),
                "--button-color-5": rgbToHex(
                  colors.medium.r,
                  colors.medium.g,
                  colors.medium.b
                ),
                "--button-color-6": rgbToHex(
                  colors.dark.r,
                  colors.dark.g,
                  colors.dark.b
                ),
              } as React.CSSProperties
            }
            aria-label={`Play ${sound.name}`}
          >
            {isPressed ? (
              // Pressed button SVG
              <svg
                className="sound-button-svg-content"
                viewBox="0 0 2500 2500"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <style>
                    {`.cls-1{fill:var(--button-color-1);}.cls-2{fill:var(--button-color-1)}.cls-3{fill:#b1b1d9}.cls-4{fill:#d9d9ed}.cls-5{fill:#888bbf}.cls-6{fill:var(--button-color-2)}`}
                  </style>
                </defs>
                <path
                  className="cls-5"
                  d="M2468.57,1157.86v378.85c0,180.77-118.9,360.32-356.68,497.41-475.58,275.4-1248.39,275.4-1723.96,0C150.13,1897.03,31.24,1717.48,31.24,1536.71v-378.85h2437.33Z"
                />
                <path
                  className="cls-3"
                  d="M2468.57,1049.52v378.85c0,180.77-118.9,360.32-356.68,497.41-475.58,275.4-1248.39,275.4-1723.96,0C150.13,1788.69,31.24,1609.14,31.24,1428.37v-378.85h2437.33Z"
                />
                <path
                  className="cls-4"
                  d="M2111.99,1547.05c-476.05,274.85-1247.89,274.84-1723.96-.02-476.06-274.86-476.07-720.48-.02-995.33,476.05-274.85,1247.89-274.84,1723.96.02,476.06,274.86,476.07,720.48.02,995.33Z"
                />
                <g>
                  <path
                    className="cls-6"
                    d="M2236.93,805.12v199.02c0,143.99-96.31,286.99-288.88,396.17-385.19,219.35-1011.08,219.35-1396.23,0-192.61-109.18-288.88-252.18-288.88-396.17v-196.55c3.09-80.55,36.58-160.79,100.47-234.68h1773.16c63.25,73.14,96.7,152.5,100.36,232.2Z"
                  />
                  <path
                    className="cls-2"
                    d="M2236.93,834.71c-2.12,46.35-14.32,92.59-36.61,137.57-44.29,89.34-128.36,173.71-252.2,244.03-385.54,218.9-1010.65,218.9-1396.23,0-121.4-68.94-204.56-151.33-249.54-238.73-.04-.04-.04-.07-.04-.11-24.41-47.37-37.51-96.26-39.38-145.22-.32-8.22-.32-16.45,0-24.64,3.09-80.55,36.58-160.79,100.47-234.68,46.63-53.97,109.44-104.52,188.48-149.39,385.54-218.93,1010.65-218.93,1396.23,0,79,44.87,141.82,95.42,188.45,149.39,63.25,73.14,96.7,152.5,100.36,232.2.47,9.88.47,19.73,0,29.58Z"
                  />
                  <path
                    className="cls-1"
                    d="M2236.85,868.71c0,141.99-95.84,283.97-288.75,392.85-385.79,216.51-1010.59,216.51-1396.39,0-192.89-108.88-289.95-250.86-289.95-392.85,1.22,102.94,98.27,204.7,289.95,282.8,385.8,157.36,1010.6,157.36,1396.39,0,191.69-78.1,287.53-179.86,288.75-282.8Z"
                  />
                </g>
              </svg>
            ) : (
              // Default button SVG
              <svg
                className="sound-button-svg-content"
                viewBox="0 0 2500 2500"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <style>
                    {`.cls-1{fill:var(--button-color-1)}.cls-2{fill:var(--button-color-1);}.cls-3{fill:#b1b1d9}.cls-4{fill:#d9d9ed}.cls-5{fill:#888bbf}.cls-6{fill:var(--button-color-2)}`}
                  </style>
                </defs>
                <path
                  className="cls-5"
                  d="M2464.73,1294.34v377.66c0,180.2-118.52,359.18-355.56,495.84-474.08,274.53-1244.46,274.53-1718.53,0-237.04-136.66-355.56-315.65-355.56-495.84v-377.66h2429.65Z"
                />
                <path
                  className="cls-3"
                  d="M2464.73,1186.35v377.65c0,180.2-118.52,359.18-355.56,495.84-474.08,274.53-1244.46,274.53-1718.53,0-237.04-136.66-355.56-315.65-355.56-495.84v-377.65h2429.65Z"
                />
                <path
                  className="cls-4"
                  d="M2109.28,1682.31c-474.55,273.98-1243.96,273.98-1718.53-.02-474.56-273.99-474.58-718.21-.02-992.19,474.55-273.98,1243.96-273.98,1718.53.02,474.56,273.99,474.57,718.21.02,992.19Z"
                />
                <g>
                  <path
                    className="cls-6"
                    d="M2233.82,694.59v437.11c0,145.94-95.99,290.9-287.97,401.58-383.97,222.35-1007.9,222.35-1391.85,0-191.98-110.68-287.97-255.64-287.97-401.58v-437.11h1967.78Z"
                  />
                  <path
                    className="cls-1"
                    d="M1945.93,1096.28c-384.34,221.9-1007.49,221.89-1391.84-.02-384.36-221.9-384.36-581.68-.02-803.58,384.34-221.9,1007.49-221.9,1391.84,0,384.36,221.91,384.36,581.68.02,803.58Z"
                  />
                  <path
                    className="cls-2"
                    d="M2233.74,739.25c0,145.12-95.54,290.24-287.84,401.52-384.58,221.3-1007.41,221.3-1392,0-192.29-111.28-289.04-256.4-289.04-401.52,1.21,105.22,97.96,209.22,289.04,289.04,384.59,160.84,1007.42,160.84,1392,0,191.08-79.82,286.62-183.83,287.84-289.04Z"
                  />
                </g>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Sound name */}
      {!hideName && (
        <div className="flex items-center justify-center px-2 flex-shrink-0">
          <Link
            href={getSoundUrl(sound.name, Number(sound.id), lang)}
            className={cn(
              "mt-2 block w-full text-center",
              size === "large"
                ? "h-[56px] max-w-[300px]"
                : "h-[36px] max-w-[90px]"
            )}
            style={{ minHeight: size === "large" ? "56px" : "36px" }}
          >
            <p
              className={cn(
                "line-clamp-2 font-semibold leading-snug text-slate-700 underline hover:text-blue-600 transition-colors dark:text-slate-300 dark:hover:text-blue-400",
                size === "large" ? "text-lg" : "text-[13px]"
              )}
            >
              {sound.name}
            </p>
          </Link>
        </div>
      )}

      {!hideActions && (
        <div
          className="mt-1 flex items-center justify-center gap-2"
          style={{ minHeight: "20px" }}
        >
          {/* Heart icon */}
          <button
            type="button"
            onClick={handleFavorite}
            className={cn(
              "transition-colors",
              favorite ? "text-red-500" : "text-red-400 hover:text-red-500"
            )}
            aria-label="Add to favorites"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={favorite ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Share icon */}
          <button
            type="button"
            onClick={handleShare}
            className="text-blue-500 transition-colors hover:text-blue-600"
            aria-label="Share"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>

          {/* Download icon */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            disabled={isDownloading}
            className="h-8 w-8"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <DownloadIcon className="h-4 w-4" />
            )}
            <span className="sr-only">Download</span>
          </Button>
        </div>
      )}

      <style jsx>{`
        .sound-button-svg {
          border: none;
          background: none;
          padding: 0;
          cursor: pointer;
          transition: transform 0.2s ease;
          width: ${size === "large" ? "250px" : "120px"};
          height: ${size === "large" ? "230px" : "110px"};
        }

        @media (max-width: 768px) {
          .sound-button-svg {
            width: 150px;
            height: 140px;
          }
        }

        @media (max-width: 480px) {
          .sound-button-svg {
            width: 120px;
            height: 110px;
          }
        }

        .sound-button-svg:hover {
          transform: scale(1.05);
        }

        .sound-button-svg:active {
          transform: scale(0.95);
        }

        .sound-button-svg-content {
          width: 100%;
          height: 100%;
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
});

function generateColorVariations(baseRgb: { r: number; g: number; b: number }) {
  const light = {
    r: Math.min(255, baseRgb.r + 45),
    g: Math.min(255, baseRgb.g + 45),
    b: Math.min(255, baseRgb.b + 45),
  };

  const medium = baseRgb;

  const dark = {
    r: Math.max(0, baseRgb.r - 35),
    g: Math.max(0, baseRgb.g - 35),
    b: Math.max(0, baseRgb.b - 35),
  };

  const darkest = {
    r: Math.max(0, baseRgb.r - 65),
    g: Math.max(0, baseRgb.g - 65),
    b: Math.max(0, baseRgb.b - 65),
  };

  return { light, medium, dark, darkest };
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : { r: 107, g: 114, b: 128 };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

export default SoundButton;
