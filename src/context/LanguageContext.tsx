import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ur";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// A simple dictionary for UI translation.
// For dynamic content (articles, etc.), the data object should have `title_en` and `title_ur` fields.
const translations: Record<Language, Record<string, string>> = {
  en: {
    home: "Home",
    articles: "Articles",
    videos: "Videos",
    quran: "Quran",
    hadith: "Hadith",
    bio: "Bio",
    readMore: "Read More",
    watchVideo: "Watch Video",
    listenAudio: "Listen Audio",
    allRightsReserved: "All Rights Reserved",
    latestArticles: "Latest Articles",
    featuredVideo: "Featured Videos",
    quickLinks: "Quick Links",
    contact: "Contact",
    contactUs: "Contact Us",
    books: "Books",
    donate: "Donate",
  },
  ur: {
    home: "مرکزی صفحہ",
    articles: "مضامین",
    videos: "ویڈیوز",
    quran: "قرآن",
    hadith: "حدیث",
    bio: "تعارف",
    readMore: "مزید پڑھیں",
    watchVideo: "ویڈیو دیکھیں",
    listenAudio: "آڈیو سنیں",
    allRightsReserved: "جملہ حقوق محفوظ ہیں",
    latestArticles: "تازہ ترین مضامین",
    featuredVideo: "منتخب ویڈیوز",
    quickLinks: "اہم لنکس",
    contact: "رابطہ کریں",
    contactUs: "ہم سے رابطہ کریں",
    books: "کتب",
    donate: "تعاون کریں",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem("preferred_lang");
    return (saved === "en" || saved === "ur") ? saved : "en";
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("preferred_lang", newLang);
  };

  useEffect(() => {
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    
    if (lang === "ur") {
      document.body.classList.add("font-urdu");
      document.body.classList.remove("font-sans");
    } else {
      document.body.classList.add("font-sans");
      document.body.classList.remove("font-urdu");
    }
  }, [lang]);

  const t = (key: string): string => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
