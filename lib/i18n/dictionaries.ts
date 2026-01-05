import type { Locale } from "./config"

// Dictionary type definition
export interface Dictionary {
  new: any
  common: {
    play: string
    pause: string
    search: string
    metaTitle?: string
    metaDescription?: string
    h1?: string
    loading: string
    error: string
    noResults: string
    favorites: string
    mySoundboards: string
    allSounds: string
    share: string
    copy: string
    copied: string
  }
  nav: {
    home: string
  }
  home: {
    title: string
    subtitle: string
    searchPlaceholder: string
    popularSounds: string
    browseSoundboards: string
  }
  soundboard: {
    sounds: string
    noSounds: string
    addToFavorites: string
    removeFromFavorites: string
    addToSoundboard: string
    playCount: string
  }
  favorites: {
    title: string
    empty: string
    emptyDescription: string
  }
  mySoundboards: {
    title: string
    create: string
    createTitle: string
    namePlaceholder: string
    empty: string
    emptyDescription: string
    delete: string
    edit: string
  }
  footer: {
    copyright: string
    privacy: string
    terms: string
    contact: string
  }
  meta: {
    title: string
    description: string
  }
}

// Dictionaries storage - ONLY 4 LANGUAGES: en, es, fr, pt
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: async () => await import("./dictionaries/en.json").then((m) => m.default as Dictionary),
  es: async () => await import("./dictionaries/es.json").then((m) => m.default as Dictionary),
  fr: async () => await import("./dictionaries/fr.json").then((m) => m.default as Dictionary),
  pt: async () => await import("./dictionaries/pt.json").then((m) => m.default as Dictionary),
  de: async () => await import("./dictionaries/de.json").then((m) => m.default as Dictionary),
  it: async () => await import("./dictionaries/it.json").then((m) => m.default as Dictionary),
  ja: async () => await import("./dictionaries/ja.json").then((m) => m.default as Dictionary),
  ko: async () => await import("./dictionaries/ko.json").then((m) => m.default as Dictionary),
  zh: async () => await import("./dictionaries/zh.json").then((m) => m.default as Dictionary),
  ar: async () => await import("./dictionaries/ar.json").then((m) => m.default as Dictionary),
  hi: async () => await import("./dictionaries/hi.json").then((m) => m.default as Dictionary),
  ru: async () => await import("./dictionaries/ru.json").then((m) => m.default as Dictionary),
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]()
}