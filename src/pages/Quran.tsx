import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import GenericHeader from "../components/layout/GenericHeader";
import { useLanguage } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { supabase } from "../lib/supabase";
import { renderFormattedTitle, renderFormattedText } from "../lib/utils";
import { 
  Info, ChevronRight, Compass, HelpCircle, X, ExternalLink, ArrowLeft
} from "lucide-react";
import { ALL_SURAHS, QURAN_SECTIONS, Surah } from "../data/quranSurahs";
import { getFallbackVerses, VerseData } from "../data/fallbackQuranContent";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};


export default function Quran() {
  const { lang } = useLanguage();
  const { sections } = useSettings();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState<number | null>(1);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  
  // Custom Detailed Reading State
  const [readingSurah, setReadingSurah] = useState<Surah | null>(null);
  const [showArabic, setShowArabic] = useState(true);
  const [showUrdu, setShowUrdu] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const [showTafseerUr, setShowTafseerUr] = useState(true);
  const [showTafseerEn, setShowTafseerEn] = useState(true);

  useEffect(() => {
    if (lang === "en") {
      setShowEnglish(true);
      setShowTafseerEn(true);
      setShowUrdu(false);
      setShowTafseerUr(false);
    } else {
      setShowUrdu(true);
      setShowTafseerUr(true);
      setShowEnglish(false);
      setShowTafseerEn(false);
    }
  }, [lang]);

  useEffect(() => {
    if (!sections.quran) return;
    supabase.from("quran").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setEntries(data);
      setLoading(false);
    });
  }, [sections.quran]);

  if (!sections.quran) {
    return <Navigate to="/" replace />;
  }

  // Resilient Fuzzy Matcher to map DB uploads to the 114 Surahs
  const findDbMatch = (surah: Surah) => {
    return entries.find(entry => {
      const titleEn = (entry.title_en || "").toLowerCase();
      const titleUr = entry.title_ur || "";

      const normalizedSurahEn = surah.nameEn.toLowerCase()
        .replace("al-", "")
        .replace("ash-", "")
        .replace("at-", "")
        .replace("an-", "")
        .replace("ar-", "")
        .replace("az-", "")
        .replace("ad-", "")
        .replace("ah-", "")
        .replace("as-", "")
        .replace("'", "")
        .trim();

      const numStr = surah.number.toString();

      // Check if title or desc directly hints the Surah Number (like "Surah 1" or "Surah 01") or name match
      const matchedByNumber = 
         titleEn.match(new RegExp(`\\b${numStr}\\b`)) || 
         titleEn.includes(`surah ${numStr}`) ||
         titleEn.includes(`chapter ${numStr}`) ||
         titleUr.includes(`سورۃ ${numStr}`) ||
         titleUr.includes(`${numStr}`);

      const matchedByName = 
         titleEn.includes(normalizedSurahEn) || 
         titleUr.includes(surah.nameUr) ||
         titleUr.includes(surah.nameAr);

      return matchedByNumber || matchedByName;
    });
  };

  const scrollToSection = (sectId: number) => {
    setActiveSectionId(sectId); // ALWAYS update visual state immediately when clicked to ensure persistent select state
    const element = document.getElementById(`quran-section-${sectId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const filteredSurahs = ALL_SURAHS;

  const getFilteredSuraListInSect = (sectSurahNums: number[]) => {
    return filteredSurahs.filter(s => sectSurahNums.includes(s.number));
  };

  const isUrdu = lang === "ur";

  // Toggle Checkbox custom button
  const ToggleButton = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-2xl border font-bold text-xs flex items-center gap-2.5 cursor-pointer uppercase transition-all duration-200 ${
        active 
          ? 'bg-primary-800 text-white border-primary-800 shadow-sm' 
          : 'bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-gray-250'
      }`}
    >
      <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
        active ? 'bg-secondary-400 border-secondary-400 text-primary-950' : 'border-gray-300 bg-gray-50'
      }`}>
        {active && <span className="text-[10px]">✔</span>}
      </div>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="bg-gray-50/60 min-h-screen pb-20">
      <GenericHeader 
        titleEn="Quran Portal" 
        titleUr="قرآن مجید" 
      />
      <AnimatePresence mode="wait">
        {readingSurah ? (
          <motion.div
            key="reading-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="max-w-6xl mx-auto px-4 py-8 space-y-8"
          >
            {/* Header Back Bar */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setReadingSurah(null)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-750 font-bold rounded-2xl shadow-sm transition-all cursor-pointer text-xs uppercase tracking-wider"
              >
                <ArrowLeft size={16} className="text-primary-850" />
                <span>{isUrdu ? "فہرست پر واپس" : "Back to index"}</span>
              </button>

              {/* Quick Title Indicator */}
              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-400">
                <span>{isUrdu ? "قرآن پورٹل" : "Quran Portal"}</span>
                <ChevronRight size={14} />
                <span className="text-primary-800">{readingSurah.nameEn}</span>
              </div>
            </div>

            {/* Surah Detail Ornate Banner */}
            <div className="bg-gradient-to-r from-primary-800 to-primary-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-primary-950 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 animate-scale-up">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_70%)] pointer-events-none"></div>
              
              <div className="space-y-4 text-center md:text-left z-10 w-full md:w-auto">
                <div>
                  <span className="bg-secondary-400/20 text-secondary-300 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-secondary-400/30">
                    Chapter {readingSurah.number}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                    {(() => {
                      const dbMatch = findDbMatch(readingSurah);
                      return dbMatch 
                        ? renderFormattedTitle(isUrdu ? dbMatch.title_ur : dbMatch.title_en, isUrdu)
                        : (isUrdu ? readingSurah.nameUr : readingSurah.nameEn);
                    })()}
                  </h1>
                  <p className="text-white/80 text-sm mt-1 sm:mt-1.5 leading-relaxed max-w-lg">
                    {isUrdu 
                      ? `سورۃ ${readingSurah.nameUr} قرآن مجید کی ${readingSurah.number} سورت ہے۔ اس میں کل ${readingSurah.verses} آیات مبارکہ ہیں۔`
                      : `Surah ${readingSurah.nameEn} is the ${readingSurah.number} chapter of the Holy Quran, containing ${readingSurah.verses} verses.`}
                  </p>
                </div>

                {/* Description Intro text retrieved from DB description */}
                {(() => {
                  const dbMatch = findDbMatch(readingSurah);
                  let introStr = "";
                  if (dbMatch) {
                    introStr = isUrdu ? dbMatch.description_ur : dbMatch.description_en;
                    if (dbMatch.description_en && dbMatch.description_en.trim().startsWith("{")) {
                      try {
                        const data = JSON.parse(dbMatch.description_en);
                        if (data && data.type === "surah_rich_data") {
                          introStr = isUrdu ? data.introduction_ur : data.introduction_en;
                        }
                      } catch (e) {}
                    }
                  }
                  if (!introStr) return null;
                  return (
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10 text-xs text-white/95 leading-relaxed max-w-xl">
                      <span className="font-bold uppercase tracking-widest text-[9px] text-secondary-300 block mb-1">
                        {isUrdu ? "تعارفی خلاصہ" : "Surah Introduction"}
                      </span>
                      <div className={isUrdu ? "font-urdu text-base leading-normal text-right text-white" : "text-white"}>
                        {renderFormattedText(introStr, isUrdu, "text-white")}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Calligraphic block */}
              <div className="bg-white/10 p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center min-w-[200px] sm:min-w-[240px] z-10 select-none">
                <span className="text-[10px] uppercase font-bold text-secondary-300 tracking-widest mb-2 block">Arabic Name</span>
                <h2 className="font-urdu text-4xl sm:text-5xl font-bold leading-none text-white drop-shadow-md">
                  {readingSurah.nameAr}
                </h2>
                <span className="text-xs font-semibold tracking-wider uppercase mt-2 text-white/80">{readingSurah.nameEn}</span>
              </div>
            </div>

            {/* Display Controls and Toggles */}
            <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className={`space-y-1 ${isUrdu ? 'text-right' : 'text-left'}`}>
                <h3 className={`text-base font-bold text-gray-850 ${isUrdu ? 'font-urdu text-lg' : ''}`}>
                  {isUrdu ? "آيات کی نمائش فلٹرز" : "Verse Display Configuration"}
                </h3>
                <p className="text-gray-400 text-xs">
                  {isUrdu 
                    ? "عربی متن، اردو/انگریزی تراجم اور مفسر تشریحات کو کنٹرول کرنے کے لیے آپشنز منتخب کریں۔"
                    : "Toggle options below to customize matching Arabic text, translation tracks, and Tafseer logs in real-time."}
                </p>
              </div>

              {/* Inline Checkbox Button Group */}
              <div className="flex flex-wrap gap-2.5 justify-center">
                <ToggleButton label={isUrdu ? "عربی عبارت" : "Arabic Script"} active={showArabic} onClick={() => setShowArabic(!showArabic)} />
                <ToggleButton label={isUrdu ? "اردو ترجمہ" : "Urdu Trans"} active={showUrdu} onClick={() => setShowUrdu(!showUrdu)} />
                <ToggleButton label={isUrdu ? "انگریزی ترجمہ" : "English Trans"} active={showEnglish} onClick={() => setShowEnglish(!showEnglish)} />
                <ToggleButton label={isUrdu ? "اردو تفسیر" : "Urdu Tafseer"} active={showTafseerUr} onClick={() => setShowTafseerUr(!showTafseerUr)} />
                <ToggleButton label={isUrdu ? "انگریزی تفسیر" : "English Tafseer"} active={showTafseerEn} onClick={() => setShowTafseerEn(!showTafseerEn)} />
              </div>
            </div>

            {/* Verses Container list */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              {(() => {
                const dbMatch = findDbMatch(readingSurah);
                let versesList: VerseData[] = [];
                if (dbMatch?.description_en && dbMatch.description_en.trim().startsWith("{")) {
                  try {
                    const data = JSON.parse(dbMatch.description_en);
                    if (data && data.type === "surah_rich_data") {
                      versesList = data.verses || [];
                    }
                  } catch (e) {}
                }

                if (versesList.length === 0) {
                  // Fetch defaults/fallbacks
                  versesList = getFallbackVerses(readingSurah.number, readingSurah.nameAr, readingSurah.nameEn, readingSurah.nameUr);
                }

                return versesList.map((verse) => (
                  <motion.div 
                    key={verse.number} 
                    variants={itemVariants}
                    className="bg-white rounded-3xl border border-gray-150 p-6 sm:p-8 shadow-sm hover:border-primary-200 transition-all duration-200 space-y-6"
                  >
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                      <span className="w-8 h-8 rounded-full bg-primary-55 text-primary-850 flex items-center justify-center font-extrabold font-mono text-xs shadow-sm border border-primary-100">
                        {verse.number}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {isUrdu ? `آیت نمبر ${verse.number}` : `Verse ${verse.number}`}
                      </span>
                    </div>

                    <div className={`grid gap-6 ${showArabic && (showUrdu || showEnglish) ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                      {showArabic && verse.arabic && (
                        <div className="flex flex-col justify-center items-end text-right">
                          <span 
                            className="text-2xl sm:text-3xl leading-loose font-extrabold text-primary-950 font-sans select-all font-arabic" 
                            style={{ fontStyle: 'normal' }}
                          >
                            {verse.arabic}
                          </span>
                        </div>
                      )}

                      {(showUrdu || showEnglish) && (
                        <div className="flex flex-col justify-center space-y-4">
                          {showUrdu && verse.translation_ur && (
                            <div dir="rtl" className="text-right border-r-2 border-primary-300 pr-4 space-y-1">
                              <span className="text-[10px] uppercase font-bold text-primary-800 tracking-wider block font-urdu">اردو ترجمہ</span>
                              <p className="font-urdu text-base sm:text-lg text-gray-800 leading-normal font-medium">
                                {verse.translation_ur}
                              </p>
                            </div>
                          )}
                          {showEnglish && verse.translation_en && (
                            <div className="border-l-2 border-gray-200 pl-4 space-y-1">
                              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">English Translation</span>
                              <p className="text-sm font-semibold text-gray-700 leading-relaxed">
                                {verse.translation_en}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {(showTafseerUr || showTafseerEn) && (verse.tafseer || verse.tafseer_en) && (
                      <div className="grid gap-6 mt-4">
                        {showTafseerUr && verse.tafseer && (
                          <div className="bg-primary-50/40 border border-primary-100 rounded-2xl p-5 space-y-2">
                            <div className="flex items-center gap-1.5 justify-end" dir="rtl">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary-500"></span>
                              <span className="text-[11px] font-bold text-primary-900 tracking-wider uppercase font-urdu">
                                اردو تفسیر
                              </span>
                            </div>
                            <p className="text-sm text-gray-750 leading-relaxed font-urdu text-right font-medium" dir="rtl">
                              {verse.tafseer}
                            </p>
                          </div>
                        )}
                        {showTafseerEn && verse.tafseer_en && (
                          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-2">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                              <span className="text-[11px] font-bold text-gray-700 tracking-wider uppercase">
                                English Tafseer
                              </span>
                            </div>
                            <p className="text-sm text-gray-750 leading-relaxed font-medium">
                              {verse.tafseer_en}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ));
              })()}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="portal-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
          {/* CORE PORTAL DOCKGRID SECTION */}
          <div className="max-w-7xl mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-8 relative items-start">
            
            {/* SIDE BAR NAVIGATION (باب انڈیکس) -> FLOATS ON THE SIDE EXACTLY LIKE IMAGE */}
            <aside className={`w-full lg:w-64 shrink-0 lg:sticky lg:top-24 gap-3 bg-white border border-gray-150 p-4 rounded-3xl shadow-md ${isUrdu ? 'order-last lg:order-2' : 'order-1'}`}>
              <div className="border-b border-gray-100 pb-3 mb-4 flex items-center gap-2 justify-between">
                <span className={`font-extrabold text-sm text-gray-800 tracking-wider uppercase ${isUrdu ? 'font-urdu flex-row-reverse text-base w-full text-right' : ''}`}>
                  {isUrdu ? "قرآنی ابواب" : "Quranic Chapters"}
                </span>
                <Compass size={16} className="text-primary-800 shrink-0" />
              </div>
              
              <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 pb-2 lg:pb-0 scrollbar-none snap-x">
                {QURAN_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl text-xs font-semibold tracking-wide transition-all uppercase whitespace-nowrap snap-center cursor-pointer border ${
                      activeSectionId === section.id 
                        ? 'bg-primary-800 hover:bg-primary-900 text-white border-primary-800 shadow-sm'
                        : 'bg-gray-50/50 text-gray-650 hover:text-primary-800 hover:bg-primary-50 hover:border-primary-100 border-gray-200'
                    } ${isUrdu ? 'flex-row-reverse font-urdu text-sm' : ''}`}
                  >
                    {/* Visual bubble inspired by left sidebar in screenshot */}
                    <span className={`w-12 h-6 flex items-center justify-center rounded-lg text-[10px] font-bold ${
                      activeSectionId === section.id 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {section.range}
                    </span>
                    <span className="truncate flex-1 text-left lg:text-right">
                      {isUrdu ? section.titleUr.split(':')[0] : `Section ${section.id}`}
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            {/* PRIMARY SURAHS DOCK AREA - MIRRORS PHOTO BOX LAYOUT */}
            <div className={`flex-1 space-y-12 w-full ${isUrdu ? 'order-1 lg:order-1' : 'order-2'}`}>
              {loading ? (
                <div className="text-center py-24 flex flex-col items-center justify-center gap-4 text-gray-500">
                  <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin"></div>
                  <p className="font-semibold">{isUrdu ? "سورتیں اپلوڈ ہو رہی ہیں..." : "Loading Quran index..."}</p>
                </div>
              ) : (
                QURAN_SECTIONS.map((section) => {
                  const surahsInSect = getFilteredSuraListInSect(section.surahs);
                  
                  // Hide section entirely if search doesn't match its Surahs
                  if (surahsInSect.length === 0) return null;

                  return (
                    <section 
                      id={`quran-section-${section.id}`} 
                      key={section.id} 
                      className="space-y-6 scroll-mt-24"
                    >
                      {/* ORNATE ROUNDED CHAPTER CAPSULE LAYOUT - PHOTO INSPIRED BAR */}
                      <div className="flex justify-center">
                        <div className="bg-primary-800 text-white py-3.5 px-10 rounded-full shadow-lg border-2 border-primary-100 flex flex-col items-center min-w-[280px] sm:min-w-[340px] text-center transform hover:scale-[1.02] transition-transform">
                          <span className={`text-[10px] font-bold tracking-widest uppercase text-secondary-300 ${isUrdu ? 'font-urdu' : ''}`}>
                            {isUrdu ? "بخش" : "SECTION"} {section.id}
                          </span>
                          <h3 className={`text-base sm:text-lg font-extrabold ${isUrdu ? 'font-urdu' : ''}`}>
                            {isUrdu ? section.titleUr : section.titleEn}
                          </h3>
                          <div className="w-16 h-0.5 bg-secondary-400 mt-1.5 opacity-60 rounded-full"></div>
                        </div>
                      </div>

                      {/* SURAHS GRID (Right-to-Left arrangement in Urdu, Left-to-Right in English) */}
                      <div 
                        dir={isUrdu ? "rtl" : "ltr"}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                      >
                        {surahsInSect.map((surah) => {
                          return (
                            <div 
                              key={surah.number}
                              className="bg-white rounded-2xl border border-gray-150 shadow-sm hover:shadow-md hover:border-primary-300 transition-all duration-300 flex flex-col overflow-hidden text-center justify-between group relative cursor-pointer"
                            >
                              {/* Elegant tiny top header strip for Surah number */}
                              <div 
                                onClick={() => setReadingSurah(surah)}
                                className="bg-gray-100/70 border-b border-gray-150 py-1.5 px-3 flex items-center justify-between"
                              >
                                <span className="text-[10px] font-bold text-gray-400 font-mono">
                                  #{String(surah.number).padStart(2, '0')}
                                </span>
                                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                                  {surah.verses} {isUrdu ? "آیات" : "verses"}
                                </span>
                              </div>

                              {/* Central Surah script block */}
                              {(() => {
                                const dbMatch = findDbMatch(surah);
                                return (
                                  <div 
                                    onClick={() => setReadingSurah(surah)}
                                    className="p-4 flex-1 flex flex-col items-center justify-center min-h-[90px] hover:bg-primary-50/20 transition-colors"
                                  >
                                    {/* Calligraphed Surah Name */}
                                    <h4 className="font-arabic font-bold text-2xl text-primary-810 leading-snug tracking-wide group-hover:text-primary-950 transition-colors">
                                      {surah.nameAr}
                                    </h4>
                                  </div>
                                );
                              })()}

                              {/* Quick details button strip matching the image buttons layout */}
                              <div className="bg-gray-50/75 border-t border-gray-155 p-2 flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setSelectedSurah(surah); }}
                                  className="w-full inline-flex cursor-pointer text-[10px] font-bold uppercase items-center justify-center gap-1.5 py-2 px-3 bg-white border border-gray-205 hover:bg-gray-100 hover:border-gray-300 text-gray-650 rounded-xl shadow-sm transition-all animate-scale-up"
                                >
                                  <Info size={12} className="text-primary-800 shrink-0" />
                                  <span>{isUrdu ? "تعارف اور تفصیل" : "Introduction & info"}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      )}



      {/* MODAL DRAWER OVERLAY DETAIL PANEL */}
      {selectedSurah && (
        <div 
          onClick={() => setSelectedSurah(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-150 animate-scale-up"
          >
            {/* Modal Heading Header */}
            <div className="bg-gradient-to-r from-primary-800 to-primary-900 text-white p-6 relative">
              <button 
                onClick={() => setSelectedSurah(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold text-secondary-300 uppercase tracking-widest block">
                  Surah Chapter {selectedSurah.number}
                </span>
                <h3 className="font-urdu text-3xl font-bold leading-normal">{selectedSurah.nameAr}</h3>
                <h4 className="text-base font-bold text-white/95">{selectedSurah.nameEn} ({selectedSurah.nameUr})</h4>
              </div>
            </div>

            {/* Modal content detail body */}
            <div className="p-6 sm:p-8 space-y-6">
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 border border-gray-150 p-3.5 rounded-2xl shadow-sm">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">{isUrdu ? "آیات کی تعداد" : "Total Verses"}</span>
                  <span className="text-xl font-extrabold text-gray-800">{selectedSurah.verses}</span>
                </div>
                <div className="bg-gray-50 border border-gray-150 p-3.5 rounded-2xl shadow-sm">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">{isUrdu ? "باب نمبر" : "Quran Section"}</span>
                  <span className="text-xl font-extrabold text-gray-800">
                    {QURAN_SECTIONS.find(sect => sect.surahs.includes(selectedSurah.number))?.id || 1}
                  </span>
                </div>
              </div>

              {/* Surah Introduction Detail description */}
              <div className="space-y-4">
                <div className="bg-primary-50/50 border border-primary-100 rounded-2xl p-5 space-y-2.5 animate-fade-in">
                  <span className="text-[10px] uppercase font-extrabold text-primary-800 tracking-widest flex items-center gap-1.5">
                    <Info size={13} className="text-secondary-600" />
                    {isUrdu ? "سوانح اور تعارفی خلاصہ" : "Surah Introduction & Essence"}
                  </span>
                  <div className={`text-gray-750 leading-relaxed ${isUrdu ? 'font-urdu text-right text-base leading-normal font-medium' : 'text-sm font-semibold'}`}>
                    {(() => {
                      const dbMatch = findDbMatch(selectedSurah);
                      let descText = "";
                      if (dbMatch) {
                        descText = isUrdu ? dbMatch.description_ur : dbMatch.description_en;
                        if (dbMatch.description_en && dbMatch.description_en.trim().startsWith("{")) {
                          try {
                            const parsed = JSON.parse(dbMatch.description_en);
                            descText = isUrdu ? parsed.introduction_ur : parsed.introduction_en;
                          } catch (e) {}
                        }
                      }
                      if (!descText) {
                        descText = isUrdu 
                          ? `${selectedSurah.nameUr} قرآن مجید کی ${selectedSurah.number} سورت ہے۔ اس میں کل ${selectedSurah.verses} آیات مبارکہ ہیں۔`
                          : `Surah ${selectedSurah.nameEn} is chapter ${selectedSurah.number} of the Holy Quran with ${selectedSurah.verses} verses.`;
                      }
                      return renderFormattedText(descText, isUrdu);
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Action footer bar */}
            <div className="bg-gray-50 border-t border-gray-150 p-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSurah(null)}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-300 font-bold rounded-xl text-xs uppercase tracking-wide cursor-pointer transition-all"
              >
                {isUrdu ? "بند کریں" : "Close"}
              </button>
            </div>

          </div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
}
