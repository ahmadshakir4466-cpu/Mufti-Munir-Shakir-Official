import React, { createContext, useContext, useState, useEffect } from "react";

type SectionSettings = {
  home: boolean;
  articles: boolean;
  videos: boolean;
  quran: boolean;
  hadith: boolean;
  bio: boolean;
  contact: boolean;
  books: boolean;
};

export interface FontConfig {
  url: string;
  applyToContent: boolean;
  applyToTitles: boolean;
}

export interface ArabicFontConfig {
  url: string;
  applyToQuran: boolean;
}

interface SettingsContextType {
  sections: SectionSettings;
  updateSection: (key: keyof SectionSettings, value: boolean) => void;
  urduFontUrl: string;
  setUrduFontUrl: (url: string) => void;
  urduFont: FontConfig;
  setUrduFont: (config: FontConfig) => void;
  englishFont: FontConfig;
  setEnglishFont: (config: FontConfig) => void;
  arabicFont: ArabicFontConfig;
  setArabicFont: (config: ArabicFontConfig) => void;
}

const defaultSettings: SectionSettings = {
  home: true,
  articles: true,
  videos: true,
  quran: true,
  hadith: true,
  bio: true,
  contact: true,
  books: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [sections, setSections] = useState<SectionSettings>(() => {
    const saved = localStorage.getItem("site_sections_settings");
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const [urduFont, setUrduFontState] = useState<FontConfig>(() => {
    const saved = localStorage.getItem("urdu_font_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    // Fallback to legacy urduFontUrl
    const oldUrl = localStorage.getItem("urdu_font_url") || "";
    return { url: oldUrl, applyToContent: true, applyToTitles: true };
  });

  const [englishFont, setEnglishFontState] = useState<FontConfig>(() => {
    const saved = localStorage.getItem("english_font_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return { url: "", applyToContent: true, applyToTitles: true };
  });

  const [arabicFont, setArabicFontState] = useState<ArabicFontConfig>(() => {
    const saved = localStorage.getItem("arabic_font_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return { url: "", applyToQuran: true };
  });

  // Maintain legacy urduFontUrl string representation for backwards compatibility
  const urduFontUrl = urduFont.url;

  const updateSection = (key: keyof SectionSettings, value: boolean) => {
    const newSettings = { ...sections, [key]: value };
    setSections(newSettings);
    localStorage.setItem("site_sections_settings", JSON.stringify(newSettings));
  };

  const setUrduFont = (config: FontConfig) => {
    setUrduFontState(config);
    localStorage.setItem("urdu_font_config", JSON.stringify(config));
    localStorage.setItem("urdu_font_url", config.url); // keep in sync
  };

  const setUrduFontUrl = (url: string) => {
    const newConfig = { ...urduFont, url };
    setUrduFont(newConfig);
  };

  const setEnglishFont = (config: FontConfig) => {
    setEnglishFontState(config);
    localStorage.setItem("english_font_config", JSON.stringify(config));
  };

  const setArabicFont = (config: ArabicFontConfig) => {
    setArabicFontState(config);
    localStorage.setItem("arabic_font_config", JSON.stringify(config));
  };

  useEffect(() => {
    const existingStyle = document.getElementById("custom-uploaded-fonts-style");
    if (existingStyle) {
      existingStyle.remove();
    }

    const cssParts: string[] = [];

    // 1. Urdu Font
    if (urduFont.url) {
      const isGoogleFont = urduFont.url.includes("fonts.googleapis.com");
      if (isGoogleFont) {
        cssParts.push(`@import url('${urduFont.url}');`);
      } else {
        cssParts.push(`
          @font-face {
            font-family: 'CustomUrduFont';
            src: url('${urduFont.url}');
            font-display: swap;
          }
        `);
      }

      const fontName = isGoogleFont ? "'Noto Nastaliq Urdu'" : "'CustomUrduFont'";

      if (urduFont.applyToContent) {
        cssParts.push(`
          .font-urdu, body.font-urdu, body.font-urdu p, body.font-urdu span, body.font-urdu div:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6) {
            font-family: ${fontName}, 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif !important;
          }
        `);
      }
      if (urduFont.applyToTitles) {
        cssParts.push(`
          body.font-urdu h1, body.font-urdu h2, body.font-urdu h3, body.font-urdu h4, body.font-urdu h5, body.font-urdu h6,
          .font-urdu-title, h1.font-urdu, h2.font-urdu, h3.font-urdu, h4.font-urdu {
            font-family: ${fontName}, 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif !important;
          }
        `);
      }
    }

    // 2. English Font
    if (englishFont.url) {
      const isGoogleFont = englishFont.url.includes("fonts.googleapis.com");
      if (isGoogleFont) {
        cssParts.push(`@import url('${englishFont.url}');`);
      } else {
        cssParts.push(`
          @font-face {
            font-family: 'CustomEnglishFont';
            src: url('${englishFont.url}');
            font-display: swap;
          }
        `);
      }

      const fontName = isGoogleFont ? "'Inter'" : "'CustomEnglishFont'";

      if (englishFont.applyToContent) {
        cssParts.push(`
          body.font-sans, .font-sans, body.font-sans p, body.font-sans span, body.font-sans div:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6) {
            font-family: ${fontName}, 'Inter', sans-serif !important;
          }
          /* Fallback root body font when language is english */
          html[lang="en"] body, html[lang="en"] p, html[lang="en"] span {
            font-family: ${fontName}, 'Inter', sans-serif !important;
          }
        `);
      }
      if (englishFont.applyToTitles) {
        cssParts.push(`
          body.font-sans h1, body.font-sans h2, body.font-sans h3, body.font-sans h4, body.font-sans h5,
          .font-english-title, html[lang="en"] h1, html[lang="en"] h2, html[lang="en"] h3, html[lang="en"] h4, html[lang="en"] h5 {
            font-family: ${fontName}, 'Inter', sans-serif !important;
          }
        `);
      }
    }

    // 3. Arabic Font
    if (arabicFont.url) {
      cssParts.push(`
        @font-face {
          font-family: 'CustomArabicFont';
          src: url('${arabicFont.url}');
          font-display: swap;
        }
      `);
      if (arabicFont.applyToQuran) {
        cssParts.push(`
          .font-arabic {
            font-family: 'CustomArabicFont', 'Scheherazade New', 'Amiri', serif !important;
          }
        `);
      }
    }

    if (cssParts.length > 0) {
      const style = document.createElement("style");
      style.id = "custom-uploaded-fonts-style";
      style.innerHTML = cssParts.join("\n");
      document.head.appendChild(style);
    }
  }, [urduFont, englishFont, arabicFont]);

  return (
    <SettingsContext.Provider value={{ 
      sections, 
      updateSection, 
      urduFontUrl, 
      setUrduFontUrl,
      urduFont,
      setUrduFont,
      englishFont,
      setEnglishFont,
      arabicFont,
      setArabicFont
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

