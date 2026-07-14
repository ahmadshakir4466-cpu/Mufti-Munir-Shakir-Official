import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import GenericHeader from "../components/layout/GenericHeader";
import { useLanguage } from "../context/LanguageContext";
import { supabase } from "../lib/supabase";
import { renderFormattedTitle, renderFormattedText, getVideoThumbnail } from "../lib/utils";
import { ArrowLeft } from "lucide-react";

export default function PlaylistDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = useLanguage();
  const [playlist, setPlaylist] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylistAndVideos = async () => {
      setLoading(true);
      const { data: playlistData } = await supabase
        .from("playlists")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (playlistData) {
        setPlaylist(playlistData);
        const { data: videosData } = await supabase
          .from("bayan")
          .select("*")
          .eq("playlist_id", playlistData.id)
          .order("created_at", { ascending: false });
        
        if (videosData) {
          setVideos(videosData);
        }
      }
      setLoading(false);
    };

    fetchPlaylistAndVideos();
  }, [slug]);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;
  if (!playlist) return <div className="text-center py-20 text-gray-500">Playlist not found.</div>;

  const title = lang === "en" ? playlist.title_en : playlist.title_ur;
  const description = lang === "en" ? playlist.description_en : playlist.description_ur;

  return (
    <div>
      <GenericHeader titleEn={playlist.title_en} titleUr={playlist.title_ur} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link to="/videos" className="inline-flex items-center gap-2 text-primary-700 font-semibold hover:text-primary-800 mb-8 transition-colors">
          <ArrowLeft size={20} className="rtl:rotate-180" />
          {lang === "en" ? "Back to Playlists" : "پلے لسٹس پر واپس جائیں"}
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
               {playlist.thumbnail && (
                  <img 
                    src={playlist.thumbnail} 
                    alt="" 
                    className="w-full md:w-1/3 aspect-video object-cover rounded-lg shadow-sm"
                  />
               )}
               <div className="flex-1">
                 <h1 className={`text-3xl font-bold text-gray-900 mb-4 pb-4 border-b border-gray-200 ${lang === "ur" ? "font-urdu text-right leading-loose" : ""}`}>
                   {renderFormattedTitle(title, lang === "ur")}
                 </h1>
                 {description && (
                   <div className={`text-gray-700 text-lg leading-relaxed ${lang === "ur" ? "font-urdu text-right" : ""}`}>
                     {renderFormattedText(description, lang === "ur")}
                   </div>
                 )}
                 <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-800 font-medium text-sm rounded-full">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2v-6a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2h-4l-4 4-4-4z" /></svg>
                   {videos.length} {lang === "en" ? "Videos" : "ویڈیوز"}
                 </div>
               </div>
            </div>
        </div>

        <h2 className={`text-2xl font-bold text-gray-900 mb-6 ${lang === "ur" ? "font-urdu text-right" : ""}`}>
           {lang === "en" ? "Videos in this Playlist" : "اس پلے لسٹ میں ویڈیوز"}
        </h2>

        {videos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100 text-gray-500">
             {lang === "en" ? "No videos found in this playlist." : "اس پلے لسٹ میں کوئی ویڈیو نہیں ملی۔"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <Link to={`/videos/${video.slug}`} key={video.id} className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col">
                <div className="w-full aspect-video relative overflow-hidden bg-gray-100">
                  <img src={getVideoThumbnail(video)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors"></div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className={`text-lg font-bold mb-2 text-gray-900 group-hover:text-primary-700 transition-colors line-clamp-2 ${lang === 'ur' ? 'font-urdu text-right leading-loose' : ''}`}>
                    {renderFormattedTitle(lang === "en" ? video.title_en : video.title_ur, lang === "ur")}
                  </h3>
                  <div className="mt-auto text-xs text-gray-500 font-medium">
                    {new Date(video.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
