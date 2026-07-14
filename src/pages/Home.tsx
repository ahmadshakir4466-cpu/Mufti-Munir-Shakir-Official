import { useLanguage } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { Link } from "react-router-dom";
import { MoveRight, BookOpen, Sparkles, Heart, Award, ArrowRight, Book, Download, ExternalLink, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { renderFormattedTitle, getVideoViews, getVideoThumbnail } from "../lib/utils";

export default function Home() {
  const { lang, t } = useLanguage();
  const { sections } = useSettings();
  
  // Custom states for all configurable page content blocks with fallbacks
  const [hero, setHero] = useState({
    titleEn: "Welcome to the Official Website of\nMufti Munir Shakir",
    titleUr: "آفیشل ویب سائٹ پر خوش آمدید\nمفتی منیر شاکر",
    descEn: "Discover authentic Islamic teachings, listen to inspiring bayans, and stay updated with the latest events and news.",
    descUr: "مستند اسلامی تعلیمات دریافت کریں، متاثر کن بیانات سنیں اور تازہ ترین پروگرامز اور خبروں سے باخبر رہیں۔",
    imgUrl: "https://images.unsplash.com/photo-1564600350352-0ceed9a117cb?auto=format&fit=crop&q=80&w=2000"
  });

  const [pillar1, setPillar1] = useState({
    titleEn: "Authentic Quranic Tafseer",
    titleUr: "مستند قرآنی تفسیر",
    descEn: "Understand Divine wisdom session by session through contextual explanations.",
    descUr: "مختلف تفسیری نشستوں کے ذریعے الٰہی حکمتوں اور اسباق کو اچھے انداز میں سمجھیں۔"
  });

  const [pillar2, setPillar2] = useState({
    titleEn: "Inspiring Weekly Bayans",
    titleUr: "روح پرور ہفتہ وار بیانات",
    descEn: "Reboot your spiritual connection with lectures on Sunnah and morality.",
    descUr: "سنت نبوی اور اسلامی آداب پر مبنی خوبصورت بیانات سے اپنے ایمان کو تازہ کریں۔"
  });

  const [pillar3, setPillar3] = useState({
    titleEn: "Verified Hadith Guidance",
    titleUr: "مستند احادیث کی روشنی",
    descEn: "Navigate everyday situations using authentic collections of Hadith.",
    descUr: "روزمرہ کے مسائل کے حل کے لیے صحیح احادیث کے مستند مجموعہ سے رہنمائی لیں۔"
  });

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
    imgUrl: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=800"
  });

  const [articles, setArticles] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [hadithEntries, setHadithEntries] = useState<any[]>([]);
  const [latestBooks, setLatestBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Consolidating all dynamic configs fetching with robust error handling to prevent infinite spinner on Vercel
  const fetchAllContentsAndLatest = async () => {
    try {
      // 1. Fetch configurable texts from page_content table
      const p1 = supabase.from("page_content").select("*")
        .then(({ data, error }) => {
          if (error) {
            console.warn("Supabase warning (page_content):", error.message);
            return;
          }
          if (data && data.length > 0) {
            // Hero
            const heroRec = data.find(r => r.page_name === "home_hero");
            if (heroRec) {
              setHero(prev => ({
                ...prev,
                titleEn: heroRec.title_en || prev.titleEn,
                titleUr: heroRec.title_ur || prev.titleUr,
                descEn: heroRec.content_en || prev.descEn,
                descUr: heroRec.content_ur || prev.descUr
              }));
            }

            const heroImg = data.find(r => r.page_name === "home_hero_image");
            if (heroImg) {
              setHero(prev => ({ ...prev, imgUrl: heroImg.content_en || prev.imgUrl }));
            }

            // Pillars
            const pil1 = data.find(r => r.page_name === "home_pillar_1");
            if (pil1) {
              setPillar1(prev => ({
                titleEn: pil1.title_en || prev.titleEn,
                titleUr: pil1.title_ur || prev.titleUr,
                descEn: pil1.content_en || prev.descEn,
                descUr: pil1.content_ur || prev.descUr
              }));
            }
            const pil2 = data.find(r => r.page_name === "home_pillar_2");
            if (pil2) {
              setPillar2(prev => ({
                titleEn: pil2.title_en || prev.titleEn,
                titleUr: pil2.title_ur || prev.titleUr,
                descEn: pil2.content_en || prev.descEn,
                descUr: pil2.content_ur || prev.descUr
              }));
            }
            const pil3 = data.find(r => r.page_name === "home_pillar_3");
            if (pil3) {
              setPillar3(prev => ({
                titleEn: pil3.title_en || prev.titleEn,
                titleUr: pil3.title_ur || prev.titleUr,
                descEn: pil3.content_en || prev.descEn,
                descUr: pil3.content_ur || prev.descUr
              }));
            }

            // About Spotlight
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
              setAboutSpotlight(prev => ({ ...prev, imgUrl: abtImg.content_en || prev.imgUrl }));
            }

            // Books list can also be parsed from books_data in page_content
            const booksData = data.find(r => r.page_name === "books_data");
            if (booksData && booksData.content_en) {
              try {
                const parsed = JSON.parse(booksData.content_en);
                setLatestBooks(Array.isArray(parsed) ? parsed.slice(0, 4) : []);
              } catch (e) {
                setLatestBooks([]);
              }
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
          }
        })
        .catch(err => {
          console.error("Error processing page_content in promise:", err);
        });

      // 2. Fetch standard entries (latest posts)
      const p2 = supabase.from("articles").select("*").order("created_at", { ascending: false }).limit(3)
        .then(({ data, error }) => {
          if (error) {
            console.warn("Supabase warning (articles):", error.message);
            return;
          }
          if (data) setArticles(data);
        })
        .catch(err => {
          console.error("Error processing articles in promise:", err);
        });

      // 3. Fetch playlists and bayans
      const p3 = Promise.all([
        supabase.from("playlists").select("*").order("created_at", { ascending: false }).limit(2),
        supabase.from("bayan").select("*").is("playlist_id", null).eq("published", true).order("created_at", { ascending: false }).limit(2)
      ])
        .then(([playlistRes, pinnedRes]) => {
          const plist = playlistRes?.data || [];
          const pinned = pinnedRes?.data || [];
          const combined = [
            ...pinned.map(v => ({ ...v, isPlaylist: false })),
            ...plist.map(p => ({ ...p, isPlaylist: true }))
          ];
          setVideos(combined);
        })
        .catch(err => {
          console.error("Error processing videos/playlists in promise:", err);
        });

      // 4. Fetch hadith
      const p5 = supabase.from("hadith").select("*").order("created_at", { ascending: false }).limit(3)
        .then(({ data, error }) => {
          if (error) {
            console.warn("Supabase warning (hadith):", error.message);
            return;
          }
          if (data) setHadithEntries(data);
        })
        .catch(err => {
          console.error("Error processing hadith in promise:", err);
        });

      // Wait for all queries to finish, settling regardless of failure or timeout after 4 seconds
      const fetchPromise = Promise.allSettled([p1, p2, p3, p5]);
      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 4000));
      await Promise.race([fetchPromise, timeoutPromise]);
    } catch (err) {
      console.error("Critical error in fetchAllContentsAndLatest:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllContentsAndLatest();

    // Setup channels for real-time reactivity
    const pageContentChannel = supabase.channel('home-page-content').on('postgres_changes', { event: '*', schema: 'public', table: 'page_content' }, fetchAllContentsAndLatest).subscribe();
    const articlesChannel = supabase.channel('home-articles').on('postgres_changes', { event: '*', schema: 'public', table: 'articles' }, fetchAllContentsAndLatest).subscribe();
    const playlistsChannel = supabase.channel('home-playlists').on('postgres_changes', { event: '*', schema: 'public', table: 'playlists' }, fetchAllContentsAndLatest).subscribe();
    const hadithChannel = supabase.channel('home-hadith').on('postgres_changes', { event: '*', schema: 'public', table: 'hadith' }, fetchAllContentsAndLatest).subscribe();

    return () => {
      supabase.removeChannel(pageContentChannel);
      supabase.removeChannel(articlesChannel);
      supabase.removeChannel(playlistsChannel);
      supabase.removeChannel(hadithChannel);
    };
  }, []);



  return (
    <div className="flex flex-col gap-12 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative py-24 md:py-32 flex items-center justify-center bg-[#0B3D1B] text-white overflow-hidden shadow-sm">
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`text-4xl md:text-6xl font-extrabold tracking-tight whitespace-pre-line ${lang === 'ur' ? 'font-urdu pb-4 !leading-[2.2] md:!leading-[2.5]' : 'leading-normal'}`}
          >
            {lang === "en" ? hero.titleEn : hero.titleUr}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className={`text-lg md:text-xl text-gray-200 font-light max-w-2xl mx-auto whitespace-pre-line ${lang === 'ur' ? 'font-urdu !leading-[2.2]' : 'leading-relaxed'}`}
          >
            {lang === "en" ? hero.descEn : hero.descUr}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pt-4 flex justify-center gap-4"
          >
            <Link 
              to="/about" 
              className="inline-flex items-center gap-2 bg-primary-705 hover:bg-primary-600 text-white px-8 py-3.5 rounded-lg font-semibold transition-all shadow-lg hover:shadow-primary-700/30"
              style={{ backgroundColor: '#1b5e20' }}
            >
              {lang === 'en' ? 'Explore Profile' : 'تعارف پڑھیں'} <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </Link>
            <Link 
              to="/videos" 
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3.5 rounded-lg font-semibold backdrop-blur-sm transition-all"
            >
              {t("watchVideo")}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 4. Featured Articles Section */}
      {sections.articles && articles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6">
          <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
            <h2 className="text-3xl font-bold text-gray-900">{t("latestArticles")}</h2>
            <Link to="/articles" className="text-primary-700 font-medium hover:text-primary-800 flex items-center gap-1 group">
              {lang === "en" ? "View All" : "سب دیکھیں"}
              <MoveRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link to={`/articles/${article.slug}`} key={article.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col">
                <div className="h-48 overflow-hidden relative bg-gray-50">
                  <img src={article.featured_image || "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=1000"} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 hover:scale-[1.02]" />
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <p className="text-sm text-gray-500 mb-2">{new Date(article.created_at).toLocaleDateString()}</p>
                  <h3 className={`font-bold mb-3 text-gray-900 group-hover:text-primary-700 transition-colors ${lang === 'ur' ? 'font-urdu text-lg !leading-[1.8] text-right' : 'text-xl'}`}>
                    {renderFormattedTitle(lang === "en" ? article.title_en : article.title_ur, lang === "ur")}
                  </h3>

                  <div className="mt-auto text-primary-700 font-medium text-sm flex items-center gap-1">
                    {t("readMore")} <MoveRight className="w-4 h-4 rtl:rotate-180" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. Featured Videos Section */}
      {sections.videos && videos.length > 0 && (
        <section className="bg-primary-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex justify-between items-end mb-8 pb-4">
              <h2 className="text-3xl font-bold text-gray-900">{t("featuredVideo")}</h2>
              <Link to="/videos" className="text-primary-700 font-medium hover:text-primary-800 flex items-center gap-1 group">
                 {lang === "en" ? "View All" : "سب دیکھیں"}
                <MoveRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {videos.map((bayan) => {
                const isPlaylist = bayan.isPlaylist !== false; // default to true if undefined
                const targetUrl = isPlaylist ? `/playlists/${bayan.slug}` : `/videos/${bayan.slug}`;
                const isPinned = !isPlaylist && bayan.published === true;

                return (
                  <Link to={targetUrl} key={bayan.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col md:flex-row items-center relative">
                    {isPinned && (
                      <div className="absolute top-2 left-2 z-10 bg-amber-500 text-white font-bold text-[10px] uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                        ⭐ {lang === "en" ? "Pinned" : "پن کردہ"}
                      </div>
                    )}
                    <div className="w-full md:w-2/5 aspect-video relative overflow-hidden bg-gray-50 shrink-0">
                      <img src={getVideoThumbnail(bayan)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                      <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1.5 shadow-sm group-hover:bg-primary-600 transition-colors">
                        {isPlaylist ? (
                          <>
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" /></svg>
                            <span>{lang === "en" ? "Playlist" : "پلے لسٹ"}</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>{lang === "en" ? "Video" : "ویڈیو"}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="p-6 md:w-3/5 flex flex-col justify-center space-y-2 w-full">
                      <h3 className={`font-bold text-gray-900 group-hover:text-primary-700 transition-colors ${lang === 'ur' ? 'font-urdu text-lg !leading-[1.8] text-right' : 'text-xl'}`}>
                        {renderFormattedTitle(lang === "en" ? bayan.title_en : bayan.title_ur, lang === "ur", true)}
                      </h3>
                      <div className={`flex items-center justify-between gap-2 flex-wrap text-xs font-semibold text-gray-500 ${lang === 'ur' ? 'flex-row-reverse' : ''}`}>
                        <span className="text-primary-700">{new Date(bayan.created_at).toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        {!isPlaylist && (
                          <span className="flex items-center gap-1.5 text-gray-400">
                            <Eye size={14} />
                            <span>{getVideoViews(bayan).toLocaleString()}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}



      {/* 6. Hadith Section */}
      {sections.hadith && hadithEntries.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-16">
          <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
              <h2 className="text-3xl font-bold text-gray-900">{t("hadith")}</h2>
              <Link to="/hadith" className="text-primary-700 font-medium hover:text-primary-800 flex items-center gap-1 group">
                 {lang === "en" ? "View All" : "سب دیکھیں"}
                <MoveRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hadithEntries.map((entry) => (
                <Link to="/hadith" key={entry.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col p-6">
                  <span className="text-xs font-bold text-primary-800 bg-primary-100/50 px-2.5 py-1 rounded-full w-max mb-3">{entry.reference}</span>
                  <h3 className={`font-bold mb-3 text-gray-900 group-hover:text-primary-700 transition-colors ${lang === 'ur' ? 'font-urdu text-lg !leading-[1.8] text-right' : 'text-lg'}`}>
                    {renderFormattedTitle(lang === "en" ? entry.title_en : entry.title_ur, lang === "ur")}
                  </h3>
                  <div className="mt-auto text-primary-700 font-medium text-sm flex items-center gap-1">
                    {t("readMore")} <MoveRight className="w-4 h-4 rtl:rotate-180" />
                  </div>
                </Link>
              ))}
            </div>
        </section>
      )}
    </div>
  );
}
