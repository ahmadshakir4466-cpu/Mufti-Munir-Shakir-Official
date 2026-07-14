import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import GenericHeader from "../components/layout/GenericHeader";
import { useLanguage } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { supabase } from "../lib/supabase";
import { Award, BookOpen, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { getDynamicIcon, renderFormattedText } from "../lib/utils";

export default function About() {
  const { lang } = useLanguage();
  const { sections } = useSettings();
  const [loading, setLoading] = useState(true);
  const [dynamicBios, setDynamicBios] = useState<any[]>([]);
  
  const [aboutSpotlight, setAboutSpotlight] = useState({
    titleEn: "Scholarly Guidance & Services",
    titleUr: "علمی رہنمائی اور دینی خدمات",
    desc1En: "Mufti Munir Shakir is a highly esteemed Islamic scholar dedicated to teaching classical theology, propagating spiritual purification, and offering authentic jurisprudential counseling to seekers across the globe.",
    desc1Ur: "مفتی منیر شاکر ایک بلند پایہ اور معتبر عالم دین ہیں جو کلاسیکی الہیات کی تدریس، تزکیہ نفس کی ترویج اور دنیا بھر کے مسلمانوں کو فقہی و شرعی رہنمائی فراہم کرنے کے لیے ہمہ وقت کوشاں ہیں۔",
    desc2En: "Through his interactive lectures, detailed Tafseer classes, and extensive Hadith sessions, he strives to foster harmony, spiritual enlightenment, and clear understanding of authentic Islamic values.",
    desc2Ur: "اپنے مکالماتی پروگرامز، تفصیلی قرآنی دروس اور احادیث کے تفصیلی حلقوں کے ذریعے، وہ معاشرے میں بھائی چارے اور دین حنیف کی حقیقی تفہیم کی آبیاری کر رہے ہیں۔",
    stat1EnLabel: "Years of Service",
    stat1UrLabel: "سالہ دینی خدمات",
    stat1Value: "25+",
    stat2EnLabel: "Weekly Audio/Video Bayans",
    stat2UrLabel: "دستیاب اصلاحی بیانات",
    stat2Value: "1000+",
    imgUrl: "" // Start empty to prevent initial portrait image flash
  });

  const [bioContent, setBioContent] = useState({
    titleEn: "Biography",
    titleUr: "سوانح حیات",
    contentEn: "Mufti Munir Shakir is a renowned Islamic scholar dedicated to teaching and spreading the light of Islam across the globe.",
    contentUr: "مفتی منیر شاکر ایک نامور اسلامی اسکالر ہیں جو دنیا بھر میں اسلام کی روشنی پھیلانے اور تعلیم دینے کے لیے وقف ہیں۔"
  });

  useEffect(() => {
    if (!sections.bio) return;
    setLoading(true);
    supabase.from("page_content").select("*").then(({ data }) => {
      if (data && data.length > 0) {
        // Spotlight section
        const abtSpot = data.find(r => r.page_name === "home_about_section");
        if (abtSpot) {
          setAboutSpotlight(prev => ({
            ...prev,
            titleEn: abtSpot.title_en || prev.titleEn,
            titleUr: abtSpot.title_ur || prev.titleUr,
            desc1En: abtSpot.content_en || prev.desc1En,
            desc1Ur: abtSpot.content_ur || prev.desc1Ur
          }));
        }

        const abtSpot2 = data.find(r => r.page_name === "home_about_section_p2");
        if (abtSpot2) {
          setAboutSpotlight(prev => ({
            ...prev,
            desc2En: abtSpot2.content_en || prev.desc2En,
            desc2Ur: abtSpot2.content_ur || prev.desc2Ur
          }));
        }

        const abtImg = data.find(r => r.page_name === "home_about_image");
        if (abtImg) {
          setAboutSpotlight(prev => ({ ...prev, imgUrl: abtImg.content_en || "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=800" }));
        } else {
          setAboutSpotlight(prev => ({ ...prev, imgUrl: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=800" }));
        }

        const stat1 = data.find(r => r.page_name === "home_about_stats_1");
        if (stat1) {
          setAboutSpotlight(prev => ({
            ...prev,
            stat1EnLabel: stat1.title_en || prev.stat1EnLabel,
            stat1UrLabel: stat1.title_ur || prev.stat1UrLabel,
            stat1Value: stat1.content_en || prev.stat1Value
          }));
        }

        const stat2 = data.find(r => r.page_name === "home_about_stats_2");
        if (stat2) {
          setAboutSpotlight(prev => ({
            ...prev,
            stat2EnLabel: stat2.title_en || prev.stat2EnLabel,
            stat2UrLabel: stat2.title_ur || prev.stat2UrLabel,
            stat2Value: stat2.content_en || prev.stat2Value
          }));
        }

        // Bio section
        const bio = data.find(r => r.page_name === "bio_page");
        if (bio) {
          setBioContent({
            titleEn: bio.title_en || "Biography",
            titleUr: bio.title_ur || "سوانح حیات",
            contentEn: bio.content_en || "",
            contentUr: bio.content_ur || ""
          });
        }

        // Fetch custom chapters / dynamic biography segments
        const dynamicList = data.filter(r => r.page_name.startsWith("dynamic_bio_"));
        dynamicList.sort((a, b) => a.page_name.localeCompare(b.page_name));
        setDynamicBios(dynamicList);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [sections.bio]);

  if (!sections.bio) {
    return <Navigate to="/" replace />;
  }



  return (
    <div className="pb-20">
      <GenericHeader 
        titleEn="About Mufti Munir Shakir" 
        titleUr="مفتی منیر شاکر کا تعارف" 
      />
      
      {/* 1. Scholar Spotlight & Stats Counters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${lang === 'ur' ? 'direction-rtl text-right' : ''}`}>
          
          {/* Leftside: Portrait Photo */}
          <div className={`relative ${lang === 'ur' ? 'lg:order-2' : ''}`}>
            <div className="relative w-full">
              <div className="absolute inset-0 bg-primary-800/10 rounded-3xl translate-x-4 translate-y-4 -z-10" />
              {aboutSpotlight.imgUrl ? (
                <img 
                  src={aboutSpotlight.imgUrl} 
                  alt="Portrait" 
                  className="w-full h-auto block rounded-3xl shadow-2xl border border-gray-100 select-none"
                  onError={(e) => {
                    (e.target as any).src = "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=800";
                  }}
                />
              ) : (
                <div className="w-full aspect-[4/5] rounded-3xl bg-gray-100 flex items-center justify-center text-gray-400">
                  No Portrait Uploaded
                </div>
              )}
            </div>
          </div>

          {/* Rightside: Editorial Spotlight text and counters */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-100 text-primary-800 text-xs font-bold rounded-full tracking-wide uppercase">
              <Award size={14} /> {lang === 'en' ? 'Scholar Spotlight' : 'خصوصی تعارف'}
            </div>
            
            <h2 className={`text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight !leading-normal ${lang === 'ur' ? 'font-urdu' : ''}`}>
              {lang === "en" ? aboutSpotlight.titleEn : aboutSpotlight.titleUr}
            </h2>

            <div className="h-1 w-20 bg-[#1b5e20] rounded" />

            <div className="space-y-4">
              <p className={`text-gray-700 text-base md:text-lg leading-relaxed ${lang === 'ur' ? 'font-urdu leading-loose text-lg' : ''}`}>
                {lang === "en" ? aboutSpotlight.desc1En : aboutSpotlight.desc1Ur}
              </p>
              <p className={`text-gray-600 text-base leading-relaxed ${lang === 'ur' ? 'font-urdu leading-loose text-base' : ''}`}>
                {lang === "en" ? aboutSpotlight.desc2En : aboutSpotlight.desc2Ur}
              </p>
            </div>

            {/* Statistics Counters Grid */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-150">
              <div className="space-y-1">
                <span className="text-4xl md:text-5xl font-extrabold text-primary-800 tracking-tight block">
                  {aboutSpotlight.stat1Value}
                </span>
                <span className={`text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wider block ${lang === 'ur' ? 'font-urdu' : ''}`}>
                  {lang === "en" ? aboutSpotlight.stat1EnLabel : aboutSpotlight.stat1UrLabel}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-4xl md:text-5xl font-extrabold text-primary-800 tracking-tight block">
                  {aboutSpotlight.stat2Value}
                </span>
                <span className={`text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wider block ${lang === 'ur' ? 'font-urdu' : ''}`}>
                  {lang === "en" ? aboutSpotlight.stat2EnLabel : aboutSpotlight.stat2UrLabel}
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Detailed Biography Statement Section */}
      <section className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 text-gray-800">
          {lang === "en" ? (
            <div className="space-y-6">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight border-b pb-4 mb-6 flex items-center gap-2">
                <BookOpen className="text-[#1b5e20] shrink-0" size={28} /> {bioContent.titleEn || "Detailed Biography"}
              </h2>
              <div className="text-gray-700">{renderFormattedText(bioContent.contentEn, false)}</div>
            </div>
          ) : (
            <div className="text-right space-y-6" dir="rtl">
              <h2 className="font-urdu text-3xl font-extrabold text-gray-900 tracking-tight border-b pb-4 mb-6 flex items-center gap-3 justify-start">
                <BookOpen className="text-[#1b5e20] shrink-0" size={28} /> {bioContent.titleUr || "تفصیلی سوانح حیات"}
              </h2>
              <div className="text-gray-700 text-right leading-loose">{renderFormattedText(bioContent.contentUr, true)}</div>
            </div>
          )}
        </div>
      </section>

      {/* 3. Dynamically Generated Chapters with Automated Icon Detection */}
      {dynamicBios.map((item) => {
        const IconComponent = getDynamicIcon(item.title_en, item.title_ur);
        return (
          <section key={item.page_name} className="bg-white border-t border-gray-100 py-16">
            <div className="max-w-4xl mx-auto px-4 text-gray-800">
              {lang === "en" ? (
                <div className="space-y-6">
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight border-b pb-4 mb-6 flex items-center gap-2">
                    <IconComponent className="text-[#1b5e20] shrink-0" size={28} /> {item.title_en}
                  </h2>
                  <div className="text-gray-700">{renderFormattedText(item.content_en, false)}</div>
                </div>
              ) : (
                <div className="text-right space-y-6" dir="rtl">
                  <h2 className="font-urdu text-3xl font-extrabold text-gray-905 tracking-tight border-b pb-4 mb-6 flex items-center gap-3 justify-start">
                    <IconComponent className="text-[#1b5e20] shrink-0" size={28} /> {item.title_ur || item.title_en}
                  </h2>
                  <div className="text-gray-700 text-right leading-loose">{renderFormattedText(item.content_ur, true)}</div>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
