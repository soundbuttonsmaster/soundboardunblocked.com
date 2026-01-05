"use client";

import type React from "react";
import { useState, useRef, useCallback, memo, useMemo } from "react";
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
  isAboveTheFold?: boolean; // Mark sounds visible immediately for eager loading
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
  isAboveTheFold = false,
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

  // Pre-calculate colors immediately - no memoization needed, just compute once
  const colorHex = getColorHex(getSoundColor(sound));
  const rgb = hexToRgb(colorHex);
  const colors = generateColorVariations(rgb);
  
  // Pre-calculate CSS variables for immediate rendering - compute synchronously
  const color1 = rgbToHex(colors.medium.r, colors.medium.g, colors.medium.b);
  const color2 = rgbToHex(colors.dark.r, colors.dark.g, colors.dark.b);
  const cssVars = {
    "--button-color-1": color1,
    "--button-color-2": color2,
    "--button-color-3": rgbToHex(colors.light.r, colors.light.g, colors.light.b),
    "--button-color-4": rgbToHex(colors.darkest.r, colors.darkest.g, colors.darkest.b),
    "--button-color-5": color1,
    "--button-color-6": color2,
  };
  
  // Split SVG into base (static) and top (pressable) parts
  // Base stays static, only top part moves down when pressed
  const baseSvg = useMemo(() => (
    <svg
      className="sound-button-base"
      viewBox="0 0 2500 2500"
      xmlns="http://www.w3.org/2000/svg"
      style={{ 
        display: "block", 
        width: "100%", 
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
      }}
    >
      <defs>
        <style>
          {`.cls-3{fill:#b1b1d9}.cls-4{fill:#d9d9ed}.cls-5{fill:#888bbf}`}
        </style>
      </defs>
      {/* Base/shadow parts - always static */}
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
    </svg>
  ), []);

  const topSvg = useMemo(() => (
    <svg
      className="sound-button-top"
      viewBox="0 0 2500 2500"
      xmlns="http://www.w3.org/2000/svg"
      style={{ 
        display: "block", 
        width: "100%", 
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        transform: isPressed ? "translateY(12px)" : "translateY(0px)",
        transition: "transform 0.08s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <defs>
        <style>
          {`.cls-1{fill:var(--button-color-1)}.cls-2{fill:var(--button-color-1);}.cls-6{fill:var(--button-color-2)}`}
        </style>
      </defs>
      {/* Top button part - moves down when pressed */}
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
  ), [color1, color2, isPressed]);

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
      audioRef.current.preload = "none"; // Don't preload - load only on play to avoid blocking LCP
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
      // Use proxy API route to avoid CORS issues
      const downloadUrl = `/api/sounds/${sound.id}/download`;
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
      if (setMessageContent && setShowMessage && dict) {
        setMessageContent(dict.download.started || "Download started");
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
      }
    } catch (error) {
      console.error("Error downloading sound:", error);
      if (setMessageContent && setShowMessage && dict) {
        setMessageContent(dict.download.failed || "Failed to download sound");
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
      } else {
        alert("Failed to download sound.");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div 
      className={cn("flex flex-col text-center items-center", className)}
      style={{
        minHeight: size === "large" ? "280px" : "140px", // Fixed min-height to prevent CLS
        width: "100%",
        contain: "layout style",
        willChange: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "0",
        margin: "0",
        boxSizing: "border-box",
        overflow: "visible",
        minWidth: 0,
        maxWidth: "100%",
        boxShadow: "none",
        flexShrink: 0,
        position: "relative",
        border: "none",
        outline: "none",
        gap: "0",
      }}
    >
      {/* Button section - centered */}
      <div 
        className="flex items-center justify-center py-1 flex-shrink-0" 
        style={{ 
          minHeight: size === "large" ? "230px" : "110px",
          contain: "layout style",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            contain: "layout style paint",
            willChange: "auto",
            position: "relative",
            width: size === "large" ? "250px" : "120px",
            height: size === "large" ? "230px" : "110px",
            margin: 0,
            padding: 0,
            display: "block",
            flexShrink: 0,
          }}
        >
          <button
            className="sound-button-svg"
            onClick={handlePlay}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setTimeout(() => setIsPressed(false), 250)}
            onMouseLeave={() => setIsPressed(false)}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setTimeout(() => setIsPressed(false), 250)}
            style={{
              WebkitTapHighlightColor: "transparent",
              ...cssVars,
              position: "relative",
              transform: "none !important",
              margin: 0,
              padding: 0,
              border: "none",
              outline: "none",
              width: "100%",
              height: "100%",
              display: "block",
            } as React.CSSProperties}
            aria-label={`Play ${sound.name}`}
          >
            {/* Base SVG - always static, never moves */}
            {baseSvg}
            {/* Top SVG - moves down when pressed, base stays static */}
            {topSvg}
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
          border: none !important;
          background: none !important;
          padding: 0 !important;
          cursor: pointer;
          width: 100% !important;
          height: 100% !important;
          contain: layout style paint !important;
          will-change: auto;
          display: block !important;
          position: relative !important;
          margin: 0 !important;
          transform: none !important;
          transition: none !important;
          overflow: visible;
        }

        .sound-button-svg:hover {
          transform: none !important;
        }

        .sound-button-svg:active {
          transform: none !important;
        }

        @media (max-width: 768px) {
          .sound-button-svg {
            width: 100% !important;
            height: 100% !important;
          }
        }

        @media (max-width: 480px) {
          .sound-button-svg {
            width: 100% !important;
            height: 100% !important;
          }
        }

        .sound-button-base {
          width: 100% !important;
          height: 100% !important;
          contain: layout style paint !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          transform: none !important;
          transition: none !important;
          pointer-events: none !important;
          margin: 0 !important;
          padding: 0 !important;
          z-index: 1;
        }

        .sound-button-top {
          width: 100% !important;
          height: 100% !important;
          contain: layout style paint !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          pointer-events: none !important;
          margin: 0 !important;
          padding: 0 !important;
          z-index: 2;
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
