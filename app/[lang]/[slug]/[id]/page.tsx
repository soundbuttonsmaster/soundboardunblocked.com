import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { getPublicApiClient } from "@/lib/api/server";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSoundboards } from "@/lib/api/helpers";
import CategoryDetailClient from "./category-detail-client";

// Fetch category data with caching
const getCategoryData = unstable_cache(
  async (categoryId: number) => {
    if (isNaN(categoryId) || categoryId < 1) {
      return null;
    }

    const apiClient = getPublicApiClient();

    try {
      const [categoryResponse, soundsResponse] = await Promise.all([
        apiClient.getCategory(categoryId).catch(() => null),
        apiClient
          .getSounds({ category: categoryId, page_size: 500 })
          .catch(() => ({ status: 200, data: { results: [] } })),
      ]);

      if (!categoryResponse || !categoryResponse.data) {
        return null;
      }

      return {
        category: categoryResponse.data,
        sounds: soundsResponse.data.results || [],
      };
    } catch (error) {
      console.error("Error fetching category data:", error);
      return null;
    }
  },
  ["category-detail"],
  { revalidate: 900, tags: ["categories"] }
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale; slug: string; id: string }>;
}): Promise<Metadata> {
  const { lang, slug, id } = await params;
  const categoryId = Number.parseInt(id, 10);
  const data = await getCategoryData(categoryId);

  if (!data) {
    return {
      title: "Category Not Found | SoundBoardUnblocked",
    };
  }

  const { category, sounds } = data;
  const siteUrl = "https://soundboardunblocked.com";
  const pageUrl = `${siteUrl}/${lang}/${slug}/${id}`;
  const ogImageUrl = `${siteUrl}/og-image.jpg`;

  const name = category.name;

  const titleByLocale: Record<Locale, string> = {
    en: `${name} Soundboard Unblocked`,
    es: `Soundboard de ${name} Desbloqueado`,
    fr: `Soundboard ${name} Débloqué`,
    de: `${name} Soundboard Unblocked`,
    pt: `Soundboard de ${name} Desbloqueado`,
    it: `Soundboard ${name} Sbloccato`,
    ja: `${name} サウンドボード アンブロック`,
    ko: `${name} 사운드보드 차단 해제`,
    zh: `${name} 音效板解锁`,
    ar: `لوحة صوت ${name} غير المحظورة`,
    hi: `${name} साउंडबोर्ड अनब्लॉक`,
    ru: `Саундборд ${name} Разблокирован`,
  };

  const descriptionByLocale: Record<Locale, string> = {
    en: `Browse ${name} sound buttons in our meme soundboard unblocked collection. Download, play, and share ${name} soundboard instantly!`,
    es: `Explora botones de sonido de ${name} en nuestra colección de tablas de memes sonoros desbloqueadas. ¡Descarga, reproduce y comparte el soundboard de ${name} al instante!`,
    fr: `Parcourez les boutons sonores ${name} dans notre collection de tables de mixage mèmes débloquées. Téléchargez, jouez et partagez le soundboard ${name} instantanément !`,
    de: `Durchsuchen Sie ${name} Sound-Buttons in unserer Meme-Soundboard Unblocked Sammlung. Laden Sie ${name} Soundboards herunter, spielen Sie sie ab und teilen Sie sie sofort!`,
    pt: `Navegue pelos botões de som de ${name} na nossa coleção de mesas de memes sonoros desbloqueadas. Baixe, reproduza e compartilhe o soundboard de ${name} instantaneamente!`,
    it: `Sfoglia i pulsanti sonori di ${name} nella nostra collezione di soundboard di meme sbloccati. Scarica, riproduci e condividi il soundboard ${name} istantaneamente!`,
    ja: `ミームサウンドボード アンブロックコレクションで${name}のサウンドボタンを閲覧。${name}サウンドボードを即座にダウンロード、再生、共有！`,
    ko: `밈 사운드보드 차단 해제 컬렉션에서 ${name} 사운드 버튼을 탐색하세요. ${name} 사운드보드를 즉시 다운로드, 재생 및 공유하세요!`,
    zh: `在我们的表情包音效板解锁收藏中浏览 ${name} 音效按钮。立即下载、播放和分享 ${name} 音效板！`,
    ar: `تصفح أزرار صوت ${name} في مجموعة لوحة صوت الميمات غير المحظورة لدينا. حمّل، شغّل، وشارك لوحة صوت ${name} فورًا!`,
    hi: `हमारे मीम साउंडबोर्ड अनब्लॉक संग्रह में ${name} साउंड बटन ब्राउज़ करें। ${name} साउंडबोर्ड तुरंत डाउनलोड, प्ले और शेयर करें!`,
    ru: `Просматривайте звуковые кнопки ${name} в нашей коллекции разблокированных мем саундбордов. Загружайте, воспроизводите и делитесь саундбордом ${name} мгновенно!`,
  };

  const title = titleByLocale[lang];
  const description = descriptionByLocale[lang];

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: [
      category.name,
      `${category.name} soundboard`,
      `${category.name} sounds`,
      `${category.name} buttons`,
      "soundboard",
      "sound buttons",
      "free sounds",
      "meme sounds",
      "sound effects",
      "audio clips",
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
      url: pageUrl,
      siteName: "SoundBoardUnblocked",
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${category.name} Category`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
      creator: "@soundboardunblocked",
      site: "@soundboardunblocked",
    },
    alternates: {
      canonical: pageUrl,
      languages: Object.fromEntries(
        locales.map((locale) => {
          const altSlug =
            locale === lang
              ? slug
              : category.name.toLowerCase().replace(/\s+/g, "-");
          return [locale, `${siteUrl}/${locale}/${altSlug}/${id}`];
        })
      ),
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ lang: Locale; slug: string; id: string }>;
}) {
  const { lang, id } = await params;
  const categoryId = Number.parseInt(id, 10);

  if (isNaN(categoryId)) {
    notFound();
  }

  const data = await getCategoryData(categoryId);

  if (!data) {
    notFound();
  }

  const dict = await getDictionary(lang);
  const allSoundboards = await getSoundboards();

  return (
    <CategoryDetailClient
      category={data.category}
      sounds={data.sounds}
      allSoundboards={allSoundboards}
      dict={dict}
      lang={lang}
    />
  );
}
