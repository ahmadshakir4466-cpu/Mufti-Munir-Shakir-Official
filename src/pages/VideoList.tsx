import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import GenericHeader from "../components/layout/GenericHeader";
import { useLanguage } from "../context/LanguageContext";
import { useSettings } from "../context/SettingsContext";
import { supabase } from "../lib/supabase";
import { renderFormattedTitle, getVideoViews, getVideoThumbnail } from "../lib/utils";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";

export default function VideoList() {
  const { lang, t } = useLanguage();
  const { sections } = useSettings();
  const [combinedItems, setCombinedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sections.videos) return;
    const fetchData = async () => {
      const { data: playlistData } = await supabase
        .from("playlists")
        .select("*")
        .order("created_at", { ascending: false });
        
      const { data: standaloneData } = await supabase
        .from("bayan")
        .select("*")
        .is("playlist_id", null)
        .order("created_at", { ascending: false });

      const plist = playlistData || [];
      const sdata = standaloneData || [];

      // Separate pinned vs non-pinned standalone videos
      const pinned = sdata.filter(v => v.published === true);
      const nonPinned = sdata.filter(v => v.published !== true);

      // Combine: pinned first, then playlists, then non-pinned
      const combined = [
        ...pinned.map(v => ({ ...v, isPlaylist: false })),
        ...plist.map(p => ({ ...p, isPlaylist: true })),
        ...nonPinned.map(v => ({ ...v, isPlaylist: false }))
      ];

      setCombinedItems(combined);
      setLoading(false);
    };

    fetchData();

    const playlistChannel = supabase.channel('videos-playlists-change')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'playlists' }, () => {
        fetchData();
      })
      .subscribe();

    const bayanChannel = supabase.channel('videos-bayan-change')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bayan' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(playlistChannel);
      supabase.removeChannel(bayanChannel);
    };
  }, [sections.videos]);

  if (!sections.videos) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <GenericHeader titleEn="Videos" titleUr="ویڈیوز" />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : combinedItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-150 p-8 shadow-sm max-w-md mx-auto">
            <span className="text-4xl mb-3 block">ℹ️</span>
            <p className="font-bold text-gray-700 text-lg">
              {lang === "en" ? "No videos or playlists found." : "کوئی بیانات یا سلسلہ وار ویڈیوز نہیں ملے۔"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {lang === "en" 
                ? "Please check back later for updates." 
                : "براہ کرم بعد میں دوبارہ چیک کریں۔"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {combinedItems.map((item, idx) => {
              const isPlaylist = item.isPlaylist;
              const targetUrl = isPlaylist ? `/playlists/${item.slug}` : `/videos/${item.slug}`;
              const isPinned = !isPlaylist && item.published === true;
              
              return (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="h-full"
                >
                  <Link to={targetUrl} className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col sm:flex-row items-center h-full relative">
                    {isPinned && (
                      <div className="absolute top-2 left-2 z-10 bg-amber-500 text-white font-bold text-[10px] uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                        ⭐ {lang === "en" ? "Pinned" : "پن کردہ"}
                      </div>
                    )}
                    <div className="w-full sm:w-2/5 aspect-video relative overflow-hidden shrink-0">
                      <img 
                        src={getVideoThumbnail(item)} 
                        alt="" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                      <div className={`absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1.5 shadow-sm group-hover:bg-primary-600 transition-colors`}>
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
                    <div className="p-6 sm:w-3/5 flex flex-col justify-center">
                      <h3 className={`text-xl font-bold mb-3 text-gray-900 group-hover:text-primary-700 transition-colors ${lang === 'ur' ? 'font-urdu text-right' : ''}`}>
                        {renderFormattedTitle(lang === "en" ? item.title_en : item.title_ur, lang === "ur", true)}
                      </h3>
                      <div className={`mt-auto flex items-center justify-between gap-2 flex-wrap ${lang === 'ur' ? 'flex-row-reverse' : ''}`}>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${isPlaylist ? 'bg-primary-100 text-primary-800' : 'bg-blue-100 text-blue-800'}`}>
                          {isPlaylist ? (lang === "en" ? "Playlist" : "سلسلہ وار") : (lang === "en" ? "Standalone Video" : "متفرقہ بیان")}
                        </span>
                        {!isPlaylist && (
                          <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                            <Eye size={14} className="text-gray-400" />
                            <span>{getVideoViews(item).toLocaleString()} {lang === 'ur' ? 'مشاہدات' : 'views'}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
