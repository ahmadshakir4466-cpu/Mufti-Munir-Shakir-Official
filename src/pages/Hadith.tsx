import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import GenericHeader from "../components/layout/GenericHeader";
import { useLanguage } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { supabase } from "../lib/supabase";
import { BookOpen, ArrowLeft, ChevronRight, Info } from "lucide-react";
import { renderFormattedTitle, renderFormattedText } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

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

export default function Hadith() {
  const { lang } = useLanguage();
  const { sections } = useSettings();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [readingHadith, setReadingHadith] = useState<any | null>(null);

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

  const isUrdu = lang === "ur";

  useEffect(() => {
    if (!sections.hadith) return;
    supabase.from("hadith").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setEntries(data);
      setLoading(false);
    });
  }, [sections.hadith]);

  if (!sections.hadith) {
    return <Navigate to="/" replace />;
  }

  const parseHadithContent = (entry: any) => {
    let arabic = "";
    let translation_ur = "";
    let translation_en = "";
    let tafseer_ur = "";
    let tafseer_en = "";
    
    // Check if it's the new JSON format
    let isRich = false;
    try {
        const parsed = JSON.parse(entry.content_en);
        if (parsed && parsed.type === "hadith_rich_data") {
            isRich = true;
            arabic = parsed.arabic || "";
            translation_en = parsed.translation_en || "";
            translation_ur = parsed.translation_ur || "";
            tafseer_en = parsed.tafseer_en || "";
            tafseer_ur = parsed.tafseer_ur || "";
        }
    } catch(e) { }

    if (!isRich) {
        // Fallback for old data
        translation_en = entry.content_en;
        translation_ur = entry.content_ur;
    }

    return { arabic, translation_en, translation_ur, tafseer_en, tafseer_ur, isRich };
  };

  const getBookName = (ref: string): string => {
    if (!ref) return "";
    // Matches English digits or Arabic/Urdu digits at the end
    let cleaned = ref.replace(/[\s,:-]+#?\s*[0-9\u0660-\u0669\u06f0-\u06f9]+\s*$/, "");
    cleaned = cleaned.replace(/\s*\(\s*[0-9\u0660-\u0669\u06f0-\u06f9]+\s*\)\s*$/, "");
    cleaned = cleaned.replace(/\s*\[\s*[0-9\u0660-\u0669\u06f0-\u06f9]+\s*\]\s*$/, "");
    cleaned = cleaned.trim();
    return cleaned || ref;
  };

  // Group entries by reference/book source
  const groupedEntries: Record<string, any[]> = {};
  entries.forEach(entry => {
    const ref = entry.reference || (isUrdu ? "عام احادیث" : "General Hadith");
    const bookName = getBookName(ref);
    if (!groupedEntries[bookName]) {
      groupedEntries[bookName] = [];
    }
    groupedEntries[bookName].push(entry);
  });

  return (
    <div className="bg-gray-50/60 min-h-screen pb-20">
      <GenericHeader 
        titleEn="Hadith Collection" 
        titleUr="احادیث کا مجموعہ" 
      />
      
      <AnimatePresence mode="wait">
        {readingHadith ? (
          <motion.div
            key="reading-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="max-w-4xl mx-auto px-4 py-8 space-y-8"
          >
            {/* Header Back Bar */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setReadingHadith(null)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-750 font-bold rounded-2xl shadow-sm transition-all cursor-pointer text-xs uppercase tracking-wider"
              >
                <ArrowLeft size={16} className="text-primary-850" />
                <span>{isUrdu ? "فہرست پر واپس" : "Back to index"}</span>
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-400">
                <span>{isUrdu ? "حدیث پورٹل" : "Hadith Portal"}</span>
                <ChevronRight size={14} />
                <span className="text-primary-800">{readingHadith.reference}</span>
              </div>
            </div>

            {/* Hadith Detail Ornate Banner */}
            <div className="bg-gradient-to-r from-primary-800 to-primary-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-primary-950 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 animate-scale-up">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_70%)] pointer-events-none"></div>
              
              <div className="space-y-4 text-center md:text-left z-10 w-full md:w-auto">
                <div>
                  <span className="bg-secondary-400/20 text-secondary-300 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-secondary-400/30">
                    {readingHadith.reference}
                  </span>
                </div>
                <div>
                  <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isUrdu ? 'font-urdu' : ''}`}>
                    {renderFormattedTitle(isUrdu ? readingHadith.title_ur : readingHadith.title_en, isUrdu)}
                  </h1>
                  <p className="text-white/80 text-sm mt-1 sm:mt-1.5 leading-relaxed max-w-lg">
                    {isUrdu 
                      ? `یہ مبارک حدیث کتاب "${readingHadith.reference}" سے مروی ہے۔`
                      : `This blessed Hadith is recorded in "${readingHadith.reference}".`}
                  </p>
                </div>
              </div>

              {/* Decorative block */}
              <div className="shrink-0 z-10 text-center md:text-right">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-5 border border-white/10 flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold text-secondary-300 tracking-widest mb-2 block">Islamic Source</span>
                  <h2 className="font-urdu text-4xl sm:text-5xl font-bold leading-none text-white drop-shadow-md">
                    الحديث
                  </h2>
                  <span className="font-urdu text-lg mt-2 text-white/90">{readingHadith.reference}</span>
                </div>
              </div>
            </div>

            {/* Display Controls and Toggles */}
            <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className={`space-y-1 ${isUrdu ? 'text-right' : 'text-left'}`}>
                <h3 className={`text-base font-bold text-gray-850 ${isUrdu ? 'font-urdu text-lg' : ''}`}>
                  {isUrdu ? "حدیث کی نمائش فلٹرز" : "Hadith Display Configuration"}
                </h3>
                <p className="text-gray-400 text-xs">
                  {isUrdu 
                    ? "عربی متن، اردو/انگریزی تراجم اور مفسر تشریحات کو کنٹرول کرنے کے لیے آپشنز منتخب کریں۔"
                    : "Toggle options below to customize matching Arabic text, translation tracks, and Tafseer logs in real-time."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 justify-center">
                <ToggleButton label={isUrdu ? "عربی عبارت" : "Arabic Script"} active={showArabic} onClick={() => setShowArabic(!showArabic)} />
                <ToggleButton label={isUrdu ? "اردو ترجمہ" : "Urdu Trans"} active={showUrdu} onClick={() => setShowUrdu(!showUrdu)} />
                <ToggleButton label={isUrdu ? "انگریزی ترجمہ" : "English Trans"} active={showEnglish} onClick={() => setShowEnglish(!showEnglish)} />
                <ToggleButton label={isUrdu ? "اردو تشریح" : "Urdu Tafseer"} active={showTafseerUr} onClick={() => setShowTafseerUr(!showTafseerUr)} />
                <ToggleButton label={isUrdu ? "انگریزی تشریح" : "English Tafseer"} active={showTafseerEn} onClick={() => setShowTafseerEn(!showTafseerEn)} />
              </div>
            </div>

            {/* Detailed Content Block */}
            {(() => {
              const { arabic, translation_en, translation_ur, tafseer_en, tafseer_ur } = parseHadithContent(readingHadith);
              return (
                <div className="bg-white rounded-3xl border border-gray-150 p-6 sm:p-10 shadow-sm space-y-10 animate-scale-up">
                  
                  {/* Arabic text block */}
                  {showArabic && arabic && (
                    <div className="text-center py-6 border-b border-gray-100">
                      <span 
                        className="text-3xl sm:text-4xl font-bold leading-loose text-primary-950 font-arabic select-all"
                        style={{ fontStyle: 'normal' }}
                      >
                        {arabic}
                      </span>
                    </div>
                  )}

                  {/* Translations Grid */}
                  <div className={`grid gap-8 ${showUrdu && showEnglish ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                    {showUrdu && translation_ur && (
                      <div dir="rtl" className="text-right border-r-4 border-primary-500 pr-6 space-y-2">
                        <span className="text-[11px] uppercase font-bold text-primary-800 tracking-wider block font-urdu">اردو ترجمہ</span>
                        <div className="font-urdu text-xl text-gray-800 leading-relaxed font-medium">
                          {renderFormattedText(translation_ur, true)}
                        </div>
                      </div>
                    )}
                    {showEnglish && translation_en && (
                      <div className="border-l-4 border-gray-250 pl-6 space-y-2">
                        <span className="text-[11px] uppercase font-bold text-gray-500 tracking-wider block">English Translation</span>
                        <div className="text-base font-semibold text-gray-750 leading-relaxed">
                          {renderFormattedText(translation_en, false)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tafseer Grid */}
                  {(showTafseerUr || showTafseerEn) && (tafseer_ur || tafseer_en) && (
                    <div className="grid gap-6 pt-6 border-t border-gray-100">
                      {showTafseerUr && tafseer_ur && (
                        <div className="bg-primary-50/40 border border-primary-100 rounded-2xl p-6 space-y-3">
                          <div className="flex items-center gap-2 justify-end" dir="rtl">
                            <span className="w-2 h-2 rounded-full bg-secondary-500"></span>
                            <span className="text-[11px] font-bold text-primary-900 tracking-wider uppercase font-urdu">
                              اردو تشریح
                            </span>
                          </div>
                          <div className="text-base text-gray-750 leading-relaxed font-urdu text-right font-medium" dir="rtl">
                            {renderFormattedText(tafseer_ur, true)}
                          </div>
                        </div>
                      )}
                      {showTafseerEn && tafseer_en && (
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                            <span className="text-[11px] font-bold text-gray-700 tracking-wider uppercase">
                              English Tafseer
                            </span>
                          </div>
                          <div className="text-base text-gray-750 leading-relaxed font-medium">
                            {renderFormattedText(tafseer_en, false)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })()}

          </motion.div>
        ) : (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="max-w-6xl mx-auto px-4 py-8 space-y-12"
          >
            {loading ? (
              <div className="text-center py-24 flex flex-col items-center justify-center gap-4 text-gray-500">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin"></div>
                <p className="font-semibold">{isUrdu ? "احادیث اپلوڈ ہو رہی ہیں..." : "Loading Hadith index..."}</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-lg bg-white rounded-3xl border border-gray-150 p-10">
                 {isUrdu ? "ابھی تک کوئی حدیث اپ لوڈ نہیں کی گئی۔" : "No hadith entries yet."}
              </div>
            ) : (
              <div className="space-y-12">
                {Object.keys(groupedEntries).map((source) => {
                  const entryList = groupedEntries[source];
                  return (
                    <section key={source} className="space-y-6">
                      
                      {/* Section Capsule */}
                      <div className="flex justify-center">
                        <div className="bg-primary-800 text-white py-3.5 px-10 rounded-full shadow-lg border-2 border-primary-100 flex flex-col items-center min-w-[280px] sm:min-w-[340px] text-center transform hover:scale-[1.02] transition-transform">
                          <span className={`text-[10px] font-bold tracking-widest uppercase text-secondary-300 ${isUrdu ? 'font-urdu' : ''}`}>
                            {isUrdu ? "حوالہ کتاب" : "REFERENCE BOOK"}
                          </span>
                          <h3 className={`text-base sm:text-lg font-extrabold ${isUrdu ? 'font-urdu' : ''}`}>
                            {source}
                          </h3>
                          <div className="w-16 h-0.5 bg-secondary-400 mt-1.5 opacity-60 rounded-full"></div>
                        </div>
                      </div>

                      {/* Hadiths Grid */}
                      <div 
                        dir={isUrdu ? "rtl" : "ltr"}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                      >
                        {entryList.map((entry, index) => (
                          <div 
                            key={entry.id}
                            onClick={() => setReadingHadith(entry)}
                            className="bg-white rounded-2xl border border-gray-150 shadow-sm hover:shadow-md hover:border-primary-300 transition-all duration-300 flex flex-col overflow-hidden text-center justify-between group relative cursor-pointer"
                          >
                            {/* Card Header */}
                            <div className="bg-gray-100/70 border-b border-gray-150 py-2 px-3 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-gray-400 font-mono">
                                #{String(index + 1).padStart(2, '0')}
                              </span>
                              <span className="text-[10px] uppercase font-bold text-primary-700 tracking-wider">
                                {entry.reference}
                              </span>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 flex-1 flex flex-col items-center justify-center min-h-[110px] hover:bg-primary-50/20 transition-colors">
                              <span className="shrink-0 w-8 h-8 rounded-full bg-primary-50 text-primary-800 flex items-center justify-center mb-3 group-hover:bg-primary-100 transition-colors">
                                <BookOpen size={16} />
                              </span>
                              <h4 className={`font-bold text-gray-900 leading-snug tracking-wide group-hover:text-primary-850 transition-colors ${isUrdu ? 'font-urdu text-lg' : 'text-sm'}`}>
                                {renderFormattedTitle(isUrdu ? entry.title_ur : entry.title_en, isUrdu)}
                              </h4>
                            </div>

                            {/* Card Footer */}
                            <div className="bg-gray-50/75 border-t border-gray-155 p-2.5 flex">
                              <div className="w-full inline-flex text-[10px] font-extrabold uppercase items-center justify-center gap-1.5 py-2 px-3 bg-white border border-gray-205 hover:bg-gray-100 hover:border-gray-300 text-gray-650 rounded-xl shadow-sm transition-all">
                                <Info size={12} className="text-primary-800 shrink-0" />
                                <span>{isUrdu ? "مکمل تفصیلات" : "View Details"}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                    </section>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
