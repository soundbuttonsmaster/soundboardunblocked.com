"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Sound } from "@/lib/api/client";
import type { Locale } from "@/lib/i18n/config";
import type { SoundboardItem } from "@/lib/api/helpers";
import SoundButton from "@/components/sound/sound-button";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import DottedBackground from "@/components/ui/dotted-background";
import { getColorHex } from "@/lib/constants/colors";
import { getSoundUrl } from "@/lib/utils/slug";
import { apiClient } from "@/lib/api/client";
import { Loader2 } from "lucide-react";
import { ShareDialog } from "@/components/sound/share-dialog";

interface Props {
  sound: Sound;
  relatedSounds: Sound[];
  lang: Locale;
  dict: any;
  soundboards: SoundboardItem[];
}

interface SoundDetailButtonProps {
  sound: Sound;
  lang: Locale;
  onShareClick: () => void;
}

function SoundDetailButton({
  sound,
  lang,
  onShareClick,
}: SoundDetailButtonProps) {
  console.log("Sound object in SoundDetailButton:", sound);
  return (
    <SoundButton
      sound={sound}
      lang={lang}
      size="large"
      hideName={true}
      hideActions={true}
      onShareClick={onShareClick}
    />
  );
}

export default function SoundDetailClient({
  sound,
  relatedSounds,
  lang,
  dict,
  soundboards,
}: Props) {
  const [isFavorited, setIsFavorited] = useState(sound.is_favorited || false);
  const [likeCount, setLikeCount] = useState(sound.likes_count || 0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [currentShareSound, setCurrentShareSound] = useState<Sound | null>(
    null
  );

  useEffect(() => {
    if (isShareDialogOpen && currentShareSound) {
      setShareUrl(
        `${window.location.origin}${getSoundUrl(
          currentShareSound.name,
          Number(currentShareSound.id),
          lang
        )}`
      );
    }
  }, [isShareDialogOpen, currentShareSound, lang]);

  const handleShareClick = (soundToShare: Sound) => {
    setCurrentShareSound(soundToShare);
    setIsShareDialogOpen(true);
  };

  useEffect(() => {
    console.log("[v0] Related sounds count:", relatedSounds.length);
    console.log("[v0] Related sounds:", relatedSounds);
  }, [relatedSounds]);

  // Increment view count on mount
  useEffect(() => {
    fetch(`/api/sounds/${sound.id}/view`, { method: "POST" }).catch(() => {});
  }, [sound.id]);

  const colorHex = getColorHex("red"); // Default color since Python API doesn't have color field

  const handleFavorite = async () => {
    try {
      if (isFavorited) {
        await fetch(`/api/sounds/${sound.id}/like`, { method: "DELETE" });
        setLikeCount((prev) => Math.max(0, prev - 1));
        setIsFavorited(false);
        setMessageContent(dict.soundDetail.removedFromFavorites);
      } else {
        await fetch(`/api/sounds/${sound.id}/like`, { method: "POST" });
        setLikeCount((prev) => prev + 1);
        setIsFavorited(true);
        setMessageContent(dict.soundDetail.addedToFavorites);
      }
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000); // Hide message after 3 seconds
    } catch (error) {
      console.error("[v0] Error favoriting sound:", error);
      setMessageContent("Error updating favorite status.");
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000); // Hide message after 3 seconds
    }
  };

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

  const handleRingtone = () => {
    try {
      const downloadUrl = apiClient.getSoundDownloadUrl(sound.id);
      console.log("[SoundDetail] Using API ringtone URL:", downloadUrl);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${sound.name}-ringtone.mp3`;
      a.click();
    } catch (error) {
      console.error(
        "[SoundDetail] Failed to create ringtone link for sound:",
        sound.id,
        error
      );
    }
  };

  const handleNotification = () => {
    try {
      const downloadUrl = apiClient.getSoundDownloadUrl(sound.id);
      console.log("[SoundDetail] Using API notification URL:", downloadUrl);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${sound.name}-notification.mp3`;
      a.click();
    } catch (error) {
      console.error(
        "[SoundDetail] Failed to create notification link for sound:",
        sound.id,
        error
      );
    }
  };

  const handleShare = (
    platform: "facebook" | "twitter" | "whatsapp" | "copy"
  ) => {
    const shareSound = currentShareSound || sound;
    const url = `${window.location.origin}${getSoundUrl(
      shareSound.name,
      Number(shareSound.id),
      lang
    )}`;
    const text = `Check out this sound: ${shareSound.name}`;

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`,
          "_blank"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            url
          )}&text=${encodeURIComponent(text)}`,
          "_blank"
        );
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
          "_blank"
        );
        break;
      case "copy":
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url);
        } else {
          // Fallback for browsers that do not support navigator.clipboard
          const textarea = document.createElement("textarea");
          textarea.value = url;
          textarea.style.position = "fixed"; // Prevent scrolling to bottom of page in MS Edge.
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          try {
            document.execCommand("copy");
            setMessageContent(dict.common.copied);
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 3000);
          } catch (err) {
            console.error("Fallback: Oops, unable to copy", err);
            setMessageContent("Error copying link.");
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 3000);
          }
          document.body.removeChild(textarea);
        }
        break;
    }
  };

  const audioUrl = apiClient.getSoundAudioUrl(sound.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AudioObject",
    name: sound.name,
    description: `Play and download the ${sound.name} sound button`,
    contentUrl: audioUrl,
    encodingFormat: "audio/mpeg",
  };

  const categoryName = sound.category_name || "Category";
  const categorySlug = categoryName.toLowerCase().replace(/\s+/g, "-");
  const categoryId = sound.category_id || sound.category || 0;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: dict.common?.home || "Home",
        item: `https://soundboardunblocked.com/${lang}`,
      },
      ...(categoryId > 0
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: categoryName,
              item: `https://soundboardunblocked.com/${lang}/${categorySlug}/${categoryId}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: categoryId > 0 ? 3 : 2,
        name: sound.name,
      },
    ],
  };

  const relatedSoundsSchema = relatedSounds.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Related Sounds to ${sound.name}`,
    description: `Related sound buttons similar to ${sound.name}`,
    numberOfItems: relatedSounds.length,
    itemListElement: relatedSounds.slice(0, 10).map((relatedSound, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: relatedSound.name,
      url: `https://soundboardunblocked.com/${lang}/sound/${relatedSound.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")}/${relatedSound.id}`,
    })),
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {relatedSoundsSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(relatedSoundsSchema) }}
        />
      )}
      <ShareDialog
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        shareUrl={shareUrl}
        soundName={currentShareSound?.name || sound.name}
        soundImageUrl="/placeholder.jpg"
        setMessageContent={setMessageContent}
        setShowMessage={setShowMessage}
        dict={dict}
      />

      <Header lang={lang} dict={dict} soundboards={soundboards} />
      <DottedBackground />
      <main className="relative min-h-screen px-4 py-8">
        <div className="mx-auto max-w-7xl md:pt-10 lg:pt-0">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Link
              href={`/${lang}`}
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              {dict.common.home}
            </Link>
            <span>/</span>
            {categoryId > 0 && (
              <Link
                href={`/${lang}/${categorySlug}/${categoryId}`}
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                {categoryName}
              </Link>
            )}
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-100">
              {sound.name}
            </span>
          </nav>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[400px_1fr]">
            {/* Left: Large button only */}
            <div className="w-full aspect-square max-w-[1000px] max-h-[1000px] flex items-center justify-center sm:max-h-[147px] mx-auto mt-20">
              <SoundDetailButton
                sound={sound}
                lang={lang}
                onShareClick={() => handleShareClick(sound)}
              />
            </div>

            {/* Right: All content in single column */}
            <div className="space-y-6">
              {/* Sound title */}
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {sound.name}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  {lang === "es" &&
                    `¡Reproduce y descarga el botón de efecto de sonido ${sound.name} ahora mismo! Perfecto para bromas, creación de contenido, transmisiones de gaming y compartir risas con amigos.`}
                  {lang === "fr" &&
                    `Jouez et téléchargez le bouton d'effet sonore ${sound.name} dès maintenant ! Parfait pour les blagues, la création de contenu, les streams gaming et partager des rires avec vos amis.`}
                  {lang === "de" &&
                    `Spielen & Laden Sie ${sound.name} Soundeffekt-Button jetzt herunter! Perfekt für Streiche, Content-Erstellung, Gaming-Streams und um Lachen mit Freunden zu teilen.`}
                  {lang === "pt" &&
                    `Reproduza e baixe o botão de efeito sonoro ${sound.name} agora mesmo! Perfeito para pegadinhas, criação de conteúdo, transmissões de gaming e compartilhar risadas com amigos.`}
                  {lang === "it" &&
                    `Riproduci e scarica il pulsante effetto sonoro {sound name} subito! Perfetto per scherzi, creazione di contenuti, streaming di giochi e condivisione di risate con gli amici.`}
                  {lang === "ja" &&
                    `${sound.name}効果音ボタンを今すぐ再生＆ダウンロード！いたずら、コンテンツ制作、ゲーム配信、友達との笑いの共有に最適。`}
                  {lang === "ko" &&
                    `${sound.name} 음향 효과 버튼을 지금 바로 재생 및 다운로드하세요! 장난, 콘텐츠 제작, 게임 스트리밍 및 친구들과 웃음 공유에 완벽합니다.`}
                  {lang === "zh" &&
                    `立即播放和下载 ${sound.name} 音效按钮！非常适合恶作剧、内容创作、游戏直播以及与朋友分享欢笑。`}
                  {lang === "ar" &&
                    `شغّل وحمّل زر المؤثر الصوتي ${sound.name} الآن! مثالي للمقالب وإنشاء المحتوى وبث الألعاب ومشاركة الضحك مع الأصدقاء.`}
                  {lang === "hi" &&
                    `${sound.name} साउंड इफेक्ट बटन अभी प्ले और डाउनलोड करें! प्रैंक, कंटेंट क्रिएशन, गेमिंग स्ट्रीम्स और दोस्तों के साथ हंसी साझा करने के लिए परफेक्ट।`}
                  {lang === "ru" &&
                    `Воспроизведите и загрузите кнопку звукового эффекта ${sound.name} прямо сейчас! Идеально подходит для розыгрышей, создания контента, игровых стримов и обмена смехом с друзьями.`}
                  {![
                    "es",
                    "fr",
                    "de",
                    "pt",
                    "it",
                    "ja",
                    "ko",
                    "zh",
                    "ar",
                    "hi",
                    "ru",
                  ].includes(lang) &&
                    `Play & Download ${sound.name} sound effect button right now! Perfect for pranks, content creation, gaming streams, and sharing laughs with friends.`}
                </p>
              </div>

              {/* Action buttons grid */}
              {showMessage && (
                <div className="mb-4 rounded-md bg-green-500 p-3 text-white">
                  {messageContent}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleFavorite}
                  className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-white transition-colors ${
                    isFavorited
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span className="font-medium">
                    {isFavorited
                      ? dict.soundDetail.addedToSoundboard
                      : dict.soundDetail.addToSoundboard}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleRingtone}
                  className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-white transition-colors hover:bg-green-700"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                  <span className="font-medium">
                    {dict.soundDetail.getRingtone}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-3 text-white transition-colors hover:bg-cyan-600"
                  disabled={isDownloading}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {isDownloading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  )}
                  <span className="font-medium">
                    {dict.soundDetail.downloadMp3}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleNotification}
                  className="flex items-center justify-center gap-2 rounded-lg bg-yellow-500 px-4 py-3 text-white transition-colors hover:bg-yellow-600"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    <path d="M18.63 13A17.89 17.89 0 0 1 18 8" />
                    <path d="M6.26 8.8C6.12 8.5 6 8.2 6 8a6 6 0 0 1 12 0c0 7-3 9-3 9H9s-3-2-3-9" />
                    <path d="M18 8a6 6 0 0 0-12 0" />
                  </svg>
                  <span className="font-medium">
                    {dict.soundDetail.notificationSound}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto]">
                {/* Stats with icons */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-red-500"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span className="font-semibold">
                      {likeCount.toLocaleString()}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {dict.soundDetail.usersFavorited}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-green-600"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span className="font-semibold">
                      {sound.views.toLocaleString()}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {dict.soundDetail?.viewed || "Views"}
                    </span>
                  </div>
                </div>

                {/* Social sharing */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {dict.soundDetail.socialSharing}
                  </h3>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleShare("facebook")}
                      className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700"
                      aria-label={dict.soundDetail.shareOnFacebook}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShare("twitter")}
                      className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-500 text-white transition-colors hover:bg-sky-600"
                      aria-label={dict.soundDetail.shareOnTwitter}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShare("whatsapp")}
                      className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500 text-white transition-colors hover:bg-green-600"
                      aria-label={dict.soundDetail.shareOnWhatsApp}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.893 1.13.649 2.376.649 3.757 0 1.38-.216 2.694-.649 3.757-.433-.984-.649-2.3-.649-3.757 0-1.38.216-2.694.649-3.757.433-1.362.649-2.578.649-3.757zm-10.475 16.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShare("copy")}
                      className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-600 text-white transition-colors hover:bg-slate-700"
                      aria-label={dict.soundDetail.copyLink}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {relatedSounds.length > 0 && (
            <div className="mt-12">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-slate-600"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path
                      d="M12 6v6l4 2"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                    />
                  </svg>
                  {dict.soundDetail.youMightLike}
                </h2>
                {categoryId > 0 && (
                  <Link
                    href={`/${lang}/${categorySlug}/${categoryId}`}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {dict.common?.seeAll || "See All"}
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Link>
                )}
              </div>

              {/* Related sounds grid */}
              {(() => {
                const firstBatch = relatedSounds.slice(0, 20);
                const secondBatch = relatedSounds.slice(20, 27);
                const soundsPerRow = 10; // Desktop: 10 sounds per row
                
                // Split first batch into rows
                const firstRows: typeof firstBatch[] = [];
                for (let i = 0; i < firstBatch.length; i += soundsPerRow) {
                  firstRows.push(firstBatch.slice(i, i + soundsPerRow));
                }
                
                return (
                  <>
                    {firstRows.map((rowSounds, rowIndex) => {
                      const isLastRow = rowIndex === firstRows.length - 1 && secondBatch.length === 0;
                      const lastRowItemCount = rowSounds.length;
                      const shouldCenter = isLastRow && lastRowItemCount >= 2 && lastRowItemCount <= 3;
                      
                      return (
                        <div key={rowIndex} className={rowIndex > 0 ? "mt-2" : ""}>
                          <div
                            className={`grid grid-cols-3 sm:grid-cols-3 md:grid-cols-8 lg:grid-cols-9 xl:grid-cols-10 ${
                              shouldCenter ? "xl:mx-auto xl:w-fit" : ""
                            }`}
                            style={{
                              ...(shouldCenter
                                ? {
                                    gridTemplateColumns: `repeat(${lastRowItemCount}, minmax(0, 1fr))`,
                                  }
                                : {}),
                              gap: "1.5rem", // 24px gap
                              display: "grid",
                            }}
                          >
                            {rowSounds.map((relatedSound) => (
                              <SoundButton
                                key={relatedSound.id}
                                sound={relatedSound}
                                lang={lang}
                                className="min-w-0"
                                onShareClick={() => handleShareClick(relatedSound)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    
                    {secondBatch.length > 0 && (
                      <div className="mt-2 flex justify-center">
                        <div
                          className={`grid grid-cols-3 sm:grid-cols-3 md:grid-cols-7 ${
                            secondBatch.length >= 2 && secondBatch.length <= 3
                              ? "md:mx-auto md:w-fit"
                              : ""
                          }`}
                          style={{
                            ...(secondBatch.length >= 2 && secondBatch.length <= 3
                              ? {
                                  gridTemplateColumns: `repeat(${secondBatch.length}, minmax(0, 1fr))`,
                                }
                              : {}),
                            gap: "1.5rem", // 24px gap
                            display: "grid",
                          }}
                        >
                          {secondBatch.map((relatedSound) => (
                            <SoundButton
                              key={relatedSound.id}
                              sound={relatedSound}
                              lang={lang}
                              className="min-w-0"
                              onShareClick={() => handleShareClick(relatedSound)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

              <hr className="my-8 border-slate-300 dark:border-slate-700" />

              {/* CTA button */}
              {categoryId > 0 && (
                <div className="text-center">
                  <Link
                    href={`/${lang}/${categorySlug}/${categoryId}`}
                    className="inline-flex items-center gap-2 rounded-lg border-2 border-blue-600 px-6 py-3 font-medium text-blue-600 transition-colors hover:bg-blue-600 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white"
                  >
                    {dict.soundDetail?.exploreMore || "Explore More"}{" "}
                    {categoryName} {dict.soundDetail?.sounds || "Sounds"}
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
