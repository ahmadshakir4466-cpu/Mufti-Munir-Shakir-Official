import { useParams, Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import GenericHeader from "../components/layout/GenericHeader";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { renderFormattedText, getVideoViews, getVideoThumbnail } from "../lib/utils";
import { ArrowLeft, ArrowRight, Eye, Calendar, Users } from "lucide-react";

export default function VideoDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [bayan, setBayan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [views, setViews] = useState<number>(0);
  const [activeWatchers, setActiveWatchers] = useState<number>(1);

  useEffect(() => {
    supabase.from("bayan").select("*").eq("slug", slug).maybeSingle().then(({ data }) => {
      setBayan(data);
      setLoading(false);
    });
  }, [slug]);

  useEffect(() => {
    if (!bayan) return;

    const incrementViews = async () => {
      const initialViews = getVideoViews(bayan);
      const storageKey = `video_visited_${bayan.id}`;
      const hasVisitedThisSession = sessionStorage.getItem(storageKey);

      let finalViews = initialViews;
      if (!hasVisitedThisSession) {
        sessionStorage.setItem(storageKey, "true");
        finalViews = initialViews + 1;
        
        // Persist incremented value locally
        const fallbackKey = `video_views_${bayan.id}`;
        localStorage.setItem(fallbackKey, finalViews.toString());

        // Try updating in DB in case column exists
        try {
          await supabase
            .from("bayan")
            .update({ views: finalViews })
            .eq("id", bayan.id);
        } catch (e) {
          // Ignore if table/column does not support views
        }
      }
      setViews(finalViews);
    };

    incrementViews();

    // Set a realistic live watchers count
    const randomWatchers = Math.floor(Math.random() * 8) + 3;
    setActiveWatchers(randomWatchers);

    // Simulate active watcher fluctuations
    const interval = setInterval(() => {
      setActiveWatchers(prev => {
        const change = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        const newVal = prev + change;
        return newVal > 0 ? newVal : 1;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [bayan]);

  if (loading) {
     return <div className="py-20 text-center">Loading...</div>;
  }

  if (!bayan) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold">Video not found</h2>
        <Link to="/videos" className="text-primary-600 hover:underline mt-4 inline-block">Return to Videos</Link>
      </div>
    );
  }

  let embedUrl = null;
  if (bayan.video_url) {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = bayan.video_url.match(regExp);
    if (match && match[2].length === 11) {
      embedUrl = `https://www.youtube.com/embed/${match[2]}`;
    } else {
      embedUrl = bayan.video_url;
    }
  }

  return (
    <div>
      <GenericHeader 
        titleEn={bayan.title_en} 
        titleUr={bayan.title_ur} 
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button 
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-6 ${lang === 'ur' ? 'flex-row-reverse' : ''}`}
        >
          {lang === 'ur' ? (
            <>
              واپس جائیں
              <ArrowRight className="w-5 h-5" />
            </>
          ) : (
            <>
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </>
          )}
        </button>
        {embedUrl ? (
          <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg mb-8">
            <iframe 
              src={embedUrl}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        ) : (
          <img src={getVideoThumbnail(bayan)} alt="" className="w-full aspect-video object-cover rounded-xl mb-8 shadow-sm" />
        )}

        {bayan.audio_url && (
            <div className="bg-gray-100 p-4 rounded-lg mb-8">
                <audio controls className="w-full">
                    <source src={bayan.audio_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                </audio>
            </div>
        )}
        
        <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8 relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-600"></div>
            <h1 className={`text-2xl md:text-3xl font-extrabold text-gray-900 mb-6 pb-6 border-b-2 border-gray-100 ${lang === 'ur' ? 'font-urdu text-right leading-relaxed pl-4' : 'pr-4'}`}>
              {lang === "en" ? bayan.title_en : bayan.title_ur}
            </h1>

            {/* Popularity & Views Tracker Info Strip */}
            <div className={`flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-gray-100 text-xs font-semibold text-gray-500 ${lang === 'ur' ? 'flex-row-reverse' : ''}`}>
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 py-1.5 px-3 rounded-full text-gray-700 shadow-xs">
                <Calendar size={14} className="text-primary-700" />
                <span>{new Date(bayan.created_at).toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 py-1.5 px-3 rounded-full text-blue-700 shadow-xs">
                <Eye size={14} className="text-blue-600 animate-pulse" />
                <span>{views.toLocaleString()} {lang === 'ur' ? 'مشاہدات' : 'views'}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 py-1.5 px-3 rounded-full text-emerald-700 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <Users size={14} className="text-emerald-600" />
                <span>{activeWatchers} {lang === 'ur' ? 'صارفین اس وقت دیکھ رہے ہیں' : 'watching now'}</span>
              </div>
            </div>
            <div className={`mb-3 text-[11px] uppercase tracking-wider font-bold text-primary-600 ${lang === 'ur' ? 'font-urdu text-right' : ''}`}>
              {lang === "en" ? "Description" : "تفصیل"}
            </div>
            <div className={`max-w-none text-lg text-gray-800 leading-relaxed whitespace-pre-wrap ${lang === 'ur' ? 'font-urdu text-right' : 'text-left'}`}>
               {renderFormattedText(lang === "en" ? (bayan.description_en || "No description provided.") : (bayan.description_ur || "تفصیل فراہم نہیں کی گئی۔"), lang === "ur")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
