import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { Star } from "lucide-react";
import { getPublicApiClient } from "@/lib/api/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSoundboards } from "@/lib/api/helpers";
import { locales, type Locale } from "@/lib/i18n/config";
import type { Sound } from "@/lib/types/database";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import DottedBackground from "@/components/ui/dotted-background";
import TrendingPageClient from "./trending-page-client";

interface Props {
  params: Promise<{ lang: Locale }>;
}

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const siteUrl = "https://soundboardunblocked.com";
  const pageUrl = `${siteUrl}/${lang}/trending`;
  const ogImageUrl = `${siteUrl}/og-image.jpg`;

  // Localized SEO title & description for Trending page
  const titleByLocale: Record<Locale, string> = {
    en: "Trending Sound Buttons: Meme Soundboard Unblocked",
    es: "Botones de Sonido en Tendencia: Tabla de Memes Sonoros Desbloqueada",
    fr: "Boutons Sonores Tendance : Table de Mixage Mèmes Débloquée",
    de: "Angesagte Sound-Buttons: Meme-Soundboard Unblocked",
    pt: "Botões de Som em Alta: Mesa de Memes Sonoros Desbloqueada",
    it: "Pulsanti Sonori di Tendenza: Soundboard di Meme Sbloccato",
    ja: "トレンドサウンドボタン：ミームサウンドボード アンブロック",
    ko: "인기 사운드 버튼: 밈 사운드보드 차단 해제",
    zh: "热门音效按钮：表情包音效板解锁",
    ar: "أزرار الصوت الرائجة: لوحة صوت الميمات غير المحظورة",
    hi: "ट्रेंडिंग साउंड बटन: मीम साउंडबोर्ड अनब्लॉक",
    ru: "Трендовые Звуковые Кнопки: Мем Саундборд Разблокирован",
  };

  const descriptionByLocale: Record<Locale, string> = {
    en: "Browse top trending sound buttons on our meme soundboard unblocked. Enjoy viral funny soundboard and popular meme sounds updated Daily!",
    es: "Explora los botones de sonido más populares en nuestra tabla de memes sonoros desbloqueada. ¡Disfruta de soundboards divertidos virales y sonidos de memes populares actualizados diariamente!",
    fr: "Parcourez les boutons sonores les plus tendance sur notre table de mixage mèmes débloquée. Profitez de soundboards drôles viraux et de sons de mèmes populaires mis à jour quotidiennement !",
    de: "Durchsuchen Sie die beliebtesten Sound-Buttons auf unserem Meme-Soundboard Unblocked. Genießen Sie virale lustige Soundboards und beliebte Meme-Sounds, täglich aktualisiert!",
    pt: "Navegue pelos botões de som mais em alta na nossa mesa de memes sonoros desbloqueada. Curta soundboards engraçados virais e sons de memes populares atualizados diariamente!",
    it: "Sfoglia i pulsanti sonori più popolari sul nostro soundboard di meme sbloccato. Goditi soundboard divertenti virali e suoni meme popolari aggiornati quotidianamente!",
    ja: "ミームサウンドボード アンブロックでトップトレンドのサウンドボタンを閲覧。毎日更新されるバイラルな面白いサウンドボードと人気のミーム音をお楽しみください！",
    ko: "밈 사운드보드 차단 해제에서 최고 인기 사운드 버튼을 탐색하세요. 매일 업데이트되는 바이럴 재미있는 사운드보드와 인기 밈 사운드를 즐기세요!",
    zh: "在我们的表情包音效板解锁上浏览热门音效按钮。享受每日更新的病毒式搞笑音效板和流行表情包声音！",
    ar: "تصفح أزرار الصوت الأكثر رواجًا على لوحة صوت الميمات غير المحظورة لدينا. استمتع بلوحات الصوت المضحكة الفيروسية وأصوات الميمات الشائعة المحدثة يوميًا!",
    hi: "हमारे मीम साउंडबोर्ड अनब्लॉक पर शीर्ष ट्रेंडिंग साउंड बटन ब्राउज़ करें। दैनिक रूप से अपडेट किए गए वायरल मजेदार साउंडबोर्ड और लोकप्रिय मीम साउंड का आनंद लें!",
    ru: "Просматривайте топовые трендовые звуковые кнопки на нашем разблокированном мем саундборде. Наслаждайтесь вирусными смешными саундбордами и популярными мем звуками, обновляемыми ежедневно!",
  };

  const title = titleByLocale[lang];
  const description = descriptionByLocale[lang];

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: [
      "trending sounds",
      "popular sound buttons",
      "viral meme sounds",
      "trending soundboard",
      "hot sounds",
      "most played sounds",
      "popular memes",
      "trending audio",
      "viral sound effects",
      "top sounds",
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
          alt: title,
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
      languages: {
        en: `${siteUrl}/en/trending`,
        es: `${siteUrl}/es/trending`,
        fr: `${siteUrl}/fr/trending`,
        de: `${siteUrl}/de/trending`,
        pt: `${siteUrl}/pt/trending`,
        it: `${siteUrl}/it/trending`,
        ja: `${siteUrl}/ja/trending`,
        ko: `${siteUrl}/ko/trending`,
        zh: `${siteUrl}/zh/trending`,
        ar: `${siteUrl}/ar/trending`,
        hi: `${siteUrl}/hi/trending`,
        ru: `${siteUrl}/ru/trending`,
      },
    },
  };
}

const getTrendingSounds = unstable_cache(
  async () => {
    const apiClient = getPublicApiClient();
    const response = await apiClient
      .getTrendingSounds({ page_size: 500 })
      .catch(() => ({ status: 200, data: { results: [] } }));
    return (response.data.results || []) as Sound[];
  },
  ["trending-sounds"],
  { tags: ["trending-sounds"] }
);

export default async function TrendingPage({ params }: Props) {
  const { lang } = await params;
  const [dict, sounds, soundboards] = await Promise.all([
    getDictionary(lang),
    getTrendingSounds(),
    getSoundboards(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Trending Sound Buttons",
    description: "Discover the most trending and viral sound buttons right now",
    url: `https://soundboardunblocked.com/${lang}/trending`,
    isPartOf: {
      "@type": "WebSite",
      name: "SoundBoardUnblocked",
      url: "https://soundboardunblocked.com",
    },
    numberOfItems: sounds.length,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `https://soundboardunblocked.com/${lang}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Trending Sounds",
        item: `https://soundboardunblocked.com/${lang}/trending`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <DottedBackground />
      <Header lang={lang} dict={dict} soundboards={soundboards} />

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Page Header */}
        <div className="mb-6 text-center">
          <h1 className="flex items-center justify-center gap-2 text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
            <Star className="h-6 w-6 text-amber-500" fill="currentColor" />
            {dict.trending.h1}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 md:text-base">
            {dict.trending.shortDescription}
          </p>
        </div>

        <TrendingPageClient sounds={sounds} lang={lang} dict={dict} />
      </main>

      <Footer lang={lang} dict={dict} />
    </div>
  );
}
