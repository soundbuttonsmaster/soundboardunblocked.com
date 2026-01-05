import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { getPublicApiClient } from "@/lib/api/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSoundboards } from "@/lib/api/helpers";
import type { Locale } from "@/lib/i18n/config";
import { locales } from "@/lib/i18n/config";
import SoundDetailClient from "./sound-detail-client";
import type { Sound } from "@/lib/types/database";
import { extractIdFromUrl, generateSlug } from "@/lib/utils/slug";

interface Props {
  params: Promise<{ lang: Locale; slug: string; id: string }>;
}

// Cached function to fetch sound and related sounds
const getSoundData = unstable_cache(
  async (numericId: number) => {
    if (isNaN(numericId) || numericId < 1) {
      return null;
    }

    const apiClient = getPublicApiClient();

    try {
      const [soundResponse, relatedResponse] = await Promise.all([
        apiClient.getSound(numericId).catch(() => null),
        apiClient
          .getRelatedSounds(numericId, { limit: 29 })
          .catch(() => ({ status: 200, data: { results: [] } })),
      ]);

      if (!soundResponse || !soundResponse.data) return null;

      return {
        sound: soundResponse.data as unknown as Sound,
        relatedSounds: (relatedResponse.data.results || []) as Sound[],
      };
    } catch (error) {
      console.error("Error fetching sound data:", error);
      return null;
    }
  },
  ["sound-detail"],
  {
    revalidate: 900,
    tags: ["sounds"],
  }
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug, id } = await params;
  const numericId = extractIdFromUrl(id);

  if (isNaN(numericId)) {
    return {
      title: "Sound Not Found | SoundBoardUnblocked",
    };
  }

  const data = await getSoundData(numericId);

  if (!data) {
    return {
      title: "Sound Not Found | SoundBoardUnblocked",
    };
  }

  const { sound } = data;
  const siteUrl = "https://soundboardunblocked.com";
  // Use actual route params to ensure canonical matches the page URL
  const soundUrl = `${siteUrl}/${lang}/sound/${slug}/${id}`;
  const ogImageUrl = `${siteUrl}/og-image.jpg`;

  // Localized SEO title & description templates per language
  const soundName = sound.name;

  const titleByLocale: Record<Locale, string> = {
    en: `${soundName} Sound Effect Button | Soundboard Unblocked`,
    es: `Botón de Efecto de Sonido ${soundName} | Soundboard Desbloqueado`,
    fr: `Bouton d'Effet Sonore ${soundName} | Soundboard Débloqué`,
    de: `${soundName} Soundeffekt-Button | Soundboard Unblocked`,
    pt: `Botão de Efeito Sonoro ${soundName} | Soundboard Desbloqueado`,
    it: `Pulsante Effetto Sonoro ${soundName} | Soundboard Sbloccato`,
    ja: `${soundName} 効果音ボタン | サウンドボード アンブロック`,
    ko: `${soundName} 음향 효과 버튼 | 사운드보드 차단 해제`,
    zh: `${soundName} 音效按钮 | 音效板解锁`,
    ar: `زر المؤثر الصوتي ${soundName} | لوحة الصوت غير المحظورة`,
    hi: `${soundName} साउंड इफेक्ट बटन | साउंडबोर्ड अनब्लॉक`,
    ru: `Кнопка Звукового Эффекта ${soundName} | Саундборд Разблокирован`,
  };

  const descriptionByLocale: Record<Locale, string> = {
    en: `Download ${soundName} sound button free from our meme soundboard. Play, share & enjoy this funny soundboard for pranks, gaming & content creation!`,
    es: `Descarga gratis el botón de sonido ${soundName} desde nuestro soundboard de memes. ¡Reproduce, comparte y disfruta este divertido soundboard para bromas, gaming y creación de contenido!`,
    fr: `Téléchargez gratuitement le bouton sonore ${soundName} depuis notre soundboard de mèmes. Jouez, partagez et profitez de ce soundboard amusant pour blagues, gaming et création de contenu !`,
    de: `Laden Sie ${soundName} Sound-Button kostenlos von unserem Meme-Soundboard herunter. Spielen, teilen & genießen Sie dieses lustige Soundboard für Streiche, Gaming & Content-Erstellung!`,
    pt: `Baixe gratuitamente o botão de som ${soundName} do nosso soundboard de memes. Reproduza, compartilhe e aproveite este soundboard divertido para pegadinhas, gaming e criação de conteúdo!`,
    it: `Scarica gratis il pulsante sonoro ${soundName} dal nostro soundboard di meme. Riproduci, condividi e goditi questo soundboard divertente per scherzi, giochi e creazione di contenuti!`,
    ja: `ミームサウンドボードから${soundName}サウンドボタンを無料でダウンロード。いたずら、ゲーム、コンテンツ制作のためのこの面白いサウンドボードを再生、共有、楽しもう！`,
    ko: `밈 사운드보드에서 ${soundName} 사운드 버튼을 무료로 다운로드하세요. 장난, 게임 및 콘텐츠 제작을 위한 이 재미있는 사운드보드를 재생하고 공유하며 즐기세요!`,
    zh: `从我们的表情包音效板免费下载 ${soundName} 音效按钮。播放、分享并享受这个用于恶作剧、游戏和内容创作的搞笑音效板！`,
    ar: `حمّل زر الصوت ${soundName} مجانًا من لوحة صوت الميمات لدينا. شغّل، شارك واستمتع بلوحة الصوت المضحكة هذه للمقالب والألعاب وإنشاء المحتوى!`,
    hi: `हमारे मीम साउंडबोर्ड से ${soundName} साउंड बटन मुफ्त में डाउनलोड करें। प्रैंक, गेमिंग और कंटेंट क्रिएशन के लिए इस मजेदार साउंडबोर्ड को प्ले, शेयर और एंजॉय करें!`,
    ru: `Скачайте звуковую кнопку ${soundName} бесплатно с нашего мем саундборда. Воспроизводите, делитесь и наслаждайтесь этим смешным саундбордом для розыгрышей, игр и создания контента!`,
  };

  const title = titleByLocale[lang];
  const description = descriptionByLocale[lang];

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: [
      sound.name,
      `${sound.name} sound`,
      `${sound.name} button`,
      `${sound.name} mp3`,
      `${sound.name} download`,
      "sound button",
      "free sound download",
      "meme sound",
      "soundboard",
      sound.soundboard?.name || "",
      "sound effect",
      "audio clip",
    ],
    authors: [{ name: "SoundBoardUnblocked" }],
    creator: "SoundBoardUnblocked",
    publisher: "SoundBoardUnblocked",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: lang,
      url: soundUrl,
      siteName: "SoundBoardUnblocked",
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${sound.name} Sound Button`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
      creator: "@soundboardunblocked",
    },
    alternates: {
      canonical: soundUrl,
      languages: Object.fromEntries(
        locales.map((l) => {
          // Use the same slug for all language alternates to maintain consistency
          const altSlug = l === lang ? slug : generateSlug(sound.name);
          return [l, `${siteUrl}/${l}/sound/${altSlug}/${id}`];
        })
      ),
    },
  };
}

export default async function SoundDetailPage({ params }: Props) {
  const { lang, id } = await params;
  const numericId = extractIdFromUrl(id);

  if (isNaN(numericId)) {
    notFound();
  }

  const [dict, soundboards, data] = await Promise.all([
    getDictionary(lang),
    getSoundboards(),
    getSoundData(numericId),
  ]);

  if (!data) {
    notFound();
  }

  const { sound, relatedSounds } = data;
  console.log("Related Sounds:", relatedSounds);

  return (
    <SoundDetailClient
      sound={sound}
      relatedSounds={relatedSounds}
      lang={lang}
      dict={dict}
      soundboards={soundboards}
    />
  );
}
