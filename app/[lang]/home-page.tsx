"use client";

import Link from "next/link";
import {
  Star,
  Sparkles,
  Headphones,
  Users,
  TrendingUp,
  Zap,
  Play,
  FileQuestion,
  FilePlus,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
// import type { Sound } from "@/lib/types/database";
import type { Sound } from "@/lib/api/client";
import type { SoundboardItem } from "@/lib/api/helpers";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import SoundGrid from "@/components/sound/sound-grid";
import SearchBar from "@/components/search-bar";
import DottedBackground from "@/components/ui/dotted-background";

import React, { useEffect, useState } from "react";
import { ShareDialog } from "@/components/sound/share-dialog";
import { getSoundUrl } from "@/lib/utils/slug";
import Script from "next/script";

interface Props {
  lang: Locale;
  dict: any;
  trendingSounds: Sound[];
  newSounds: Sound[];
  soundboards: SoundboardItem[];
}

export default function HomePage({
  lang,
  dict,
  trendingSounds,
  newSounds,
  soundboards,
}: Props) {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [currentSoundName, setCurrentSoundName] = useState("");
  const [currentSoundImageUrl, setCurrentSoundImageUrl] = useState("");

  useEffect(() => {
    if (isShareDialogOpen && currentSoundName) {
      const sound = [...trendingSounds, ...newSounds].find(
        (s) => s.name === currentSoundName
      );
      if (sound) {
        setShareUrl(
          `${window.location.origin}${getSoundUrl(
            sound.name,
            Number(sound.id),
            lang
          )}`
        );
        setCurrentSoundImageUrl("/placeholder.jpg");
      }
    }
  }, [isShareDialogOpen, currentSoundName, trendingSounds, newSounds, lang]);

  const handleShareClick = (soundName: string) => {
    setCurrentSoundName(soundName);
    setIsShareDialogOpen(true);
  };
  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SoundBoardUnblocked",
    url: `https://soundboardunblocked.com/${lang}`,
    description: dict.meta.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `https://soundboardunblocked.com/${lang}/search/{search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SoundBoardUnblocked",
    url: "https://soundboardunblocked.com",
    logo: {
      "@type": "ImageObject",
      url: "https://soundboardunblocked.com/icon-512x512.png",
      width: 512,
      height: 512,
    },
    description: dict.meta.description,
    sameAs: [
      "https://twitter.com/soundboardunblocked",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "contact@soundboardunblocked.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />

      <ShareDialog
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        shareUrl={shareUrl}
        soundName={currentSoundName}
        soundImageUrl={currentSoundImageUrl}
        setMessageContent={setMessageContent}
        setShowMessage={setShowMessage}
        dict={dict}
      />

      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-950">
        <DottedBackground />
        <Header lang={lang} dict={dict} soundboards={soundboards} />

        <main className="mx-auto max-w-6xl md:px-4">
          <section
            className="py-6 text-center md:py-8"
            style={{ minHeight: "200px" }}
          >
            <h1
              className="text-balance text-xl font-bold text-slate-900 dark:text-white md:text-2xl"
              style={{ minHeight: "28px" }}
            >
              {dict.home.title}
            </h1>
            <p
              className="text-pretty mx-auto mt-2 max-w-3xl text-xs text-slate-500 dark:text-slate-400 md:text-sm"
              style={{ minHeight: "40px" }}
            >
              {dict.home.subtitle}
            </p>

            {/* Search Bar */}
            <div className="mx-auto mt-4 max-w-lg">
              <SearchBar
                lang={lang}
                placeholder={dict.home.searchPlaceholder}
              />
            </div>
          </section>

          <section className="py-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-white md:text-xl">
                <Star className="h-5 w-5 text-amber-500" fill="currentColor" />
                {dict.home.trending}
              </h2>
              <Link
                href={`/${lang}/trending`}
                className="flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {dict.common.seeAll}
                <span className="text-sky-500">→</span>
              </Link>
            </div>

            <div className="my-3 h-px bg-slate-200 dark:bg-slate-700" />

            {trendingSounds.length > 0 ? (
              <SoundGrid
                sounds={trendingSounds}
                lang={lang}
                maxMobile={16}
                centerLastRow={true}
                desktopCols={10}
                onShareClick={handleShareClick}
                setMessageContent={setMessageContent}
                setShowMessage={setShowMessage}
                dict={dict}
                isAboveTheFold={true}
              />
            ) : (
              <p className="py-8 text-center text-sm text-slate-500">
                {dict.common.noResults}
              </p>
            )}

            <div className="mt-4 text-center">
              <Link
                href={`/${lang}/trending`}
                className="inline-flex items-center gap-2 rounded-md border border-sky-600 px-4 py-1.5 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-50 dark:border-sky-400 dark:text-sky-300 dark:hover:bg-sky-950"
              >
                <Sparkles className="h-3 w-3" />
                {dict.home.exploreTrending}
                <span>→</span>
              </Link>
            </div>
          </section>

          <section className="py-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-white md:text-xl">
                <Star
                  className="h-5 w-5 text-emerald-500"
                  fill="currentColor"
                />
                {dict.home.newSounds}
              </h2>
              <Link
                href={`/${lang}/new`}
                className="flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {dict.common.seeAll}
                <span className="text-emerald-500">→</span>
              </Link>
            </div>

            <div className="my-3 h-px bg-slate-200 dark:bg-slate-700" />

            {newSounds.length > 0 ? (
              <SoundGrid
                sounds={newSounds}
                lang={lang}
                maxMobile={8}
                centerLastRow={true}
                desktopCols={10}
                onShareClick={handleShareClick}
                setMessageContent={setMessageContent}
                setShowMessage={setShowMessage}
                dict={dict}
              />
            ) : (
              <p className="py-8 text-center text-sm text-slate-500">
                {dict.common.noResults}
              </p>
            )}

            <div className="mt-4 text-center">
              <Link
                href={`/${lang}/new`}
                className="inline-flex items-center gap-2 rounded-md border border-emerald-600 px-4 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-300 dark:hover:bg-emerald-950"
              >
                <Sparkles className="h-3 w-3" />
                {dict.home.exploreNew}
                <span>→</span>
              </Link>
            </div>
          </section>

          <section className="py-12">
            <div className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 dark:border-slate-700/80 dark:from-slate-900 dark:to-slate-800 md:p-10">
              <div className="text-center mb-8">
                <h2 className="text-center text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-white dark:to-slate-200 md:text-4xl">
                  {dict.home.aboutTitle}
                </h2>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
              </div>

              <div className="mb-10">
                <p className="text-pretty text-center text-base leading-relaxed text-slate-700 dark:text-slate-300 md:text-lg max-w-4xl mx-auto">
                  {dict.home.aboutDescription}
                </p>
              </div>

              <div className="space-y-10">
                <div className="bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-slate-700/60 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 md:text-2xl">
                    {dict.home.whoBenefits}
                  </h3>
                  <p className="text-pretty text-base leading-relaxed text-slate-700 dark:text-slate-300">
                    {dict.home.whoBenefitsDesc}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-800 dark:to-slate-700/60 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 md:text-2xl">
                    {dict.home.whyChoose}
                  </h3>
                  <p className="text-pretty text-base leading-relaxed text-slate-700 dark:text-slate-300">
                    {dict.home.whyChooseDesc}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-800 dark:to-slate-700/60 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 md:text-2xl">
                    {dict.home.exploreCollection}
                  </h3>
                  <p className="text-pretty text-base leading-relaxed text-slate-700 dark:text-slate-300">
                    {dict.home.exploreCollectionDesc}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-white to-pink-50/30 dark:from-slate-800 dark:to-slate-700/60 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 md:text-2xl">
                    {dict.home.exploreCategoriesTitle}
                  </h3>
                  <p className="text-pretty text-base leading-relaxed text-slate-700 dark:text-slate-300">
                    {dict.home.exploreCategoriesIntro}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 px-4 md:grid-cols-3 md:px-0">
                <Link
                  href={`/${lang}/memes/914`}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-green-50 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-300 dark:border-slate-700 dark:from-emerald-950/30 dark:via-slate-800 dark:to-green-950/30 dark:hover:border-emerald-600"
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-green-100 shadow-sm transition-transform duration-300 group-hover:scale-110 dark:from-emerald-900/50 dark:to-green-900/50">
                        <svg
                          className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H13m-3 3.5a.5.5 0 11-1 0 .5.5 0 011 0zM19 7.389c0-.827-.673-1.5-1.5-1.5h-11C6.673 5.889 6 6.562 6 7.389v4.222c0 .827.673 1.5 1.5 1.5h11c.827 0 1.5-.673 1.5-1.5V7.389z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-slate-800 transition-colors duration-300 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-300">
                        {dict.home.memesCategory}
                      </h4>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600 transition-colors duration-300 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300">
                        {dict.home.memesCategoryDesc}
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </Link>

                <Link
                  href={`/${lang}/game/913`}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-amber-300 dark:border-slate-700 dark:from-amber-950/30 dark:via-slate-800 dark:to-orange-950/30 dark:hover:border-amber-600"
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 shadow-sm transition-transform duration-300 group-hover:scale-110 dark:from-amber-900/50 dark:to-orange-900/50">
                        <svg
                          className="h-6 w-6 text-amber-600 dark:text-amber-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-slate-800 transition-colors duration-300 group-hover:text-amber-700 dark:text-white dark:group-hover:text-amber-300">
                        {dict.home.gamesCategory}
                      </h4>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600 transition-colors duration-300 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300">
                        {dict.home.gamesCategoryDesc}
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </Link>

                <Link
                  href={`/${lang}/sound-effects/909`}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-indigo-300 dark:border-slate-700 dark:from-indigo-950/30 dark:via-slate-800 dark:to-purple-950/30 dark:hover:border-indigo-600"
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 shadow-sm transition-transform duration-300 group-hover:scale-110 dark:from-indigo-900/50 dark:to-purple-900/50">
                        <svg
                          className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-slate-800 transition-colors duration-300 group-hover:text-indigo-700 dark:text-white dark:group-hover:text-indigo-300">
                        {dict.home.soundEffectsCategory}
                      </h4>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600 transition-colors duration-300 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300">
                        {dict.home.soundEffectsCategoryDesc}
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </Link>

                <Link
                  href={`/${lang}/reaction/910`}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 dark:border-slate-700 dark:from-blue-950/30 dark:via-slate-800 dark:to-cyan-950/30 dark:hover:border-blue-600"
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 shadow-sm transition-transform duration-300 group-hover:scale-110 dark:from-blue-900/50 dark:to-cyan-900/50">
                        <svg
                          className="h-6 w-6 text-blue-600 dark:text-blue-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-slate-800 transition-colors duration-300 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
                        {dict.home.reactionCategory}
                      </h4>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600 transition-colors duration-300 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300">
                        {dict.home.reactionCategoryDesc}
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </Link>

                <Link
                  href={`/${lang}/prank/919`}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-purple-300 dark:border-slate-700 dark:from-purple-950/30 dark:via-slate-800 dark:to-pink-950/30 dark:hover:border-purple-600"
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 shadow-sm transition-transform duration-300 group-hover:scale-110 dark:from-purple-900/50 dark:to-pink-900/50">
                        <svg
                          className="h-6 w-6 text-purple-600 dark:text-purple-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-slate-800 transition-colors duration-300 group-hover:text-purple-700 dark:text-white dark:group-hover:text-purple-300">
                        {dict.home.pranksCategory}
                      </h4>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600 transition-colors duration-300 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300">
                        {dict.home.pranksCategoryDesc}
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </Link>
                <Link
                  href={`/${lang}/movies/915`}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-yellow-300 dark:border-slate-700 dark:from-yellow-950/30 dark:via-slate-800 dark:to-orange-950/30 dark:hover:border-yellow-600"
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 shadow-sm transition-transform duration-300 group-hover:scale-110 dark:from-purple-900/50 dark:to-pink-900/50">
                        <svg
                          className="h-6 w-6 text-purple-600 dark:text-purple-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-slate-800 transition-colors duration-300 group-hover:text-yellow-700 dark:text-white dark:group-hover:text-yellow-300">
                        {dict.home.moviesCategory}
                      </h4>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600 transition-colors duration-300 dark:text-slate-400">
                        {dict.home.moviesCategoryDesc}
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </Link>
              </div>

              <div className="mt-12">
                <div className="bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-800 dark:to-slate-700/60 rounded-xl p-8 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 md:text-2xl">
                    {dict.home.createSoundboardTitle}
                  </h3>
                  <p className="text-pretty text-base leading-relaxed text-slate-700 dark:text-slate-300">
                    {dict.home.createSoundboardDesc}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <div className="bg-gradient-to-br from-white to-cyan-50/30 dark:from-slate-800 dark:to-slate-700/60 rounded-xl p-8 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 md:text-2xl">
                    {dict.home.perfectOccasionTitle}
                  </h3>
                  <p className="text-pretty text-base leading-relaxed text-slate-700 dark:text-slate-300 mb-3">
                    {dict.home.perfectOccasionDesc1}
                  </p>
                  <p className="text-pretty text-base leading-relaxed text-slate-700 dark:text-slate-300">
                    {dict.home.perfectOccasionDesc2}
                  </p>
                </div>
              </div>

              <div className="mt-10 text-center">
                <div className="bg-gradient-to-br from-white to-violet-50/30 dark:from-slate-800 dark:to-slate-700/60 rounded-xl p-8 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 md:text-3xl">
                    {dict.home.ctaTitle}
                  </h3>
                  <p className="text-pretty mx-auto max-w-2xl text-base text-slate-700 dark:text-slate-300 mb-6">
                    {dict.home.ctaDesc}
                  </p>
                  <div className="flex flex-wrap justify-center gap-6">
                    <Link
                      href={`/${lang}/trending`}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg"
                    >
                      <TrendingUp className="h-4 w-4" />
                      {dict.home.ctaTrending}
                    </Link>
                    <Link
                      href={`/${lang}/new`}
                      className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <Sparkles className="h-4 w-4" />
                      {dict.home.ctaNew}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-12">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50 md:p-8">
              <div className="mx-auto max-w-4xl">
                <h2 className="text-balance text-center text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
                  {dict.home.faqTitle}
                </h2>
                <p className="text-pretty mx-auto mt-4 max-w-2xl text-center text-slate-600 dark:text-slate-300">
                  Find answers to common questions about Sound Buttons Unblocked
                </p>

                <div className="mt-8 space-y-4">
                  <details className="group rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 dark:text-white">
                      <span className="text-lg">
                        1. {dict.home.faq1Question}
                      </span>
                      <svg
                        className="h-5 w-5 transition-transform group-open:rotate-180"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>
                    <div className="mt-4 text-slate-700 dark:text-slate-300">
                      <p>{dict.home.faq1Answer}</p>
                    </div>
                  </details>

                  <details className="group rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 dark:text-white">
                      <span className="text-lg">
                        2. {dict.home.faq2Question}
                      </span>
                      <svg
                        className="h-5 w-5 transition-transform group-open:rotate-180"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>
                    <div className="mt-4 text-slate-700 dark:text-slate-300">
                      <p>{dict.home.faq2Answer}</p>
                    </div>
                  </details>

                  <details className="group rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 dark:text-white">
                      <span className="text-lg">
                        3. {dict.home.faq3Question}
                      </span>
                      <svg
                        className="h-5 w-5 transition-transform group-open:rotate-180"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>
                    <div className="mt-4 text-slate-700 dark:text-slate-300">
                      <p>{dict.home.faq3Answer}</p>
                    </div>
                  </details>

                  {(lang === "de" ||
                    lang === "hi" ||
                    lang === "en" ||
                    lang === "es" ||
                    lang === "fr" ||
                    lang === "ja" ||
                    lang === "pt" ||
                    lang === "ar" ||
                    lang === "ru" ||
                    lang === "it" ||
                    lang === "zh") && (
                    <details className="group rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                      <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 dark:text-white">
                        <span className="text-lg">
                          {lang === "ar" || lang === "ru" || lang === "ko"
                            ? "3."
                            : "4."}{" "}
                          {dict.home.faq4Question}
                        </span>
                        <svg
                          className="h-5 w-5 transition-transform group-open:rotate-180"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </summary>
                      <div className="mt-4 text-slate-700 dark:text-slate-300">
                        <p>{dict.home.faq4Answer}</p>
                      </div>
                    </details>
                  )}

                  {(lang === "en" ||
                    lang === "es" ||
                    lang === "fr" ||
                    lang === "ja" ||
                    lang === "zh" ||
                    lang === "pt" ||
                    lang === "de" ||
                    lang === "hi" ||
                    lang === "ru" ||
                    lang === "it" ||
                    lang === "ar") && (
                    <details className="group rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                      <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 dark:text-white">
                        <span className="text-lg">
                          5. {dict.home.faq5Question}
                        </span>
                        <svg
                          className="h-5 w-5 transition-transform group-open:rotate-180"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </summary>
                      <div className="mt-4 text-slate-700 dark:text-slate-300">
                        <p>{dict.home.faq5Answer}</p>
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer lang={lang} dict={dict} />
      </div>
    </>
  );
}
