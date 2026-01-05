import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { Sparkles } from "lucide-react";
import { getPublicApiClient } from "@/lib/api/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSoundboards } from "@/lib/api/helpers";
import { locales, type Locale } from "@/lib/i18n/config";
import type { Sound } from "@/lib/types/database";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import DottedBackground from "@/components/ui/dotted-background";
import NewPageClient from "./new-page-client";

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
  const pageUrl = `${siteUrl}/${lang}/new`;
  const ogImageUrl = `${siteUrl}/og-image.jpg`;

  // Localized SEO title & description for New page
  const titleByLocale: Record<Locale, string> = {
    en: "New Sound Buttons: Meme Soundboard Unblocked",
    es: "Nuevos Botones de Sonido: Tabla de Memes Sonoros Desbloqueada",
    fr: "Nouveaux Boutons Sonores : Table de Mixage Mèmes Débloquée",
    de: "Neue Sound-Buttons: Meme-Soundboard Unblocked",
    pt: "Novos Botões de Som: Mesa de Memes Sonoros Desbloqueada",
    it: "Nuovi Pulsanti Sonori: Soundboard di Meme Sbloccato",
    ja: "新着サウンドボタン：ミームサウンドボード アンブロック",
    ko: "새로운 사운드 버튼: 밈 사운드보드 차단 해제",
    zh: "新增音效按钮：表情包音效板解锁",
    ar: "أزرار الصوت الجديدة: لوحة صوت الميمات غير المحظورة",
    hi: "नए साउंड बटन: मीम साउंडबोर्ड अनब्लॉक",
    ru: "Новые Звуковые Кнопки: Мем Саундборд Разблокирован",
  };

  const descriptionByLocale: Record<Locale, string> = {
    en: "Check out newly added sound buttons on our meme soundboard unblocked. New funny soundboard, viral memes & prank sounds uploaded daily!",
    es: "Descubre los botones de sonido recién agregados en nuestra tabla de memes sonoros desbloqueada. ¡Nuevos soundboards divertidos, memes virales y sonidos de bromas subidos diariamente!",
    fr: "Découvrez les nouveaux boutons sonores ajoutés sur notre table de mixage mèmes débloquée. Nouveaux soundboards drôles, mèmes viraux et sons pour blagues ajoutés quotidiennement !",
    de: "Schauen Sie sich neu hinzugefügte Sound-Buttons auf unserem Meme-Soundboard Unblocked an. Neue lustige Soundboards, virale Memes & Streich-Sounds täglich hochgeladen!",
    pt: "Confira os botões de som recém-adicionados na nossa mesa de memes sonoros desbloqueada. Novos soundboards engraçados, memes virais e sons de pegadinha enviados diariamente!",
    it: "Scopri i pulsanti sonori appena aggiunti sul nostro soundboard di meme sbloccato. Nuovi soundboard divertenti, meme virali e suoni per scherzi caricati ogni giorno!",
    ja: "ミームサウンドボード アンブロックで新しく追加されたサウンドボタンをチェック。毎日アップロードされる新しい面白いサウンドボード、バイラルミーム、いたずら音！",
    ko: "밈 사운드보드 차단 해제에서 새로 추가된 사운드 버튼을 확인하세요. 매일 업로드되는 새로운 재미있는 사운드보드, 바이럴 밈 및 장난 소리!",
    zh: "查看我们表情包音效板解锁上新添加的音效按钮。每日上传新的搞笑音效板、病毒式表情包和恶作剧声音！",
    ar: "اطلع على أزرار الصوت المضافة حديثًا على لوحة صوت الميمات غير المحظورة لدينا. لوحات صوت مضحكة جديدة وميمات فيروسية وأصوات مقالب تُحمّل يوميًا!",
    hi: "हमारे मीम साउंडबोर्ड अनब्लॉक पर नए जोड़े गए साउंड बटन देखें। नए मजेदार साउंडबोर्ड, वायरल मीम्स और प्रैंक साउंड रोजाना अपलोड किए जाते हैं!",
    ru: "Посмотрите недавно добавленные звуковые кнопки на нашем разблокированном мем саундборде. Новые смешные саундборды, вирусные мемы и звуки для розыгрышей загружаются ежедневно!",
  };

  const title = titleByLocale[lang];
  const description = descriptionByLocale[lang];

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: [
      "new sounds",
      "latest sound buttons",
      "new meme sounds",
      "fresh sounds",
      "newly added sounds",
      "recent sounds",
      "new soundboard",
      "latest audio clips",
      "new sound effects",
      "fresh memes",
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
    },
    alternates: {
      canonical: pageUrl,
      languages: {
        en: `${siteUrl}/en/new`,
        es: `${siteUrl}/es/new`,
        fr: `${siteUrl}/fr/new`,
        de: `${siteUrl}/de/new`,
        pt: `${siteUrl}/pt/new`,
        it: `${siteUrl}/it/new`,
        ja: `${siteUrl}/ja/new`,
        ko: `${siteUrl}/ko/new`,
        zh: `${siteUrl}/zh/new`,
        ar: `${siteUrl}/ar/new`,
        hi: `${siteUrl}/hi/new`,
        ru: `${siteUrl}/ru/new`,
      },
    },
  };
}

const getNewSounds = unstable_cache(
  async () => {
    const apiClient = getPublicApiClient();
    const response = await apiClient
      .getNewSounds({ page_size: 500 })
      .catch(() => ({ status: 200, data: { results: [] } }));
    return (response.data.results || []) as Sound[];
  },
  ["new-sounds"],
  { revalidate: 600, tags: ["new-sounds"] }
);

export default async function NewPage({ params }: Props) {
  const { lang } = await params;
  const [dict, sounds, soundboards] = await Promise.all([
    getDictionary(lang),
    getNewSounds(),
    getSoundboards(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "New Sound Buttons",
    description:
      "Explore the newest sound buttons, fresh meme sounds, and latest audio clips",
    url: `https://soundboardunblocked.com/${lang}/new`,
    isPartOf: {
      "@type": "WebSite",
      name: "SoundBoardUnblocked",
      url: "https://soundboardunblocked.com",
    },
    numberOfItems: sounds.length,
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <DottedBackground />
      <Header lang={lang} dict={dict} soundboards={soundboards} />

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Page Header */}
        <div className="mb-6 text-center">
          <h1 className="flex items-center justify-center gap-2 text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
            <Sparkles className="h-6 w-6 text-emerald-500" />
            {dict.new.h1}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 md:text-base">
            {dict.new.shortDescription}
          </p>
        </div>

        <NewPageClient sounds={sounds} lang={lang} dict={dict} />
      </main>

      <Footer lang={lang} dict={dict} />
    </div>
  );
}
